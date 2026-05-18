import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Store, Clock, CheckCircle, XCircle, LogOut, Pencil,
  MapPin, Phone, ShieldCheck, ExternalLink, X, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  useGetMyShops, getGetMyShopsQueryKey,
  useUpdateShop, getGetShopQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type Shop = {
  id: number; name: string; category: string; subcategory?: string | null;
  locality: string; phone?: string | null; openingTime?: string | null;
  closingTime?: string | null; status: string; imageUrl?: string | null;
  rejectionReason?: string | null;
};

const STATUS_CONFIG = {
  pending:  { label: "Pending Approval", icon: Clock,        color: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-400" },
  verified: { label: "Verified & Live",  icon: CheckCircle,  color: "bg-green-100 text-green-800 border-green-200",   dot: "bg-green-500" },
  rejected: { label: "Not Approved",     icon: XCircle,      color: "bg-red-100 text-red-800 border-red-200",         dot: "bg-red-400" },
};

function ShopCard({ shop, onEdit }: { shop: Shop; onEdit: (s: Shop) => void }) {
  const [, navigate] = useLocation();
  const cfg = STATUS_CONFIG[shop.status as keyof typeof STATUS_CONFIG];
  const Icon = cfg?.icon ?? Clock;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Image strip */}
      <div className="h-32 bg-muted flex items-center justify-center relative">
        {shop.imageUrl ? (
          <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl font-bold text-muted-foreground/20">{shop.name.charAt(0)}</span>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${cfg?.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
            {cfg?.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-foreground">{shop.name}</h3>
            <span className="text-xs text-muted-foreground capitalize">{shop.subcategory ?? shop.category}</span>
          </div>
          <Button size="sm" variant="ghost" className="shrink-0 h-8 w-8 p-0" onClick={() => onEdit(shop)}>
            <Pencil size={14} />
          </Button>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5"><MapPin size={11} className="text-primary shrink-0" />{shop.locality}</div>
          {shop.phone && <div className="flex items-center gap-1.5"><Phone size={11} className="text-primary shrink-0" />{shop.phone}</div>}
          {shop.openingTime && shop.closingTime && (
            <div className="flex items-center gap-1.5"><Clock size={11} className="text-primary shrink-0" />{shop.openingTime} – {shop.closingTime}</div>
          )}
        </div>

        {shop.status === "rejected" && shop.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 mb-3">
            <span className="font-medium">Rejection reason: </span>{shop.rejectionReason}
          </div>
        )}

        {shop.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 text-xs text-yellow-800 mb-3">
            Your shop is under review. We'll notify you once it's approved.
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onEdit(shop)}>
            <Pencil size={12} className="mr-1" /> Edit Details
          </Button>
          {shop.status === "verified" && (
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate(`/shops/${shop.id}`)}>
              <ExternalLink size={12} className="mr-1" /> View Live
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditShopModal({ shop, onClose }: { shop: Shop; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: shop.name,
    locality: shop.locality,
    phone: shop.phone ?? "",
    subcategory: shop.subcategory ?? "",
    openingTime: shop.openingTime ?? "",
    closingTime: shop.closingTime ?? "",
  });
  const [saved, setSaved] = useState(false);

  const { mutate: updateShop, isPending } = useUpdateShop({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMyShopsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetShopQueryKey(shop.id) });
        setSaved(true);
        setTimeout(onClose, 1200);
      },
    },
  });

  function handleSave() {
    updateShop({
      shopId: shop.id,
      data: {
        name: form.name,
        locality: form.locality,
        phone: form.phone || null,
        subcategory: form.subcategory || null,
        openingTime: form.openingTime || null,
        closingTime: form.closingTime || null,
      },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-foreground text-lg">Edit Shop</h3>
            <p className="text-muted-foreground text-xs mt-0.5">Changes will be re-submitted for admin approval</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Shop Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Locality / Address</Label>
            <Input value={form.locality} onChange={e => setForm(f => ({ ...f, locality: e.target.value }))} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="98XXXXXXXX" />
            </div>
            <div>
              <Label>Subcategory</Label>
              <Input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className="mt-1" placeholder="e.g. pharmacy" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Opening Time</Label>
              <Input type="time" value={form.openingTime} onChange={e => setForm(f => ({ ...f, openingTime: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Closing Time</Label>
              <Input type="time" value={form.closingTime} onChange={e => setForm(f => ({ ...f, closingTime: e.target.value }))} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mt-4">
          Saving will reset your shop status to <strong>Pending</strong> until the admin re-approves it.
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className={`flex-1 ${saved ? "bg-green-600 hover:bg-green-600" : "bg-primary"} text-white`}
            onClick={handleSave}
            disabled={isPending || saved}
          >
            {saved ? <><CheckCircle size={15} className="mr-1" /> Saved!</> : isPending ? "Saving..." : <><Save size={15} className="mr-1" /> Save & Re-submit</>}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user, isLoading, logout } = useAuth();
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const isShopOwner = user?.role === "shop_owner";
  const { data: myShops = [], isLoading: shopsLoading } = useGetMyShops({
    query: { enabled: isShopOwner, queryKey: getGetMyShopsQueryKey() },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">You need to be logged in to view your dashboard.</p>
        <Button onClick={() => navigate("/login")} className="bg-primary text-primary-foreground">Log In</Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusCfg?.icon ?? Clock;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              <LogOut size={15} className="mr-1" /> Log out
            </Button>
          </div>

          {/* Account status banners */}
          {user.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <Clock size={18} className="text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 text-sm">Account Pending Verification</p>
                <p className="text-yellow-700 text-xs mt-0.5">Your account is being reviewed. You'll have full access once approved.</p>
              </div>
            </div>
          )}
          {user.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-red-800 text-sm">Account Not Approved</p>
                <p className="text-red-700 text-xs mt-0.5">Your registration was not approved. Contact support for details.</p>
              </div>
            </div>
          )}

          {/* Profile card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                {user.role === "admin" ? <ShieldCheck size={26} className="text-primary" />
                  : user.role === "shop_owner" ? <Store size={26} className="text-primary" />
                  : <User size={26} className="text-primary" />}
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">{user.name}</h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    {user.role === "shop_owner" ? "Shop Owner" : user.role === "admin" ? "Administrator" : "Customer"}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg?.color}`}>
                    <StatusIcon size={11} /> {statusCfg?.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-sm border-t border-border pt-3">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium text-right">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground font-medium">{user.phone}</span>
                </div>
              )}
              {user.locality && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Locality</span>
                  <span className="text-foreground font-medium">{user.locality}</span>
                </div>
              )}
              {user.businessName && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Business Name</span>
                  <span className="text-foreground font-medium">{user.businessName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin shortcut */}
          {user.role === "admin" && (
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => navigate("/admin")}>
              <ShieldCheck size={16} className="mr-2" /> Open Admin Panel
            </Button>
          )}

          {/* My Shops — shop owner only */}
          {isShopOwner && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Store size={16} className="text-primary" /> My Shop Listings
                </h2>
                {myShops.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{myShops.length} listing{myShops.length !== 1 ? "s" : ""}</Badge>
                )}
              </div>

              {shopsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              ) : myShops.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                  <Store size={32} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground text-sm mb-3">You haven't submitted any shop listings yet.</p>
                  <p className="text-xs text-muted-foreground">Once your account is verified, you can add your shop from the Shops page.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(myShops as Shop[]).map((shop) => (
                    <ShopCard key={shop.id} shop={shop} onEdit={setEditingShop} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/shops")}>
              <Store size={18} className="text-primary" />
              <span className="text-xs">Browse Shops</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/healthcare")}>
              <span className="text-lg leading-none">🏥</span>
              <span className="text-xs">Healthcare</span>
            </Button>
          </div>

        </motion.div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingShop && (
          <EditShopModal shop={editingShop} onClose={() => setEditingShop(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
