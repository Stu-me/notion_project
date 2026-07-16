import { useContext } from 'react'
import SubscriptionContext from '../context/subscriptionContext'

// Provides cached subscription state and a refresh function to subscribed components.
export function useSubscription() {
  return useContext(SubscriptionContext)
}
