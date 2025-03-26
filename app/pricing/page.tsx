"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { Check } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { redirectToPayment, isLoading } = useSubscriptionStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If user is not authenticated, redirect to sign-in
    if (!user && isClient) {
      router.push("/sign-in");
    }
  }, [user, router, isClient]);

  const handleSubscribe = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (!user.email) {
      console.error("User email not found");
      return;
    }

    // Pass both user ID and email to the redirectToPayment function
    redirectToPayment(user.id, user.email);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
            Get Started with Premium Features
          </h2>
          <p className="text-base text-gray-700 md:text-lg">
            Unlock advanced features and capabilities with our premium subscription.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-8 row-gap-5 mb-8 md:row-gap-8 lg:grid-cols-3">
          <div className="p-5 duration-300 transform bg-white border rounded shadow-sm hover:-translate-y-2">
            <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
              <Check className="w-6 h-6 text-indigo-600" />
            </div>
            <h6 className="mb-2 font-semibold leading-5">Advanced AI Chatbot</h6>
            <p className="text-sm text-gray-900">
              Access our advanced AI capabilities with unlimited messages and faster responses.
            </p>
          </div>

          <div className="p-5 duration-300 transform bg-white border rounded shadow-sm hover:-translate-y-2">
            <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
              <Check className="w-6 h-6 text-indigo-600" />
            </div>
            <h6 className="mb-2 font-semibold leading-5">Roadmap Planning</h6>
            <p className="text-sm text-gray-900">
              Get personalized roadmaps to guide your learning journey efficiently.
            </p>
          </div>

          <div className="p-5 duration-300 transform bg-white border rounded shadow-sm hover:-translate-y-2">
            <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
              <Check className="w-6 h-6 text-indigo-600" />
            </div>
            <h6 className="mb-2 font-semibold leading-5">Interview Preparation</h6>
            <p className="text-sm text-gray-900">
              Practice with our interview simulator and get tailored feedback.
            </p>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
            <div className="mb-4 text-center">
              <p className="text-xl font-medium tracking-wide text-gray-900">Premium Plan</p>
              <div className="flex items-center justify-center">
                <p className="mr-2 text-5xl font-semibold text-gray-900 lg:text-6xl">$29</p>
                <p className="text-lg text-gray-500">/month</p>
              </div>
            </div>
            <ul className="mb-8 space-y-2">
              <li className="flex items-center">
                <div className="mr-3 text-indigo-600">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-gray-700">Unlimited Messages</p>
              </li>
              <li className="flex items-center">
                <div className="mr-3 text-indigo-600">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-gray-700">Roadmap Planning</p>
              </li>
              <li className="flex items-center">
                <div className="mr-3 text-indigo-600">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-gray-700">Interview Preparation</p>
              </li>
              <li className="flex items-center">
                <div className="mr-3 text-indigo-600">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-gray-700">Priority Support</p>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className={`inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 bg-indigo-600 rounded shadow-md ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700 focus:shadow-outline focus:outline-none"
              }`}
            >
              {isLoading ? "Processing..." : "Subscribe Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 