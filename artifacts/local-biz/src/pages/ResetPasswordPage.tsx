import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = { password: string; confirm: string };

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    if (data.password !== data.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message ?? "Reset failed. The link may have expired.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-md text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
          <p className="text-muted-foreground text-sm mb-5">This reset link is missing a token. Please request a new one.</p>
          <Button className="w-full" onClick={() => navigate("/forgot-password")}>Request New Link</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-md"
      >
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
            <LockKeyhole size={22} className="text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose a strong password for your account</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-green-800">Password updated!</p>
              <p className="text-sm text-green-700 mt-1">You can now log in with your new password.</p>
            </div>
            <Button className="w-full bg-primary text-primary-foreground" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                {...register("password", { required: true, minLength: 8 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repeat your new password"
                {...register("confirm", { required: true })}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
