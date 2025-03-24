import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Crown, ArrowRight } from 'lucide-react';

export default function SubscriptionOverlay() {
  const { user } = useAuthStore();
  const { redirectToPayment } = useSubscriptionStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add a small delay to trigger the fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = () => {
    if (user?.id) {
      redirectToPayment(user.id, user.email);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Semi-transparent background */}
      <div className="absolute inset-0 bg-black/0 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Unlock Full Access</h2>
          <p className="text-white/90">Subscribe to continue using this feature</p>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500" />
              <p>Advanced AI-powered data analysis</p>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500" />
              <p>Unlimited access to all features</p>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500" />
              <p>Priority customer support</p>
            </div>
          </div>

          {/* Price Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">$9.99</span>
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
        </div>
      </div>
    </div>
  );
} 