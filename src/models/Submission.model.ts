import mongoose,{Document,Schema,Types} from "mongoose";
import User from "./User.model"
import Category from "./Category.model";


interface ISubmission extends Document{
  title:string;
  student : Types.ObjectId ;//REFERENCE TO USER
  category :Types.ObjectId;//REFERENCE TO CATEGORY
  content:{ //SUBMISSION FILE
    type:'text' | 'audio' | 'video' | 'photo';
    data:string;
  };
  evaluationScores:{ //SCORE FOR EACH PARAM
    parameter:string;
    score:number;
  }[];
  aggregatedScore:number;
  submittedAt:Date;
  updatedAt:Date;
}



const submissionSchema=new Schema<ISubmission>({
  title:{
    type:String,
    required:[true,"Submission Title is Required"],
    trim:true
  },
  student:{
    type :Schema.Types.ObjectId,
    ref:'User',
    required:[true,'Student Reference is required']
  },
  category:{
    type :Schema.Types.ObjectId,
    ref:'Category',
    required:[true,'Category Reference is required']
  },
  content:{
    type:{
      type:String,
      enum:['text','audio','video','photo'],
      required:true
    },
    data:{
      type:String,
      required:true
    }
  },
  evaluationScores:[{
    parameter:String,
    score:Number
  }],
  aggregatedScore:{
    type:Number,
    default:0
  }
},{timestamps:true})

//CREATING INDEXES FOR FINDING AND SORTING
submissionSchema.index({student:1})

submissionSchema.index({category:1})

submissionSchema.index({aggregatedScore : -1})

submissionSchema.index({'evaluationScores.parameter':1 , 'evaluationScores.score' : -1})



//SUBMISSION AFTER DEADLINE NOT ALLOWED
submissionSchema.pre('save',async function(next){
  const category=await mongoose.model('Category').findById(this.category);

  if(!category){
    return next(new Error('Categroy not found'));
  }

  if(category.deadline<new Date()){
    return next(new Error('Submission Deadline has passed'));
  }
  next();
});



const Submission=(mongoose.models.Submission as mongoose.Model<ISubmission>) || (mongoose.model<ISubmission>('Submission',submissionSchema))

export default Submission;
