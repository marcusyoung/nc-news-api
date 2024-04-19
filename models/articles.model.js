const db = require('../db/connection')

function selectArticle(article_id) {

    return db.query(`SELECT a.article_id, a.author, title, a.body, topic, a.created_at, a.votes, article_img_url, count(b.comment_id)::int AS comment_count
    FROM articles a
    LEFT JOIN comments b
    ON a.article_id = b.article_id
	WHERE a.article_id = $1
	GROUP BY a.article_id ORDER BY created_at DESC;`, [article_id])
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


function selectArticles(topic) {

    const topicArray = []

    let sqlQuery = `SELECT a.article_id, a.author, title, topic, a.created_at, a.votes, article_img_url, count(b.comment_id)::int AS comment_count
    FROM articles a
    LEFT JOIN comments b
    ON a.article_id = b.article_id`

    if (topic) {
        topicArray.push(topic)
        sqlQuery = sqlQuery + ' WHERE topic = $1'
    }

    sqlQuery = sqlQuery + ' GROUP BY a.article_id ORDER BY created_at DESC;'

    return db.query(sqlQuery, topicArray)
        .then((results) => {
            if (topic && results.rows.length === 0) {
                // check if topic exists in topic table
                // if it does not, return error message
                return db.query(`SELECT * FROM topics WHERE slug = $1;`, topicArray)
                    .then((result) => {
                        if (result.rows.length === 0) {
                            return Promise.reject({
                                custom_error: {
                                    status: 404,
                                    msg: `Topic: ${topic} does not exist`
                                }
                            })
                        }
                        else return results.rows
                    })
            } else {
                return results.rows
            }
        })
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