const mongoose = require('mongoose')

const otpShema = new mongoose.Schema({
    email: {
        type: String,
        required : [true, "EMAIL IS REQUIRED"]
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true,"user is required"]
    },
    otpHash: {
        type : String,
        required : [true,"otpHash  is required"],
        
    },
    otptest:{
        type : String,
    },
    expiresAt : {
        type : Date,
        required : [true,"expiresAt required"]
    }
},{timestamps:true})

const otpModel = mongoose.model('otpModel',otpShema)
module.exports = otpModel

