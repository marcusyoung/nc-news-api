const express = require('express')
const getTopics = require('./controllers/topics.controller')
const { getArticle, getArticles } = require('./controllers/articles.controller')
const { getCommentsByArticleId, postComment} = require('./controllers/comments.controller')
const endpoints = require('./endpoints.json')

const app = express()
app.use(express.json())

app.get('/api', (req, res) => {
    res.status(200).send({ endpoints: endpoints })
})

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticle)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.post('/api/articles/:article_id/comments', postComment)

// if api endpoint not found return 404
app.all('*', (req, res, next) => {
    res.status(404).send({ msg: 'Endpoint not found' })
})

// custom error handling
app.use((err, req, res, next) => {
    if (err.custom_error) {
        res.status(err.custom_error.status).send({ msg: err.custom_error.msg })
    } else next(err)
})

// postgresql error handling
app.use((err, req, res, next) => {
    switch (err.code) {
        case '22P02':
            res.status(400).send({ msg: 'Invalid input' })
            break
        case '23502':
            res.status(400).send({msg: 'Invalid input (not_null_violation)'})
            break
        default: next(err)
    }
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' })
})

module.exports = app