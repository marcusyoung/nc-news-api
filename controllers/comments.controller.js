const { selectCommentsByArticleId, insertComment, deleteComment, updateComment } = require('../models/comments.model')

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
    const tokenUsername = req.user.username

    // check that username in body matches username in JWT token
    // if not then not authorised to comment on behalf of this user.
    if (tokenUsername === username) {
        insertComment(article_id, username, body)
            .then((comment) => {
                res.status(201).send({ comment: comment })
            })
            .catch(next)
    } else {
        next({ custom_error: { status: 403, msg: "Unauthorised" } })
    }


}

function removeComment(req, res, next) {
    const { comment_id } = req.params
    const tokenUsername = req.user.username

    deleteComment(comment_id, tokenUsername)
        .then((result) => {
            res.status(204).send()
        })
        .catch(next)
}

function patchComment(req, res, next) {

    const { comment_id } = req.params
    const { inc_votes } = req.body
    const tokenUsername = req.user.username

    updateComment(comment_id, inc_votes, tokenUsername)
        .then((comment) => {
            res.status(200).send({ comment: comment })
        })
        .catch(next)

}

module.exports = { getCommentsByArticleId, postComment, removeComment, patchComment }