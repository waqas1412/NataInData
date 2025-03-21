"use client";
import React, { FormEvent, useState } from "react";
import displayImg from "@/public/images/sign-in-page-img.png";
import Image from "next/image";
import fav from "@/public/images/favicon.png";
import FormInput from "@/components/ui/FormInput";
import GradientBackground from "@/components/ui/GradientBackground";
import Footer from "@/components/Footer";
import { PiGoogleLogo } from "react-icons/pi";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { AuthError } from "@supabase/supabase-js";

function SignIn() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);
    setErrorMessage("");
    setIsLoading(true);

    try {
      await signIn(userEmail, userPassword);
    } catch (error) {
      const authError = error as AuthError;
      setIsError(true);
      setErrorMessage(authError.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("", "", "google");
    } catch (error) {
      const authError = error as AuthError;
      setIsError(true);
      setErrorMessage(authError.message || "Failed to sign in with Google");
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
          <p className="text-2xl font-semibold">Welcome Back!</p>
          <p className="text-sm pt-4">Sign in to your account and join us</p>

          <form
            onSubmit={handleSubmit}
            className="pt-10 grid grid-cols-2 gap-4 sm:gap-6"
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
              <Link
                href="/forgot-password"
                className="text-end block pt-4 text-primaryColor text-sm"
              >
                Forget password?
              </Link>
            </div>

            <p className="col-span-2 text-sm pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-errorColor font-semibold">
                Sign Up
              </Link>
            </p>

            <div className="col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
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

export default SignIn;
