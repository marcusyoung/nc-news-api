const selectCommentsByArticleId = require('../models/comments.model')


function getCommentsByArticleId(req, res, next) {

    const { article_id } = req.params

    selectCommentsByArticleId(article_id)
        .then((comments) => {
            res.status(200).send({ comments: comments })
        })
        .catch(next)

}



module.exports = getCommentsByArticleId