const db = require('../db/connection')


function selectCommentsByArticleId(article_id) {

    // check if valid article_id exists
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
        .then((result) => {
            if (result.rows < 1) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `No article found for article_id: ${article_id}`
                    }
                })
            } else {
                return db.query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC `, [article_id])
                    .then((result) => result.rows)
            }
        })

}




module.exports = selectCommentsByArticleId