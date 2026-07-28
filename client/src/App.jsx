import { useEffect } from 'react'
import ProfileDropdown from './components/Header/ProfileDropdown'
import CreateEvent from './components/CreateEvent/CreateEvent'
import EventsList from './components/EventsList/EventsList'
import UpdateHistoryModal from './components/Modal/UpdateHistoryModal'
import EditEventModal from './components/Modal/EditEventModal'
import Toast from './components/common/Toast'
import useProfileStore from './store/profileStore'
import useEventStore from './store/eventStore'
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'

export default function App() {
  const { fetchProfiles } = useProfileStore()
  const { fetchEvents, toast, hideToast } = useEventStore()

  useEffect(() => {
    fetchProfiles()
    fetchEvents()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Event Management</h1>
          <p className="app-subtitle">Create and manage events across multiple timezones</p>
        </div>
        <div className="header-right">
          <ProfileDropdown />
        </div>
      </header>

      <main className="app-main">
        <div className="main-card">
          <div className="main-left">
            <CreateEvent />
          </div>
          <div className="main-right">
            <EventsList />
          </div>
        </div>
      </main>

      <UpdateHistoryModal />
      <EditEventModal />
      {toast && <Toast message={toast} onClose={hideToast} />}
    </div>
  )
}