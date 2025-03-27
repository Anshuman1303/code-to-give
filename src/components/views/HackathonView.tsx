"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formSchema, { acceptedFileTypes } from "@/lib/schemas/submission";
import { z } from "zod";

interface HackathonViewProps {
  hackathon: {
    id: string;
    name: string;
    description: string;
    evaluationParameters: string[];
    subDeadline: string;
    participants: number;
    isSubmitted: boolean;
  };
}

// const hackathons: Record<string, Hackathon> = {
//   "1": {
//     name: "AI Innovation Challenge",
//     description: "Develop an AI model that predicts energy consumption in smart cities.",
//     subDeadline: "March 25, 2025",
//     evaluationParameters: ["Creativity", "Feasibility", "Technical Soundness"],
//   },
//   "2": {
//     name: "Blockchain Hackfest",
//     description: "Build a decentralized identity verification system.",
//     subDeadline: "March 28, 2025",
//     evaluationParameters: ["Security", "Innovation", "Scalability"],
//   },
// };

const HackathonView = ({ hackathon }: HackathonViewProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const router = useRouter();

  // const [file, setFile] = useState<File | null>(null);
  // const [altText, setAltText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  if (!hackathon) return notFound();

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files.length > 0) {
  //     setFile(event.target.files[0]);
  //   }
  // };

  // const handleSubmit = () => {
  //   if (!file) {
  //     toast.error("Please upload a file before submitting.");
  //     return;
  //   }

  //   console.log("Submission Details:", {
  //     fileName: file.name,
  //     altText,
  //   });

  //   toast.success("Successfully submitted!");

  //   // Redirect to dashboard after a short delay
  //   setTimeout(() => {
  //     router.push("/dashboard/student");
  //   }, 1500);
  // };
  //   const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const formData = new FormData();
    formData.append("file", values.file);
    formData.append("title", values.title);
    formData.append("id", hackathon.id);
    setSubmitLoading(true);
    const res = await fetch("/api/submission", {
      method: "POST",
      body: formData,
    });
    setSubmitLoading(false);
    const { message } = await res.json();
    toast(message);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-card shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold">{hackathon.name} : Submission</h1>
      <p className="mt-2 text-muted-foreground">{hackathon.description}</p>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong>Submission Deadline:</strong> {hackathon.subDeadline}
        </p>
      </div>

      <div className="my-4">
        <h2 className="text-xl font-semibold">Judgement Criteria</h2>
        <div className="flex gap-2 mt-2">
          {hackathon.evaluationParameters.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-accent rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submission Title</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormLabel>Upload Submission</FormLabel>
                <FormControl>
                  <Input
                    onChange={(event) => {
                      if (event.target.files && event.target.files.length > 0) {
                        form.setValue("file", event.target.files[0]);
                      }
                    }}
                    type="file"
                    accept={acceptedFileTypes.join(" ")}
                    multiple={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitLoading}>
            Submit
          </Button>
        </form>
      </Form>
      <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard")}>
        Back to Dashboard
      </Button>
      {/* <div className="mt-6">
        <Label className="block text-sm font-medium">Upload Submission</Label>
        <Input type="file" accept=".pdf,.docx,.mp4,.mp3,.wav,.jpg,.png" onChange={handleFileChange} className="mt-2" />
      </div>

      <div className="mt-4">
        <Label className="block text-sm font-medium">Alternate Text</Label>
        <Textarea
          placeholder="Describe your submission (optional)"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className="mt-2"
        />
      </div>
 */}
    </div>
  );
};

export default HackathonView;
