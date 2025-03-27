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

export default async function Dashboard({ params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const category = await Category.findById((await params)["id"]);
  if (!category) return notFound();

  const hackathon = {
    id: (category._id as Types.ObjectId).toString(),
    name: category.name,
    description: category.description,
    evaluationParameters: category.evaluationParameters,
    subDeadline: category.deadline.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    participants: category.submissions.length,
  };

  const submissions = await Submission.find({ category: category._id }).lean();
  const cleanSubmissions = await Promise.all(
    submissions.map(async (submission) => {
      return {
        id: (submission._id as Types.ObjectId).toString(),
        name: (await User.findById(submission.student))?.name,
        parameters: submission.evaluationScores?.map((i) => {
          return { name: i.parameter, score: i.score };
        }),
        aggregate: submission.aggregatedScore,
      };
    })
  );
  console.log(cleanSubmissions);
  return (
    <>
      <ResultView hackathon={hackathon} submissions={cleanSubmissions} />
    </>
  );
}
