import { requireUser } from "@/lib/user";
import NavbarClient from "./Nav";
interface Feature {
  title: string;
  description: string;
  href: string;
}

const Navbar = async () => {
  const user = await requireUser();
  
  // Define features data here so it's available to the client component
  const features: Feature[] = [
    {
      title: "Dashboard",
      description: "Overview of your activity",
      href: "/dashboard",
    },
    {
      title: "Analytics",
      description: "Track Meal Plans, Recipes, and progress",
      href: "/dashboard/analytics",
    },
    {
      title: "Settings",
      description: "Configure your preferences",
      href: "/dashboard/preferences",
    },
    {
      title: "Support",
      description: "Get help when needed",
      href: "/support",
    },
  ];

  // Pass data from server to client component
  return <NavbarClient user={user} features={features} />;
};

export default Navbar;
