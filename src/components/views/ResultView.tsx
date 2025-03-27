"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Define types for our data
type Parameter = {
  name: string;
  score: number;
};

// type Student = {
//   id: number;
//   name: string;
//   parameters: Parameter[];
//   aggregate: number;
// };

interface ResultViewProps {
  hackathon: {
    id: string;
    name: string;
    description: string;
    evaluationParameters: string[];
    subDeadline: string;
    participants: number;
  };
  submissions: {
    id: string;
    name: string;
    parameters: Parameter[];
    aggregate: number;
  }[];
}

export default function ResultView({ hackathon, submissions }: ResultViewProps) {
  // Sample hackathon name - can be changed
  //   const [hackathonName, setHackathonName] = useState("Web Development Hackathon 2025");
  const hackathonName = hackathon.name;
  // Sample parameters - can be modified
  //   const [parameterNames, setParameterNames] = useState(["UI/UX Design", "Code Quality", "Innovation", "Functionality", "Presentation"]);
  const parameterNames = hackathon.evaluationParameters;
  // Sample student data
  //   const [students, setStudents] = useState<Student[]>([
  //     {
  //       id: 1,
  //       name: "Alex Johnson",
  //       parameters: [
  //         { name: "UI/UX Design", score: 8.5 },
  //         { name: "Code Quality", score: 7.8 },
  //         { name: "Innovation", score: 9.2 },
  //         { name: "Functionality", score: 8.0 },
  //         { name: "Presentation", score: 7.5 },
  //       ],
  //       aggregate: 0, // Will be calculated
  //     },
  //     {
  //       id: 2,
  //       name: "Sam Wilson",
  //       parameters: [
  //         { name: "UI/UX Design", score: 6.5 },
  //         { name: "Code Quality", score: 8.2 },
  //         { name: "Innovation", score: 5.5 },
  //         { name: "Functionality", score: 7.8 },
  //         { name: "Presentation", score: 6.0 },
  //       ],
  //       aggregate: 0,
  //     },
  //     {
  //       id: 3,
  //       name: "Taylor Smith",
  //       parameters: [
  //         { name: "UI/UX Design", score: 9.0 },
  //         { name: "Code Quality", score: 8.5 },
  //         { name: "Innovation", score: 8.8 },
  //         { name: "Functionality", score: 9.2 },
  //         { name: "Presentation", score: 8.5 },
  //       ],
  //       aggregate: 0,
  //     },
  //     {
  //       id: 4,
  //       name: "Jordan Lee",
  //       parameters: [
  //         { name: "UI/UX Design", score: 3.2 },
  //         { name: "Code Quality", score: 5.5 },
  //         { name: "Innovation", score: 7.0 },
  //         { name: "Functionality", score: 4.8 },
  //         { name: "Presentation", score: 6.5 },
  //       ],
  //       aggregate: 0,
  //     },
  //     {
  //       id: 5,
  //       name: "Casey Brown",
  //       parameters: [
  //         { name: "UI/UX Design", score: 7.8 },
  //         { name: "Code Quality", score: 2.5 },
  //         { name: "Innovation", score: 6.0 },
  //         { name: "Functionality", score: 5.5 },
  //         { name: "Presentation", score: 8.0 },
  //       ],
  //       aggregate: 0,
  //     },
  //   ]);

  // Search functionality

  const students = submissions;

  const [searchQuery, setSearchQuery] = useState("");

  // Calculate aggregate scores and sort students
  const sortedStudents = [...students]
    .map((student) => {
      // Calculate aggregate
      const sum = student.parameters.reduce((acc, param) => acc + param.score, 0);
      const aggregate = Number.parseFloat((sum / student.parameters.length).toFixed(2));
      return { ...student, aggregate };
    })
    .sort((a, b) => b.aggregate - a.aggregate)
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Function to determine cell background color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 4) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{hackathonName}</CardTitle>
          <p className="text-xl text-muted-foreground">Results</p>
        </CardHeader>
        <CardContent>
          {/* Added search bar */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search students by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md mx-auto"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Name</TableHead>
                  {parameterNames.map((param, index) => (
                    <TableHead key={index}>{param} (10)</TableHead>
                  ))}
                  <TableHead>Aggregate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.length > 0 ? (
                  sortedStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Link href={`/submission/${student.id}`} passHref>
                          {student.name}
                        </Link>
                      </TableCell>
                      {student.parameters.map((param, paramIndex) => (
                        <TableCell key={paramIndex} className={`${getScoreColor(param.score)} font-medium text-center`}>
                          {param.score.toFixed(1)}
                        </TableCell>
                      ))}
                      <TableCell className="font-bold text-center">{student.aggregate.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={parameterNames.length + 3} className="text-center">
                      {students.length === 0 ? "No students found" : "No students match your search"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
