const express = require("express")
const postRouter = express.Router()
const postController = require("../controller/post.controller")
const authMiddleware = require("../middleware/auth.middleware")
const uploadMiddleware = require('../middleware/upload.middleware')

postRouter.post("/createpost",uploadMiddleware.array("media",10),authMiddleware,postController.createPost)
postRouter.patch("/updatepost/:postId",authMiddleware,postController.updatePost)
postRouter.delete("/deletepost/:postId",authMiddleware,postController.deletePost)
postRouter.get("/getpost/:id",authMiddleware,postController.getPostById) //get post by user id
postRouter.get("/likepost/:postId",authMiddleware,postController.likePostdislike) //like post
postRouter.post("/createcomment/:postId",authMiddleware,postController.createComment) //create comment
postRouter.get("/getcomments/:postId",authMiddleware,postController.getCommentsByPostId) //get comments by post id
postRouter.get("/getreplies/:commentId",authMiddleware,postController.getRepliesByCommentId) //get replies by comment id
postRouter.delete("/deletecomment/:commentId",authMiddleware,postController.deleteComment)

module.exports = postRouter