const db = require('../db/connection')

function selectUsers() {
    return db.query(`SELECT * FROM users;`)
        .then((results) => results.rows)
}

module.exports = { selectUsers }