const app = require('../app')
const db = require('../db/connection')
const request = require('supertest')
const data = require(`../db/data/test-data/index`)
const seed = require('../db/seeds/seed')



beforeEach(() => {
    return seed(data)
})

afterAll((() => db.end()))

describe('General app test', () => {
    test('GET 404 - responds with 404 and `Endpoint not found` if requested endpoint has not been defined', () => {
        return request(app)
            .get('/api/no_api_here')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Endpoint not found')
            })
    })
})
describe('GET /api/topics', () => {
    test('GET 200 a valid request should return a status code 200', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
    })
    test('GET 200  an array of topic objects of correct length and with expected properties', () => {
        return request(app)
            .get('/api/topics')
            .then(({ body }) => {
                const { topics } = body
                expect(topics.length).toBe(3)
                topics.forEach((topic) => {
                    expect(typeof topic.slug).toBe('string')
                    expect(typeof topic.description).toBe('string')
                })

            })
    })
})