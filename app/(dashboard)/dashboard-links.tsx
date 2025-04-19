'use client';

import { cn } from "@/lib/utils";
import { HomeIcon, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const dashboardLinks = [
  {
    id: 0,
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    id: 1,
    name: "Pricing",
    href: "/dashboard/pricing",
    icon: UserCog,
  },
  {
    id: 2,
    name: "Meals",
    href: "/dashboard/meals",
    icon: UserCog,
  },
  {
    id: 2,
    name: "Products",
    href: "/dashboard/meals",
    icon: UserCog,
  },
  {
    id: 2,
    name: "Preferences",
    href: "/dashboard/meals",
    icon: UserCog,
  },
];

export function DashboardLinks() {
  const pathname = usePathname();
  return (
    <>
      {dashboardLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.id}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              isActive
                ? "bg-primary/20 text-primary font-medium hover:bg-primary/30 shadow-md"
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
