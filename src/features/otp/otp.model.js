const mongoose=require("mongoose")

const otpSchema=new mongoose.Schema({
    userid:{type:String},
    otp:{type:String, required:true,unique:true},
    
    

},{
        versionKey:false,
        timestamps:true
    })
     const Otp=mongoose.model("opt",otpSchema)
     module.exports=Otp