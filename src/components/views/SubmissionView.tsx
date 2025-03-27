"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SubmissionViewProps {
  hackathonName: string;
  studentName: string;
  submission: {
    id: string;
    type: string;
    content: string;
    url: string;
    score: {
      name: string;
      marks: number;
    }[];
    aggregate?: number;
  };
}

export default function SubmissionView({ hackathonName, studentName, submission }: SubmissionViewProps) {
  // Sample data - in a real app, this would come from a database

  // Judging criteria with editable marks
  const [criteria, setCriteria] = useState(submission.score);
  // Track if aggregate is manually set
  const [manualAggregate, setManualAggregate] = useState(false);
  const [manualAggregateValue, setManualAggregateValue] = useState(0);

  // Calculate aggregate score
  const calculatedAggregate = criteria.reduce((sum, criterion) => sum + criterion.marks, 0) / criteria.length;
  const aggregateScore = manualAggregate ? manualAggregateValue : calculatedAggregate;

  // Get color class based on mark value
  const getMarkColorClass = (mark: number) => {
    if (mark >= 0 && mark <= 3.5) return "bg-red-100 text-red-800";
    if (mark > 3.5 && mark <= 6.5) return "bg-yellow-100 text-yellow-800";
    if (mark > 6.5 && mark <= 10) return "bg-green-100 text-green-800";
    return "";
  };

  // Handle mark updates
  const updateMark = (index: number, value: string) => {
    const newValue = Number.parseFloat(value);
    if (isNaN(newValue) || newValue < 0 || newValue > 10) return;

    const updatedCriteria = [...criteria];
    updatedCriteria[index].marks = newValue;
    setCriteria(updatedCriteria);
  };

  // Handle manual aggregate update
  const updateManualAggregate = (value: string) => {
    const newValue = Number.parseFloat(value);
    if (isNaN(newValue) || newValue < 0 || newValue > 10) return;

    setManualAggregateValue(newValue);
    setManualAggregate(true);
  };

  // Handle publish action
  const handlePublish = async () => {
    const res = fetch("/api/submission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evaluationScores: criteria.map((i) => {
          return { parameter: i.name, score: i.marks };
        }),
        aggregatedScore: manualAggregateValue,
        id: submission.id,
      }),
    });
    toast("Evaluation Published", {
      description: `Evaluation for ${studentName} has been published successfully.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <style jsx global>{`
        /* Remove arrows from number inputs */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <h1 className="text-3xl font-bold text-center mb-8">{hackathonName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Submission */}
        <Card>
          <CardHeader>
            <CardTitle>Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{submission.description}</p>
            </div> */}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Summary</h3>
              <div className="border rounded-md p-4 bg-muted/30 text-sm">{submission.content}</div>
            </div>

            <div className="text-xs text-muted-foreground">{submission.url}</div>
          </CardContent>
        </Card>

        {/* Right column - Evaluation */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation</CardTitle>
            <div className="text-lg font-medium">{studentName}</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Judging Criteria</th>
                    <th className="text-center p-3 font-medium w-24">Marks (0-10)</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((criterion, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{criterion.name}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={criterion.marks}
                          onChange={(e) => updateMark(index, e.target.value)}
                          className={`text-center ${getMarkColorClass(criterion.marks)}`}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30 font-medium">
                    <td className="p-3">Aggregate Score</td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={manualAggregate ? manualAggregateValue : aggregateScore.toFixed(2)}
                        onChange={(e) => updateManualAggregate(e.target.value)}
                        className="text-center"
                        onClick={() => {
                          if (!manualAggregate) {
                            setManualAggregateValue(Number.parseFloat(aggregateScore.toFixed(2)));
                            setManualAggregate(true);
                          }
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button onClick={handlePublish}>Publish Evaluation</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
