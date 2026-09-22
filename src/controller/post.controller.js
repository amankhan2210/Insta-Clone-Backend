const Post = require("../models/post.model")
const uploadToCloudinary = require("../utils/uploadToCloudinary")
const Profile = require("../models/profile.model")
const Follow = require("../models/follow.model")
const Like = require("../models/like.model")
const Comment = require("../models/comment.model")
const cloudinary = require('../configs/cloudinary')
const mongoose = require('mongoose')

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

async function likePostdislike(req,res){
    const { postId } = req.params
    if(!postId) return res.status(400).json({msg : "Post id is required"})
    if(!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({msg : "Invalid post id"})
    const post = await Post.findById(postId)
    if(!post) return res.status(404).json({msg : "Post not found"})
    const existingLike = await Like.findOne({user:req.user.id,post:postId})
    if(existingLike){
        await Like.findOneAndDelete({user:req.user.id,post:postId})
        await Post.findByIdAndUpdate(postId,{$inc : {likesCount:-1}})
        return res.status(200).json({msg : "Post disliked successfully"})
    }
    await Like.create({user:req.user.id,post:postId})
    await Post.findByIdAndUpdate(postId,{$inc : {likesCount:1}})
    return res.status(200).json({msg : "Post liked successfully"})
}

async function createComment(req,res){
    try{
        const { postId } = req.params
        const {text,parentComment} = req.body
        if(!text ||  !text.trim()) return res.status(400).json({msg : "Comment text is required"})
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({msg : "Post not found"})
        const comment = await Comment.create({
            post:postId,
            user:req.user.id,
            text : text.trim(),
            parentComment : parentComment || null
        })
        await Post.findByIdAndUpdate(postId,{$inc : {commentsCount:1}})
        if(parentComment) await Comment.findByIdAndUpdate(parentComment,{$inc : {repliesCount:1}})
        const populatedComment = await Comment.findById(comment._id).populate("user", "username profileImage");      
        return res.status(201).json({msg : "Comment created successfully",comment:populatedComment})
    }
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function getCommentsByPostId(req,res){
    const { postId } = req.params
    if(!postId) return res.status(400).json({msg : "Post id is required"})
    const comments = await Comment.find({post:postId,parentComment:null}).populate("user","username profileImage").sort({createdAt:-1})
    return res.status(200).json({msg : "Comments fetched successfully",comments})
}

async function getRepliesByCommentId(req,res){
    try{
        const { commentId } = req.params
        if(!commentId) return res.status(400).json({msg : "Comment id is required"})
        const replies = await Comment.find({parentComment:commentId}).populate("user","username profileImage").sort({createdAt:-1})
        return res.status(200).json({msg : "Replies fetched successfully",replies})
    }
    catch(error){
        return res.status(500).json({msg : "Internal server error",error:error.message})
    }
}

async function deleteComment(req,res){
    const { commentId } = req.params
    if(!commentId) return res.status(400).json({msg : "Comment id is required"})
    const userId = req.user.id
    const comment = await Comment.findById(commentId)
    if(!comment) return res.status(404).json({msg : "Comment not found"})
    if(comment.user.toString() !== userId.toString()) return res.status(403).json({msg : "You are not allowed to delete this comment"})
    if(comment.parentComment){
        await Comment.findByIdAndUpdate(comment.parentComment,{$inc : {repliesCount:-1}})
        await Post.findByIdAndUpdate(comment.post,{$inc : {commentsCount:-1}})
        await Comment.findByIdAndDelete(commentId)
        return res.status(200).json({msg : "Comment deleted successfully"}) 
    }
    const result = await Comment.deleteMany({parentComment: commentId})
    const minx = result.deletedCount+1
    await Post.findByIdAndUpdate(comment.post,{$inc : {commentsCount:-minx}})
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json({msg : "Comment deleted successfully"})     

}


module.exports = {
    createPost,
    updatePost,
    deletePost,
    getPostById,
    likePostdislike,
    createComment,
    getCommentsByPostId,
    getRepliesByCommentId,
    deleteComment
}