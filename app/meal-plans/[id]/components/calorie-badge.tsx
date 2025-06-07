import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { CalorieBadgeProps } from "../components/types";

export const CalorieBadge = ({ calories, variant = "default", size = "md" }: CalorieBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <Badge variant={variant} className={sizeClasses[size]}>
      <Flame className="h-3 w-3 mr-1" />
      {calories} cal
    </Badge>
  );
};

export default CalorieBadge;
