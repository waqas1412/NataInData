"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { CheckCircle, XCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { fetchSubscription } = useSubscriptionStore();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    if (paymentStatus === 'success') {
      setMessage({
        type: 'success',
        text: 'Your subscription has been activated successfully!'
      });
      setShowMessage(true);
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'canceled') {
      setMessage({
        type: 'error',
        text: 'Payment was canceled. You can try again later.'
      });
      setShowMessage(true);
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Refresh subscription data after payment
    if (user.id && searchParams.get('payment_status') === 'success') {
      fetchSubscription(user.id);
    }

    // Wait a moment for the message to be displayed, then redirect
    const redirectTimer = setTimeout(() => {
      // If user is authenticated, always redirect to main app regardless of subscription
      router.push("/new-chat");
    }, 1000);
    
    return () => clearTimeout(redirectTimer);
  }, [user, router, searchParams, fetchSubscription]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {showMessage && message && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 flex items-center gap-2 animate-fade-in-down
            ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? 
            <CheckCircle className="h-5 w-5 text-green-500" /> : 
            <XCircle className="h-5 w-5 text-red-500" />}
          <p>{message.text}</p>
        </div>
      )}
      
      <div className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
      </div>
    </div>
  );
}
