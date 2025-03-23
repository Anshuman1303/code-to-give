import mongoose, { Document, Schema, Types } from 'mongoose';
import User from './User.model'

interface ICategory extends Document{
  name:string;
  teacher : Types.ObjectId;//REFERENCE TO TEACHER
  submissions:Types.ObjectId[];//REFERENCE TO SUBMSSIONS
  deadline:Date;
  evaluationParameters:string[];
  createdAt:Date;
  updatedAt:Date;
}

const categorySchema=new Schema<ICategory>({
  name:{
    type:String,
    required:[true,"Category name is required"],
    trim:true
  },
  teacher:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:[true,"Teacher reference is required"],
    //VALIDATION DURING CREATING CATEGORY REQUIRED
    // validate:{
    //   validator: async function(teacherId : Types.ObjectId){
    //     const teacher=await User.findById(teacherId);
    //     return teacher && (teacher.role==='teacher' || teacher.role==='admin');
    //   },
    //   message:"Referenced user must be a teacher or admin"
    // }
  },
  submissions: [{
    type:Schema.Types.ObjectId,
    ref:'Submission'
  }],
  deadline:{
    type : Date,
    required:[true,'Deadline is required']
  },
  evaluationParameters:[{
    type:String,
    required :[true,"Atleast one evalutaion parameter is required"]
  }]
},{timestamps:true});

categorySchema.index({teacher:1});

categorySchema.index({deadline : 1});

const Category = (mongoose.models.Category as mongoose.Model<ICategory> ) || (mongoose.model<ICategory>('Category',categorySchema))

export default Category;