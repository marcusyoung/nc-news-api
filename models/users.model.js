const db = require('../db/connection')


function checkValidUsername(username) {

    return db.query(`SELECT * FROM users where username = $1;`, [username])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `User does not exist`
                    }
                })
            } else { return } // important to return 
        })
}

function selectUsers() {
    return db.query(`SELECT username, name, avatar_url FROM users;`)
        .then((result) => result.rows)
}

function selectUser(username) {
    return checkValidUsername(username)
    .then(() => {
        return db.query(`SELECT password FROM users WHERE username = $1;`, [username])
            .then((result) => result.rows[0])
    })
}

module.exports = { selectUsers, selectUser }