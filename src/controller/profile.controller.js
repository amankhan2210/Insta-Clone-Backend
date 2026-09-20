const Profile = require('../models/profile.model')
const mongoose = require('mongoose')
const uploadToCloudinary = require('../utils/uploadToCloudinary')
const cloudinary = require('../configs/cloudinary')
async function getProfile(req,res){
    const profile = await Profile.findOne({user:req.user.id})
    if(!profile) return res.status(404).json({msg : "Profile not found"})
    return res.status(200).json({msg : "Profile fetched successfully",profile})
}

async function getProfileById(req,res){
    const {id} = req.params
    if(!id) return res.status(400).json({msg : "User id is required"})
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({msg : "Invalid user id"})
    const profile = await Profile.findOne({user:id}).populate('user','username email')
    if(!profile) return res.status(404).json({msg : "Profile not found"})
    return res.status(200).json({msg : "Profile fetched successfully",profile})
}

async function UpdateProfile(req,res){
    const {fullname,bio,website,gender} = req.body
    const profile = await Profile.findOneAndUpdate({user:req.user.id},{
        fullName:fullname,
        bio,
        website,
        gender
    },{new:true,runValidators: true})
    if(!profile) return res.status(404).json({msg : "Profile not found"})
    return res.status(200).json({msg : "Profile updated successfully",profile})
}

async function UpdateProfileAvatar(req,res){
    try{
        if(!req.file) return res.status(400).json({msg : "Avatar file is required"})
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile) return res.status(404).json({msg : "Profile not found"})
        // Upload the new avatar to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer)
        const newAvatar = await Profile.findOneAndUpdate({user:req.user.id},{
            avatar: {
                url: result.secure_url,
                publicId: result.public_id
            }
        },{new:true,runValidators: true})
        return res.status(200).json({msg : "Profile avatar updated successfully",profile:newAvatar})
    }
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function deletavtar(req,res){
    try {
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile) return res.status(404).json({msg : "Profile not found"})
        if(!profile.avatar.publicId) return res.status(400).json({msg : "No avatar to delete"})
        // Delete the avatar from Cloudinary
        await cloudinary.uploader.destroy(profile.avatar.publicId)
        const updatedProfile = await Profile.findOneAndUpdate({user:req.user.id},{
            avatar: {
                url: "",
                publicId: ""
            }
        },{new:true,runValidators: true})
        return res.status(200).json({msg : "Profile avatar deleted successfully",profile:updatedProfile})
    } catch (error) {
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function publictoggle(req,res){
    try {
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile) return res.status(404).json({msg : "Profile not found"})
        const updatedProfile = await Profile.findOneAndUpdate({user:req.user.id},{
            isPrivate: !profile.isPrivate
        },{new:true,runValidators: true})
        return res.status(200).json({msg : "Profile privacy toggled successfully",profile:updatedProfile})
    } catch (error) {
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}
module.exports = {
    UpdateProfile,
    getProfile,
    getProfileById,
    UpdateProfileAvatar,
    deletavtar,
    publictoggle
}