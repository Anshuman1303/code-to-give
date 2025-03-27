// components/Dashboard/Student/HackathonsTab/HackathonsTab.tsx
"use client";
import { useState } from "react";
import { HackathonSubTabs } from "./HackathonSubTabs";
import { HackathonGrid } from "./HackathonGrid";

interface HackathonsTabProps {
  hackathons: Array<{
    id: string;
    name: string;
    subDeadline: string;
    participants: number;
    isSubmitted: boolean;
  }>;
}

export const HackathonsTab = ({ hackathons }: HackathonsTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState("all");

  const filteredHackathons = hackathons.filter((hackathon) => {
    switch (activeSubTab) {
      case "submitted":
        return hackathon.isSubmitted;
      case "available":
        return !hackathon.isSubmitted;
      // Add cases for other tabs as needed
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <HackathonSubTabs activeTab={activeSubTab} onTabChange={setActiveSubTab} />
      <HackathonGrid hackathons={filteredHackathons} />
    </div>
  );
};
