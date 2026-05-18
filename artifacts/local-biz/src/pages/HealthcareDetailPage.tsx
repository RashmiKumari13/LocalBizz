import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, ArrowLeft, Pill, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetShop, getGetShopQueryKey, useGetMedicines, getGetMedicinesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ContactActions } from "@/components/ContactActions";

const SUBCATEGORY_COLORS: Record<string, string> = {
  hospital: "bg-red-100 text-red-700",
  clinic: "bg-blue-100 text-blue-700",
  pharmacy: "bg-green-100 text-green-700",
  diagnostic: "bg-purple-100 text-purple-700",
  optical: "bg-cyan-100 text-cyan-700",
};

export default function HealthcareDetailPage() {
  const { id } = useParams<{ id: string }>();
  const shopId = parseInt(id ?? "0");

  const { data: shop, isLoading } = useGetShop(shopId, {
    query: { enabled: !!shopId, queryKey: getGetShopQueryKey(shopId) },
  });

  const { data: medicines = [] } = useGetMedicines(shopId, {
    query: {
      enabled: shop?.subcategory === "pharmacy",
      queryKey: getGetMedicinesQueryKey(shopId),
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-56 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Provider not found.</p>
        <Link href="/healthcare"><Button variant="outline" className="mt-4">Back to Healthcare</Button></Link>
      </div>
    );
  }

  const colorClass = SUBCATEGORY_COLORS[shop.subcategory ?? ""] ?? "bg-blue-100 text-blue-700";
  const inStock = medicines.filter((m) => m.available).length;
  const outOfStock = medicines.filter((m) => !m.available).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/healthcare">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft size={16} className="mr-1" /> Back to Healthcare
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Hero */}
        <div className="h-52 rounded-xl overflow-hidden shadow-md bg-muted flex items-center justify-center">
          {shop.imageUrl ? (
            <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${colorClass}`}>
              <span className="text-6xl font-bold opacity-30">{shop.name.charAt(0)}</span>
              <span className="text-sm font-medium capitalize opacity-60">{shop.subcategory ?? "Healthcare"}</span>
            </div>
          )}
        </div>

        {/* Main info card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">{shop.name}</h1>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 ${colorClass}`}>
                {shop.subcategory ?? "Healthcare"}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} className="text-primary shrink-0" /> {shop.locality}
            </div>
            {shop.openingTime && shop.closingTime ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} className="text-primary shrink-0" />
                {shop.openingTime === "00:00" && shop.closingTime === "23:59"
                  ? "Open 24 Hours"
                  : `${shop.openingTime} – ${shop.closingTime}`}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">Timing not available</div>
            )}
            {shop.rating != null && (
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                {shop.reviewCount != null && (
                  <span className="text-muted-foreground text-xs">({shop.reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>

          {/* Contact actions */}
          <ContactActions shopName={shop.name} phone={shop.phone} backLabel="healthcare provider" />
        </div>

        {/* Medicines section (pharmacy only) */}
        {shop.subcategory === "pharmacy" && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">Medicine Inventory</h2>
              </div>
              {medicines.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{inStock} In Stock</span>
                  {outOfStock > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{outOfStock} Out of Stock</span>
                  )}
                </div>
              )}
            </div>
            {medicines.length === 0 ? (
              <p className="text-muted-foreground text-sm">No medicine information available.</p>
            ) : (
              <div className="space-y-1">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm ${med.available ? "bg-green-50/50" : "bg-muted/40"}`}
                  >
                    <div className="flex items-center gap-2">
                      {med.available ? (
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-red-400 shrink-0" />
                      )}
                      <span className={`font-medium ${med.available ? "text-foreground" : "text-muted-foreground line-through"}`}>
                        {med.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {med.price != null && (
                        <span className="text-xs font-semibold text-foreground">₹{med.price.toFixed(0)}</span>
                      )}
                      <Badge
                        variant={med.available ? "default" : "secondary"}
                        className={`text-xs ${med.available ? "bg-green-500 hover:bg-green-500" : ""}`}
                      >
                        {med.available ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Stock information may change. Call or WhatsApp the pharmacy to confirm availability before visiting.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
