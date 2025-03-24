"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { Crown, Check, Shield, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user } = useAuthStore();
  const { redirectToPayment } = useSubscriptionStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push("/sign-in");
    }
  }, [user, router]);

  const handleSubscribe = () => {
    if (user?.id) {
      redirectToPayment(user.id, user.email);
    } else {
      router.push("/sign-in");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {/* Subscription Required Banner */}
      <div className="max-w-md w-full bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center">
        <AlertCircle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-amber-800">Subscription Required</h2>
          <p className="text-amber-700 text-sm">A subscription is required to use this application. Please subscribe to continue.</p>
        </div>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Premium Access</h1>
          <p className="text-white/90">Unlock all features today</p>
        </div>

        {/* Benefits Section */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Unlimited access to all content</h3>
                <p className="text-gray-500 text-sm">Advanced AI, intelligent data analysis, and customized insights</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Priority customer support</h3>
                <p className="text-gray-500 text-sm">Get assistance within 24 hours from our expert team</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Early access to new features</h3>
                <p className="text-gray-500 text-sm">Be the first to try our latest innovations</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Ad-free experience</h3>
                <p className="text-gray-500 text-sm">Clean, distraction-free interface</p>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">$9.99</span>
              <span className="text-xl text-gray-500 ml-2">/month</span>
            </div>
            <p className="text-gray-500 mt-2">Cancel anytime • No commitments</p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
          >
            Subscribe Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>

          {/* Security Note */}
          <div className="mt-6 text-center flex items-center justify-center text-gray-500 text-sm">
            <Shield className="h-4 w-4 mr-1" />
            Secured by industry-leading encryption
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-gray-500 max-w-md">
        <p className="text-sm">
          Want to learn more about our premium features?{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View detailed comparison
          </a>
        </p>
      </div>
    </div>
  );
} 