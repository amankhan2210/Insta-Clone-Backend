const express = require('express')
const authRouter = express.Router()
const authController = require('../controller/auth.controller')


authRouter.post('/register',authController.register)
authRouter.post('/emailverify',authController.verifyEmail)
authRouter.post('/login',authController.login)
authRouter.post('/refreshtoken',authController.rotatetoken)
module.exports = authRouter