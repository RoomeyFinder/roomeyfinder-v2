"use client";

import { SubmitEventHandler, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@supabase/supabase-js";

export default function useLogin() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleSocialLogin = useCallback(
    async (provider: Provider) => {
      const setProviderLoading = provider === "google" ? setGoogleLoading : setFacebookLoading;
      const providerLoading = provider === "google" ? googleLoading : facebookLoading;
      if (providerLoading) return;

      setProviderLoading(true);
      setError("");
      setSuccess("");

      const { error } = await createClient().auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/setup`,
        },
      });

      if (error) {
        setError(error.message);
        setProviderLoading(false);
      }
    },
    [facebookLoading, googleLoading],
  );

  const handleGoogleLogin = useCallback(() => handleSocialLogin("google"), [handleSocialLogin]);
  const handleFacebookLogin = useCallback(() => handleSocialLogin("facebook"), [handleSocialLogin]);

  const handleLogin: SubmitEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email || loading) return setError("Email is required");
      if (loading) return;
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch("/auth/magic-link", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(result.error ?? "Unable to send magic link");
          return;
        }
        setEmail("");
        setSuccess("Check your email for the sign-in link.");
      } catch {
        setError("Unable to send magic link");
      } finally {
        setLoading(false);
      }
    },
    [email, loading],
  );

  return {
    email,
    setEmail,
    loading,
    googleLoading,
    facebookLoading,
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    error,
    success,
  };
}
