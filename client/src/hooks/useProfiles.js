import { useEffect } from 'react'
import useProfileStore from '../store/profileStore'

export function useProfiles() {
  const { profiles, fetchProfiles, loading, error } = useProfileStore()

  useEffect(() => {
    if (profiles.length === 0) {
      fetchProfiles()
    }
  }, [])

  return { profiles, loading, error }
}
