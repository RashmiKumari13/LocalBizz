import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useListShops, getListShopsQueryKey } from "@workspace/api-client-react";
import { ShopCard } from "@/components/ShopCard";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["All", "grocery", "fashion", "healthcare", "services", "restaurants"];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ShopsPage() {
  const rawSearch = useSearch();
  const params = new URLSearchParams(rawSearch);
  const initialSearch = params.get("search") ?? "";
  const initialCategory = params.get("category") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [inputVal, setInputVal] = useState(initialSearch);

  const queryParams = {
    ...(search ? { search } : {}),
    ...(category && category !== "All" ? { category } : {}),
  };

  const { data: shops = [], isLoading } = useListShops(queryParams, {
    query: { queryKey: getListShopsQueryKey(queryParams) },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputVal.trim());
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">All Shops</h1>
        <p className="text-muted-foreground text-sm mb-6">Browse verified local businesses across India</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search by name, locality..."
            className="pl-9"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat || (cat === "All" && !category) ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat === "All" ? "" : cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
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
          <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No shops found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{shops.length} shop{shops.length !== 1 ? "s" : ""} found</p>
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
        </>
      )}
    </div>
  );
}
