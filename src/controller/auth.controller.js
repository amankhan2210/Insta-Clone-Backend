const User = require('../models/user.model')
const otpModel = require('../models/otp.model')
const Session = require('../models/session.models')
const SendGenOtp = require('../utils/utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

async function register(req,res) {
    const{username,email,password} = req.body
    const isUserAlreadyExits = await User.findOne({email})
    if(isUserAlreadyExits){
        return res.status(409).json({
            msg : "User Already exits"
        })
    }
    const hashedPassword = await bcrypt.hash(password,10)
    const user  = await User.create({
        username,
        email,
        password : hashedPassword
    })
    const otp = await SendGenOtp(email,username)
    const otpHash = await bcrypt.hash(otp,10)
    await otpModel.create({
        email,
        user : user._id,
        otpHash,
        otptest:otp,
        expiresAt :new Date(Date.now() + 10 * 60 * 1000)
    })

    return res.status(200).json({msg : 'User Created Succefully',user,otp})
}

async function verifyEmail(req,res) {
    const {email,otp} =req.body
    const otpdoc = await otpModel.findOne({email})
    if(!otpdoc) return res.status(400).json({msg:'Invalid otp'})
    if(otpdoc.expiresAt < new Date()){
        await otpModel.deleteMany({
            email : otpdoc.email
        })
        return res.status(409).json({msg : "Otp expired"})
    }
    const isMatch = await bcrypt.compare(otp,otpdoc.otpHash)
    if(!isMatch){
        return res.status(409).json({msg : "Otp Invalid"})
    }
    const user = await User.findByIdAndUpdate(otpdoc.user,{isVerified:true})
    await otpModel.deleteMany({
        email : otpdoc.email
    })
    return res.status(200).json({
        msg: "User Verifed",
        username : user.username,
        email :  user.email
    })
}


module.exports = {
    register,
    verifyEmail
}