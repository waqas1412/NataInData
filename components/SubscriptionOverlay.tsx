import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionOverlayProps {
  onClose: () => void;
}

export default function SubscriptionOverlay({ onClose }: SubscriptionOverlayProps) {
  const { redirectToPayment } = useSubscriptionStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      console.error("User not found");
      return;
    }

    if (!user.email) {
      console.error("User email not found");
      return;
    }

    setIsLoading(true);
    try {
      await redirectToPayment(user.id, user.email);
    } catch (error) {
      console.error("Error redirecting to payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
        <p className="text-gray-600 mb-6">
          This feature requires a premium subscription. Upgrade now to access all premium features!
        </p>
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Processing..." : "Upgrade Now"}
        </button>
      </div>
    </div>
  );
} 