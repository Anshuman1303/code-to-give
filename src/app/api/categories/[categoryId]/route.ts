import { NextRequest,NextResponse } from "next/server";
import { categoryValidationSchema } from "@/lib/schemas/categoryCreation";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Submission from "@/models/Submission";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";



export async function PUT(request : NextRequest,{params} : {params : {categoryId : string}}){
  try {
    const session = await getServerSession(authOptions)
    if(!session?.user){
      return NextResponse.json(
        {error : 'Unauthorized'},
        {status : 401}
      );
    }

    const body=await request.json();
    const validation = categoryValidationSchema.safeParse(body);

    if(!validation.success){
      return NextResponse.json(
        {error : validation.error.flatten().fieldErrors},
        {status:400}
      );
    }

    await dbConnect();

    const category = await Category.findById(params.categoryId);
    if(!category){
      return NextResponse.json(
        {error : 'Category not found'},
        {status : 404}
      );
    }

    if(session.user.role ==='student'){
      return NextResponse.json(
        {error:'Forbidden . Only teachers and admins can perform this action.'},
        {status:403}
      );
    }

    if(session.user.role==='teacher' && category.teacher.toString()!==session.user.id){
      return NextResponse.json(
        {error : 'Forbidden . Teachers can only modify their own categories.'},
        {status:403}
      );
    }

    const updatedCategory=await Category.findByIdAndUpdate(
      params.categoryId,
      {
        ...validation.data,
        deadline: new Date(validation.data.deadline)
      },
      {new : true , runValidators:true}
    );

    return NextResponse.json(
      {message: 'Category updated', category: updatedCategory},
      {status:200}
    );

  } catch (error) {
    console.log(`ERROR :: CATEGORY UPDATE ERROR :: ${error}`);
    return NextResponse.json(
      {error:'Internal Server error'},
      {status:500}
    );
  }
}

export async function DELETE(request : NextRequest,{params} : {params : {categoryId : string}}){
  try {
    const session = await getServerSession(authOptions)
    if(!session?.user){
      return NextResponse.json(
        {error : 'Unauthorized'},
        {status : 401}
      );
    }

    await dbConnect();

    const category = await Category.findById(params.categoryId);
    if(!category){
      return NextResponse.json(
        {error : 'Category not found'},
        {status : 404}
      );
    }

    if(session.user.role ==='student'){
      return NextResponse.json(
        {error:'Forbidden . Only teachers and admins can perform this action.'},
        {status:403}
      );
    }

    if(session.user.role==='teacher' && category.teacher.toString()!==session.user.id){
      return NextResponse.json(
        {error : 'Forbidden . Teachers can only delete their own categories.'},
        {status:403}
      );
    }

    const deletedCategory=await Category.findByIdAndDelete(params.categoryId);
    if(!deletedCategory){
      return NextResponse.json(
        {error : 'Category not found'},
        {status:404}
      );
    }

    await Submission.deleteMany({category: params.categoryId});

    return NextResponse.json(
      {message: 'Category deleted'},
      {status:200}
    );

  } catch (error) {
    console.log(`ERROR :: CATEGORY DELETION ERROR :: ${error}`);
    return NextResponse.json(
      {error:'Internal Server error'},
      {status:500}
    );
  }
}
