"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useLogin from "@/hooks/useLogin";

export default function Login() {
  const {
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    email,
    setEmail,
    loading,
    googleLoading,
    facebookLoading,
    error,
    success,
  } = useLogin();
  return (
    <div className="flex h-[60dvh] items-center justify-center">
      <Card className="w-[90dvw] max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" className="w-full bg-background/60" onClick={handleGoogleLogin} disabled={googleLoading || facebookLoading || loading}>
            <GoogleIcon />
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </Button>
          <Button type="button" variant="outline" className="mt-3 w-full bg-background/60" onClick={handleFacebookLogin} disabled={googleLoading || facebookLoading || loading}>
            <FacebookIcon />
            {facebookLoading ? "Connecting to Facebook..." : "Continue with Facebook"}
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending link..." : "Continue with email"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z" />
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.23 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.86v-8.4H7.08V12h3.04V9.36c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.93-1.95 1.87V12h3.32l-.53 3.46h-2.79v8.4A12 12 0 0 0 24 12Z" />
      <path fill="white" d="M16.65 15.46 17.18 12h-3.32V9.75c0-.94.46-1.87 1.95-1.87h1.51V4.93s-1.37-.23-2.68-.23c-2.73 0-4.52 1.66-4.52 4.66V12H7.08v3.46h3.04v8.4a12.1 12.1 0 0 0 3.74 0v-8.4h2.79Z" />
    </svg>
  );
}
