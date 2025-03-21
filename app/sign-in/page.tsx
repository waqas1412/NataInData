"use client";
import React, { useEffect, useState } from "react";
import displayImg from "@/public/images/sign-in-page-img.png";
import Image from "next/image";
import fav from "@/public/images/favicon.png";
import GradientBackground from "@/components/ui/GradientBackground";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { AuthError } from "@supabase/supabase-js";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

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
          <p className="text-2xl font-semibold">Welcome Back</p>
          <p className="text-sm pt-4">
            Sign in to your account to continue using AIQuill
          </p>

          <form onSubmit={handleSubmit} className="pt-10">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-primaryColor/30 bg-white dark:bg-n0 text-n700 dark:text-n30"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-primaryColor/30 bg-white dark:bg-n0 text-n700 dark:text-n30"
                  required
                />
              </div>

              {error && (
                <p className="text-errorColor text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-primaryColor text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className="pt-6 text-center">
              <p className="text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-primaryColor hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
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
