"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore, Subscription } from "@/stores/subscriptionStore";
import { CheckCircle, Clock, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionStatusPage() {
  const { user } = useAuthStore();
  const { subscription, hasActiveSubscription, fetchSubscription, redirectToPayment } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const loadSubscription = async () => {
      setIsLoading(true);
      await fetchSubscription(user.id);
      setIsLoading(false);
    };

    loadSubscription();
  }, [user, fetchSubscription, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubscribe = () => {
    if (user?.id) {
      redirectToPayment(user.id, user.email);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "trialing":
        return (
          <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active
          </span>
        );
      case "past_due":
      case "incomplete":
        return (
          <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {status === "past_due" ? "Past Due" : "Incomplete"}
          </span>
        );
      case "cancelled":
      case "canceled":
      case "inactive":
      case "incomplete_expired":
      case "unpaid":
        return (
          <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {status === "cancelled" || status === "canceled" ? "Cancelled" : "Inactive"}
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4 mr-1" />
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscription Status</h1>

          {subscription ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-700">Current Status</h2>
                  <div className="mt-2">{getStatusBadge(subscription.status)}</div>
                </div>
                {!hasActiveSubscription && (
                  <button
                    onClick={handleSubscribe}
                    className="py-2 px-4 bg-purple-600 text-white font-medium rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center"
                  >
                    Reactivate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                    <h3 className="font-medium">Subscription Period</h3>
                  </div>
                  <p className="text-gray-600">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                    <h3 className="font-medium">Subscription Created</h3>
                  </div>
                  <p className="text-gray-600">{formatDate(subscription.created_at)}</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-700 mb-2">Subscription Details</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscription ID</span>
                    <span className="text-gray-900 font-medium">{subscription.stripe_subscription_id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer ID</span>
                    <span className="text-gray-900 font-medium">{subscription.stripe_customer_id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
              <p className="text-gray-600 mb-6">A subscription is required to use this application. Subscribe now to unlock all features and functionality.</p>
              <button
                onClick={() => router.push("/pricing")}
                className="py-3 px-6 bg-purple-600 text-white font-medium rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center mx-auto"
              >
                View Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 