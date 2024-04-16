const db = require('../db/connection')

function selectTopics() {
    return db.query('SELECT * FROM topics;')
        .then((result) => result.rows)
}

module.exports = selectTopics