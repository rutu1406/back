const mongoose=require("mongoose")

const main=async()=>{
    return mongoose.connect("mongodb://127.0.0.1:27017/blogusers")
    console.log("conneted")
    conn.disconnect()
}

module.exports=main