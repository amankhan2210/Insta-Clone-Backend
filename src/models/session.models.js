const mongoose = require('mongoose')
const SessionSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true,"User is required"]
    },
    refreshTokenHash:{
        type : String,
        required : true
    },
    ip:{
        type :String,
        required : true
    },
    usergent:{
        type : String,
        required : true
    },
    revoked : {
        type : Boolean,
        default : false
    },
},{timestamps : true})

const Session = mongoose.model('Session',SessionSchema)
module.exports = Session