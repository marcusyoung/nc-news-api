const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const tokenKey = 'jwt-token'
    const csrfKey = 'csrf-token'
    const jwtSecretKey = process.env.JWT_SECRET
    const token = req.cookies[tokenKey]
    const csrfToken = req.get('X-XSRF-TOKEN')
    if (!token) {
        res.status(403).send({ msg: 'No jwt token' })
        return
    }
    if (!csrfToken) {
        res.status(403).send({msg: 'No csrf token'})
        return
    }
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
        if (err) {
            res.status(403).send({ msg: 'Invalid jwt token' })
            return
        }
        if (decoded.csrf !== csrfToken) {
            res.status(403).send({ msg: 'Invalid csrf token' })
            return
        }
        req.user = decoded
        next()
    })
}

module.exports = verifyToken