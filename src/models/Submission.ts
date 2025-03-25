import mongoose, { Document, Schema, Types } from "mongoose";
// import User from "./User";
// import Category from "./Category";

interface Submissions extends Document {
  title: string;
  description?:string;
  student: Types.ObjectId; //REFERENCE TO USER
  category: Types.ObjectId; //REFERENCE TO CATEGORY
  content: {
    //SUBMISSION FILE
    type: "text" | "audio" | "video" | "photo";
    data: string;
  };
  evaluationScores: {
    //SCORE FOR EACH PARAM
    parameter: string;
    score: number;
  }[];
  aggregatedScore: number;
  submittedAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<Submissions>(
  {
    title: {
      type: String,
      required: [true, "Submission title missing"],
      trim: true,
    },
    description:{
      type:String
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference missing"],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference missing"],
      index: true,
    },
    content: {
      type: {
        type: String,
        enum: ["text", "audio", "video", "photo"],
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
    },
    evaluationScores: [
      {
        parameter: {
          type: String,
          index: 1,
        },
        score: {
          type: Number,
          index: 1,
        },
      },
    ],
    aggregatedScore: {
      type: Number,
      default: 0,
      index: -1,
    },
  },
  { timestamps: true }
);

//SUBMISSION AFTER DEADLINE NOT ALLOWED
submissionSchema.pre("save", async function (next) {
  const category = await mongoose.model("Category").findById(this.category);

  if (!category) {
    return next(new Error("Category not found"));
  }

  if (category.deadline < new Date()) {
    return next(new Error("Submission Deadline has passed"));
  }
  next();
});

export default (mongoose.models.Submission as mongoose.Model<Submissions>) || mongoose.model<Submissions>("Submission", submissionSchema);
