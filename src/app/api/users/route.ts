import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Category from "@/models/Category";
import Submission from "@/models/Submission";

//GET ALL USERS {STUDENT AND TEACHER}
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized . Only admins can access this" }, { status: 401 });
    }

    await dbConnect();

    const roleParam = request.nextUrl.searchParams.get("role");

    let users;

    if (roleParam === "student" || roleParam === "teacher") {
      users = await User.find({ role: roleParam }).select("-password").sort({ createdAt: -1 }).lean();
    } else {
      users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json(
      {
        ...users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`ERROR :: USER FETCH ERROR :: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//DELETING A USER
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { userId } = await req.json();
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "teacher") {
      const categories = await Category.find({ teacher: user._id });
      const categoryIds = categories.map((c) => c._id);
      await Submission.deleteMany({ category: { $in: categoryIds } });
      await Category.deleteMany({ teacher: user._id });
    } else if (user.role === "student") {
      await Submission.deleteMany({ student: user._id });
    }

    return NextResponse.json({ message: "User deleted Successfully" }, { status: 200 });
  } catch (error) {
    console.log(`ERROR :: ADMIN USER DELETION :: ${error}`);
    return NextResponse.json({ error: "Internal Server Error " }, { status: 500 });
  }
}
