"use server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TeacherView from "@/components/views/TeacherView";
import { StudentView } from "@/components/views/StudentView";
import Category from "@/models/Category";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import Submission from "@/models/Submission";
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

export default async function Dashboard() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  let categories;
  const isTeacher = session?.user.role === "teacher";
  if (isTeacher) {
    categories = await Category.find({ teacher: session.user._id }).sort({ deadline: 1 });
  } else {
    categories = await Category.find({}).sort({ deadline: 1 });
  }

  const hackathons = await Promise.all(
    categories.map(async (category) => {
      return {
        id: (category._id as Types.ObjectId).toString(),
        name: category.name,
        subDeadline: category.deadline.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        participants: category.submissions.length,
        isSubmitted: (await Submission.countDocuments({ student: session?.user._id, category: category._id })) > 0,
        ...(isTeacher && {
          status: new Date().getTime() <= category.deadline.getTime() ? "On going" : "Completed",
        }),
      };
    })
  );
  return (
    <>{isTeacher ? <TeacherView hackathons={hackathons} /> : session?.user.role === "student" && <StudentView hackathons={hackathons} />}</>
  );
}
