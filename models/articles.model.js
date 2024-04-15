const db = require('../db/connection')

function selectArticle(article_id) {


    return db.query(`SELECT * from articles where article_id =  $1`, [article_id])
        .then((result) => {
            const article = result.rows[0]
            if (!article) {
                return Promise.reject({
                    custom_error: {
                        status: 404,
                        msg: `No article found for article_id: ${article_id}`
                    }
                })
            }

            return article

        })
}

module.exports = selectArticle