"use client";
import React, { useEffect, useState } from "react";
import displayImg from "@/public/images/sign-in-page-img.png";
import Image from "next/image";
import fav from "@/public/images/favicon.png";
import GradientBackground from "@/components/ui/GradientBackground";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

function ConfirmEmail() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if we're not coming from sign-up
    const isFromSignUp = sessionStorage.getItem('fromSignUp') === 'true';
    
    if (!isFromSignUp) {
      router.push("/sign-in");
    }
    setIsLoading(false);
  }, [router]);

  const handleResend = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/new-chat`,
        },
      });

      if (error) throw error;
      setResendSuccess(true);
    } catch (error) {
      const authError = error as AuthError;
      setResendError(authError.message || "Failed to resend confirmation email");
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex justify-between text-n500 dark:text-n30 xxl:gap-20 max-xxl:container xxl:h-dvh max-xxl:justify-center relative">
      <GradientBackground />
      <div className="py-6 xxl:ml-[calc((100%-1296px)/2)] flex-1 flex flex-col justify-between items-start max-xxl:max-w-[600px]">
        <div className="flex justify-start items-center gap-1.5">
          <Image src={fav} alt="" />
          <span className="text-2xl font-semibold text-n700 dark:text-n30">
            AIQuill
          </span>
        </div>

        <div className="w-full pt-4">
          <p className="text-2xl font-semibold">Check Your Email</p>
          <p className="text-sm pt-4">
            We&apos;ve sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
          </p>

          <div className="pt-10">
            <div className="bg-primaryColor/5 border border-primaryColor/30 rounded-full p-6 text-center">
              <p className="text-sm text-n700 dark:text-n30">
                {user?.email}
              </p>
            </div>

            <div className="pt-6 text-center">
              <p className="text-sm text-n500 dark:text-n30">
                Didn&apos;t receive the email?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primaryColor hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </p>
              {resendError && (
                <p className="text-errorColor text-sm pt-2">
                  {resendError}
                </p>
              )}
              {resendSuccess && (
                <p className="text-green-600 text-sm pt-2">
                  Confirmation email has been resent!
                </p>
              )}
            </div>

            <div className="pt-6">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block w-full"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center w-full pt-4">
          <Footer />
        </div>
      </div>
      <div className="w-1/2 max-xxl:hidden max-h-dvh overflow-hidden">
        <Image src={displayImg} alt="" className="w-full object-cover" />
      </div>
    </div>
  );
}

export default ConfirmEmail; 