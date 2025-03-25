import { NextRequest,NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Submission from "@/models/Submission";

export async function DELETE(request : NextRequest,{params}:{params : {categoryId : string}}){
  try {
    const session=await getServerSession(authOptions);
    if(!session?.user || session.user.role !=='admin'){
      return NextResponse.json(
        {error : "Unauthorized"},
        {status:401}
      );
    }

    await dbConnect();

    const deletedCategory= await Category.findByIdAndDelete(params.categoryId)
    if(!deletedCategory){
      return NextResponse.json(
        {error: "Category not found"},
        {status:404}
      );
    }

    await Submission.deleteMany({category : params.categoryId})

    return NextResponse.json(
      {message:"Category Deleted Suuccessfully"},
      {status : 200}
    );


  } catch (error) {
    console.log(`ERROR :: ADMIN CATEGORY DELETION :: ${error}`);
    return NextResponse.json(
      {error : "Internal Server Error "},
      {status : 500}
    );
  }
}
