const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
    follower :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    following :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    status :{
        type : String,
        enum : ["pending","accepted"],
        default : "pending" 
    }

},{timestamps:true})

followSchema.index({follower:1,folowing:1},{unique:true})
followSchema.index({folowing:1,status:1})
followSchema.index({follower:1,status:1})

module.exports = mongoose.model("Follow", followSchema);

