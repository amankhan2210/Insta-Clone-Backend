const jwt = require('jsonwebtoken')

async function resetPasswordMiddleware(req,res,next) {
    const token = req.headers.authorization?.split(" ")[1]
    if(!token) return res.status(409).json({msg : 'Rest-token need'})
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET2)
        req.user ={
            id : decoded.id,
            email : decoded.email
        }
        next()
    } catch (error) {
        return res.status(401).json({msg : 'Invalid or expired Reset token'})
    }
}

module.exports = resetPasswordMiddleware