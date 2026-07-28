import { useEffect } from 'react'
import useEventStore from '../store/eventStore'

export function useEvents() {
  const { events, fetchEvents, loading, error } = useEventStore()

  useEffect(() => {
    fetchEvents()
  }, [])

  return { events, loading, error }
}
