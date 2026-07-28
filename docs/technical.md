# Technical Documentation

**Service:** Event Management System
**Version:** 1.0.0
**Status:** Production
**Last updated:** 2026-07-28

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Installation and Setup](#5-installation-and-setup)
6. [Database Design](#6-database-design)
7. [API Documentation](#7-api-documentation)
8. [Usage Guide](#8-usage-guide)
9. [Security and Scalability](#9-security-and-scalability)
10. [Testing](#10-testing)
11. [Deployment](#11-deployment)
12. [Support and Maintenance](#12-support-and-maintenance)
13. [Future Enhancements](#13-future-enhancements)
14. [Change Log](#14-change-log)
15. [References](#15-references)

---

# 1. Introduction

## 1.1 Purpose
This document is the technical reference for **Event Management System (EMS)**, a full-stack MERN application for managing events across multiple profiles and timezones. It describes the system architecture, database design, API specifications, frontend component hierarchy, timezone conversion pipeline, DSA optimization strategies, and deployment strategy for the platform.

## 1.2 Scope
The document covers the entire EMS repository: the Express.js backend with MongoDB/Mongoose ODM, the React frontend with Zustand for state management, dayjs timezone plugins for UTC conversion, a two-panel single-page layout, event CRUD with automatic update logging, profile-based event filtering, custom calendar and time pickers, and Vercel/Render deployment. The system provides administrators with a web-based dashboard to create profiles, schedule events across multiple timezones, and track every change made to events.

## 1.3 Audience
- Software engineers extending the API or adding new frontend features.
- DevOps engineers setting up the deployment environment.
- Reviewers and onboarding engineers building a mental model of the architecture.
- QA engineers designing test cases for the system.
Readers are assumed to be comfortable with Node.js, Express, React, MongoDB, and modern REST API patterns.

## 1.4 Problem Statement
Managing events across distributed teams operating in different timezones typically leads to scheduling confusion, missed meetings, and duplicate entries. Existing calendar tools either lack multi-profile support or require user accounts and authentication. This project demonstrates a lightweight, no-auth event management platform that enables administrators to create profiles, assign events to one or more profiles, and view all event times in any timezone. The system must handle timezone conversion accurately (including DST transitions), track every event modification with before/after values, and provide a responsive single-page interface without requiring user login.

## 1.5 Objectives
- Provide a profile-based event management system with no authentication overhead.
- Enable CRUD operations for events with multi-profile assignment.
- Convert all event times to UTC for storage and back to any timezone for display.
- Log every event update with field-level old/new value tracking.
- Deliver a responsive, two-panel single-page React UI.
- Implement DSA strategies (LRU cache, binary search, debouncing) for performance optimization.
- Deploy as a serverless frontend (Vercel) and hosted backend (Render) with MongoDB Atlas.

---

# 2. System Overview

## 2.1 Project Overview
EMS is a single-page application with a REST API backend. The backend uses Express.js with MongoDB as the document store, accessed through Mongoose ODM. The frontend is a Vite + React 19 SPA using Zustand for state management, dayjs with utc and timezone plugins for timezone conversion, and Vanilla CSS for styling. The application has no authentication layer — profiles are identified by name only. All event date-times are stored in UTC and converted to the user's selected timezone on display.

## 2.2 Features
- **Profile Management** — Create profiles by name with a default timezone; no login required.
- **Multi-Profile Events** — Assign a single event to one or multiple profiles at once.
- **Timezone Conversion** — All events stored in UTC; displayed in any of 15 supported IANA timezones.
- **Event CRUD** — Create, read, update, and delete events with full validation.
- **Event Update Logs** — Every PATCH request logs changed fields with old/new values and timestamps.
- **View in Any Timezone** — "View in Timezone" dropdown instantly recalculates all displayed times.
- **Custom Calendar Picker** — Month-view date picker with navigation arrows and today highlighting.
- **Searchable Dropdowns** — Profile selector and timezone dropdown with real-time search filtering.
- **Inline Profile Creation** — Create new profiles directly from the event form or header dropdown.
- **Edit Event Modal** — Edit events in a modal overlay without leaving the main page.
- **Toast Notifications** — Success messages on event create/update with auto-dismiss.
- **Responsive Design** — Two-panel layout collapses to single-column on mobile viewports.

## 2.3 Workflow
At a high level: an administrator opens the application → the profile and event lists load from the API → the administrator creates a profile (or uses the default) → fills the Create Event form on the left panel (selects profiles, picks timezone, selects start/end date and time) → clicks "Create Event" → the date-time is converted to UTC via dayjs and sent to the API → the event appears in the right panel list → the administrator can switch the "View in Timezone" dropdown to see all events in a different timezone → clicking "Edit" opens a modal with pre-filled values → after updating, the PATCH request logs all changed fields → clicking "View Logs" opens a modal showing the full update history.

## 2.4 User Roles
- **Administrator** — the sole user role. No authentication required. Can create profiles, create/edit/delete events, view events across timezones, and inspect event update history.
- **System maintainer** — extends backend APIs, adds frontend features, manages deployment infrastructure, and monitors the database.

---

# 3. System Architecture

## 3.1 High-Level Design (HLD)
EMS implements a decoupled frontend/backend architecture. The backend is an Express.js application that exposes RESTful endpoints with CORS enabled for all origins. The frontend is a React SPA served by Vite that communicates with the backend via Axios. MongoDB serves as the document store, accessed through Mongoose ODM. The frontend manages application state through two Zustand stores (profileStore, eventStore) and renders Vanilla CSS components in a two-panel layout.

## 3.2 Low-Level Design (LLD)
The repository is organized by layer: the backend is split into `config/` (database connection), `controllers/` (profile and event business logic), `middleware/` (error handling), `models/` (Mongoose schema definitions), and `routes/` (Express router definitions). The frontend is split into `components/` (CreateEvent, EventsList, Header, Modal, common), `store/` (Zustand stores), `services/` (Axios API instance), `hooks/` (custom React hooks), `utils/` (timezone helpers, DSA utilities), and `styles/` (Vanilla CSS with CSS variables). The Axios instance uses a response interceptor to normalize error messages from the API.

## 3.3 Architecture Diagram

```
+-----------------------------------------------------------+
|                      Frontend (Vercel)                     |
|  +-------------+  +--------------+  +---------------+     |
|  |  CreateEvent |  |  EventsList  |  |  Modals       |     |
|  |  (left)      |  |  (right)     |  |  (overlay)    |     |
|  +------+------+-  +------+-------+  +-------+-------+     |
|         |                |                   |              |
|  +------^----------------^-------------------^---------+  |
|  |              Zustand Stores                          |  |
|  |         profileStore + eventStore                    |  |
|  +------------------------^-----------------------------+  |
|                           |                                |
|  +------------------------^-----------------------------+  |
|  |              Axios API Service                       |  |
|  |         VITE_API_URL -> backend                      |  |
|  +------------------------^-----------------------------+  |
+---------------------------+-------------------------------+
                            | HTTPS
+---------------------------+-------------------------------+
|                    Backend (Render)                        |
|  +------------------------^-----------------------------+  |
|  |              Express.js Server                       |  |
|  |         CORS + JSON + Morgan                         |  |
|  +------+---------------------------^--------+          |
|  +------v-----------+          +------^--------+          |
|  |  Profile Routes  |          |   Event Routes |          |
|  |  GET/POST/PATCH  |          |  GET/POST/     |          |
|  +------+-----------+          +------^--------+          |
|  +------v-----------+          +------^--------+          |
|  |  Profile          |          |   Event        |          |
|  |  Controller       |          |   Controller   |          |
|  +------+-----------+          +------^--------+          |
|         |                               |                  |
|  +------^-------------------------------^---------+      |
|  |              Mongoose ODM                        |      |
|  |         Schema Validation + Indexes              |      |
|  +------------------------^------------------------+      |
+---------------------------+------------------------------+
                            |
+---------------------------+------------------------------+
|                    MongoDB Atlas                          |
|  +------------------------^------------------------+     |
|  |  profiles collection     events collection       |     |
|  |  - name (unique)         - profiles (ref[])      |     |
|  |  - timezone              - timezone              |     |
|  |                          - startDateTime (UTC)   |     |
|  |                          - endDateTime (UTC)     |     |
|  |                          - updateLogs[]          |     |
|  +-------------------------------------------------+     |
+-----------------------------------------------------------+
```

## 3.4 Module Breakdown
```
EMS/
+-- server/
|   +-- config/
|   |   +-- db.js                     # MongoDB connection with Mongoose
|   +-- controllers/
|   |   +-- profileController.js       # Profile CRUD operations
|   |   +-- eventController.js         # Event CRUD + update logging logic
|   +-- middleware/
|   |   +-- errorMiddleware.js         # Centralized error handler + 404
|   +-- models/
|   |   +-- Profile.js                 # Profile schema (name, timezone)
|   |   +-- Event.js                   # Event schema with updateLogs subdoc
|   +-- routes/
|   |   +-- profileRoutes.js           # Profile API routes
|   |   +-- eventRoutes.js             # Event API routes
|   +-- .env                           # Environment variables (gitignored)
|   +-- package.json
|   +-- server.js                      # Express app entry point
|
+-- client/
|   +-- src/
|   |   +-- components/
|   |   |   +-- CreateEvent/
|   |   |   |   +-- CreateEvent.jsx    # Left panel form (local state)
|   |   |   |   +-- ProfileSelector.jsx # Multi-select with search + add
|   |   |   |   +-- TimezoneDropdown.jsx # Searchable timezone picker
|   |   |   |   +-- DateTimePicker.jsx  # Custom calendar + time input
|   |   |   +-- EventsList/
|   |   |   |   +-- EventsList.jsx      # Right panel with profile filtering
|   |   |   |   +-- EventCard.jsx       # Event display card with actions
|   |   |   |   +-- EmptyState.jsx      # No events placeholder
|   |   |   +-- Header/
|   |   |   |   +-- ProfileDropdown.jsx # Profile selector in header
|   |   |   +-- Modal/
|   |   |   |   +-- EditEventModal.jsx  # Edit event in overlay modal
|   |   |   |   +-- UpdateHistoryModal.jsx # View change logs
|   |   |   +-- common/
|   |   |       +-- Button.jsx          # Reusable button component
|   |   |       +-- Card.jsx            # Reusable card wrapper
|   |   |       +-- Loader.jsx          # Loading spinner
|   |   |       +-- Toast.jsx           # Success/error notifications
|   |   +-- store/
|   |   |   +-- profileStore.js         # Zustand: profiles, currentProfile
|   |   |   +-- eventStore.js           # Zustand: events, forms, modals
|   |   +-- services/
|   |   |   +-- api.js                  # Axios instance + API functions
|   |   +-- hooks/
|   |   |   +-- useDebounce.js          # Debounce hook for search inputs
|   |   |   +-- useEvents.js            # Event fetching hook
|   |   |   +-- useProfiles.js          # Profile fetching hook
|   |   +-- utils/
|   |   |   +-- timezone.js             # dayjs helpers, TIMEZONES array
|   |   |   +-- dsaUtils.js             # LRU cache, binary search, sorting
|   |   |   +-- constants.js            # App-wide constants
|   |   +-- styles/
|   |   |   +-- variables.css           # CSS custom properties
|   |   |   +-- global.css              # Base styles, layout, components
|   |   |   +-- animations.css          # Transitions, keyframes
|   |   +-- App.jsx                     # Root component, layout
|   |   +-- main.jsx                    # React DOM entry point
|   +-- index.html                      # HTML template
|   +-- vite.config.js                  # Vite config with API proxy
|   +-- package.json
|
+-- PLANNING.md                         # Project planning document
+-- .gitignore
+-- README.md
```

## 3.5 Data Flow Diagram (DFD)
**Profile creation flow:** Browser -> ProfileDropdown -> POST /api/profiles -> Express -> Mongoose Profile.create() -> MongoDB -> profile returned -> Zustand profileStore updated -> ProfileSelector re-renders.

**Event creation flow:** Browser -> CreateEvent form -> user selects profiles, timezone, dates -> toUTC() converts local time to UTC -> POST /api/events -> Express -> Mongoose Event.create() -> MongoDB -> event returned with populated profiles -> eventStore updated -> EventsList re-renders.

**Event update flow:** Browser -> EditEventModal -> user modifies fields -> toUTC() converts local time to UTC -> PATCH /api/events/:id -> Express -> controller compares old/new values -> change pushed to updateLogs[] -> Event.save() -> MongoDB -> updated event returned -> eventStore updated -> EventsList re-renders.

**Timezone display flow:** Browser -> user changes "View in Timezone" dropdown -> eventStore.viewTimezone updated -> EventCard re-renders -> formatInTimezone() converts UTC startDateTime/endDateTime to selected timezone -> display updates instantly without API call.

## 3.6 Sequence Diagram
A typical event management session: Administrator opens browser -> App.jsx mounts -> useEffect triggers fetchProfiles() and fetchEvents() -> both Zustand stores dispatch API calls -> GET /api/profiles and GET /api/events hit the backend -> Mongoose queries MongoDB -> responses returned -> stores populated -> CreateEvent form and EventsList render -> administrator fills form (profiles, timezone, dates) -> clicks Create -> toUTC() converts to UTC -> POST /api/events -> backend validates and saves -> event returned -> store updated -> event appears in right panel -> administrator clicks Edit -> EditEventModal opens with pre-filled values -> modifies fields -> clicks Update -> PATCH /api/events/:id -> controller logs changes -> event saved -> store updated -> modal closes -> administrator clicks View Logs -> UpdateHistoryModal opens -> displays timestamped change history.

---

# 4. Technology Stack

## 4.1 Core Technologies
- **Node.js 16+** — JavaScript runtime for the backend server.
- **Express 4** — Web framework for REST API with JSON middleware.
- **MongoDB 7+** — Document database for profiles and events.
- **Mongoose 8** — ODM for MongoDB with schema validation, indexes, and population.
- **React 19** — Frontend SPA library with hooks and functional components.
- **Vite 8** — Frontend build tool with HMR and API proxy.

## 4.2 Runtime Technologies
- **Zustand** — Lightweight state management (alternative to Redux).
- **Axios** — HTTP client with response interceptors for error normalization.
- **dayjs** (utc + timezone plugins) — Timezone conversion and date formatting.
- **Lucide React** — SVG icon library.
- **Morgan** — HTTP request logging middleware for development.
- **cors** — Cross-origin resource sharing middleware.
- **dotenv** — Environment variable loading from .env files.

## 4.3 Implementation Technologies
- **Vanilla CSS** — Custom properties (CSS variables) for theming, no CSS framework.
- **Custom Calendar** — Hand-built month-view date picker with navigation.
- **Custom DSA Utilities** — LRU cache, binary search, merge sort, debouncing, overlap detection.
- **Vercel** — Serverless frontend deployment with automatic builds.
- **Render** — Hosted backend deployment with free tier.
- **MongoDB Atlas** — Cloud-hosted MongoDB with free M0 cluster.

## 4.4 Libraries and Dependencies

### Backend (server/package.json)
| Dependency | Version | Role |
|---|---|---|
| `express` | `4.21+` | Web framework for REST API |
| `mongoose` | `8.6+` | MongoDB ODM with schema validation |
| `cors` | `2.8.5` | Cross-origin resource sharing |
| `dotenv` | `16.4.5` | Environment variable loading |
| `morgan` | `1.10.0` | HTTP request logging |
| `nodemon` | `3.1.4` | Auto-reload during development (devDep) |

### Frontend (client/package.json)
| Dependency | Version | Role |
|---|---|---|
| `react` | `19.2.7` | Frontend UI library |
| `react-dom` | `19.2.7` | React DOM rendering |
| `zustand` | `5.0.14` | State management |
| `axios` | `1.18.1` | HTTP client |
| `dayjs` | `1.11.21` | Date/time manipulation with timezone support |
| `lucide-react` | `1.27.0` | SVG icon components |
| `vite` | `8.1.1` | Build tool and dev server (devDep) |
| `@vitejs/plugin-react` | `6.0.3` | Vite React plugin (devDep) |
| `oxlint` | `1.71.0` | Linter (devDep) |

## 4.5 External Services / Infrastructure
- **MongoDB Atlas** — cloud-hosted MongoDB for production and development.
- **Vercel** — serverless frontend hosting with automatic GitHub integration.
- **Render** — hosted backend with automatic deployment from GitHub.
- No other external services or cloud APIs are required — the system is self-contained.

---

# 5. Installation and Setup

## 5.1 Prerequisites
- Node.js 16 or newer.
- npm or yarn.
- MongoDB (local, Docker, or Atlas).

## 5.2 System Requirements
- OS: Linux, macOS, or Windows (developed cross-platform).
- Memory: 256 MB minimum for backend + 512 MB minimum for frontend build.
- Disk: 200 MB for application code and dependencies.
- Database: MongoDB instance accessible via connection string.

## 5.3 Environment Setup
The backend uses environment variables loaded from a `.env` file in the `server/` directory. The frontend uses Vite environment variables prefixed with `VITE_` for API base URL configuration.

## 5.4 Installation Steps
```bash
# Clone the repository
git clone https://github.com/VIP-CODER1/Event-Management-System.git
cd Event-Management-System

# Backend setup
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
NODE_ENV=development
EOF

# Start the server (with nodemon for auto-reload)
npm run dev

# Frontend setup (new terminal)
cd client
npm install

# Create .env file (optional, defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm run dev
```

The backend runs on `http://localhost:5000`. The frontend runs on `http://localhost:5173` and automatically proxies `/api` requests to `http://localhost:5000` via the Vite dev server proxy.

## 5.5 Configuration Parameters
| Setting | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Backend server port |
| `MONGODB_URI` | `mongodb://localhost:27017/ems` | MongoDB connection string |
| `NODE_ENV` | `development` | Environment mode (development/production) |
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

## 5.6 Environment Variables
```bash
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ems
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=https://event-management-system-r1w6.onrender.com/api
```

---

# 6. Database Design

## 6.1 Entity Relationship Diagram (ERD)
The database uses MongoDB with two document collections: `profiles` and `events`. Events reference Profiles via Mongoose ObjectId arrays for a many-to-many relationship. Each collection has appropriate indexes for query performance and uniqueness constraints.

## 6.2 Data Schema
The core data structures are defined as Mongoose Schema models:

**Profile:** Stores user profile information with `name` (unique, trimmed, 2-50 characters) and `timezone` (IANA string, default America/New_York). Timestamps are auto-generated by Mongoose.

**Event:** Stores event information with `profiles` (array of ObjectId references to Profile, required, min 1), `timezone` (IANA string, required), `startDateTime` (Date, required, stored in UTC), `endDateTime` (Date, required, stored in UTC), and `updateLogs` (array of change log entries). Each log entry contains a `timestamp` and an array of `changes` with `field`, `oldValue`, and `newValue`. Timestamps are auto-generated by Mongoose.

## 6.3 Collection Structure
| Collection | Key Fields | Indexes |
|---|---|---|
| `profiles` | `name` (unique, trimmed, 2-50 chars), `timezone` (default: America/New_York) | Unique on `name` |
| `events` | `profiles` (ObjectId[]), `timezone`, `startDateTime` (UTC), `endDateTime` (UTC), `updateLogs[]` | On `profiles`, `startDateTime`, `endDateTime` |

## 6.4 Relationships and Constraints
- Events reference Profiles via ObjectId arrays — one event can be assigned to multiple profiles.
- `profiles` array must contain at least one profile (enforced by Mongoose pre-validate hook).
- `endDateTime` must be after `startDateTime` (enforced by Mongoose pre-validate hook).
- Profile `name` must be unique across all profiles (enforced by MongoDB unique index).
- Profile `name` must be 2-50 characters (enforced by Mongoose minlength/maxlength).
- Timezone must be a valid IANA timezone string (validated at the application level).
- Update logs are appended on every PATCH request — no history is deleted or overwritten.
- Cascade delete is not implemented — events with deleted profiles will show stale references.

---

# 7. API Documentation

## 7.1 HTTP API (Express.js)

### GET /api/health
Health check endpoint for monitoring.
**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-07-28T10:30:00.000Z"
}
```

### POST /api/profiles
Creates a new profile.
**Request body:**
```json
{
  "name": "John Doe",
  "timezone": "Asia/Kolkata"
}
```
**Response (201 Created):**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "John Doe",
  "timezone": "Asia/Kolkata",
  "createdAt": "2026-07-28T10:30:00.000Z",
  "updatedAt": "2026-07-28T10:30:00.000Z"
}
```
**Failure:** 400 Bad Request — duplicate name, name too short, or validation error.

### GET /api/profiles
Retrieves all profiles sorted by name.
**Response (200 OK):** Array of profile objects.

### GET /api/profiles/:id
Retrieves a single profile by MongoDB ObjectId.
**Response (200 OK):** Profile object.
**Failure:** 404 Not Found — "Profile not found".

### PATCH /api/profiles/:id/timezone
Updates a profile's timezone.
**Request body:** `{"timezone": "Europe/London"}`
**Response (200 OK):** Updated profile object.
**Failure:** 404 Not Found — "Profile not found".

### GET /api/events
Retrieves all events with populated profile names, sorted by startDateTime descending.
**Query parameters:** `profileId` (optional, filters by profile).
**Response (200 OK):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "profiles": [
      {
        "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
        "name": "John Doe",
        "timezone": "Asia/Kolkata"
      }
    ],
    "timezone": "Asia/Kolkata",
    "startDateTime": "2026-07-28T03:30:00.000Z",
    "endDateTime": "2026-07-28T05:30:00.000Z",
    "updateLogs": [],
    "createdAt": "2026-07-28T10:30:00.000Z",
    "updatedAt": "2026-07-28T10:30:00.000Z"
  }
]
```

### GET /api/events?profileId=xxx
Retrieves events filtered by profile ID. Returns only events assigned to the specified profile.

### POST /api/events
Creates a new event.
**Request body:**
```json
{
  "profiles": ["64a1b2c3d4e5f6a7b8c9d0e1"],
  "timezone": "Asia/Kolkata",
  "startDateTime": "2026-07-28T03:30:00.000Z",
  "endDateTime": "2026-07-28T05:30:00.000Z"
}
```
**Response (201 Created):** Created event object with populated profiles.
**Failure:** 400 Bad Request — missing profiles, missing dates, or end before start.

### PATCH /api/events/:id
Updates an existing event. Automatically logs all changed fields.
**Request body:** Any subset of `profiles`, `timezone`, `startDateTime`, `endDateTime`.
**Response (200 OK):**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
  "profiles": [...],
  "timezone": "America/New_York",
  "startDateTime": "2026-07-27T14:00:00.000Z",
  "endDateTime": "2026-07-28T05:30:00.000Z",
  "updateLogs": [
    {
      "timestamp": "2026-07-28T11:00:00.000Z",
      "changes": [
        {
          "field": "timezone",
          "oldValue": "Asia/Kolkata",
          "newValue": "America/New_York"
        },
        {
          "field": "startDateTime",
          "oldValue": "2026-07-28T03:30:00.000Z",
          "newValue": "2026-07-27T14:00:00.000Z"
        }
      ]
    }
  ]
}
```
**Failure:** 400 Bad Request — end before start. 404 Not Found — "Event not found".

### DELETE /api/events/:id
Deletes an event.
**Response (200 OK):** `{"message": "Event deleted successfully"}`
**Failure:** 404 Not Found — "Event not found".

### GET /api/events/:id/logs
Retrieves the update history for a specific event.
**Response (200 OK):** Array of log entries with timestamps and changes.

## 7.2 Error Handling and Status Codes
| Scenario | HTTP Status | Response | User-Facing Action |
|---|---|---|---|
| Missing required fields | 400 | `{"message": "..."}` | Alert with error message |
| End before start | 400 | `{"message": "End date/time must be after start date/time"}` | Alert in form |
| Duplicate profile name | 400 | `{"message": "A profile with this name already exists"}` | Alert in form |
| Profile not found | 404 | `{"message": "Profile not found"}` | Not shown (API only) |
| Event not found | 404 | `{"message": "Event not found"}` | Not shown (API only) |
| Route not found | 404 | `{"message": "Route /api/xxx not found"}` | Not shown (API only) |
| Server error | 500 | `{"message": "Internal server error"}` | Generic alert |

## 7.3 CORS Configuration
The backend is configured with `origin: '*'` to allow all origins. This enables the Vercel frontend to make requests to the Render backend without CORS issues. Methods allowed: GET, POST, PATCH, DELETE, OPTIONS. Allowed headers: Content-Type.

---

# 8. Usage Guide

## 8.1 User Interface Overview
The application provides a single-page web interface with the following main views:
1. **Header** — Application title ("Event Management"), subtitle ("Create and manage events across multiple timezones"), and a profile dropdown in the top-right corner for selecting the current profile.
2. **Create Event Panel (Left)** — Form with profile multi-select, timezone dropdown, start/end date-time pickers, and a "Create Event" button.
3. **Events List Panel (Right)** — "View in Timezone" dropdown at the top, followed by a scrollable list of event cards. Each card shows profile names, start/end times, created/updated timestamps, and action buttons (Edit, View Logs).
4. **Edit Event Modal** — Overlay modal with pre-filled form fields for editing an existing event.
5. **Update History Modal** — Overlay modal showing timestamped change logs with old/new values for each field.

## 8.2 Profile Management
On first access, no profiles exist. The administrator can create profiles by:
1. Clicking the profile dropdown in the header → clicking "Add Profile" → typing a name → clicking "Add".
2. Or directly in the Create Event form's ProfileSelector → typing a name in the "Add new profile..." field → clicking "Add".

Once created, profiles appear in the ProfileSelector multi-select dropdown and the header ProfileDropdown. Selecting a profile in the header filters the events list to show only events assigned to that profile.

## 8.3 Event Creation
1. Select one or more profiles from the ProfileSelector multi-select.
2. Pick a timezone from the TimezoneDropdown (defaults to Eastern Time).
3. Select a start date using the custom calendar picker and a start time using the time input.
4. Select an end date and end time the same way.
5. Click "+ Create Event".
6. The date-times are converted to UTC using `dayjs.tz(date, timezone).utc().toISOString()` and sent to the API.
7. A toast notification confirms "Event created successfully!".
8. The event appears at the top of the EventsList panel.

## 8.4 Event Viewing and Timezone Conversion
The EventsList panel shows all events (or filtered events if a profile is selected in the header). Each event card displays:
- Profile names (comma-separated)
- Start time (converted to the selected "View in Timezone")
- End time (converted to the selected "View in Timezone")
- Created timestamp
- Updated timestamp
- Edit and View Logs buttons

Changing the "View in Timezone" dropdown instantly recalculates all displayed times without making any API calls — the conversion happens client-side using `dayjs(date).tz(tz).format()`.

## 8.5 Event Editing
1. Click the "Edit" button on any event card.
2. The EditEventModal opens with all fields pre-filled (converted from UTC to the event's timezone).
3. Modify any field (profiles, timezone, start/end dates).
4. Click "Update Event".
5. The controller compares old and new values, logs any changes to `updateLogs[]`, and saves.
6. A toast notification confirms "Event updated successfully!".
7. The modal closes and the events list updates.

## 8.6 Event Update History
1. Click the "View Logs" button on any event card.
2. The UpdateHistoryModal opens showing all logged changes.
3. Each log entry displays:
   - Timestamp of when the change was made
   - Field name, old value (red, strikethrough), arrow, new value (green)
4. If no changes have been made, a "No update history yet" message is shown.

## 8.7 Troubleshooting
- **No events appearing** — Check that the backend is running and MongoDB is accessible. Verify the VITE_API_URL environment variable.
- **CORS errors** — Ensure the backend has CORS configured with `origin: '*'`. Check that the frontend is using the correct API URL.
- **Timezone conversion looks wrong** — Verify the event's stored timezone matches what was selected during creation. The display timezone can be changed independently.
- **Backend not responding** — Check the Render deployment for cold start issues (free tier sleeps after inactivity). The first request may take 30-50 seconds.
- **Frontend shows blank page** — Check browser console for errors. Verify VITE_API_URL is set correctly in Vercel environment variables.

---

# 9. Security and Scalability

## 9.1 Authentication Mechanism
EMS has no authentication layer. Profiles are identified by name only. This is a deliberate design choice to keep the system lightweight and focused on event management rather than user management.

## 9.2 Data Security
- MongoDB connection strings are stored in environment variables, not in code.
- CORS is configured to allow all origins (`origin: '*'`) for development flexibility.
- No sensitive data is stored — profiles contain only a name and timezone.
- Mongoose schema validation prevents invalid data from being stored.

## 9.3 Rate Limiting and Validation
- **Input validation:** Mongoose schema validators on all fields (required, minlength, maxlength, unique, custom pre-validate hooks).
- **Server-side validation:** Controllers check for required fields, valid dates, and profile existence before database operations.
- **Client-side validation:** Forms check for selected profiles, valid dates, and end-after-start before sending API requests.

## 9.4 Scalability Approach
- **Database indexes:** Indexes on `profiles`, `startDateTime`, and `endDateTime` fields for efficient queries.
- **Population:** Mongoose `.populate()` is used to join profile data in a single query rather than multiple round trips.
- **Stateless backend:** No session state on the server — each request is independent.
- **CDN deployment:** Frontend served from Vercel's global CDN for low-latency access.
- **Serverless scaling:** Vercel automatically scales the frontend based on traffic.
- **Free tier limits:** Render free tier may experience cold starts; MongoDB Atlas M0 has 512 MB storage limit.

---

# 10. Testing

## 10.1 Test Plan
The test suite covers backend API integration tests and manual frontend verification. Backend tests use a test MongoDB instance to verify CRUD operations, validation, and error handling.

## 10.2 Test Cases

### Backend API Tests
- **Profile CRUD:** Create profile, list profiles, get profile by ID, update timezone, reject duplicate names, reject short names.
- **Event CRUD:** Create event with valid data, reject missing profiles, reject end before start, update event with change logging, delete event, get event logs.
- **Error handling:** 404 for non-existent IDs, 400 for validation errors, 500 for server errors.

### Frontend Manual Tests
- **Profile creation:** Create profile from header dropdown and from CreateEvent form.
- **Event creation:** Create event with single profile, multiple profiles, different timezones.
- **Timezone conversion:** Verify displayed times change correctly when switching "View in Timezone".
- **Event editing:** Edit event and verify update logs capture all changes.
- **Responsive design:** Test on mobile viewport (768px and below).
- **Toast notifications:** Verify success messages appear and auto-dismiss after 3 seconds.

## 10.3 Running Tests
```bash
# Backend tests (requires test MongoDB)
cd server
npm test

# Frontend lint check
cd client
npm run lint
```

---

# 11. Deployment

## 11.1 Deployment Architecture
The application is deployed as two separate services: the Express.js backend on Render (with MongoDB Atlas as the database) and the React frontend on Vercel (as a serverless deployment). The frontend communicates with the backend via HTTPS using the VITE_API_URL environment variable.

## 11.2 Backend Deployment (Render)
1. Push code to GitHub.
2. Create a new Web Service on Render.
3. Connect the GitHub repository.
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `MONGODB_URI` — MongoDB Atlas connection string
     - `NODE_ENV` — production
     - `PORT` — 5000 (or leave default)
5. Deploy — Render auto-detects Node.js and runs the commands.

## 11.3 Frontend Deployment (Vercel)
1. Push code to GitHub.
2. Import project on Vercel.
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Environment Variables:**
     - `VITE_API_URL` — `https://your-backend.onrender.com/api`
4. Deploy — Vercel auto-detects Vite and builds.

## 11.4 Database Deployment (MongoDB Atlas)
1. Create a free M0 cluster on MongoDB Atlas.
2. Create a database user with read/write access.
3. Whitelist IP addresses (or allow all with `0.0.0.0/0`).
4. Get the connection string and add it to Render environment variables.

## 11.5 CI/CD Pipeline
- **Frontend:** Vercel automatically deploys on every push to the main branch.
- **Backend:** Render automatically deploys on every push to the main branch.
- **No manual steps required** — the entire deployment is GitOps-based.

## 11.6 Release Notes
- **Version 1.0.0** — Initial production release with profile management, event CRUD, timezone conversion, update logging, custom calendar picker, and responsive UI.

## 11.7 Known Issues and Limitations
- **No authentication** — anyone can create profiles and events.
- **Render cold start** — free tier backend may take 30-50 seconds to respond on first request after inactivity.
- **MongoDB Atlas M0 limits** — 512 MB storage, shared RAM.
- **No WebSocket support** — event updates require manual refresh (though Zustand handles this via API polling).
- **No audit trail for profiles** — only events have update logs.
- **Single-page layout** — no routing, no deep linking to specific events.

---

# 12. Support and Maintenance

## 12.1 Troubleshooting Guide
See section 8.7 for common issues. For API-level problems, check the backend logs on Render. For database issues, verify the MongoDB Atlas connection string and network access. For frontend issues, check browser developer console for API errors or React rendering warnings.

## 12.2 Frequently Asked Questions (FAQs)
- **How do I add a new timezone?** Add it to the `TIMEZONES` array in `client/src/utils/timezone.js`.
- **How do I change the default timezone?** Update the `default` value in the Profile model (`server/models/Profile.js`).
- **Can I add more fields to events?** Yes — add the field to the Event schema, update the controller's comparison logic, and add it to the frontend form.
- **How do I reset the database?** Drop the MongoDB collections or create a new database.
- **Can I run this without MongoDB Atlas?** Yes — use a local MongoDB instance and update the MONGODB_URI in `.env`.

## 12.3 Maintenance Process
- Backend changes go in `server/` following the existing controller/model/route pattern.
- Frontend changes go in `client/src/` following the existing component/store/util pattern.
- Database schema changes require corresponding updates to Mongoose models.
- API contract changes require updates to both backend controllers and frontend API service.

---

# 13. Future Enhancements

## 13.1 Planned Features
- JWT-based authentication with user accounts and role-based access control.
- Event recurring patterns (daily, weekly, monthly).
- Calendar view (month/week/day) in addition to the list view.
- Email/SMS notifications for upcoming events.
- Drag-and-drop event rescheduling.
- Event categories and tags.
- Export events to .ics (iCalendar) format.
- Multi-language support.

## 13.2 Improvement Areas
- Add comprehensive end-to-end test suite with Cypress or Playwright.
- Implement database backup and restore utilities.
- Add API versioning for backward compatibility.
- Performance optimization for large-scale deployments (1000+ events).
- Enhanced error reporting with structured logging and monitoring.
- WebSocket support for real-time event updates.
- Progressive Web App (PWA) support for offline access.

---

# 14. Change Log

## 14.1 Version History
| Version | Date | Summary |
|---|---|---|
| 1.0.0 | 2026-07 | Initial production release with profile management, event CRUD, timezone conversion, update logging, custom calendar picker, and responsive UI |

## 14.2 Change Summary
Initial release implements the complete event management platform with Express.js backend (MongoDB/Mongoose, profile CRUD, event CRUD with update logging, validation) and React frontend (Zustand, dayjs timezone conversion, custom calendar, two-panel layout, edit modal, update history modal, toast notifications, responsive design).

---

# 15. References

## 15.1 Documentation References
- `/PLANNING.md` — Project planning document with phase breakdown and DSA strategies.
- `/README.md` — User-facing documentation and quick start guide.
- `/docs/technical.md` — This technical documentation.

## 15.2 External Resources
- Express.js documentation — https://expressjs.com/
- Mongoose documentation — https://mongoosejs.com/
- React documentation — https://react.dev/
- Zustand documentation — https://zustand-demo.pmnd.rs/
- dayjs documentation — https://day.js.org/
- Vite documentation — https://vitejs.dev/
- MongoDB Atlas documentation — https://www.mongodb.com/docs/atlas/
- Render documentation — https://render.com/docs
- Vercel documentation — https://vercel.com/docs
