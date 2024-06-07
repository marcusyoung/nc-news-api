const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const tokenHeaderKey = 'jwt-token'
    const jwtSecretKey = process.env.JWT_SECRET
    const token = req.headers[tokenHeaderKey]
    if (!token) {
        res.status(401).send('Authentication required.')
        return
    }
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
        if (err) {
            res.status(403).send('Invalid token.')
            return
        }
        req.user = decoded;
        next()
    })
}

module.exports = verifyToken