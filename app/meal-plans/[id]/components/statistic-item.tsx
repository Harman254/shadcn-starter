import { Card, CardContent } from "@/components/ui/card";
import { StatisticItemProps } from "../components/types";

export const StatisticItem = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  color, 
  bgColor 
}: StatisticItemProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className={`inline-flex p-3 rounded-lg ${bgColor} mb-4`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-1">{label}</h3>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
};

export default StatisticItem;

