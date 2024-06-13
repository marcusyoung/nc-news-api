const db = require('../db/connection')
const { checkValidArticleId } = require('../models/articles.model')


function checkComment(comment_id, tokenUsername) {

    return db.query(`SELECT author FROM comments WHERE comment_id = $1;`, [comment_id])
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `No comment found for comment_id: ${comment_id}`
                    }
                })
            } else if (result.rows[0].author != tokenUsername) {
                return Promise.reject({
                    custom_error: {
                        status: 403,
                        msg: `Unauthorised`
                    }
                })
            } else {
                return
            }
        })
}

function selectCommentsByArticleId(article_id) {

    // check if valid article_id exists - promise is rejected if not
    // and don't get to .then()
    return checkValidArticleId(article_id)
        .then(() => {
            return db.query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id])
                .then((result) => result.rows)
        })
}

function insertComment(article_id, username, body) {
    return db.query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;`, [username, body, article_id])
        .then((result) => result.rows[0])

}

function deleteComment(comment_id, tokenUsername) {

    return checkComment(comment_id, tokenUsername)
        .then(() => {
            return db.query('DELETE FROM comments WHERE comment_id = $1', [comment_id])
        })
}


module.exports = { selectCommentsByArticleId, insertComment, deleteComment }