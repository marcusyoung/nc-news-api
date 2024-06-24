const db = require('../db/connection')
const { checkValidArticleId } = require('../models/articles.model')


function checkCommentExists(comment_id) {

    return db.query(`SELECT author FROM comments WHERE comment_id = $1;`, [comment_id])
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `No comment found for comment_id: ${comment_id}`
                    }
                })
            } else {
                return result.rows[0]
            }
        })
}

function checkUserIsAuthorised(comment_id, tokenUsername) {

    return db.query(`SELECT author FROM comments WHERE comment_id = $1;`, [comment_id])
        .then((result) => {
            if (result.rows[0].author != tokenUsername) {
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
    return checkCommentExists(comment_id)
        .then(() => {
            return checkUserIsAuthorised(comment_id, tokenUsername)
        })
        .then(() => {
            return db.query('DELETE FROM comments WHERE comment_id = $1', [comment_id])
        })
}

function updateComment(comment_id, inc_votes, tokenUsername) {

    // check for valid comment_id - promise is rejected if not valid
    return checkCommentExists(comment_id)
        .then((result) => {
            if (result.author === tokenUsername) {
                return Promise.reject({
                    custom_error: {
                        status: 400,
                        msg: `You can't vote on your own content`
                    }
                })
            } else {
            return db.query(`UPDATE comments
                SET votes = votes + $1 WHERE comment_id = $2
                RETURNING *;
                `, [inc_votes, comment_id])
                .then((result) => result.rows[0])
            }
        })
}

module.exports = { selectCommentsByArticleId, insertComment, deleteComment, updateComment }