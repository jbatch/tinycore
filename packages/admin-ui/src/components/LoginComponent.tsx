import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth, useRegistrationStatus } from "@tinycore/client";
import { getErrorMessage } from "@/lib/errorUtils";

const LoginComponent: React.FC<{ onLogin: () => void }> = ({onLogin}) => {
  const { login, register, loading: authLoading, error: authError } = useAuth();
  const {
    registrationAllowed,
    loading: statusLoading,
    error: statusError,
  } = useRegistrationStatus();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      if (isLogin) {
        await login(email, password);
        onLogin();
      } else {
        await register(email, password);
      }
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err));
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const error = authError || statusError || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>{isLogin ? "Sign In" : "Create Admin Account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access TinyCore Admin"
              : "Create the first admin account for TinyCore KV"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={authLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading
                ? "Loading..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          {registrationAllowed && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={authLoading}
              >
                {isLogin
                  ? "Need to create the first admin account?"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginComponent;
