"use client";

import React from "react";
import { NavigationMenuTrigger } from "@/components/ui/navigation-menu";

interface NavMenuTriggerProps {
  children: React.ReactNode;
}

const NavMenuTriggerClient = ({ children }: NavMenuTriggerProps) => {
  return <NavigationMenuTrigger>{children}</NavigationMenuTrigger>;
};

export default NavMenuTriggerClient;