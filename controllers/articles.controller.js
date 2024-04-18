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

    const { topic } = req.query
  
    selectArticles(topic)
        .then((articles) => {
            res.status(200).send({ articles: articles })
        })
        .catch(next)

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