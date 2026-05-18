import { Link } from "wouter";
import { Phone, MapPin, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Shop = {
  id: number;
  name: string;
  category: string;
  subcategory?: string | null;
  locality: string;
  phone?: string | null;
  imageUrl?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  status: string;
  rating?: number | null;
  reviewCount?: number | null;
};

function getOpenStatus(opening?: string | null, closing?: string | null) {
  if (!opening || !closing) return null;
  const now = new Date();
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  return nowMins >= openMins && nowMins <= closeMins;
}

const CATEGORY_COLORS: Record<string, string> = {
  grocery: "bg-green-100 text-green-800",
  fashion: "bg-pink-100 text-pink-800",
  healthcare: "bg-blue-100 text-blue-800",
  services: "bg-orange-100 text-orange-800",
  restaurants: "bg-yellow-100 text-yellow-800",
};

export function ShopCard({ shop, href }: { shop: Shop; href?: string }) {
  const isOpen = getOpenStatus(shop.openingTime, shop.closingTime);
  const link = href ?? `/shops/${shop.id}`;

  return (
    <Link href={link}>
      <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
        <div className="relative h-44 bg-muted overflow-hidden">
          {shop.imageUrl ? (
            <img
              src={shop.imageUrl}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-4xl font-bold">
              {shop.name.charAt(0)}
            </div>
          )}
          <div className="absolute top-2 right-2">
            {isOpen === null ? (
              <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">Timing N/A</span>
            ) : isOpen ? (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">Open</span>
            ) : (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">Closed</span>
            )}
          </div>
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CATEGORY_COLORS[shop.category] ?? "bg-gray-100 text-gray-700"}`}>
              {shop.subcategory ?? shop.category}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{shop.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
            <MapPin size={11} />
            <span className="line-clamp-1">{shop.locality}</span>
          </div>
          {shop.phone && (
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-xs">
              <Phone size={11} />
              <span>{shop.phone}</span>
            </div>
          )}
          {shop.openingTime && shop.closingTime && (
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-xs">
              <Clock size={11} />
              <span>{shop.openingTime} – {shop.closingTime}</span>
            </div>
          )}
          {shop.rating != null && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{shop.rating.toFixed(1)}</span>
              {shop.reviewCount != null && (
                <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
