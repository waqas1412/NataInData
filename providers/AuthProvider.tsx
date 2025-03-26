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
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const { hasActiveSubscription, fetchSubscription } = useSubscriptionStore();

  // Public routes that don't require auth
  const publicRoutes = ["/sign-in", "/sign-up", "/confirm-email"];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Auth routes that logged-in users should be redirected from
  const authRoutes = ["/sign-in", "/sign-up"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Fetch subscription data when user is authenticated
  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
    }
  }, [user?.id, fetchSubscription]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Fetch subscription data if user is authenticated
      if (currentUser?.id) {
        fetchSubscription(currentUser.id);
      }
      
      setIsLoading(false);

      // Handle initial routing based on session
      if (session) {
        // If user is logged in and trying to access sign-in/sign-up, redirect to app
        if (isAuthRoute) {
          router.push("/new-chat");
        }
      } else {
        // If user is not logged in and trying to access protected route, redirect to sign-in
        if (!isPublicRoute) {
          router.push("/sign-in");
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Fetch subscription data if user is authenticated
      if (currentUser?.id) {
        fetchSubscription(currentUser.id);
      }
      
      setIsLoading(false);

      // Handle routing based on auth state
      if (session) {
        // If user is logged in and trying to access sign-in/sign-up, redirect to app
        if (isAuthRoute) {
          router.push("/new-chat");
        }
      } else {
        // If user is not logged in and trying to access protected route, redirect to sign-in
        if (!isPublicRoute) {
          router.push("/sign-in");
        }
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [pathname, router, setUser, isPublicRoute, isAuthRoute, fetchSubscription]);

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