import { NextRequest, NextResponse } from "next/server";
import { categoryValidationSchema } from "@/lib/schemas/categoryCreation";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['teacher', 'admin'].includes(session?.user.role)) {
      return NextResponse.json({
        error: "Unauthorized"
      },
        { status: 403 });
    }

    const body = await request.json();
    const validation = categoryValidationSchema.safeParse(body);

    if(!validation.success){
      return NextResponse.json(
        {error : validation.error.flatten().fieldErrors},
        {status:400}
      );
    }

    await dbConnect();

    const newCategory=new Category({
      ...validation.data,
      teacher:session.user.id,
      deadline : new Date(validation.data.deadline),
      submissions:[]
    });

    await newCategory.save();

    return NextResponse.json(
      {message:"Category Created ", category : newCategory},
      {status:201}
    );

  } catch (error) {
    console.log(`ERROR :: CATEGORY CREATION ERROR :: ${error}`);
    return NextResponse.json(
      {error : 'Internal Server Error'},
      {status : 500}
    );
    
  }
}
