const express = require("express")
const profileRouter = express.Router()
const profileController = require("../controller/profile.controller")
const authMiddleware = require("../middleware/auth.middleware")
const uploadMiddleware = require('../middleware/upload.middleware')

profileRouter.get("/getmyprofile",authMiddleware,profileController.getProfile)
profileRouter.get("/getprofile/:id",authMiddleware,profileController.getProfileById)
profileRouter.patch("/update",authMiddleware,profileController.UpdateProfile)
profileRouter.patch("/updateavatar",uploadMiddleware.single("file"),authMiddleware,profileController.UpdateProfileAvatar)
profileRouter.delete("/deleteavatar",authMiddleware,profileController.deletavtar)
profileRouter.patch("/toggleprivacy",authMiddleware,profileController.publictoggle)
module.exports = profileRouter
