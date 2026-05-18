import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { Link } from "wouter";

export default function CheckoutPage() {
  const { cartItems, cartTotal, shopId, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [address, setAddress] = useState("");

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">You need to log in to place an order.</p>
        <Button className="w-full" onClick={() => setLocation("/login?redirect=/checkout")}>
          Log In to Checkout
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/shops">
          <Button className="w-full">Browse Shops</Button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    if (!address.trim()) {
      toast({ title: "Address Required", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }

    if (!shopId) return;

    createOrder.mutate(
      {
        data: {
          shopId,
          deliveryAddress: address,
          items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Order Placed!", description: "Your order has been successfully placed." });
          clearCart();
          setLocation("/orders");
        },
        onError: (err: any) => {
          toast({
            title: "Order Failed",
            description: err.response?.data?.message || "Something went wrong.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="-ml-2">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold ml-2">Checkout</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Cart Items</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{"\u20B9"}{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </Button>
                    </div>
                    <p className="font-bold w-16 text-right">{"\u20B9"}{item.price * item.quantity}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{"\u20B9"}{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{"\u20B9"}40</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>{"\u20B9"}{cartTotal + 40}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-1 block">Delivery Address</label>
                <Input
                  placeholder="Enter complete address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Placing Order..." : "Place Order (Cash on Delivery)"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
