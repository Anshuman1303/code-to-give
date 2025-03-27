// components/Dashboard/Student/HackathonsTab/HackathonSubTabs.tsx
"use client";
import { cn } from "@/lib/utils";

interface HackathonSubTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const HackathonSubTabs = ({ activeTab, onTabChange }: HackathonSubTabsProps) => {
  const subTabs = ["submitted", "available", "all"];

  return (
    <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
      {subTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-full transition-colors",
            "border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeTab === tab ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent hover:text-accent-foreground"
          )}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
};
