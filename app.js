const express = require('express')
const getTopics = require('./controllers/topics.controller')

const app = express()

app.get('/api/topics', getTopics)

// if api endpoint not found return 404
app.all('*', (req, res, next) => {
    res.status(404).send({ msg: 'Endpoint not found' })
})



app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' })
})

module.exports = app