const { selectCommentsByArticleId, insertComment } = require('../models/comments.model')


function getCommentsByArticleId(req, res, next) {

    const { article_id } = req.params

    selectCommentsByArticleId(article_id)
        .then((comments) => {
            console.log(comments)
            res.status(200).send({ comments: comments })
        })
        .catch(next)

}


function postComment(req, res, next) {

    const { article_id } = req.params
    const { username, body } = req.body

        insertComment(article_id, username, body)
            .then((comment) => {
                res.status(201).send({ comment: comment })
            })
            .catch(next)


}

module.exports = { getCommentsByArticleId, postComment }