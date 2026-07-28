import { create } from 'zustand'
import { profileApi } from '../services/api'

const useProfileStore = create((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: false,
  error: null,

  fetchProfiles: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await profileApi.getAll()
      set({ profiles: data, loading: false })
      if (data.length > 0 && !get().currentProfile) {
        set({ currentProfile: data[0] })
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createProfile: async (name, timezone) => {
    try {
      const { data } = await profileApi.create({ name, timezone })
      set((state) => ({ profiles: [...state.profiles, data] }))
      return data
    } catch (error) {
      throw error
    }
  },

  setCurrentProfile: (profile) => {
    set({ currentProfile: profile })
  },

  updateTimezone: async (id, timezone) => {
    try {
      const { data } = await profileApi.updateTimezone(id, timezone)
      set((state) => ({
        profiles: state.profiles.map((p) => (p._id === id ? data : p)),
        currentProfile: state.currentProfile?._id === id ? data : state.currentProfile
      }))
    } catch (error) {
      throw error
    }
  }
}))

export default useProfileStore