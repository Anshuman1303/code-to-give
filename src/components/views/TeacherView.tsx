"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { categoryValidationSchema } from "@/lib/schemas/category";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// const hackathons = [
//   {
//     id: 1,
//     name: "AI Innovation Challenge",
//     creatorId: "t_001",
//     participants: 142,
//     status: "Results to be Announced",
//     subDeadline: "Mar 15",
//   },
//   { id: 2, name: "Blockchain Hack", creatorId: "t_002", participants: 89, status: "Results to be Announced", subDeadline: "Mar 18" },
//   { id: 3, name: "Climate Tech Showdown", creatorId: "t_003", participants: 204, status: "Completed", subDeadline: "Mar 20" },
//   {
//     id: 4,
//     name: "Cybersecurity Challenge",
//     creatorId: "t_004",
//     participants: 99,
//     status: "Results to be Announced",
//     subDeadline: "Mar 22",
//   },
//   { id: 5, name: "Healthcare AI", creatorId: "t_005", participants: 65, status: "Completed", subDeadline: "Mar 25" },
// ];

export interface TeacherViewProps {
  hackathons: Array<{
    id: string;
    name: string;
    subDeadline: string;
    participants: number;
    isSubmitted: boolean;
    status: "On Going" | "Completed";
  }>;
}

export default function TeacherView({ hackathons }: TeacherViewProps) {
  const form = useForm<z.infer<typeof categoryValidationSchema>>({
    resolver: zodResolver(categoryValidationSchema),
    defaultValues: {
      name: "",
      description: "",
      evaluationParameters: [],
      deadline: "",
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hackathons");
  const [activeFilter, setActiveFilter] = useState("all");
  const [newHackathon, setNewHackathon] = useState<{
    name: string;
    description: string;
    judgingCriteria: string[];
    criterionInput: string;
    submissionDeadline: string;
  }>({
    name: "",
    description: "",
    judgingCriteria: [],
    criterionInput: "",
    submissionDeadline: "",
  });

  const router = useRouter();
  const statusOrder: Record<string, number> = {
    "On going": 1,
    Completed: 2,
  };

  const filteredHackathons = hackathons
    .filter((h) => activeFilter === "all" || h.status === activeFilter)
    .filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.name.localeCompare(b.name));

  async function onSubmit(values: z.infer<typeof categoryValidationSchema>) {
    console.log(values);
    setSubmitLoading(true);
    const res = await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSubmitLoading(false);
    const { message } = await res.json();
    // if (success) toast.success("Successfully submitted!");
    // else toast.error(error);
    toast(message);
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="flex border-b">
        <button
          className={`flex-1 text-center py-2 ${activeTab === "hackathons" ? "border-b-2 border-black font-bold" : ""}`}
          onClick={() => setActiveTab("hackathons")}>
          Hackathons
        </button>
      </div>
      {activeTab === "hackathons" && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* <div className="lg:col-span-1 border rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Create Hackathon</h2>
            <Input
              type="text"
              placeholder="Problem Statement"
              value={newHackathon.name}
              onChange={(e) => setNewHackathon({ ...newHackathon, name: e.target.value })}
              className="w-full mb-2"
            />
            <Textarea
              placeholder="Description"
              value={newHackathon.description}
              onChange={(e) => setNewHackathon({ ...newHackathon, description: e.target.value })}
              className="w-full mb-2"
            />

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Judging Criteria</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {newHackathon.judgingCriteria.map((criterion, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span>{criterion.name}</span>
                    <button
                      onClick={() => {
                        if (newHackathon.judgingCriteria.length <= 1) {
                          toast.error("You must have at least one judging criterion.");
                          return;
                        }
                        setNewHackathon({
                          ...newHackathon,
                          judgingCriteria: newHackathon.judgingCriteria.filter((_, i) => i !== index),
                        });
                      }}
                      className="ml-2 hover:text-red-600">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Add criteria and press Enter"
                value={newHackathon.criterionInput}
                onChange={(e) => setNewHackathon({ ...newHackathon, criterionInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!newHackathon.criterionInput.trim()) return;
                    if (newHackathon.judgingCriteria.length >= 10) {
                      toast.error("You can have a maximum of 10 judging criteria.");
                      return;
                    }
                    setNewHackathon({
                      ...newHackathon,
                      judgingCriteria: [...newHackathon.judgingCriteria, { name: newHackathon.criterionInput.trim(), maxMarks: 10 }],
                      criterionInput: "",
                    });
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Submission Deadline</h3>
              <Input
                type="date"
                value={newHackathon.submissionDeadline}
                onChange={(e) => setNewHackathon({ ...newHackathon, submissionDeadline: e.target.value })}
                className="w-full"
              />
            </div>

            <Button className="w-full bg-black text-white mt-2" onClick={handleCreateHackathon}>
              Create Hackathon
            </Button>
          </div> */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hackathon Title</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input type="textarea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evaluationParameters"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-2">Judging Criteria</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {field.value.map((criterion, index) => (
                            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                              <span>{criterion}</span>
                              <button
                                onClick={() => {
                                  if (newHackathon.judgingCriteria.length <= 1) {
                                    toast.error("You must have at least one judging criterion.");
                                    return;
                                  }
                                  setNewHackathon({
                                    ...newHackathon,
                                    judgingCriteria: newHackathon.judgingCriteria.filter((_, i) => i !== index),
                                  });
                                  field.onChange(field.value.filter((_, i) => i !== index));
                                }}
                                className="ml-2 hover:text-red-600">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <Input
                          type="text"
                          placeholder="Add criteria and press Enter"
                          value={newHackathon.criterionInput}
                          onChange={(e) => {
                            setNewHackathon({ ...newHackathon, criterionInput: e.target.value });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!newHackathon.criterionInput.trim()) return;
                              if (newHackathon.judgingCriteria.length >= 10) {
                                toast.error("You can have a maximum of 10 judging criteria.");
                                return;
                              }
                              setNewHackathon({
                                ...newHackathon,
                                judgingCriteria: [...newHackathon.judgingCriteria, newHackathon.criterionInput.trim()],
                                criterionInput: "",
                              });
                              field.onChange([...field.value, newHackathon.criterionInput.trim()]);
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="ml-2" type="submit" disabled={submitLoading}>
                Submit
              </Button>
            </form>
          </Form>

          <div className="col-span-3">
            <div className="flex border-b mb-4">
              {["On going", "Completed", "all"].map((filter) => (
                <button
                  key={filter}
                  className={`flex-1 text-center py-2 capitalize ${activeFilter === filter ? "border-b-2 border-black font-bold" : ""}`}
                  onClick={() => setActiveFilter(filter)}>
                  {filter}
                </button>
              ))}
            </div>

            {/* Added search bar here */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="🔎 Search hackathons by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHackathons.map((hackathon) => (
                <div key={hackathon.id} className="border rounded-lg p-6 shadow-md flex flex-col cursor-pointer">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">{hackathon.name}</h2>
                    <p className={`text-sm font-semibold ${hackathon.status === "On Going" ? "text-green-600" : "text-blue-600"}`}>
                      {hackathon.status}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">👥 {hackathon.participants} participants</p>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 Submission Deadline: <span className="font-semibold">{hackathon.subDeadline}</span>
                  </p>

                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      router.push(`/results/${hackathon.id}`);
                    }}
                    className="mt-3 border-t pt-3 text-center font-semibold text-blue-500">
                    View details →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
