import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionOverlayProps {
  onClose: () => void;
}

export default function SubscriptionOverlay({ onClose }: SubscriptionOverlayProps) {
  const { redirectToPayment } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await redirectToPayment();
    } catch (error) {
      console.error('Error redirecting to payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
        <p className="text-gray-600 mb-6">
          Get unlimited access to all features and start learning today!
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating checkout...</span>
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 