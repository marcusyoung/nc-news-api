const db = require('../db/connection')

function selectArticle(article_id) {

    return db.query(`SELECT * from articles where article_id =  $1;`, [article_id])
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


function selectArticles() {

    return db.query(`WITH tmp AS (
        SELECT article_id, count(*) AS comment_count
        FROM comments
        GROUP BY article_id
        )
        SELECT articles.article_id, author, title, topic, created_at, votes, article_img_url, COALESCE(tmp.comment_count, 0)::int AS comment_count
        FROM articles
        LEFT JOIN tmp
        ON articles.article_id = tmp.article_id
        ORDER BY created_at DESC;`)
        .then((results) => results.rows)
}

function updateArticle(article_id, inc_votes) {

    // check if article_id exists in database
    // needs refactoring at some point as this code is duplicated in another model(dufferent ticket)
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
                return db.query(`UPDATE articles
                SET votes = votes + $1 WHERE article_id = $2
                RETURNING *;
                `, [inc_votes, article_id])
                    .then((result) => result.rows[0])
            }
        })
}

module.exports = { selectArticle, selectArticles, updateArticle }