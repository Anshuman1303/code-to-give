import mongoose , {Schema , Document} from 'mongoose'

export interface IUser extends Document {
  username : string;
  contactNumber : string;
  email : string;
  password:string;
  role : 'student'|'teacher'|'admin';
  createdAt:Date;
  updatedAt:Date
}

const userSchema : Schema<IUser>=new Schema(
  {
    username:{
      type:String,
      required:[true,"Username is required"],
      trim:true
    },
    contactNumber:{
      type:String,
      required:[true,"Contact number is required"],
      unique:true
    },
    email:{
      type:String,
      required:[true,"Email is required"],
      unique:true,
      lowercase:true,
      match:[/.+\@.+\..+/, 'please use a valid email address']
    },
    password:{
      type:String,
      required:[true,"Password is required"],
      minLength:[8,"Password must be at least 8 characters"]
    },
    role:{
      type:String,
      enum:['student','teacher','admin'],
      default:'student',
      required:true
    }

  }
,
{timestamps:true});

 const User=(mongoose.models.User as mongoose.Model<IUser>)  || (mongoose.model<IUser>('User', userSchema))

 export default User;