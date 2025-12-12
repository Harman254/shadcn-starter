import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Pricing4 from "@/components/prices";

export default async function PricingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <Pricing4 />
    </div>
  );
}
