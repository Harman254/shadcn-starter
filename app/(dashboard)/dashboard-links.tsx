"use client";

import { cn } from "@/lib/utils";
import { HomeIcon, UserCog, Utensils, Package, Sliders } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const dashboardLinks = [
  {
    id: 0,
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    id: 13,
    name: "New",
    href: "/meal-plans/new",
    icon: HomeIcon,
  },
  
  {
    id: 2,
    name: "Meals",
    href: "/meal-plans",
    icon: Utensils,
  },
  {
    id: 3,
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    id: 4,
    name: "Preferences",
    href: "/dashboard/preferences",
    icon: Sliders,
  },
  {
    id: 1,
    name: "Pricing",
    href: "/dashboard/pricing",
    icon: UserCog,
  },
];

export function DashboardLinks() {
  const pathname = usePathname();

  return (
    <>
      {dashboardLinks.map((link) => {
        // Check if the current pathname starts with the link's href
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.id}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              isActive
                ? "bg-primary/10 text-primary font-medium hover:bg-primary/30 shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
            >
            <link.icon className="size-4" />
            {link.name}
          </Link>
        );
      })}
    </>
  );
}
