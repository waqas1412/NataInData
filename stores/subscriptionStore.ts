import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'canceled' | 'trialing' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  price_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

// Helper function to check if a subscription status is considered active
const isActiveStatus = (status: string): boolean => {
  // Stripe considers 'active' and 'trialing' as active subscription states
  return status === 'active' || status === 'trialing';
}

interface SubscriptionState {
  subscription: Subscription | null
  isLoading: boolean
  hasActiveSubscription: boolean
  fetchSubscription: (userId: string) => Promise<void>
  setSubscription: (subscription: Subscription | null) => void
  redirectToPayment: (userId: string) => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      isLoading: true,
      hasActiveSubscription: false,
      
      fetchSubscription: async (userId: string) => {
        try {
          set({ isLoading: true })
          console.log(`Fetching subscription for user: ${userId}`)
          
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()
            
          if (error) {
            console.error('Error fetching subscription:', error)
            set({ 
              subscription: null, 
              isLoading: false,
              hasActiveSubscription: false 
            })
            return
          }
          
          // Check if subscription status is active or trialing
          const isActive = isActiveStatus(data.status);
          console.log(`Subscription status: ${data.status}, isActive: ${isActive}`)
          
          set({
            subscription: data as Subscription,
            isLoading: false,
            hasActiveSubscription: isActive
          })
        } catch (error) {
          console.error('Error in fetchSubscription:', error)
          set({ 
            subscription: null, 
            isLoading: false,
            hasActiveSubscription: false 
          })
        }
      },
      
      setSubscription: (subscription: Subscription | null) => {
        const isActive = subscription ? isActiveStatus(subscription.status) : false;
        console.log(`Setting subscription, status: ${subscription?.status}, isActive: ${isActive}`)
        set({ 
          subscription, 
          hasActiveSubscription: isActive 
        })
      },
      
      redirectToPayment: (userId: string) => {
        const basePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
        
        if (!basePaymentLink) {
          console.error('Payment link not configured')
          return
        }
        
        console.log(`Redirecting to payment link for user: ${userId}, hasActiveSubscription: ${get().hasActiveSubscription}`)
        
        // Add user_id as client_reference_id to the URL
        // This will help identify the user in Stripe webhook
        const paymentLink = new URL(basePaymentLink)
        
        // Add user ID as a query parameter - Stripe will pass this in the metadata
        paymentLink.searchParams.append('client_reference_id', userId)
        
        window.location.href = paymentLink.toString()
      }
    }),
    {
      name: 'subscription-storage',
      // Important: make sure the state is properly persisted by including all relevant fields
      partialize: (state) => ({
        subscription: state.subscription,
        hasActiveSubscription: state.hasActiveSubscription,
      }),
      // When state is rehydrated, recalculate hasActiveSubscription based on the subscription status
      onRehydrateStorage: () => (state) => {
        if (state && state.subscription) {
          console.log('Rehydrating subscription state from storage')
          const isActive = isActiveStatus(state.subscription.status)
          state.hasActiveSubscription = isActive
          console.log(`Rehydrated subscription status: ${state.subscription.status}, isActive: ${isActive}`)
        }
      }
    }
  )
) 