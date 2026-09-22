const express = require("express")
const postRouter = express.Router()
const postController = require("../controller/post.controller")
const authMiddleware = require("../middleware/auth.middleware")
const uploadMiddleware = require('../middleware/upload.middleware')

postRouter.post("/createpost",uploadMiddleware.array("media",10),authMiddleware,postController.createPost)
postRouter.patch("/updatepost/:postId",authMiddleware,postController.updatePost)
postRouter.delete("/deletepost/:postId",authMiddleware,postController.deletePost)
postRouter.get("/getpost/:id",authMiddleware,postController.getPostById) //get post by user id
 

module.exports = postRouter