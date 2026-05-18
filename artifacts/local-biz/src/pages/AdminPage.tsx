import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Users, Store, Clock, CheckCircle, XCircle, ShieldCheck, Plus, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useGetPendingUsers, getGetPendingUsersQueryKey,
  useGetPendingShops, getGetPendingShopsQueryKey,
  useVerifyUser, useVerifyShop, useAdminCreateShop,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

type AddShopForm = {
  name: string; category: string; locality: string;
  phone?: string; imageUrl?: string; openingTime?: string; closingTime?: string; subcategory?: string;
};

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [addingShop, setAddingShop] = useState(false);

  const { data: stats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: pendingUsers = [], refetch: refetchUsers } = useGetPendingUsers({ query: { queryKey: getGetPendingUsersQueryKey() } });
  const { data: pendingShops = [], refetch: refetchShops } = useGetPendingShops({ query: { queryKey: getGetPendingShopsQueryKey() } });

  const { mutate: verifyUser, isPending: verifyingUser } = useVerifyUser({
    mutation: { onSuccess: () => { refetchUsers(); qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() }); } }
  });
  const { mutate: verifyShop, isPending: verifyingShop } = useVerifyShop({
    mutation: { onSuccess: () => { refetchShops(); qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() }); } }
  });
  const { mutate: adminCreateShop, isPending: creatingShop } = useAdminCreateShop({
    mutation: { onSuccess: () => { setAddingShop(false); refetchShops(); } }
  });

  const { register, handleSubmit, reset } = useForm<AddShopForm>();

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldCheck size={48} className="mx-auto mb-3 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground mb-4">Admin access required.</p>
        <Button variant="outline" onClick={() => navigate("/login")}>Log In</Button>
      </div>
    );
  }

  const STATS = [
    { label: "Pending Users", value: stats?.pendingUsers ?? 0, icon: Clock, color: "text-yellow-600" },
    { label: "Pending Shops", value: stats?.pendingShops ?? 0, icon: Store, color: "text-orange-500" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Verified Shops", value: stats?.verifiedShops ?? 0, icon: CheckCircle, color: "text-green-500" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, icon: Users, color: "text-purple-500" },
    { label: "Shop Owners", value: stats?.totalShopOwners ?? 0, icon: Store, color: "text-primary" },
  ];

  function onAddShop(data: AddShopForm) {
    adminCreateShop({
      data: {
        name: data.name,
        category: data.category as any,
        locality: data.locality,
        phone: data.phone || undefined,
        imageUrl: data.imageUrl || undefined,
        openingTime: data.openingTime || undefined,
        closingTime: data.closingTime || undefined,
        subcategory: data.subcategory || undefined,
      }
    });
    reset();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-xs">Manage users, shops, and verifications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
                <Icon size={20} className={`mx-auto mb-1 ${s.color}`} />
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending-users">
          <TabsList className="mb-6">
            <TabsTrigger value="pending-users">
              Pending Users
              {(stats?.pendingUsers ?? 0) > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs">{stats?.pendingUsers}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending-shops">
              Pending Shops
              {(stats?.pendingShops ?? 0) > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white text-xs">{stats?.pendingShops}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="add-shop">Add Shop</TabsTrigger>
          </TabsList>

          {/* Pending Users */}
          <TabsContent value="pending-users">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={36} className="mx-auto mb-2 text-green-400" />
                <p>No pending user verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">{u.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{u.role.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                      {u.businessName && <p className="text-xs text-primary font-medium mt-0.5">{u.businessName}</p>}
                      {u.locality && <p className="text-xs text-muted-foreground">{u.locality}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Registered: {new Date(u.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white text-xs"
                        disabled={verifyingUser}
                        onClick={() => verifyUser({ userId: u.id, data: { action: "approve" } })}
                      >
                        <CheckCircle size={13} className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-500 hover:bg-red-50 text-xs"
                        disabled={verifyingUser}
                        onClick={() => verifyUser({ userId: u.id, data: { action: "reject" } })}
                      >
                        <XCircle size={13} className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Shops */}
          <TabsContent value="pending-shops">
            {pendingShops.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={36} className="mx-auto mb-2 text-green-400" />
                <p>No pending shop verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingShops.map((s) => (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">{s.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{s.category}</Badge>
                        {s.subcategory && <Badge variant="secondary" className="text-xs">{s.subcategory}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{s.locality}</p>
                      {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white text-xs"
                        disabled={verifyingShop}
                        onClick={() => verifyShop({ shopId: s.id, data: { action: "approve" } })}
                      >
                        <CheckCircle size={13} className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-500 hover:bg-red-50 text-xs"
                        disabled={verifyingShop}
                        onClick={() => verifyShop({ shopId: s.id, data: { action: "reject" } })}
                      >
                        <XCircle size={13} className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add Shop */}
          <TabsContent value="add-shop">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-lg">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus size={16} className="text-primary" /> Add New Shop (Auto-Verified)
              </h3>
              <form onSubmit={handleSubmit(onAddShop)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Shop Name *</Label>
                    <Input placeholder="Gupta Kirana Store" {...register("name", { required: true })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select {...register("category", { required: true })} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select...</option>
                      <option value="grocery">Grocery</option>
                      <option value="fashion">Fashion</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="services">Services</option>
                      <option value="restaurants">Restaurants</option>
                    </select>
                  </div>
                  <div>
                    <Label>Subcategory</Label>
                    <Input placeholder="e.g. pharmacy" {...register("subcategory")} className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label>Locality *</Label>
                    <Input placeholder="Malviya Nagar, Delhi" {...register("locality", { required: true })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="98XXXXXXXX" {...register("phone")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input placeholder="https://..." {...register("imageUrl")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Opening Time</Label>
                    <Input type="time" {...register("openingTime")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Closing Time</Label>
                    <Input type="time" {...register("closingTime")} className="mt-1" />
                  </div>
                </div>
                <Button type="submit" disabled={creatingShop} className="w-full bg-primary text-primary-foreground">
                  {creatingShop ? "Adding..." : "Add Shop"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
