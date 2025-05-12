"use client";

import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";

const MobileMenuTrigger = () => {
  return (
    <SheetTrigger asChild className="lg:hidden">
      <Button variant="outline" size="icon">
        <MenuIcon className="h-4 w-4" />
      </Button>
    </SheetTrigger>
  );
};

export default MobileMenuTrigger;