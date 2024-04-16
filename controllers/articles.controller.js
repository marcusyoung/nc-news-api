const { selectArticle, selectArticles } = require('../models/articles.model')

function getArticle(req, res, next) {

    const { article_id } = req.params

    selectArticle(article_id)
        .then((article) => {
            res.status(200).send({ article: article })
        })
        .catch(next)
}


function getArticles(req, res, next) {

    selectArticles()
        .then((articles) => {
            res.status(200).send({ articles: articles })
        })

}


module.exports = { getArticle, getArticles }