import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useListShops, getListShopsQueryKey } from "@workspace/api-client-react";
import { ShopCard } from "@/components/ShopCard";
import { Skeleton } from "@/components/ui/skeleton";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const CATEGORY_LABELS: Record<string, string> = {
  grocery: "Grocery Stores",
  fashion: "Fashion & Clothing",
  healthcare: "Healthcare Services",
  services: "Local Services",
  restaurants: "Restaurants & Dhabas",
};

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const category = name ?? "";

  const queryParams = { category };
  const { data: shops = [], isLoading } = useListShops(queryParams, {
    query: { queryKey: getListShopsQueryKey(queryParams) },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1 capitalize">
          {CATEGORY_LABELS[category] ?? category}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Verified businesses in this category
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-medium">No shops in this category yet</p>
        </div>
      ) : (
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {shops.map((shop) => (
            <motion.div key={shop.id} variants={fadeUp}>
              <ShopCard shop={shop} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
