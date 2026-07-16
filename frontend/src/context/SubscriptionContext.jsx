import { useCallback, useEffect, useState } from 'react'
import SubscriptionContext from './subscriptionContext'
import { useAuth } from '../hooks/useAuth'
import { paymentService } from '../services/paymentService'

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetches the subscription once for UI state; backend middleware remains the security authority.
  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      return null
    }

    setLoading(true)
    try {
      const response = await paymentService.getMySubscription()
      setSubscription(response.data)
      return response.data
    } catch {
      setSubscription(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // This starts an asynchronous request after authentication changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSubscription()
  }, [refreshSubscription])

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
