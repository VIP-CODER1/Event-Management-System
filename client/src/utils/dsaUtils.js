export function useDebounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function lruCache(maxSize = 10) {
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
    },
    has(key) {
      return cache.has(key)
    }
  }
}

export function binarySearchDate(events, targetDate, key = 'startDateTime') {
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

export function sortByDate(events, key = 'startDateTime', ascending = true) {
  return [...events].sort((a, b) => {
    const diff = new Date(a[key]) - new Date(b[key])
    return ascending ? diff : -diff
  })
}

export function detectOverlap(existing, newStart, newEnd) {
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