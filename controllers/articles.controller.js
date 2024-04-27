const { selectArticle, selectArticles, updateArticle } = require('../models/articles.model')

function getArticle(req, res, next) {

    const { article_id } = req.params

    selectArticle(article_id)
        .then((article) => {
            res.status(200).send({ article: article })
        })
        .catch(next)
}


function getArticles(req, res, next) {

    const queryKeys = Object.keys(req.query)
    const validQueryKeys = ['topic', 'sort_by', 'order']
    const validSortColumns = ['article_id', 'author', 'title', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']
    const validOrder = ['asc', 'desc']

    if (!queryKeys.every((key) => validQueryKeys.includes(key))) {
        next({ custom_error: { status: 400, msg: "Invalid query key(s)" } })
    }

    const { topic, sort_by, order } = req.query

    if (sort_by && !validSortColumns.includes(sort_by)) {
        next({ custom_error: { status: 400, msg: "Invalid sort_by column" } })
    }

    if (order && !validOrder.includes(order)) {
        next({ custom_error: { status: 400, msg: "Invalid sort order" } })
    }

    selectArticles(topic, sort_by, order)
        .then((articles) => {
            res.status(200).send({ articles: articles })
        })
        .catch((err) => {
            next(err)
        })

}

function patchArticle(req, res, next) {

    const { article_id } = req.params
    const { inc_votes } = req.body

    updateArticle(article_id, inc_votes)
        .then((article) => {
            res.status(200).send({ article: article })
        })
        .catch(next)

}


module.exports = { getArticle, getArticles, patchArticle }