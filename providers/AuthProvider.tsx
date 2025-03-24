"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

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
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const { fetchSubscription, hasActiveSubscription, subscription } = useSubscriptionStore();

  // Public routes that don't require auth or subscription
  const publicRoutes = ["/sign-in", "/sign-up", "/confirm-email"];
  
  // Routes that require auth but not subscription
  const authOnlyRoutes = ["/pricing", "/subscription-status"];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Check if current route only requires auth
  const isAuthOnlyRoute = authOnlyRoutes.includes(pathname);

  useEffect(() => {
    console.log("AuthProvider initialized, pathname:", pathname);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // If user exists, fetch subscription
      if (currentUser?.id) {
        console.log("Session found, user ID:", currentUser.id);
        setCheckingSubscription(true);
        fetchSubscription(currentUser.id).finally(() => {
          setCheckingSubscription(false);
        });
      } else {
        console.log("No session found");
      }
      
      setIsLoading(false);

      // Handle initial routing based on session
      if (!session) {
        if (!isPublicRoute) {
          console.log("No session, redirecting to sign-in");
          router.push("/sign-in");
        }
      } else {
        if (isPublicRoute) {
          console.log("Has session, redirecting to home page");
          router.push("/"); // Send to home page for subscription check
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // If user exists, fetch subscription
      if (currentUser?.id) {
        console.log("Auth state changed, user ID:", currentUser.id);
        setCheckingSubscription(true);
        fetchSubscription(currentUser.id).finally(() => {
          setCheckingSubscription(false);
        });
      }
      
      setIsLoading(false);

      // Handle routing based on auth state
      if (session) {
        // User is signed in
        if (isPublicRoute) {
          console.log("Auth changed, has session, redirecting to home page");
          router.push("/"); // Send to home page for subscription check
        }
      } else {
        // User is signed out
        if (!isPublicRoute) {
          console.log("Auth changed, no session, redirecting to sign-in");
          router.push("/sign-in");
        }
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [pathname, router, setUser, fetchSubscription, isPublicRoute]);

  // Check subscription status and redirect if needed - separated to its own effect
  useEffect(() => {
    const checkAndHandleSubscription = async () => {
      console.log("Checking subscription status:", {
        user: !!user,
        isLoading,
        checkingSubscription,
        hasActiveSubscription,
        isPublicRoute,
        isAuthOnlyRoute,
        subscriptionStatus: subscription?.status,
      });
      
      // For all non-public and non-auth-only routes, redirect to pricing if no subscription
      if (user && !isLoading && !checkingSubscription && !hasActiveSubscription && !isPublicRoute && !isAuthOnlyRoute) {
        console.log("No active subscription, redirecting to pricing page");
        router.push("/pricing");
      }
    };
    
    checkAndHandleSubscription();
  }, [user, isLoading, checkingSubscription, hasActiveSubscription, isPublicRoute, isAuthOnlyRoute, subscription?.status, router]);

  // Show nothing while loading
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
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 