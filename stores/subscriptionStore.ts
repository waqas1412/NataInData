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
          hasActiveSubscription: subscription
            ? ["active", "trialing"].includes(subscription.status)
            : false,
        });
      },

      fetchSubscription: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              // No subscription found - not an error
              get().setSubscription(null);
            } else {
              throw error;
            }
          } else if (data) {
            get().setSubscription(data as Subscription);
          } else {
            get().setSubscription(null);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
          set({ error: error instanceof Error ? error.message : "An unknown error occurred" });
        } finally {
          set({ isLoading: false });
        }
      },

      redirectToPayment: (userId: string, email?: string) => {
        const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
        if (!paymentLink) {
          console.error("Payment link not found in environment variables");
          return;
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        
        // Add client_reference_id
        queryParams.append("client_reference_id", userId);
        
        // Add prefilled_email if provided
        if (email) {
          queryParams.append("prefilled_email", email);
        }
        
        // Construct the full URL
        const paymentURL = `${paymentLink}?${queryParams.toString()}`;
        
        // Redirect to the payment link
        window.location.href = paymentURL;
      },
    }),
    {
      name: "subscription-storage",
    }
  )
); 