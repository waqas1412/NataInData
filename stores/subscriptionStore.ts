import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string | null;
  quantity: number | null;
  cancel_at_period_end: boolean;
  created_at: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  error: string | null;
  setSubscription: (subscription: Subscription | null) => void;
  fetchSubscription: (userId: string) => Promise<void>;
  redirectToPayment: (userId: string, email?: string) => void;
}

// Helper function to determine if the subscription is active
const isSubscriptionActive = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  
  const activeStatuses = ['active', 'trialing', 'past_due'];
  return activeStatuses.includes(subscription.status);
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      hasActiveSubscription: false,
      isLoading: false,
      error: null,

      setSubscription: (subscription: Subscription | null) => {
        set({
          subscription,
          hasActiveSubscription: isSubscriptionActive(subscription),
        });
      },

      fetchSubscription: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Don't use .single() to avoid 406 errors when no results
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (error) {
            throw error;
          } else if (data && data.length > 0) {
            // If data exists and has at least one item, use the first one
            get().setSubscription(data[0] as Subscription);
          } else {
            // No subscription found
            get().setSubscription(null);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
          set({ error: error instanceof Error ? error.message : "An unknown error occurred" });
          // Set subscription to null even on error to prevent blocking the UI
          get().setSubscription(null);
        } finally {
          set({ isLoading: false });
        }
      },

      redirectToPayment: async (userId: string, email?: string) => {
        try {
          if (!userId) {
            console.error("User ID is required");
            return;
          }

          if (!email) {
            console.error("Email is required");
            return;
          }

          set({ isLoading: true, error: null });

          // Call our new API endpoint to create a checkout session
          const response = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to create checkout session');
          }

          if (data.url) {
            // Redirect to the checkout URL
            window.location.href = data.url;
          } else {
            throw new Error('No checkout URL returned');
          }
        } catch (error) {
          console.error("Error redirecting to payment:", error);
          set({ error: error instanceof Error ? error.message : "Failed to redirect to payment" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "subscription-storage",
      partialize: (state) => ({
        subscription: state.subscription,
        hasActiveSubscription: state.hasActiveSubscription,
      }),
    }
  )
); 