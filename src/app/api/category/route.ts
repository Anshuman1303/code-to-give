import { NextRequest, NextResponse } from "next/server";
import { categoryValidationSchema } from "@/lib/schemas/category";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Submission from "@/models/Submission";
import User from "@/models/User";
//CREATING CATEGORY
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user.role !== "teacher") {
      return NextResponse.json({ error: "Only Teacher can create category" }, { status: 403 });
    }

    const body = await request.json();
    const validation = categoryValidationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    await dbConnect();
    console.log(request);
    const newCategory = await Category.create({
      ...validation.data,
      teacher: session.user._id,
      deadline: new Date(validation.data.deadline),
      submissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Category Created ", category: newCategory }, { status: 201 });
  } catch (error) {
    console.log(`ERROR :: CATEGORY CREATION ERROR :: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
      const teacher = await User.findById(teacherId);
      if (teacher && teacher.role === "teacher") {
        categories = await Category.find({ teacher: teacher._id }).sort({ deadline: 1 }).lean();
      } else {
        return NextResponse.json({ error: "Teacher Not Found" }, { status: 404 });
      }
    } else {
      categories = await Category.find({}).sort({ deadline: 1 });
    }

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.log(`ERROR :: ALL CATEGORIES FETCH :: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE CATEGORY BY ID
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "student") {
      return NextResponse.json({ error: "Forbidden . Only teachers and admins can perform this action." }, { status: 403 });
    }

    const { categoryId } = await req.json();

    await dbConnect();

    const category = await Category.findById(categoryId).exec();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 403 });
    }

    if ((session.user.role === "teacher" && category.teacher.toString() !== session.user.id) || session.user.role === "admin") {
      return NextResponse.json({ error: "Forbidden. Teachers can only delete their own categories." }, { status: 403 });
    }

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await Category.findByIdAndDelete(categoryId);
    await Submission.deleteMany({ category: categoryId });

    return NextResponse.json({ message: "Category deleted" }, { status: 200 });
  } catch (error) {
    console.log(`ERROR :: CATEGORY DELETION ERROR :: ${error}`);
    return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
  }
}
