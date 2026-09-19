const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
       type: String,
       required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
},{ timestamps: true })

module.exports = mongoose.model("User", userSchema);