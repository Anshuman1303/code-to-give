import { NextRequest,NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Category from "@/models/Category";
import Submission from "@/models/Submission";


export async function DELETE( request : NextRequest , {params}:{params :{userId : string}}){
  try {
    const session=await getServerSession(authOptions);
    if(!session?.user || session.user.role !=='admin'){
      return NextResponse.json(
        {error:"Unauthorized"},
        {status : 401}
      );
    }

    await dbConnect();

    const user=await User.findByIdAndDelete(params.userId);
    if(!user){
      return NextResponse.json(
        {error : "User not found"},
        {status:404}
      );
    }

    if(user.role==='teacher'){
      const categories=await Category.find({teacher:user._id});
      const categoryIds= categories.map(c=>c._id);
      await Submission.deleteMany({category : { $in : categoryIds}});
      await Category.deleteMany({teacher : user._id});
    }
    else if(user.role ==='student'){
      await Submission.deleteMany({student : user._id});
    }

    return NextResponse.json(
      {message : "User deleted Suuccessfully"},
      {status:200}
    );
  } catch (error) {
    console.log(`ERROR :: ADMIN USER DELETION :: ${error}`);
    return  NextResponse.json(
      {error : "Internal Server Error "},
      {status : 500}
    );
  }
}