const app = require('../app')
const db = require('../db/connection')
const request = require('supertest')
const data = require(`../db/data/test-data/index`)
const seed = require('../db/seeds/seed')
const expectedEndpoints = require('../endpoints.json')


beforeEach(() => {
    return seed(data)
})

afterAll((() => db.end()))

describe('General app tests', () => {
    test('GET 404 - responds with 404 and `Endpoint not found` if requested endpoint has not been defined', () => {
        return request(app)
            .get('/api/no_api_here')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Endpoint not found')
            })
    })
    test('GET 200 /api responds with an object describing all available endpoints', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({ body }) => {
                const { endpoints } = body
                expect(endpoints).toEqual(expectedEndpoints)
            })
    })
})
describe('GET /api/topics', () => {
    test('GET 200 a valid request should return a status code 200', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
    })
    test('GET 200 an array of topic objects of correct length and with expected properties', () => {
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
describe('GET /api/articles/:article_id', () => {
    test('GET 200 responds with an article object corresponding with the id passed as a request parameter and having the expected properties', () => {
        return request(app)
            .get('/api/articles/2')
            .then(({ body }) => {
                const { article } = body
                expect(article.article_id).toEqual(2)
                expect(typeof article.article_id).toBe('number')
                expect(typeof article.author).toBe('string')
                expect(typeof article.title).toBe('string')
                expect(typeof article.body).toBe('string')
                expect(typeof article.topic).toBe('string')
                expect(typeof article.created_at).toBe('string')
                expect(typeof article.votes).toBe('number')
                expect(typeof article.article_img_url).toBe('string')
            })
    })
    test('GET 400 if passed invalid parameter should return status 400 and expected message', () => {
        return request(app)
            .get('/api/articles/1.23')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input')
            })
    })
    test('GET 404 if passed article_id that does not exist in the database table return status 404 and expected message', () => {
        return request(app)
            .get('/api/articles/14')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('No article found for article_id: 14')
            })
    })
})
describe('GET /api/articles', () => {
    test('GET 200 returns an array of article objects with the expected properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body}) => {
            const {articles} = body
            expect(articles.length).toBe(13)
            articles.forEach((article) => {
                expect(typeof article.author).toBe('text')
                expect(typeof article.title).toBe('text')
                expect(typeof article.topic).toBe('text')
                expect(typeof article.created_at).toBe('text')
                expect(typeof article.votes).toBe('number')
                expect(typeof article_img_url).toBe('text')
                expect(typeof article.comment_count).toBe('number')
            })
        })
    })
})