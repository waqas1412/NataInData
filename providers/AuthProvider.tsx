"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Handle initial routing based on session
      if (!session) {
        if (pathname !== "/sign-in" && pathname !== "/sign-up" && pathname !== "/confirm-email") {
          router.push("/sign-in");
        }
      } else {
        if (pathname === "/sign-in" || pathname === "/sign-up") {
          router.push("/new-chat");
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Handle routing based on auth state
      if (session) {
        // User is signed in
        if (pathname === "/sign-in" || pathname === "/sign-up") {
          router.push("/new-chat");
        }
      } else {
        // User is signed out
        if (pathname !== "/sign-in" && pathname !== "/sign-up" && pathname !== "/confirm-email") {
          router.push("/sign-in");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, setUser]);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 