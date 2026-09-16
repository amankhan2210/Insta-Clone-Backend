const User = require('../models/user.model')
const otpModel = require('../models/otp.model')
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
        expiresAt :new Date(Date.now() + 10 * 60 * 1000)
    })

    return res.status(200).json({msg : 'User Created Succefully',user,otp})
}




module.exports = {
    register
}