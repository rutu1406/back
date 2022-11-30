const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String, required:true,unique:true},
    password:{type:String},
    age:{type:Number},
    role:{
        type:String,
        enum:["guests","employee","hr"],
        default:"guests"
    }
    

},{
        versionKey:false,
        timestamps:true
    })
     const User=mongoose.model("user",userSchema)
     module.exports=User