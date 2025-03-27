"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubmissionViewerProps {
  submission: {
    type: string;
    content: string;
    description: string;
    files?: Array<{
      name: string;
      type: string;
      url: string;
    }>;
  };
}

export function SubmissionViewer({ submission }: SubmissionViewerProps) {
  const [activeTab, setActiveTab] = useState("content");

  const renderContent = () => {
    switch (submission.type) {
      case "text":
        return <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-wrap">{submission.content}</div>;
      case "pdf":
        return (
          <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center h-96">
            <iframe src={submission.files?.[0]?.url} className="w-full h-full" title="PDF Submission" />
          </div>
        );
      case "audio":
        return (
          <div className="border rounded-md p-4 bg-muted/30">
            <audio controls className="w-full">
              <source src={submission.files?.[0]?.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "video":
        return (
          <div className="border rounded-md p-4 bg-muted/30">
            <video controls className="w-full">
              <source src={submission.files?.[0]?.url} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        );
      default:
        return <div className="border rounded-md p-4 bg-muted/30 text-sm">[Unsupported submission format]</div>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Submission</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            {submission.files && submission.files.length > 0 && <TabsTrigger value="files">Files</TabsTrigger>}
          </TabsList>

          <TabsContent value="content" className="mt-0">
            {renderContent()}
          </TabsContent>

          <TabsContent value="description" className="mt-0">
            <div className="border rounded-md p-4 bg-muted/30 text-sm">{submission.description}</div>
          </TabsContent>

          {submission.files && (
            <TabsContent value="files" className="mt-0">
              <div className="border rounded-md p-4 bg-muted/30">
                <ul className="space-y-2">
                  {submission.files.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({file.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
