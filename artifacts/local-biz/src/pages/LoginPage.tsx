import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { onLogin } = useAuth();

  const { register, handleSubmit } = useForm<FormData>();

  const { mutate, isPending, error } = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        onLogin();
        navigate("/dashboard");
      },
    },
  });

  function onSubmit(data: FormData) {
    mutate({ data });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-md"
      >
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Store size={22} className="text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Demo credentials */}
        <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground mb-5 space-y-1">
          <div className="font-medium text-foreground mb-1">Demo Accounts</div>
          <div>Admin: <code>admin@localbiz.in</code> / <code>admin123</code></div>
          <div>Customer: <code>rohit@customer.in</code> / <code>password</code></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Your password" {...register("password", { required: true })} className="mt-1" />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              Invalid email or password. Please try again.
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
            {isPending ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-muted-foreground hover:text-primary hover:underline">
              Forgot your password?
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-primary hover:underline font-medium">
            Register
          </button>
        </p>
      </motion.div>
    </div>
  );
}
