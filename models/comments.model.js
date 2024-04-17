const db = require('../db/connection')


function selectCommentsByArticleId(article_id) {

    // check if valid article_id exists
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
        .then((result) => {
            if (result.rows < 1) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `No article found for article_id: ${article_id}`
                    }
                })
            } else {
                return db.query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id])
                    .then((result) => result.rows)
            }
        })

}

function insertComment(article_id, username, body) {
    return db.query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;`, [username, body, article_id])
    .then((result) =>  result.rows[0])

}




module.exports = {selectCommentsByArticleId, insertComment}