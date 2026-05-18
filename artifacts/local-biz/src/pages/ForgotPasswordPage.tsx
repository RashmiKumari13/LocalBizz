import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = { email: string };

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (!res.ok && res.status !== 200) {
        const json = await res.json().catch(() => ({}));
        setError(json.message ?? "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-md"
      >
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
            <KeyRound size={22} className="text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="text-3xl mb-2">📧</div>
              <p className="font-semibold text-green-800">Reset link sent!</p>
              <p className="text-sm text-green-700 mt-1">
                Check your inbox (and spam folder) for a password reset email.
                The link expires in 1 hour.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: true })}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <button type="button" onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
