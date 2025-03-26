"use client";
import React, { FormEvent, useState } from "react";
import displayImg from "@/public/images/sign-up-page-img.png";
import Image from "next/image";
import fav from "@/public/images/favicon.png";
import FormInput from "@/components/ui/FormInput";
import GradientBackground from "@/components/ui/GradientBackground";
import Footer from "@/components/Footer";
import { PiGoogleLogo } from "react-icons/pi";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { AuthError } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function SignUp() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { signUp } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Confirmation email sent! Please check your inbox.');
      
      // Delay redirect for 2 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error) {
      const authError = error as AuthError;
      setIsError(true);
      setErrorMessage(authError.message || "Failed to sign up");
      toast.error(authError.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signUp("", "", "google");
    } catch (error) {
      const authError = error as AuthError;
      setIsError(true);
      setErrorMessage(authError.message || "Failed to sign up with Google");
      toast.error(authError.message || "Failed to sign up with Google");
    }
  };

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
          <p className="text-2xl font-semibold">Let&apos;s Get Started</p>
          <p className="text-sm pt-4">Create an account and join Tutor Chatbot</p>

          <form
            onSubmit={handleSubmit}
            className="pt-6 sm:pt-10 grid grid-cols-2 gap-4 sm:gap-6"
          >
            <div className="col-span-2">
              <FormInput
                title="Enter Your Email ID"
                placeholder="Your email ID here"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <FormInput
                title="Password"
                placeholder="*******"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                required
              />
            </div>
            <p className="col-span-2 text-sm pt-2">
              Have an account?{" "}
              <Link href="/sign-in" className="text-errorColor font-semibold">
                Sign In
              </Link>
            </p>

            <div className="col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
              {isError && (
                <p className="text-errorColor text-sm pt-2">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>

          <div className="pt-8">
            <div className="flex justify-center items-center">
              <div className="bg-n30 flex-1 h-px"></div>
              <p className="text-xs px-2">Or Continue</p>
              <div className="bg-n30 flex-1 h-px"></div>
            </div>
            <div className="flex justify-center items-center pt-6 gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="flex justify-center items-center p-2 rounded-full border border-primaryColor/30 bg-primaryColor/5 text-xl hover:bg-primaryColor hover:border-primaryColor duration-300 hover:text-white cursor-pointer"
              >
                <PiGoogleLogo />
              </button>
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

export default SignUp;
