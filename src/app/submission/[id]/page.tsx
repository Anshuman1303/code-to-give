"use server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Category from "@/models/Category";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import ResultView from "@/components/views/ResultView";
import Submission from "@/models/Submission";
import User from "@/models/User";
import SubmissionView from "@/components/views/SubmissionView";

export default async function Dashboard({ params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const submission = await Submission.findById((await params)["id"]);
  if (!submission) return notFound();
  const category = await Category.findById(submission.category);
  const student = await User.findById(submission.student);
  //   const hackathon = {
  //     id: (category._id as Types.ObjectId).toString(),
  //     name: category.name,
  //     description: category.description,
  //     evaluationParameters: category.evaluationParameters,
  //     subDeadline: category.deadline.toLocaleDateString("en-IN", {
  //       day: "numeric",
  //       month: "short",
  //       year: "numeric",
  //     }),
  //     participants: category.submissions.length,
  //   };
  console.log("submission: ", submission);
  return (
    <>
      <SubmissionView
        hackathonName={category?.name}
        studentName={student?.name}
        submission={{
          type: submission.content.type,
          content: submission.content.summary,
          url: submission.content.data,
          id: submission._id.toString(),
          score: submission.evaluationScores?.map((i) => {
            return { name: i.parameter, marks: i.score };
          }),
          aggregate: submission.aggregatedScore,
        }}
      />
    </>
  );
}
