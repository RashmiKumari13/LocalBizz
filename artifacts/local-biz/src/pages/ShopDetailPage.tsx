import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetShop,
  getGetShopQueryKey,
  useGetShopProducts,
  getGetShopProductsQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ContactActions } from "@/components/ContactActions";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

function getOpenStatus(opening?: string | null, closing?: string | null) {
  if (!opening || !closing) return null;
  const now = new Date();
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= oh * 60 + om && nowMins <= ch * 60 + cm;
}

const CATEGORY_COLORS: Record<string, string> = {
  grocery: "bg-green-100 text-green-800",
  fashion: "bg-pink-100 text-pink-800",
  healthcare: "bg-blue-100 text-blue-800",
  services: "bg-orange-100 text-orange-800",
  restaurants: "bg-yellow-100 text-yellow-800",
};

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const shopId = parseInt(id ?? "0");

  const { data: shop, isLoading, error } = useGetShop(shopId, {
    query: { enabled: !!shopId, queryKey: getGetShopQueryKey(shopId) },
  });

  const { data: products } = useGetShopProducts(shopId, {
    query: { enabled: !!shopId, queryKey: getGetShopProductsQueryKey(shopId) },
  });

  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Shop not found.</p>
        <Link href="/shops"><Button variant="outline" className="mt-4">Back to Shops</Button></Link>
      </div>
    );
  }

  const isOpen = getOpenStatus(shop.openingTime, shop.closingTime);
  const colorClass = CATEGORY_COLORS[shop.category] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/shops">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft size={16} className="mr-1" /> Back to Shops
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero image or placeholder */}
        <div className="h-56 rounded-xl overflow-hidden mb-5 shadow-md bg-muted flex items-center justify-center">
          {shop.imageUrl ? (
            <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${colorClass}`}>
              <span className="text-6xl font-bold opacity-30">{shop.name.charAt(0)}</span>
              <span className="text-sm font-medium capitalize opacity-60">{shop.subcategory ?? shop.category}</span>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{shop.name}</h1>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 ${colorClass}`}>
                {shop.subcategory ?? shop.category}
              </span>
            </div>
            <div className="shrink-0">
              {isOpen === null ? (
                <Badge variant="secondary">Timing N/A</Badge>
              ) : isOpen ? (
                <Badge className="bg-green-500 text-white">Open Now</Badge>
              ) : (
                <Badge className="bg-red-500 text-white">Closed</Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm border-t border-border pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={15} className="text-primary shrink-0" />
              <span>{shop.locality}</span>
            </div>
            {shop.openingTime && shop.closingTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={15} className="text-primary shrink-0" />
                <span>{shop.openingTime} - {shop.closingTime}</span>
              </div>
            )}
            {shop.rating != null && (
              <div className="flex items-center gap-2">
                <Star size={15} className="text-yellow-500 fill-yellow-500 shrink-0" />
                <span className="font-semibold text-foreground">{shop.rating.toFixed(1)}</span>
                {shop.reviewCount != null && (
                  <span className="text-muted-foreground text-xs">({shop.reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>

          {/* Contact actions */}
          <ContactActions shopName={shop.name} phone={shop.phone} backLabel="shop" />
        </div>

        {/* Products Section */}
        {products && products.length > 0 && (
          <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Products</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-center py-3 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                    <p className="font-bold text-primary mt-1">{"\u20B9"}{product.price}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={product.available ? "default" : "secondary"}
                    disabled={!product.available}
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart size={14} className="mr-2" />
                    {product.available ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="mt-4 bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">About LocalBiz listings</p>
          <p className="text-xs leading-relaxed">
            All businesses on LocalBiz are verified by our admin team. Contact the shop directly via call, WhatsApp, or send an enquiry to get the latest info on products and services.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
