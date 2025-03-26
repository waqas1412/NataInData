"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import Link from "next/link";

export default function TestSubscriptionPage() {
  const { user } = useAuthStore();
  const { subscription, hasActiveSubscription, isLoading, error, fetchSubscription } = useSubscriptionStore();
  const [userSubId, setUserSubId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setUserSubId(user.id);
      // Force a fetch to test the subscription status
      fetchSubscription(user.id);
    }
  }, [user?.id, fetchSubscription]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Status Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Status</h2>
        {user ? (
          <div className="space-y-2">
            <p><span className="font-medium">User ID:</span> {user.id}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        ) : (
          <p className="text-amber-600">
            Not logged in. <Link href="/sign-in" className="underline">Sign in</Link> first.
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
        
        {isLoading ? (
          <p>Loading subscription data...</p>
        ) : error ? (
          <div className="text-red-500">
            <p className="font-medium">Error loading subscription:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Has Active Subscription:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {hasActiveSubscription ? 'Yes' : 'No'}
              </span>
            </div>
            
            {subscription ? (
              <div className="space-y-2 border-t pt-4">
                <p><span className="font-medium">Subscription ID:</span> {subscription.id}</p>
                <p><span className="font-medium">Status:</span> {subscription.status}</p>
                <p><span className="font-medium">Created:</span> {new Date(subscription.created_at).toLocaleString()}</p>
                <p><span className="font-medium">Current Period:</span> {new Date(subscription.current_period_start).toLocaleDateString()} to {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                <p><span className="font-medium">Stripe Subscription ID:</span> {subscription.stripe_subscription_id}</p>
                <p><span className="font-medium">Stripe Customer ID:</span> {subscription.stripe_customer_id}</p>
              </div>
            ) : (
              <p className="text-gray-500 mt-2">No subscription data found.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Home
        </Link>

        <button 
          onClick={() => user?.id && fetchSubscription(user.id)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={!user}
        >
          Refresh Subscription Data
        </button>
      </div>
    </div>
  );
} 