import { create } from 'zustand'
import { eventApi } from '../services/api'

const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,
  selectedProfileIds: [],
  formTimezone: 'America/New_York',
  startDateTime: '',
  endDateTime: '',
  viewTimezone: 'America/New_York',
  editingEvent: null,
  showHistoryModal: false,
  historyEvent: null,
  toast: null,

  fetchEvents: async (profileId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await eventApi.getAll(profileId)
      set({ events: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createEvent: async (eventData) => {
    try {
      const { data } = await eventApi.create(eventData)
      set((state) => ({ events: [data, ...state.events] }))
      return data
    } catch (error) {
      throw error
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const { data } = await eventApi.update(id, eventData)
      set((state) => ({
        events: state.events.map((e) => (e._id === id ? data : e))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  deleteEvent: async (id) => {
    try {
      await eventApi.delete(id)
      set((state) => ({
        events: state.events.filter((e) => e._id !== id)
      }))
    } catch (error) {
      throw error
    }
  },

  setFormField: (field, value) => {
    set({ [field]: value })
  },

  resetForm: () => {
    set({
      selectedProfileIds: [],
      formTimezone: 'America/New_York',
      startDateTime: '',
      endDateTime: '',
      editingEvent: null
    })
  },

  setEditingEvent: (event) => {
    if (!event) {
      set({ editingEvent: null })
      return
    }
    set({
      editingEvent: event,
      selectedProfileIds: event.profiles.map((p) => p._id || p),
      formTimezone: event.timezone,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime
    })
  },

  openHistoryModal: (event) => {
    set({ showHistoryModal: true, historyEvent: event })
  },

  closeHistoryModal: () => {
    set({ showHistoryModal: false, historyEvent: null })
  },

  showToast: (message) => {
    set({ toast: message })
  },

  hideToast: () => {
    set({ toast: null })
  }
}))

export default useEventStore