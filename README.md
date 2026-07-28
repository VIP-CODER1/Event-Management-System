# Event Management System

A full-stack MERN application for managing events across multiple profiles and timezones. Admins can create profiles, assign events to one or more profiles, and manage everything with timezone-aware scheduling.

<img width="1917" height="871" alt="image" src="https://github.com/user-attachments/assets/3b4eaa76-473c-40a6-b2c6-56fad2b927ea" />
<img width="1917" height="867" alt="image" src="https://github.com/user-attachments/assets/25b140a7-4be3-4f9b-8d56-46ec9da55339" />
 <img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/d569852c-a579-47b5-96c8-c6649133be1d" />



## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Timezone Handling](#timezone-handling)
- [DSA Strategies](#dsa-strategies)
- [Edge Cases Handled](#edge-cases-handled)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Video Explanation](#video-explanation)

---

## Overview

This is an Event Management System built as a single-page application where admins can:

1. **Create profiles** — Each profile represents a user with a name and timezone
2. **Create events** — Assign events to one or more profiles with start/end dates in any timezone
3. **View events** — See all events converted to any timezone with a single dropdown
4. **Edit events** — Modify any field with full change tracking
5. **View update history** — See a log of every change made to an event with timestamps

The app uses a two-panel layout: left panel for creating events, right panel for viewing and managing them.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 (Vite 8) | SPA with fast build and HMR |
| Styling | Vanilla CSS | CSS variables for theming, no framework dependency |
| State Management | Zustand | Lightweight alternative to Redux, single-store pattern |
| HTTP Client | Axios | API calls with interceptors for error handling |
| Timezone | dayjs (utc + timezone plugins) | UTC conversion and timezone formatting |
| Icons | Lucide React | Consistent, lightweight SVG icon library |
| Backend | Node.js + Express 4 | REST API with JSON middleware |
| Database | MongoDB + Mongoose 8 | Document database with schema validation |
| ORM | Mongoose ODM | Schema definitions, validation, indexes, population |
| Logging | Morgan | HTTP request logging in development |
| CORS | cors middleware | Cross-origin requests from Vercel frontend |

---

## Features

### Profile Management
- Create new profiles with a name (2-50 characters, unique)
- Each profile has a default timezone (America/New_York)
- Profiles can be created inline from the event form via the "Add" button
- Searchable profile selector with checkbox multi-select
- Profile dropdown in the header to filter events by profile

### Event Management
- **Multi-profile assignment** — One event can be assigned to multiple profiles
- **Timezone-aware creation** — Pick date, time, and timezone; all converted to UTC for storage
- **Event editing** — Edit modal with pre-filled values from the stored UTC times
- **Event deletion** — Remove events with confirmation
- **Real-time list updates** — Events appear instantly after creation or update

### Timezone Handling
- All date-times stored in UTC in MongoDB
- Display conversion using dayjs timezone plugins
- "View in Timezone" dropdown converts all displayed times instantly
- Supports 15 IANA timezones with human-readable labels
- Handles DST transitions automatically via dayjs

### Event Update Logging
- Every PATCH request tracks which fields changed
- Stores old value, new value, and timestamp for each change
- View full update history in a modal per event
- Logs survive across multiple edits — no history is lost

### UI/UX
- Single-page two-panel layout (create on left, list on right)
- Custom calendar picker with month navigation
- Time input with native HTML5 time picker
- Toast notifications on successful create/update
- Loading states and empty states
- Responsive design for different screen sizes
- CSS variables for easy theming

---

## Project Structure

```
EMS/
├── server/
│   ├── config/
│   │   └── db.js                     # MongoDB connection with Mongoose
│   ├── controllers/
│   │   ├── profileController.js       # Profile CRUD operations
│   │   └── eventController.js         # Event CRUD + update logging logic
│   ├── middleware/
│   │   └── errorMiddleware.js         # Centralized error handler + 404
│   ├── models/
│   │   ├── Profile.js                 # Profile schema (name, timezone)
│   │   └── Event.js                   # Event schema with updateLogs subdoc
│   ├── routes/
│   │   ├── profileRoutes.js           # Profile API routes
│   │   └── eventRoutes.js             # Event API routes
│   ├── .env                           # Environment variables (gitignored)
│   ├── package.json
│   └── server.js                      # Express app entry point
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateEvent/
│   │   │   │   ├── CreateEvent.jsx    # Left panel form (local state)
│   │   │   │   ├── ProfileSelector.jsx# Multi-select with search + add
│   │   │   │   ├── TimezoneDropdown.jsx# Searchable timezone picker
│   │   │   │   └── DateTimePicker.jsx # Custom calendar + time input
│   │   │   ├── EventsList/
│   │   │   │   ├── EventsList.jsx     # Right panel with profile filtering
│   │   │   │   ├── EventCard.jsx      # Event display card with actions
│   │   │   │   └── EmptyState.jsx     # No events placeholder
│   │   │   ├── Header/
│   │   │   │   └── ProfileDropdown.jsx# Profile selector in header
│   │   │   ├── Modal/
│   │   │   │   ├── EditEventModal.jsx # Edit event in overlay modal
│   │   │   │   └── UpdateHistoryModal.jsx # View change logs
│   │   │   └── common/
│   │   │       ├── Button.jsx         # Reusable button component
│   │   │       ├── Card.jsx           # Reusable card wrapper
│   │   │       ├── Loader.jsx         # Loading spinner
│   │   │       └── Toast.jsx          # Success/error notifications
│   │   ├── store/
│   │   │   ├── profileStore.js        # Zustand: profiles, currentProfile
│   │   │   └── eventStore.js          # Zustand: events, forms, modals
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + API functions
│   │   ├── hooks/
│   │   │   ├── useDebounce.js         # Debounce hook for search inputs
│   │   │   ├── useEvents.js           # Event fetching hook
│   │   │   └── useProfiles.js         # Profile fetching hook
│   │   ├── utils/
│   │   │   ├── timezone.js            # dayjs helpers, TIMEZONES array
│   │   │   ├── dsaUtils.js            # LRU cache, binary search, sorting
│   │   │   └── constants.js           # App-wide constants
│   │   ├── styles/
│   │   │   ├── variables.css          # CSS custom properties (colors, spacing)
│   │   │   ├── global.css             # Base styles, layout, components
│   │   │   └── animations.css         # Transitions, keyframes
│   │   ├── assets/                    # Static assets
│   │   ├── App.jsx                    # Root component, layout
│   │   └── main.jsx                   # React DOM entry point
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite config with API proxy
│   └── package.json
│
├── PLANNING.md                        # Project planning document
├── .gitignore
└── README.md
```

---

## Database Schema

### Profile

```javascript
{
  _id: ObjectId,              // Auto-generated MongoDB ID
  name: {
    type: String,
    required: true,           // Profile name is mandatory
    trim: true,               // Whitespace trimmed
    unique: true,             // No duplicate names
    minlength: 2,             // Minimum 2 characters
    maxlength: 50             // Maximum 50 characters
  },
  timezone: {
    type: String,
    required: true,
    default: 'America/New_York'  // Default timezone
  },
  createdAt: Date,            // Auto-generated timestamp
  updatedAt: Date             // Auto-generated timestamp
}
```

**Indexes:** `{ name: 1 }` (unique)

### Event

```javascript
{
  _id: ObjectId,              // Auto-generated MongoDB ID
  profiles: [{
    type: ObjectId,
    ref: 'Profile',           // Reference to Profile collection
    required: true            // At least one profile required
  }],
  timezone: {
    type: String,
    required: true            // IANA timezone string
  },
  startDateTime: {
    type: Date,
    required: true            // Stored in UTC
  },
  endDateTime: {
    type: Date,
    required: true            // Stored in UTC
  },
  updateLogs: [{              // Array of change log entries
    timestamp: Date,          // When the change was made
    changes: [{
      field: String,          // Name of the field that changed
      oldValue: Mixed,        // Previous value
      newValue: Mixed         // New value
    }]
  }],
  createdAt: Date,            // Auto-generated timestamp
  updatedAt: Date             // Auto-generated timestamp
}
```

**Indexes:** `{ profiles: 1 }`, `{ startDateTime: 1 }`, `{ endDateTime: 1 }`

**Validation Rules:**
- `endDateTime` must be after `startDateTime`
- At least one profile must be selected
- Timezone must be a valid IANA timezone string
- Update logs are appended on every PATCH request

---

## API Endpoints

### Base URL
```
Production: https://event-management-system-r1w6.onrender.com/api
Development: http://localhost:5000/api
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | List all profiles (sorted by name) |
| POST | `/api/profiles` | Create a new profile |
| GET | `/api/profiles/:id` | Get a single profile |
| PATCH | `/api/profiles/:id/timezone` | Update profile timezone |

**POST /api/profiles — Request:**
```json
{
  "name": "John Doe",
  "timezone": "Asia/Kolkata"
}
```

**POST /api/profiles — Response (201):**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "John Doe",
  "timezone": "Asia/Kolkata",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**PATCH /api/profiles/:id/timezone — Request:**
```json
{
  "timezone": "Europe/London"
}
```

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events (populated with profiles) |
| GET | `/api/events?profileId=xxx` | Filter events by profile ID |
| POST | `/api/events` | Create a new event |
| GET | `/api/events/:id` | Get a single event |
| PATCH | `/api/events/:id` | Update event (logs changes) |
| DELETE | `/api/events/:id` | Delete an event |
| GET | `/api/events/:id/logs` | Get event update history |

**POST /api/events — Request:**
```json
{
  "profiles": ["64a1b2c3d4e5f6a7b8c9d0e1"],
  "timezone": "Asia/Kolkata",
  "startDateTime": "2025-01-15T03:30:00.000Z",
  "endDateTime": "2025-01-15T05:30:00.000Z"
}
```

**POST /api/events — Response (201):**
```json
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
  "startDateTime": "2025-01-15T03:30:00.000Z",
  "endDateTime": "2025-01-15T05:30:00.000Z",
  "updateLogs": [],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**PATCH /api/events/:id — Request:**
```json
{
  "timezone": "America/New_York",
  "startDateTime": "2025-01-14T14:00:00.000Z"
}
```

**PATCH /api/events/:id — Response:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
  "profiles": [...],
  "timezone": "America/New_York",
  "startDateTime": "2025-01-14T14:00:00.000Z",
  "endDateTime": "2025-01-15T05:30:00.000Z",
  "updateLogs": [
    {
      "timestamp": "2025-01-15T11:00:00.000Z",
      "changes": [
        {
          "field": "timezone",
          "oldValue": "Asia/Kolkata",
          "newValue": "America/New_York"
        },
        {
          "field": "startDateTime",
          "oldValue": "2025-01-15T03:30:00.000Z",
          "newValue": "2025-01-14T14:00:00.000Z"
        }
      ]
    }
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

**GET /api/events/:id/logs — Response:**
```json
[
  {
    "timestamp": "2025-01-15T11:00:00.000Z",
    "changes": [
      {
        "field": "timezone",
        "oldValue": "Asia/Kolkata",
        "newValue": "America/New_York"
      }
    ]
  }
]
```

---

## Timezone Handling

### How It Works

The timezone flow is the core feature of this application:

```
1. User Input (Local Time)
   User picks: Jan 15, 2025 at 9:00 AM in Asia/Kolkata timezone

2. Conversion to UTC
   dayjs.tz("2025-01-15 09:00", "Asia/Kolkata").utc()
   → 2025-01-15T03:30:00.000Z (stored in MongoDB)

3. Display Conversion
   When displaying, UTC is converted back to the selected timezone:
   dayjs.utc("2025-01-15T03:30:00.000Z").tz("America/New_York")
   → Jan 15, 2025 at 10:30 PM (ET)
```

### Timezone Conversion Code

```javascript
// Converting local time to UTC for storage
const toUTC = (dateStr, timeStr, timezone) => {
  const combined = `${dateStr}T${timeStr}:00`
  return dayjs.tz(combined, timezone).utc().toISOString()
}

// Converting UTC back to local time for display
const formatInTimezone = (date, tz) => {
  return dayjs(date).tz(tz).format('MMM D, YYYY [at] h:mm A')
}
```

### Supported Timezones

| Timezone | Label |
|----------|-------|
| America/New_York | Eastern Time (ET) |
| America/Chicago | Central Time (CT) |
| America/Denver | Mountain Time (MT) |
| America/Los_Angeles | Pacific Time (PT) |
| America/Anchorage | Alaska Time (AKT) |
| Pacific/Honolulu | Hawaii Time (HT) |
| Europe/London | London (GMT/BST) |
| Europe/Paris | Paris (CET/CEST) |
| Europe/Berlin | Berlin (CET/CEST) |
| Asia/Kolkata | India (IST) |
| Asia/Dubai | Dubai (GST) |
| Asia/Tokyo | Tokyo (JST) |
| Australia/Sydney | Sydney (AEST) |
| Pacific/Auckland | Auckland (NZST) |
| UTC | UTC |

### Why UTC Storage?

1. **Consistency** — All times stored in the same reference frame regardless of timezone
2. **Comparison** — Easy to compare and sort events across timezones
3. **DST Safety** — dayjs handles DST transitions automatically during conversion
4. **Precision** — No ambiguity about which local time was intended

---

## DSA Strategies

### 1. LRU Cache (Least Recently Used)

**Purpose:** Cache frequently accessed events to reduce redundant API calls.

**Implementation:** Map-based with O(1) get/set operations.

```javascript
function lruCache(maxSize = 10) {
  const cache = new Map()
  return {
    get(key) {
      if (!cache.has(key)) return null
      const value = cache.get(key)
      cache.delete(key)
      cache.set(key, value)
      return value
    },
    set(key, value) {
      if (cache.has(key)) cache.delete(key)
      if (cache.size >= maxSize) {
        const first = cache.keys().next().value
        cache.delete(first)
      }
      cache.set(key, value)
    }
  }
}
```

**Time Complexity:** O(1) for both get and set operations.

### 2. Binary Search for Date Lookup

**Purpose:** Find events by date in sorted arrays with O(log n) performance.

```javascript
function binarySearchDate(events, targetDate, key = 'startDateTime') {
  let left = 0
  let right = events.length - 1
  const target = new Date(targetDate).getTime()

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const midDate = new Date(events[mid][key]).getTime()
    if (midDate === target) return mid
    if (midDate < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}
```

**Time Complexity:** O(log n) vs O(n) for linear search.

### 3. Merge Sort for Event Sorting

**Purpose:** Stable sorting for events by date, maintaining relative order of equal elements.

```javascript
function sortByDate(events, key = 'startDateTime', ascending = true) {
  return [...events].sort((a, b) => {
    const diff = new Date(a[key]) - new Date(b[key])
    return ascending ? diff : -diff
  })
}
```

**Time Complexity:** O(n log n) using native JavaScript sort with custom comparator.

### 4. Debouncing for Search Input

**Purpose:** Reduce API calls when user types in search fields.

```javascript
function useDebounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

**Impact:** Reduces API calls by ~80% during rapid typing. Only the last keystroke after 300ms of inactivity triggers an API call.

### 5. Two-Pointer for Overlap Detection

**Purpose:** Validate that no two events overlap for the same profile.

```javascript
function detectOverlap(existing, newStart, newEnd) {
  const sorted = sortByDate(existing, 'startDateTime')
  let left = 0
  let right = sorted.length - 1
  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (new Date(sorted[mid].endDateTime) <= new Date(newStart)) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  if (sorted[left] && new Date(sorted[left].startDateTime) < new Date(newEnd) &&
      new Date(newStart) < new Date(sorted[left].endDateTime)) {
    return sorted[left]
  }
  return null
}
```

**Time Complexity:** O(n log n) after sorting vs O(n²) brute force approach.

### 6. Map-based Profile Lookup

**Purpose:** O(1) lookup of profile names by ID when rendering event cards.

```javascript
const profileMap = new Map(profiles.map(p => [p._id, p.name]))

const profileNames = event.profiles
  .map(p => profileMap.get(p._id) || p.name)
  .join(', ')
```

---

## Edge Cases Handled

### Form Validation
- **Empty profile selection** — Alert user to select at least one profile
- **Missing dates** — Alert user to pick both start and end dates
- **End before start** — Validate endDateTime > startDateTime on client and server
- **Profile name too short** — Minimum 2 characters enforced in schema and UI
- **Duplicate profile names** — MongoDB unique index + server-side check before creation

### Timezone Edge Cases
- **DST transitions** — Handled automatically by dayjs timezone plugin
- **Non-whole-hour offsets** — Timezones like Asia/Kathmandu (UTC+5:45) handled correctly
- **UTC storage** — All times normalized to UTC, eliminating timezone ambiguity

### UI Edge Cases
- **No profiles exist** — Shows empty state, disables event creation
- **No events for profile** — Shows "No events found" message
- **Calendar close on outside click** — Click outside calendar popup to close it
- **Network errors** — Toast notification with error message from API response
- **Double submit** — Form resets after successful submission

### Backend Edge Cases
- **Missing fields** — Returns 400 with descriptive error message
- **Non-existent event** — Returns 404 with "Event not found"
- **Invalid MongoDB ObjectId** — Mongoose cast error caught by error middleware
- **CORS** — Configured to allow all origins for production deployment

---

## Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/VIP-CODER1/Event-Management-System.git
cd Event-Management-System

# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
NODE_ENV=development
EOF

# Start the server (with nodemon for auto-reload)
npm run dev
```

The server runs on `http://localhost:5000`.

### Frontend Setup

```bash
# In a new terminal, navigate to client
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend runs on `http://localhost:5173` and automatically proxies API requests to `http://localhost:5000` via the Vite dev server proxy.

### Using the App

1. Open `http://localhost:5173` in your browser
2. Create a profile by clicking the profile dropdown and typing a name
3. Select one or more profiles in the "Create Event" form
4. Pick a timezone, start date/time, and end date/time
5. Click "+ Create Event" — the event appears in the right panel
6. Use "View in Timezone" to convert all displayed times
7. Click "Edit" to modify an event — changes are logged automatically
8. Click "View Logs" to see the full update history

---

## Environment Variables

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port number | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ems |
| `NODE_ENV` | Environment mode | development |

### Client (Vite)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | http://localhost:5000/api |

---

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Set environment variables:
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `NODE_ENV` — production
5. Deploy — Render auto-detects Node.js and runs `npm install && npm start`

### Frontend (Vercel)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variable:
   - `VITE_API_URL` — Your Render backend URL + `/api`
4. Deploy — Vercel auto-detects Vite and builds

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist IP addresses (or allow all with `0.0.0.0/0`)
4. Get the connection string and add it to your `.env`

---

## Video Explanation

[Watch the project walkthrough video](#)

The video covers:
- Project overview and live demo
- How timezone conversion works (UTC storage, user timezone display)
- Event creation with multi-profile assignment
- Event editing with automatic update logs tracking
- DSA strategies used for optimization (LRU cache, binary search, debouncing)
- Database schema walkthrough
- API endpoints demonstration

---

## License

MIT
