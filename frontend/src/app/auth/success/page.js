"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("user");

    if (token && username) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ username }));
      router.push(`/ask/${username}`);
    }
  }, [router, searchParams]);

  return <p className="text-white">Logging you in...</p>;
}
