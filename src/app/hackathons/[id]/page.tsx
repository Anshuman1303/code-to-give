"use server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Category from "@/models/Category";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import HackathonView from "@/components/views/HackathonView";
import { notFound } from "next/navigation";
// const mockHackathons = [
//   {
//     id: 1,
//     name: "AI Innovation Challenge",
//     creatorId: "t_001",
//     regDeadline: "2024-03-15",
//     subDeadline: "2024-03-25",
//     participants: 142,
//     isRegistered: true,
//     image: "public/black.jpg",
//   },
//   {
//     id: 2,
//     name: "Blockchain Hack",
//     creatorId: "t_002",
//     regDeadline: "2024-03-18",
//     subDeadline: "2024-03-28",
//     participants: 89,
//     isRegistered: false,
//     image: "public/black.jpg",
//   },
//   {
//     id: 3,
//     name: "Climate Tech Showdown",
//     creatorId: "t_003",
//     regDeadline: "2024-03-20",
//     subDeadline: "2024-03-30",
//     participants: 204,
//     isRegistered: true,
//     image: "public/black.jpg",
//   },
// ];

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
    isSubmitted: category.submissions.includes(session?.user._id as Types.ObjectId),
  };
  return (
    <>
      <HackathonView hackathon={hackathon} />
    </>
  );
}
