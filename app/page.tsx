"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import SignIn from "./sign-in/page";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/new-chat");
    } else {
      router.push("/sign-in");
    }
  }, [user, router]);

  return null;
}
