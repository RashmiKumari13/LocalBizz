import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Building2, Stethoscope, Pill, FlaskConical, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListHealthcareShops, getListHealthcareShopsQueryKey } from "@workspace/api-client-react";
import { ShopCard } from "@/components/ShopCard";
import { Skeleton } from "@/components/ui/skeleton";

const SUBCATEGORIES = [
  { value: "", label: "All", icon: HeartPulse },
  { value: "hospital", label: "Hospitals", icon: Building2 },
  { value: "clinic", label: "Clinics", icon: Stethoscope },
  { value: "pharmacy", label: "Pharmacies", icon: Pill },
  { value: "diagnostic", label: "Diagnostics", icon: FlaskConical },
  { value: "optical", label: "Optical", icon: Eye },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function HealthcarePage() {
  const [subcategory, setSubcategory] = useState("");
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");

  const queryParams = {
    ...(subcategory ? { subcategory: subcategory as any } : {}),
    ...(search ? { search } : {}),
  };

  const { data: shops = [], isLoading } = useListHealthcareShops(queryParams, {
    query: { queryKey: getListHealthcareShopsQueryKey(queryParams) },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
          <HeartPulse size={16} /> Healthcare
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Healthcare Services</h1>
        <p className="text-muted-foreground text-sm mb-6">Find hospitals, clinics, pharmacies, diagnostic labs, and optical stores nearby</p>
      </motion.div>

      {/* Subcategory tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {SUBCATEGORIES.map((sub) => {
          const Icon = sub.icon;
          return (
            <Button
              key={sub.value}
              variant={subcategory === sub.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSubcategory(sub.value)}
              className="flex items-center gap-1"
            >
              <Icon size={13} />
              {sub.label}
            </Button>
          );
        })}
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setSearch(inputVal.trim()); }}
        className="relative mb-6 max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search healthcare providers..."
          className="pl-9"
        />
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HeartPulse size={40} className="mx-auto mb-3 opacity-40" />
          <p>No healthcare providers found</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{shops.length} provider{shops.length !== 1 ? "s" : ""} found</p>
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {shops.map((shop) => (
              <motion.div key={shop.id} variants={fadeUp}>
                <ShopCard shop={shop} href={`/healthcare/${shop.id}`} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
