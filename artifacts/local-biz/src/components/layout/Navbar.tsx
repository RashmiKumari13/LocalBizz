import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/context/CartContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HeartPulse, User, Store, ShoppingCart, Package } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [, setLocation] = useLocation();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 mr-6 text-foreground hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">LocalConnect</span>
        </Link>

        <div className="hidden md:flex flex-1 items-center gap-4 text-sm font-medium">
          <Link href="/shops" className="text-foreground/80 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-card">All Shops</Link>
          <Link href="/healthcare" className="text-foreground/80 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-card flex items-center gap-1">
            <HeartPulse size={14} className="text-primary" /> Healthcare
          </Link>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/checkout")} className="relative mr-2">
            <ShoppingCart size={18} className="text-foreground/80" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartItemCount}
              </span>
            )}
          </Button>

          {user ? (
            <>
              {user.role === "admin" && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
                  Admin Panel
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setLocation("/orders")} className="hidden sm:flex">
                <Package size={16} className="mr-2" />
                Orders
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="hidden sm:flex">
                <User size={16} className="mr-2" />
                Dashboard
              </Button>
              <Button variant="secondary" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/login")}>
                Log in
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLocation("/register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
