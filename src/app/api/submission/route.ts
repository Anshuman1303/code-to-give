import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Submission from "@/models/Submission";
import { uploadFile } from "@/lib/uploadFile";
import submission from "@/lib/schemas/submission";
import { Types } from "mongoose";
import { submissionHelper } from "@/lib/submissionHelper";
import User from "@/models/User";
//CREATING SUBMISSION
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    console.log(formData);
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const id = formData.get("id") as string;
    const validation = submission.safeParse({ file, title });

    if (!validation.success) {
      console.log(validation.error);
      return NextResponse.json({ message: validation.error.format()._errors.join(" ") }, { status: 400 });
    }

    const url = await uploadFile(file.name, Buffer.from(await file.arrayBuffer()), file.type);

    await dbConnect();
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ message: "Category Not Found" }, { status: 404 });
    const newSubmission = await Submission.create({
      ...validation.data,
      student: session.user._id,
      category: category._id,
      content: {
        type: file.type,
        data: url,
      },
    });
    category.submissions = [...category.submissions, newSubmission._id as Types.ObjectId];
    await category.save();
    submissionHelper(newSubmission, category);
    return NextResponse.json({ message: "Submitted successfully", category: newSubmission }, { status: 201 });
  } catch (error) {
    console.log(`ERROR :: CATEGORY CREATION ERROR :: ${error}`);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

//GETTING ALL CATEGORIES or GETTING CATEGORIES FROM TeacherId
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = request.nextUrl.searchParams.get("teacherId");

    await dbConnect();
    let categories;
    if (teacherId) {
      categories = await Category.find({ teacherId }).sort({ deadline: 1 });
    } else {
      categories = await Category.find({}).sort({ deadline: 1 });
    }

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.log(`ERROR :: ALL CATEGORIES FETCH :: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//UPDATING USER ROLE
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role === "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();
    console.log(data);
    const submission = await Submission.findById(data.id);
    if (!submission) return NextResponse.json({}, { status: 404 });
    submission.evaluationScores = data.evaluationScores;
    submission.aggregatedScore = data.aggregatedScore;
    submission?.save();
    // const { newRole } = await request.json();
    // const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true, runValidators: true });

    // if (!updatedUser) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    return NextResponse.json(
      {
        message: "Scores Updated!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`ERROR :: CHANGE USER ROLE :: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
