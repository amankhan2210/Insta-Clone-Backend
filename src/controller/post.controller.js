const Post = require("../models/post.model")
const uploadToCloudinary = require("../utils/uploadToCloudinary")
const Profile = require("../models/profile.model")
const Follow = require("../models/follow.model")
const cloudinary = require('../configs/cloudinary')

async function createPost(req, res) {
    try{
        if(!req.files || req.files.length ==0) return res.status(400).json({msg : "Atleast One Media is required"})
        if(req.files.length > 10) return res.status(400).json({msg : "Maximum 10 media files are allowed"})
        const media = []
        for(const file of req.files){
            const result = await uploadToCloudinary(file.buffer)
            media.push({url:result.secure_url,publicId:result.public_id})
        }
        let hashtags = []
        let mention = []
        if(req.body.hashtags) hashtags = JSON.parse(req.body.hashtags)
        if(req.body.mention) mention = JSON.parse(req.body.mention)
        const post = await Post.create({
            author:req.user.id,
            caption:req.body.caption,
            media,
            hashtags,
            mention
        })
        await Profile.findOneAndUpdate({user:req.user.id},{$inc : {postsCount:1}})
        return res.status(201).json({msg : "Post created successfully",post})
    }
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function updatePost(req,res){
    try{
        const { postId } = req.params;
        if(!postId) return res.status(400).json({msg : "Post id is required"})  
        const post = await Post.findOne({author:req.user.id,_id:postId})
        if(!post) return res.status(404).json({msg : "Post not found"})
        if(req.body?.caption!==undefined) post.caption = req.body.caption
        if(req.body?.hashtags!==undefined) post.hashtags = req.body.hashtags
        if(req.body?.mention!==undefined) post.mention = req.body.mention
        await post.save()
        return res.status(200).json({msg : "Post updated successfully",post})
    }
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function deletePost(req,res){
    try{
        const { postId } = req.params
        if(!postId) return res.status(400).json({msg : "Post id is required"})  
        const post = await Post.findOne({author:req.user.id,_id:postId})
        if(!post) return res.status(404).json({msg : "Post not found"})
        // Delete media from Cloudinary
        for(const media of post.media){
            if(media.publicId) await cloudinary.uploader.destroy(media.publicId)
        }
        await Post.findOneAndDelete({author:req.user.id,_id:postId})
        await Profile.findOneAndUpdate({user:req.user.id},{$inc : {postsCount:-1}})
        return res.status(200).json({msg : "Post deleted successfully"})
    }   
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function getPostById(req,res){
    try{
        const { id } = req.params
        if(!id) return res.status(400).json({msg : "User id is required"})
        const profile = await Profile.findOne({user:id})
        if(!profile) return res.status(404).json({msg : "Profile not found"})
        if(id.toString() === req.user.id.toString()){
            const posts = await Post.find({author:id}).sort({createdAt:-1})
            return res.status(200).json({msg : "Posts fetched successfully",posts})
        }
        if(profile.isPrivate){
           const isFollowing = await Follow.findOne({follower:req.user.id,following:id})
           if(!isFollowing || isFollowing.status !== "accepted") return res.status(403).json({msg : "You are not allowed to view this profile"})
        }
        const posts = await Post.find({author:id}).sort({createdAt:-1})
        return res.status(200).json({msg : "Posts fetched successfully",posts})
    }
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}


module.exports = {
    createPost,
    updatePost,
    deletePost,
    getPostById
}