const express=require("express");
const { db } = require("./user.model");
const User=require("./user.model");
const Otp=require('../otp/otp.model')
const app=express.Router()
var nodemailer = require('nodemailer');

console.log(Otp);
app.use(express.urlencoded({extended:true}))


const jwt=require("jsonwebtoken")
const blacklist=[]


app.post("/signup",async(req,res)=>{
    const {name,email,password,age}=req.body
const token=req.headers["token"]
    try{
        if(token){
        const decoded=jwt.decode(token)
        if(decoded){
            if(decoded.role=="hr"){
                let user=new User({name,email,password,age,role:"employee"})
                console.log('user1',user)
                await user.save()
              return  res.status(200).send('employee created sucessfully')

            }else{
                res.status(403).send("you are not allowed to create employee")
            }
        }

    }

    }catch(e){
        res.send("Non hr side is try to create write")
    }
    
    let user=new User({name,email,password,age})
    console.log('user2',user)
    await user.save()
  return  res.status(201).send('guest created sucessfully')

})








//   //app.use(authMiddleware)



app.post("/login",async(req,res)=>{
    const {email,password}=req.body
    console.log(email,password)

    try{
       let user=await User.findOne({email})
       //console.log(user)
       if(user){
        if(user.password===password){
            const token=jwt.sign({id:user._id,age:user.age,role:user.role},"Secreate123",
            {expiresIn:'5 min'}
            )

            const refreshtoken=jwt.sign({},"Secreaterefresh123",
            {expiresIn:'13 days'})
            res.status(201).send({massage:'login sucess',token,refreshtoken})

        }
        else{
            res.status(404).send(` Athentication failed incorrect password`)
        }
       }else{
        res.status(404).send(`user with email ${email} not found`)

       }

    }catch(e){
        res.send(e.message)
    }
    
})


app.use((req,res,next)=>{
    const token=req.headers.token
    //const{email,password}=req.body
      ///console.log("email",email,password)
      if(!token){
        res.send("missing token")
      }
      //const verification=jwt.verify(token,"Secreate123")

      try{
        const verification=jwt.verify(token,"Secreate123")
console.log(verification);
        if(verification.exp>new Date().getTime()){
           // let user=await User.findById({"_id":id})

            res.send('token is expired')

        }
        if(blacklist.includes(token)){
            return res.send('token already used')
               }
               next()

  }catch(e){
    blacklist.push(token)
      res.send(e.message)
  }
  
  })







  app.get("/verify",async(req,res)=>{
    const token=req.headers.token
    try{
        //const verification=jwt.verify(token,"Secreate123")
        const verification=jwt.decode(token)
const date=new Date().getTime()
const date1=Math.floor(date/1000)

console.log('veri',verification,new Date().getTime(),date1);
        if(verification.exp<date1){
           // let user=await User.findById({"_id":id})
           blacklist.push(token)


            res.status(403).send('token is expired')


        }
        else{
            res.status(200).send("token is valid")
        }
        
  }catch(e){
    ///.push(token)

      res.send(e.message)
  }
  
})





  app.post("/logout",async(req,res)=>{
    const token=req.headers.token
blacklist.push(token)
return res.send('user logged out sucessfully')
})









app.post("/refresh", async(req,res)=>{
    let id=req.params
   const refreshtoken=req.headers['refreshtoken']
   if(!refreshtoken){
    res.send("token not found")
   }
    //console.log(req.method,req.url)
    //let product=db.products.find((products)=> products.id===num)
const verification=jwt.verify(refreshtoken,"Secreaterefresh123")
    try{
        if(verification){
           // let user=await User.findById({"_id":id})
const newtoken=jwt.sign({id:verification.id,age:verification.age},'Secreate123',
{expiresIn:'10 days'}
)
            res.send({token:newtoken})
        }else{
            res.send("user not found")
        }
    }catch(e){
        res.send(e.message)
    }
  
    })




    app.get("/reset-password/getotp",async(req,res)=>{
        const token=req.headers["token"]
       
        generateOTP = (otp_length) => {
            // Declare a digits variable
            // which stores all digits
            var digits = "0123456789";
            let OTP = "";
            for (let i = 0; i < otp_length; i++) {
              OTP += digits[Math.floor(Math.random() * 10)];
            }
            return OTP;
          };
    
    //console.log(otp);
    //res.send(otp)
    
    
    try {
    
         const decoded=jwt.decode(token)
     const otp = generateOTP(6);
    
                console.log(decoded);
                const id=decoded.id
            let user=await User.findById({"_id":id});
            let newotp=new Otp({userid:user._id,otp:otp})
            console.log('user2',user)
            await newotp.save()
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'lomaterutuja1706@gmail.com',
              pass: 'dcoyxfmilglhhmki'
            }
          });
          
          var mailOptions = {
            from: 'lomaterutuja1706@gmail.com',
            to: `lomaterutuja1506@gmail.com`,
            subject: 'Sending Email using Node.js',
            text: `${otp}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              return res.status(201).send({newotp})

            }
          });
        return res.status(201).send({newotp})
    
        
    } catch (e) {
        return res.send(e.message)
    }
    
    
    })





    app.patch("/reset-password/reset", async(req,res)=>{
       // let id=req.headers.id
       const {id,password,otp}=req.body
       //let password=
        const token=req.headers["token"]
        const decoded=jwt.decode(token)

  console.log(decoded);
        try{
            
            let user=await Otp.find()
            let otpfind=await Otp.findOne( {userid:id,otp:otp})
            if(otpfind){
                let user=await User.findByIdAndUpdate({"_id":otpfind.userid},{...req.body,password:password},{new:true})
                return res.send({message:"password udated sucessfully ",user})


            }
else{
res.status(400).send('not found')
}

    
       
 }catch(e){
            res.send(e.message)
        }
  
      })

      







app.get("/:id", async(req,res)=>{
    let {id}=req.params
    const token=req.headers['token']

//    if(!token){
//     console.log('hiiii')
//     return res.send('Unauthrized')
//    }
//    if(blacklist.includes(token)){
// return res.send('token already expired')
//    }
    //console.log(req.method,req.url)
    //let product=db.products.find((products)=> products.id===num)
// if(verification){
//     return res.send("verify")
// }
    try{
        const verification=jwt.verify(token,"Secreate123")

        if(verification){
            let user=await User.findOne({_id:id})

            res.send({user})
        }else{
            res.send("user not found")
        }
    }catch(e){
        console.log(e.message);

        if(e.message=="jwt expired"){
            console.log('jklhguiop');

blacklist.push(token)
        }
       return res.send(blacklist)

    }
  
    })





    module.exports=app


    
      //app.use(authMiddleware)












