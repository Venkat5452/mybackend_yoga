const express=require("express")
const cors=require("cors")
const mongoose=require("mongoose");
const nodemailer=require('nodemailer');
require("dotenv").config();

const server=express()
server.use(express.json()) 
server.use(express.urlencoded())
server.use(cors())
mongoose
  .connect(process.env.MYURL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    day:String,
    Phone:String,
    Age:Number
})
const slotSchema=new mongoose.Schema({
    email:String,
    slottime:String
})
const paymentSchema=new mongoose.Schema({
    email:String,
    paymentstatus:String
})
const User=new mongoose.model("users",userSchema);
const slotu=new mongoose.model("slots",slotSchema);
const paymentd=new mongoose.model("payments",paymentSchema);

server.post("/verify",(req,res)=>{
    //let testAcc=await nodemailer.createTestAccount();
   const  {name , email, day}=req.body;
   User.findOne({email:email}).then((user)=> {
    if(user) {
        var sy=user.day.slice(0,4),sm=user.day.slice(5,7);
        if(sy==day.slice(0,4) && sm==day.slice(5,7)) {
            paymentd.findOne({email:email}).then((user1)=>{
                if(user1) {
                    if(user1.paymentstatus=="No") {
                        res.send({message:"Payment"})
                    }
                    else {
                        slotu.findOne({email:email}).then((user4)=>{
                            if(user4) {
                                res.send({slot:user4.slottime})
                            }
                            else {
                                res.send({message:"Already Registered"})
                            }
                        })
                    }
                }
                else {
                    res.send({message:"Already Registered"})
                }
            })
        }
        else {
            paymentd.findOne({email:email}).then((user1)=>{
                if(user1) {
                    if(user1.paymentstatus=="No") {
                        res.send({message:"Payment"})
                    }
                    else {
                        res.send({message : "Verified"});
                    }
                }
            })
        }
    }
    else {
        res.send({message : "Verified"});
    }})
 })

server.post("/register",(req,res)=>{
    const {email,name,day,slottime,paymentstatus,Phone,Age}=req.body;
    User.findOne({email:email}).then((user)=> {
        if(user) {
           user.day=day;
           user.name=name;
           user.save();
        }
        else {
            const user=new User({
                name,
                email,
                day,
                Phone,
                Age
            })
            user.save();
         }
    })
    slotu.findOne({email:email}).then((user)=> {
        if(user) {
           user.slottime=slottime;
           user.save();
        }
        else {
            const user=new slotu({
                email,
                slottime
            })
            user.save();
         }
    })
    paymentd.findOne({email:email}).then((user)=> {
        if(user) {
           user.paymentstatus=paymentstatus;
           user.save();
        }
        else {
            const user=new paymentd({
                email,
                paymentstatus
            })
            user.save();
         }
    })
    res.send("SuccessFull");
})

server.post("/payment",(req,res)=>{
    const {email}=req.body;
    paymentd.findOne({email:email}).then((user)=>{
        if(user) {
            user.paymentstatus="Yes";
            user.save().then(res.send({message : "Done"}));
        }
        else {
            res.send({message:"Error"});
        }
    })
})

server.listen(9002,() =>{
    console.log("Started at port 9002");
})