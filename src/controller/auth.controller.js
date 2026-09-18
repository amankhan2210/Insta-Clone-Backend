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
        if(!isUserAlreadyExits.isVerified){
            const hashedPassword = await bcrypt.hash(password,10)
            const user = await User.findByIdAndUpdate({_id : isUserAlreadyExits._id},{
                username:username,
                password:hashedPassword
            })
            await otpModel.deleteMany({email})
            const otp = await SendGenOtp(email,username)
            const otpHash = await bcrypt.hash(otp,10)
            await otpModel.create({
                email,
                user : user._id,
                otpHash,
                otptest:otp,
                expiresAt :new Date(Date.now() + 10 * 60 * 1000)
            })
            return res.status(200).json({msg : 'Otp Send Done',user,otp})
        }
        return res.status(409).json({msg : "User Already exits"})
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

    const refreshToken = jwt.sign({
        id : user._id,
        email : user.email,
    },process.env.JWT_SECRET,{
        expiresIn : '7d'
    })
    const refreshTokenHash = crypto.createHash("md5").update(refreshToken).digest("hex")
    const session = await Session.create({
        user : user._id,
        refreshTokenHash,
        ip : req.ip,
        usergent : req.headers['user-agent']
    })
    const accessToken = jwt.sign({
        id : user._id,
        email : user.email,
        sessionid : session._id,
    },process.env.JWT_SECRET,{expiresIn : '15m'})

    res.cookie("refreshToken",refreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",    
    maxAge : 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        msg: "User Verifed",
        username : user.username,
        email :  user.email,
        refreshToken,
        accessToken
    })
}

async function login(req,res){
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user || !user.isVerified ) return res.status(404).json({msg:'User Not Found'})
    console.log(user.password,password)
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) {return res.status(409).json({msg : "Invalid password"})}
    const refreshToken = jwt.sign({
        id : user._id,
        email : user.email,
    },process.env.JWT_SECRET,{
        expiresIn : '7d'
    })
    const refreshTokenHash = crypto.createHash("md5").update(refreshToken).digest("hex")

    const session = await Session.create({
    user : user._id,
    refreshTokenHash,
    ip : req.ip,
    usergent : req.headers['user-agent']
    })

    const accessToken = jwt.sign({
        id : user._id,
        email : user.email,
        sessionid : session._id,
    },process.env.JWT_SECRET,{expiresIn : '15m'})

    res.cookie("refreshToken",refreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",    
    maxAge : 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        msg: "Loggedin-done",
        username : user.username,
        email :  user.email,
        refreshToken,
        accessToken
    })

}


module.exports = {
    register,
    verifyEmail,
    login
}