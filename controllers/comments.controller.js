const { selectCommentsByArticleId, insertComment, deleteComment } = require('../models/comments.model')


function getCommentsByArticleId(req, res, next) {

    const { article_id } = req.params

    selectCommentsByArticleId(article_id)
        .then((comments) => {
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

function removeComment(req, res, next) {

    const { comment_id } = req.params

    deleteComment(comment_id)
        .then((result) => {
            res.status(204).send()
        })
        .catch(next)

}

module.exports = { getCommentsByArticleId, postComment, removeComment }