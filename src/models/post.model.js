const mongoose = require("mongoose")

const mediaSchema = new mongoose.Schema({
    url:{
        type:String,
        required:true
    },
    publicId: String,
},{_id:false})

const postSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true,
    },
    caption:{
        type:String,
        maxlength:2200,
        trim:true,
    },
    media:{
        type:[mediaSchema],
        required:true,
        validate: {
        validator: (value) =>
          value.length >= 1 && value.length <= 10,
          message: "Post must contain 1 to 10 media files",
      },
    },
    hashtags: [String],
    mention:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    likesCount:{
        type:Number,
        default:0,
    },
    commentsCount:{
        type:Number,
        default:0,
    },
    isArchived:{
        type:Boolean,
        default:false,
    },
},{timestamps:true})

postSchema.index({author:1,createdAt:-1})
postSchema.index({createdAt: -1})

module.exports = mongoose.model("Post",postSchema)