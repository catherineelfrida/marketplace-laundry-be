const jwt = require('jsonwebtoken')
const config = require('../config/config.js')

async function auth(req, res, next) {
    const { authorization } = req.headers
    if(!authorization){
        return res.status(401).json({
            status: 'failed',
            message: 'you\'re not authorized!',
            data: null,
        })
    }
    jwt.verify(authorization, config.jwt.key, (err, decoded) => {
        if(err){
            return res.status(401).json({
                status: 'failed',
                message: 'you\'re not authorized!',
                err: err.message,
                data: null,
            })
        }
        req.user = decoded;
        next()
    })
}
async function JWTsign(user){
    const token = jwt.sign(user, config.jwt.key)
    return token;
}
module.exports = {
    auth,
    JWTsign
}
