import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, Users } from "lucide-react";

type HackathonCardProps = {
  id: string;
  name: string;
  subDeadline: string;
  participants: number;
  isSubmitted: boolean;
  onClick?: () => void;
};

export const HackathonCard = ({
  name,
  subDeadline,
  participants,
  isSubmitted,
  onClick, // Receive onClick prop
}: HackathonCardProps) => {
  return (
    <Card
      onClick={onClick} // Apply onClick to make the card clickable
      className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold truncate">{name}</h3>
          <span
            className={cn(
              "px-2 py-1 text-xs rounded-full",
              isSubmitted
                ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
                : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400"
            )}>
            {isSubmitted ? "Submitted" : "Open"}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{participants.toLocaleString()} participants</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span>Submit by {subDeadline}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <button className="w-full text-sm font-medium text-primary hover:underline">
            {isSubmitted ? "View details →" : "Learn more →"}
          </button>
        </div>
      </div>
    </Card>
  );
};
