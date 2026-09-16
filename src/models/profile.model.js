const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    user : {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      maxlength: 150,
    },
    avatar: {
      url: String,
      publicId: String,
    },
    website: String,
    isPrivate: {
      type: Boolean,
      default: false,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
},{ timestamps: true })
module.exports = mongoose.model("Profile", profileSchema);