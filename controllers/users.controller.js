const { selectUsers, selectUser } = require('../models/users.model')
const bcrypt = require('bcryptjs')


function getUsers(req, res, next) {

    selectUsers()
        .then((users) => {
            res.status(200).send({ users: users })
        })
        .catch(next)
}


function authoriseUser(req, res, next) {
    
    const {username, password} = req.params
    
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


module.exports = { getUsers, authoriseUser }