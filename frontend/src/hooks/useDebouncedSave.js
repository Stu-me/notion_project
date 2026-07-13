import { useCallback, useEffect, useRef } from 'react'

export function useDebouncedSave(saveFn, delay = 500) {
  const timeoutsRef = useRef(new Map())

  const cancelSave = useCallback((key) => {
    const timeout = timeoutsRef.current.get(key)
    if (timeout) clearTimeout(timeout)
    timeoutsRef.current.delete(key)
  }, [])

  const debouncedSave = useCallback((key, ...args) => {
    cancelSave(key)
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(key)
      void saveFn(...args)
    }, delay)
    timeoutsRef.current.set(key, timeout)
  }, [cancelSave, delay, saveFn])

  useEffect(() => () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current.clear()
  }, [])

  return { debouncedSave, cancelSave }
}
