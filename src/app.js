const express = require('express')
const authRouter = require('../src/routes/auth.routes')
const profileRouter = require('../src/routes/profile.routes')
const postRouter = require('../src/routes/post.routes')
const morgan = require('morgan');
const cookieParser = require("cookie-parser")
const app = express()
require('dotenv').config();
app.use(morgan('dev'))
app.use(express.json());
app.use(cookieParser())
app.use('/api/auth',authRouter)
app.use('/api/profile',profileRouter)
app.use('/api/post',postRouter)
module.exports = app