const { selectUsers, selectUser, insertUser } = require('../models/users.model')
const bcrypt = require('bcryptjs')


function getUsers(req, res, next) {

    selectUsers()
        .then((users) => {
            res.status(200).send({ users: users })
        })
        .catch(next)
}


function authoriseUser(req, res, next) {

    const { username, password } = req.body

    selectUser(username)
        .then((user) => {
            const isUser = bcrypt.compareSync(password, user.password)
            if (isUser) {
                res.status(200).send()
            } else {
                res.status(401).send()
            }
        })
        .catch(next)
}

function createUser(req, res, next) {
    const { username, password, name, avatar_url } = req.body
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,16}$/
    const usernameRegex = /^[A-Za-z0-9]{5,}$/

    if (passwordRegex.test(password) && usernameRegex.test(username)) {
        const hashedPassword = bcrypt.hashSync(password, 8)
        insertUser(username, hashedPassword, name, avatar_url)
            .then((user) => {
                res.status(201).send({ user: user })
            })
            .catch(next)
    } else {
        next({ custom_error: { status: 400, msg: "Invalid username or password" } })
    }
}


module.exports = { getUsers, authoriseUser, createUser }