"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import dynamic from "next/dynamic";

const SubscriptionOverlay = dynamic(() => import("@/app/components/SubscriptionOverlay"), {
  ssr: false,
});

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  hasActiveSubscription: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const { fetchSubscription, hasActiveSubscription } = useSubscriptionStore();

  // Public routes that don't require auth
  const publicRoutes = ["/sign-in", "/sign-up", "/confirm-email"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser?.id) {
        setCheckingSubscription(true);
        fetchSubscription(currentUser.id).finally(() => {
          setCheckingSubscription(false);
        });
      }
      
      setIsLoading(false);

      // Handle initial routing based on session
      if (!session && !isPublicRoute) {
        router.push("/sign-in");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser?.id) {
        setCheckingSubscription(true);
        fetchSubscription(currentUser.id).finally(() => {
          setCheckingSubscription(false);
        });
      }
      
      setIsLoading(false);

      // Handle routing based on auth state
      if (!session && !isPublicRoute) {
        router.push("/sign-in");
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [pathname, router, setUser, fetchSubscription, isPublicRoute]);

  // Check subscription status and show overlay if needed
  useEffect(() => {
    if (user && !isLoading && !checkingSubscription && !hasActiveSubscription && !isPublicRoute) {
      setShowSubscriptionOverlay(true);
    } else {
      setShowSubscriptionOverlay(false);
    }
  }, [user, isLoading, checkingSubscription, hasActiveSubscription, isPublicRoute]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      hasActiveSubscription 
    }}>
      {children}
      {showSubscriptionOverlay && <SubscriptionOverlay />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 