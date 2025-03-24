"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasActiveSubscription } = useSubscriptionStore();

  useEffect(() => {
    // If user is not logged in, redirect to sign-in
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // If user is logged in but doesn't have an active subscription, redirect to pricing
    if (user && !hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    // If user is logged in and has an active subscription, redirect to the app
    if (user && hasActiveSubscription) {
      router.push("/new-chat");
    }
  }, [user, hasActiveSubscription, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
      </div>
    </div>
  );
}
