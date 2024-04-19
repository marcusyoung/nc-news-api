const db = require('../db/connection')

function selectUsers() {
    return db.query(`SELECT * FROM users;`)
        .then((result) => result.rows)
}

module.exports = { selectUsers }