import mongoose, { Document, Schema, Types } from "mongoose";

interface Categories extends Document {
  name: string;
  description:string;
  teacher: Types.ObjectId; //REFERENCE TO TEACHER
  submissions: Types.ObjectId[]; //REFERENCE TO SUBMSSIONS
  deadline: Date;
  evaluationParameters: string[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<Categories>(
  {
    name: {
      type: String,
      required: [true, "Category missing"],
      trim: true,
    },
    description:{
      type:String,
      required:[true,"Description is required"]
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference missing"],
      index: true,
      //VALIDATION DURING CREATING CATEGORY REQUIRED
      // validate:{
      //   validator: async function(teacherId : Types.ObjectId){
      //     const teacher=await User.findById(teacherId);
      //     return teacher && (teacher.role==='teacher' || teacher.role==='admin');
      //   },
      //   message:"Referenced user must be a teacher or admin"
      // }
    },
    submissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Submission",
      },
    ],
    deadline: {
      type: Date,
      required: [true, "Deadline missing"],
      index: true,
    },
    evaluationParameters: [
      {
        type: String,
        required: [true, "At least one evaluation parameter is required"],
      },
    ],
  },
  { timestamps: true }
);

export default (mongoose.models.Category as mongoose.Model<Categories>) || mongoose.model<Categories>("Category", categorySchema);
