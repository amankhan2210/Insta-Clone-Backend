const express = require('express')
const authRouter = express.Router()
const authController = require('../controller/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')
const resetPasswordMiddleware = require('../middleware/reset.middleware')

authRouter.post('/register',authController.register)
authRouter.post('/emailverify',authController.verifyEmail)
authRouter.post('/login',authController.login)
authRouter.post('/refreshtoken',authController.rotatetoken)
authRouter.get('/logout',authMiddleware,authController.logout)
authRouter.get('/logoutall',authMiddleware,authController.logoutall)
authRouter.post('/forgotpassword',authController.Forgotpassword)
authRouter.post('/verifyotp',authController.verifyOtp)
authRouter.post('/resetpassoword',resetPasswordMiddleware,authController.resetPassword)

module.exports = authRouter