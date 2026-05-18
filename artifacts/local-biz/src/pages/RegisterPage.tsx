import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Store, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterUser } from "@workspace/api-client-react";

type FormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "shop_owner";
  businessName?: string;
  locality?: string;
};

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const [done, setDone] = useState(false);
  const [role, setRole] = useState<"customer" | "shop_owner">("customer");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues: { role: "customer" } });

  const { mutate, isPending, error } = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        setDone(true);
      },
    },
  });

  function onSubmit(data: FormData) {
    mutate({ data: { name: data.name, email: data.email, password: data.password, phone: data.phone || undefined, role, businessName: data.businessName || undefined, locality: data.locality || undefined } as any });
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-md"
        >
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Registration Submitted</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your registration is <strong>pending admin approval</strong>. You will be notified once your account is verified. This usually takes 1-2 business days.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-foreground mb-6">
            In the meantime, you can browse local businesses while we review your account.
          </div>
          <Button className="w-full bg-primary text-primary-foreground" onClick={() => navigate("/")}>
            Browse Businesses
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-md"
      >
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Store size={22} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join the LocalBiz community</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["customer", "shop_owner"] as const).map((r) => {
            const Icon = r === "customer" ? User : Store;
            const label = r === "customer" ? "Customer" : "Shop Owner";
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  role === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Ramesh Gupta" {...register("name", { required: true })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Min. 6 characters" {...register("password", { required: true, minLength: 6 })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="phone" placeholder="98XXXXXXXX" {...register("phone")} className="mt-1" />
          </div>
          {role === "shop_owner" && (
            <>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="Gupta Kirana Store" {...register("businessName")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="locality">Your Locality / Area</Label>
                <Input id="locality" placeholder="e.g. Malviya Nagar, Delhi" {...register("locality")} className="mt-1" />
              </div>
            </>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              Registration failed. Please check your details and try again.
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
}
