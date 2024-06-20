const { selectUsers, selectUser, checkUser, insertUser } = require('../models/users.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const jwtSecret = process.env.JWT_SECRET
const csrfSecret = process.env.CSRF_SECRET


function getUsers(req, res, next) {

    selectUsers()
        .then((users) => res.status(200).send({ users: users }))
        .catch(next)
}

function getUser(req, res, next) {

    const { username } = req.params

    selectUser(username)
        .then((user) => res.status(200).send({ user: user }))
        .catch(next)
}


function authoriseUser(req, res, next) {

    const { username, password } = req.body

    checkUser(username)
        .then((user) => bcrypt.compare(password, user.password))
        .then((isUser) => {
            if (isUser) {
                const uuid = crypto.randomUUID()
                const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
                const jwtToken = jwt.sign({ username: username, uuid: uuid, csrf: csrfToken}, jwtSecret, { expiresIn: '24h' })
                res.cookie('jwt-token', jwtToken, { domain: 'int2.uk', httpOnly: true, secure: true, sameSite: 'none'})
                res.cookie('csrf-token', csrfToken, { domain: 'int2.uk', httpOnly: false, secure: true, sameSite: 'none'})
                res.status(200).send({msg: 'Logged in successfully'})
            } else {
                next({ custom_error: { status: 401, msg: "Authentication failed" } })
            }
        })
        .catch(next)
}

function createUser(req, res, next) {
    const { username, password, name, avatar_url } = req.body
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,16}$/
    const usernameRegex = /^[A-Za-z0-9]{5,}$/

    if (passwordRegex.test(password) && usernameRegex.test(username)) {
        bcrypt.hash(password, 8)
            .then((hashedPassword) => insertUser(username, hashedPassword, name, avatar_url))
            .then((user) => res.status(201).send({ user: user }))
            .catch(next)
    } else {
        next({ custom_error: { status: 400, msg: "Invalid username or password" } })
    }
}

function logoutUser(req, res, next) {
    res
    .clearCookie('jwt-token', {domain: 'int2.uk', httpOnly: true, secure: true, sameSite: 'none'})
    .clearCookie('csrf-token', {domain: 'int2.uk', httpOnly: false, secure: true, sameSite: 'none'})
    .status(201)
    .send({msg: 'Successfully logged out'})
}


module.exports = { getUsers, getUser, authoriseUser, createUser, logoutUser }