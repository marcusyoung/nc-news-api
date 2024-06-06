const cors = require('cors')
const express = require('express')
const apiRouter = require('./routes/api-router')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/', apiRouter)

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
            res.status(400).send({ msg: 'Invalid input (invalid_text_representation)' })
            break
        case '23502':
            res.status(400).send({ msg: 'Invalid input (not_null_violation)' })
            break
        case '23503':
            res.status(400).send({ msg: 'Invalid input (foreign_key_violation)' })
            break
        case '23505':
            res.status(400).send({ msg: 'Invalid input (unique_violation)' })
            break
        default: next(err)
    }
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' })
})

module.exports = app