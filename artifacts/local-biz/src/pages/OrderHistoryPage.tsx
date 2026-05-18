import { useGetMyOrders, getGetMyOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Package, MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: orders, isLoading } = useGetMyOrders({
    query: { enabled: !!user, queryKey: getGetMyOrdersQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground">You haven't placed any orders. Discover amazing local businesses!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="text-primary" /> My Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b pb-4">
              <div>
                <p className="text-sm text-muted-foreground font-mono">Order #{order.id}</p>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(order.createdAt), "h:mm a")}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${STATUS_COLORS[order.status]} text-white capitalize`}>
                  {order.status}
                </Badge>
                <p className="font-bold text-lg mt-1">{"\u20B9"}{order.totalAmount + 40}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Items ({order.items?.length})</p>
                <div className="space-y-1">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x Item #{item.productId}</span>
                      <span>{"\u20B9"}{item.priceAtTime * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
