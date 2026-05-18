import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Scissors,
  HeartPulse,
  Wrench,
  UtensilsCrossed,
  MapPin,
  Store,
  BadgeCheck,
  Clock3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetShopsSummary, useGetFeaturedShops } from "@workspace/api-client-react";
import { ShopCard } from "@/components/ShopCard";

const CATEGORIES = [
  { name: "Grocery", slug: "grocery", icon: ShoppingCart, desc: "Kirana stores, supermarkets, daily essentials" },
  { name: "Fashion", slug: "fashion", icon: Scissors, desc: "Sarees, ethnic wear, boutiques" },
  { name: "Healthcare", slug: "healthcare", icon: HeartPulse, desc: "Hospitals, clinics, pharmacies" },
  { name: "Services", slug: "services", icon: Wrench, desc: "Electricians, laundry, repairs, tailors" },
  { name: "Restaurants", slug: "restaurants", icon: UtensilsCrossed, desc: "Dhabas, cafes, tiffin centres" },
];

const STEPS = [
  {
    title: "Search your area",
    description: "Type a shop name, category, or locality to find options near you in seconds.",
    icon: Search,
  },
  {
    title: "Compare and contact",
    description: "Check details and reach businesses directly without jumping between multiple apps.",
    icon: BadgeCheck,
  },
  {
    title: "Support local first",
    description: "Choose trusted neighborhood stores and services that keep your community thriving.",
    icon: Sparkles,
  },
] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { data: summary } = useGetShopsSummary();
  const { data: featured = [] } = useGetFeaturedShops();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) navigate(`/shops?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.25),transparent_55%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_50%)]" />

      <section className="relative container mx-auto px-4 pt-12 pb-10 md:pt-18 md:pb-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <MapPin size={14} /> Local discovery made simple
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Find trusted local businesses without the noise.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              LocalConnect helps families and shoppers discover nearby stores, clinics, restaurants, and services from one clean directory built for real neighborhoods.
            </p>

            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onSubmit={handleSearch}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shops, categories, localities..."
                  className="h-12 border-border bg-card pl-10 text-foreground shadow-sm"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 min-w-32 bg-primary text-primary-foreground hover:bg-primary/90">
                Explore
              </Button>
            </motion.form>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={14} className="text-primary" /> Verified listings
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} className="text-primary" /> Fast local search
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-lg"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Store size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Community Snapshot</p>
                <h2 className="text-xl font-bold text-foreground">Neighborhood Commerce</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/80 bg-background p-4">
                <p className="text-2xl font-extrabold text-foreground">{summary?.total ?? 0}+</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Businesses</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-background p-4">
                <p className="text-2xl font-extrabold text-foreground">{summary?.localities?.length ?? 0}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Localities</p>
              </div>
              {Object.entries(summary?.byCategory ?? {})
                .slice(0, 2)
                .map(([cat, count]) => (
                  <div key={cat} className="rounded-xl border border-border/80 bg-background p-4">
                    <p className="text-2xl font-extrabold text-foreground">{count as number}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{cat}</p>
                  </div>
                ))}
            </div>

            <Button variant="outline" className="mt-5 w-full" onClick={() => navigate("/shops")}>
              View all businesses <ArrowRight size={15} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-2xl font-bold text-foreground"
        >
          Browse by Category
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.slug} variants={fadeUp}>
                <button
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group w-full rounded-2xl border border-border bg-card p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                >
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={22} className="text-primary transition-colors group-hover:text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{cat.name}</div>
                  <div className="mt-1 hidden text-xs leading-tight text-muted-foreground sm:block">{cat.desc}</div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {featured.length > 0 && (
        <section className="container mx-auto px-4 pb-12 pt-4">
          <div className="mb-6 flex items-center justify-between">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-foreground"
            >
              Featured Businesses
            </motion.h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/shops")}>
              View All
            </Button>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {featured.slice(0, 8).map((shop) => (
              <motion.div key={shop.id} variants={fadeUp}>
                <ShopCard shop={shop} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-14">
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-foreground">How it works</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Built for busy customers and growing local owners. From search to call, everything takes just a few taps.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-border/80 bg-background p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-primary">
                    <StepIcon size={18} />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-primary/20 bg-[linear-gradient(120deg,hsl(var(--primary)/0.12),hsl(var(--accent)/0.22))]">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-12 md:flex-row">
          <div>
            <div className="mb-1 flex items-center gap-2 font-semibold text-primary">
              <Store size={18} /> For Shop Owners
            </div>
            <h3 className="text-xl font-bold text-foreground">List your business for free</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Register your shop and reach local customers looking for trusted businesses near them.
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("/register")}
          >
            Register Your Shop
          </Button>
        </div>
      </section>
    </div>
  );
}
