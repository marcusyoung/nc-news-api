const selectArticle = require('../models/articles.model')

function getArticle(req, res, next) {

    const { article_id } = req.params

    selectArticle(article_id)
        .then((article) => {
            res.status(200).send({ article: article })
        })
        .catch(next)
}

module.exports = getArticle