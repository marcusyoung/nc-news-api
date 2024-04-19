const db = require('../db/connection')

function selectTopics() {
    return db.query('SELECT * FROM topics;')
        .then((result) => result.rows)
}

function checkTopicExists(topic) {
    return db.query(`SELECT * FROM topics WHERE slug = $1;`, [topic])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `Topic: ${topic} does not exist`
                    }
                })
            } else { return } // important to return 
        })
}

module.exports = { selectTopics, checkTopicExists }