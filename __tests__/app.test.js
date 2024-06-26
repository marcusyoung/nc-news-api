const app = require('../app')
const db = require('../db/connection')
const request = require('supertest')
const data = require(`../db/data/test-data/index`)
const seed = require('../db/seeds/seed')
const expectedEndpoints = require('../endpoints.json')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const jwtSecret = process.env.JWT_SECRET
const csrfSecret = process.env.CSRF_SECRET

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
            .get('/api/articles/5')
            .then(({ body }) => {
                const { article } = body
                expect(article.article_id).toEqual(5)
                expect(article.comment_count).toEqual(2)
                expect(typeof article.article_id).toBe('number')
                expect(typeof article.author).toBe('string')
                expect(typeof article.title).toBe('string')
                expect(typeof article.body).toBe('string')
                expect(typeof article.topic).toBe('string')
                expect(typeof article.created_at).toBe('string')
                expect(typeof article.votes).toBe('number')
                expect(typeof article.article_img_url).toBe('string')
                expect(typeof article.comment_count).toBe('number')
            })
    })
    test('GET 400 if passed invalid parameter should return status 400 and expected message', () => {
        return request(app)
            .get('/api/articles/1.23')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (invalid_text_representation)')
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
            .then(({ body }) => {
                const { articles } = body
                expect(articles.length).toBe(13)
                expect(articles).toBeSortedBy('created_at', { descending: true })
                articles.forEach((article) => {
                    expect(typeof article.article_id).toBe('number')
                    expect(typeof article.author).toBe('string')
                    expect(typeof article.title).toBe('string')
                    expect(typeof article.topic).toBe('string')
                    expect(typeof article.created_at).toBe('string')
                    expect(typeof article.votes).toBe('number')
                    expect(typeof article.article_img_url).toBe('string')
                    expect(typeof article.comment_count).toBe('number')
                })
                expect(articles.map((article) => article.comment_count)).toEqual([2, 1, 0, 0, 0, 2, 11, 2, 0, 0, 0, 0, 0])
            })
    })
    test('GET 200 returns articles for the topic specified as a query in the request', () => {
        return request(app)
            .get('/api/articles?topic=cats')
            .expect(200)
            .then(({ body }) => {
                const { articles } = body
                expect(articles.length).toBe(1)
                articles.forEach((article) => {
                    expect(article.topic).toBe('cats')
                })
            })
    })
    test('GET 404 if no articles have the passed topic and the topic does not exist', () => {
        return request(app)
            .get('/api/articles?topic=dogs')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Topic: dogs does not exist')
            })
    })
    test('GET 200 return an empty array if no articles have the passed topic and the topic exists', () => {
        return request(app)
            .get('/api/articles?topic=paper')
            .expect(200)
            .then(({ body }) => {
                const { articles } = body
                expect(articles).toEqual([])
            })
    })
    test('GET 400 if passed an invalid query key', () => {
        return request(app)
            .get('/api/articles?subject=cats')
            .expect(400)
            .then(({ body }) => {
                const { articles } = body
                expect(body.msg).toBe('Invalid query key(s)')
            })
    })
    test('GET 400 if passed mixture of valid and invalid keys', () => {
        return request(app)
            .get('/api/articles?topic=cats&&subject=cats')
            .expect(400)
            .then(({ body }) => {
                const { articles } = body
                expect(body.msg).toBe('Invalid query key(s)')
            })
    })
    test('GET 200 results return sorted by column passed in query', () => {
        return request(app)
            .get('/api/articles?sort_by=comment_count')
            .expect(200)
            .then(({ body }) => {
                const { articles } = body
                expect(articles).toBeSortedBy('comment_count', { descending: true })
            })
    })
    test('GET 200 results return sorted by column passed in query and in specified order', () => {
        return request(app)
            .get('/api/articles?sort_by=comment_count&&order=asc')
            .expect(200)
            .then(({ body }) => {
                const { articles } = body
                expect(articles).toBeSortedBy('comment_count', { descending: false })
            })
    })
    test('GET 400 if passed invalid sort_by column', () => {
        return request(app)
            .get('/api/articles?sort_by=invalid_column')
            .expect(400)
            .then(({ body }) => {
                const { articles } = body
                expect(body.msg).toBe('Invalid sort_by column')
            })
    })
    test('GET 400 if passed invalid order value', () => {
        return request(app)
            .get('/api/articles?order=invalid')
            .expect(400)
            .then(({ body }) => {
                const { articles } = body
                expect(body.msg).toBe('Invalid sort order')
            })
    })
})
describe('GET comments', () => {
    test('GET 200 returns an array of comments for the provided article id', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
                const { comments } = body
                expect(comments.length).toBe(11)
                expect(comments).toBeSortedBy('created_at', { descending: true })
                comments.forEach((comment) => {
                    expect(comment).toEqual(expect.objectContaining({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: expect.any(Number)
                    }))
                })
            })
    })
    test('GET 400 if passed invalid parameter should return status 400 and expected message', () => {
        return request(app)
            .get('/api/articles/1.45/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (invalid_text_representation)')
            })
    })
    test('GET 404 if passed article_id that does not exist in the database table return status 404 and expected message', () => {
        return request(app)
            .get('/api/articles/14/comments')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('No article found for article_id: 14')
            })
    })
    test('GET 200 returns empty array if passed and article_id that exists but where there are no comments for that article', () => {
        return request(app)
            .get('/api/articles/10/comments')
            .expect(200)
            .then(({ body }) => {
                const { comments } = body
                expect(comments).toEqual([])
            })
    })
})
describe('POST 201 create comment for article', () => {
    test('POST 403 endpoint should not be reachable if token is not valid', () => {
        const newComment = { username: "rogersop", body: "This is a test comment" }
        const insertedComment = { author: "rogersop", body: "This is a test comment", votes: 0, article_id: 10 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = "invalidtoken"
        return request(app)
            .post('/api/articles/10/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid jwt token')
            })
    })
    test('POST 403 endpoint should not be reachable if csrf token in header is not valid', () => {
        const newComment = { username: "rogersop", body: "This is a test comment" }
        const insertedComment = { author: "rogersop", body: "This is a test comment", votes: 0, article_id: 10 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/articles/10/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', 'invalidtoken')
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid csrf token')
            })
    })
    test('creates new comment for passed article_id and responds with that comment', () => {
        const newComment = { username: "rogersop", body: "This is a test comment" }
        const insertedComment = { author: "rogersop", body: "This is a test comment", votes: 0, article_id: 10 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/articles/10/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(201)
            .then(({ body }) => {
                const { comment } = body
                expect(comment).toMatchObject(insertedComment)
            })
    })
    test('POST 403 if passed comment does not have username property', () => {
        const newComment = { user: "rogersop", body: "This is a test comment" }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/articles/10/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Unauthorised')
            })
    })
    test('POST 400 if passed comment does not have body property', () => {
        const newComment = { username: "rogersop", notbody: "This is a test comment" }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/articles/10/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (not_null_violation)')
            })
    })
    test('POST 403 if passed username that does not match username in jwt token', () => {
        const newComment = { username: "nonexistentuser", body: "This is a test comment" }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/articles/10/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Unauthorised')
            })
    })
    test('POST 400 if passed article id that does not exist in article table', () => {
        const newComment = { username: "rogersop", body: "This is a test comment" }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/articles/14/comments')
            .send(newComment)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (foreign_key_violation)')
            })
    })
})
describe('Update article by incrementing votes', () => {
    test('PATCH 403 endpoint should not be reachable if token is invalid', () => {
        const newVote = { inc_votes: 10 }
        const updatedArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 110,
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = "badtoken"
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid jwt token')
            })
    })
    test('PATCH 403 endpoint should not be reachable if invalid csrf token in header', () => {
        const newVote = { inc_votes: 10 }
        const updatedArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 110,
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', "invalidtoken")
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid csrf token')
            })
    })
    test('PATCH 200 Updates an article\'s vote column depending on value of inc_votes in the request body - positive increment', () => {
        const newVote = { inc_votes: 10 }
        const updatedArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 110,
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(200)
            .then(({ body }) => {
                const { article } = body
                expect(article).toEqual(updatedArticle)
            })
    })
    test('PATCH 200 Updates an article\'s vote column depending on value of inc_votes in the request body - negative increment', () => {
        const newVote = { inc_votes: -10 }
        const updatedArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 90,
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(200)
            .then(({ body }) => {
                const { article } = body
                expect(article).toEqual(updatedArticle)
            })
    })
    test('PATCH 404 passed article_id is not in database', () => {
        const newVote = { inc_votes: 10 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/14')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('No article found for article_id: 14')
            })
    })
    test('PATCH 400 if passed inc_votes value not an integer', () => {
        const newVote = { inc_votes: 10.5 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (invalid_text_representation)')
            })
    })
    test('PATCH 400 if logged on user attemping to vote on own article', () => {
        const newVote = { inc_votes: 1 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('You can\'t vote on your own content')
            })
    })
    test('PATCH 400 passed object does not have inc_votes property', () => {
        const newVote = { wrong_key: 10 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/articles/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (not_null_violation)')
            })
    })
})
describe('Delete comment', () => {
    test('DELETE 403 if attempt to reach endpoint without valid jwt token', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = "badtoken"
        return request(app)
            .delete('/api/comments/1')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid jwt token')
            })
    })
    test('DELETE 403 if attempt to reach endpoint with invalid csrf token in header', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .delete('/api/comments/1')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', 'invalidtoken')
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid csrf token')
            })
    })
    test('DELETE 204 delete comment by comment id', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .delete('/api/comments/1')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(204)
            .then(() => {
                return db.query('SELECT * FROM comments WHERE comment_id = 1')
                    .then((result) => {
                        expect(result.rows.length).toBe(0)
                    })
            })
    })
    test('DELETE 404 when comment_id does not exist in database table', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .delete('/api/comments/19')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('No comment found for comment_id: 19')
            })
    })
    test('DELETE 403 when comment_id author does not match username in token', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "wrongauthor", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .delete('/api/comments/1')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Unauthorised')
            })
    })
    test('DELETE 400 when comment_id is not in valid format', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .delete('/api/comments/hello')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (invalid_text_representation)')
            })
    })
})
describe('Get users', () => {
    test('GET 200 get array of user objects', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({ body }) => {
                const { users } = body
                expect(users.length).toBe(4)
                users.forEach((user) => {
                    expect(user).toEqual(expect.objectContaining({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    }))
                })
            })
    })
})
describe('User login authentication', () => {
    test('Post 200 if valid user credentials are provided', () => {
        const userObject = { username: "rogersop", password: "testing123" }
        return request(app)
            .post('/api/users/login').send(userObject)
            .expect(200)
            .then(({ body }) => {
            })
    })
    test('Post 401 if invalid user credentials are provided', () => {
        const userObject = { username: "rogersop", password: "invalid" }
        return request(app)
            .post('/api/users/login').send(userObject)
            .expect(401)
            .then(({ body }) => {
                expect(body.msg).toBe('Authentication failed')
            })
    })
    test('Post 404 if user does not exist', () => {
        const userObject = { username: "invalid", password: "testing123" }
        return request(app)
            .post('/api/users/login').send(userObject)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('User does not exist')
            })
    })
})
describe('User create account', () => {
    test('Post 201 creates new user account', () => {
        const userObject = { username: "marcus", password: "testing123", name: "Marcus Young", avatar_url: "https://0.gravatar.com/avatar/daaccd8893f983eb241e9be1e03f7a71" }
        const insertedUser = { username: "marcus", name: "Marcus Young", avatar_url: "https://0.gravatar.com/avatar/daaccd8893f983eb241e9be1e03f7a71" }
        return request(app)
            .post('/api/users/signup').send(userObject)
            .expect(201)
            .then(({ body }) => {
                const { user } = body
                expect(user).toEqual(insertedUser)
            })
    })
    test('Post 400 if user account already exists', () => {
        const userObject = { username: "rogersop", password: "testing123", name: "Marcus Young", avatar_url: "https://0.gravatar.com/avatar/daaccd8893f983eb241e9be1e03f7a71" }
        return request(app)
            .post('/api/users/signup').send(userObject)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toEqual("Invalid input (unique_violation)")
            })
    })
})
describe('GET /api/users/:username', () => {
    test('DELETE 403 if attempt to reach endpoint without valid jwt token', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = "badtoken"
        return request(app)
            .get('/api/users/rogersop')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid jwt token')
            })
    })
    test('DELETE 403 if attempt to reach endpoint with invalid csrf token in header', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .get('/api/users/rogersop')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', 'invalidtoken')
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid csrf token')
            })
    })
    test('GET 200 responds with a user object corresponding with the id passed as a request parameter and having the expected properties', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .get('/api/users/rogersop')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(200)
            .then(({ body }) => {
                const { user } = body
                expect(typeof user.username).toBe("string"),
                    expect(typeof user.name).toBe("string"),
                    expect(typeof user.avatar_url).toBe("string")
            })
    })
    test('GET 404 if passed username that does not exist in the database table return status 404 and expected message', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .get('/api/users/invalidusername')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('User does not exist')
            })
    })
})
describe('POST 201 /api/users/logout', () => {
    test('POST 201 when user logs out', () => {
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .post('/api/users/logout')
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(201)
            .then(({ body }) => {
                expect(body.msg).toBe('Successfully logged out')
            })
    })
})
describe('Update comment by incrementing votes', () => {
    test('PATCH 403 endpoint should not be reachable if token is invalid', () => {
        const newVote = { inc_votes: 1 }
        const updatedComment = {
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: "butter_bridge",
            votes: 17,
            created_at: "2020-04-06T20:13:17.000Z"
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = "badtoken"
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid jwt token')
            })
    })
    test('PATCH 403 endpoint should not be reachable if invalid csrf token in header', () => {
        const newVote = { inc_votes: 1 }
        const updatedComment = {
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: "butter_bridge",
            votes: 17,
            created_at: "2020-04-06T20:13:17.000Z"
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', "invalidtoken")
            .expect(403)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid csrf token')
            })
    })
    test('PATCH 200 Updates a comment\'s vote column depending on value of inc_votes in the request body - positive increment', () => {
        const newVote = { inc_votes: 1 }
        const updatedComment = {
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: "butter_bridge",
            votes: 17,
            created_at: "2020-04-06T12:17:00.000Z"
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(200)
            .then(({ body }) => {
                const { comment } = body
                expect(comment).toEqual(updatedComment)
            })
    })
    test('PATCH 200 Updates a comment\'s vote column depending on value of inc_votes in the request body - negative increment', () => {
        const newVote = { inc_votes: -1 }
        const updatedComment = {
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: "butter_bridge",
            votes: 15,
            created_at: "2020-04-06T12:17:00.000Z"
        }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(200)
            .then(({ body }) => {
                const { comment } = body
                expect(comment).toEqual(updatedComment)
            })
    })
    test('PATCH 404 passed comment_id is not in database', () => {
        const newVote = { inc_votes: 1 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/20')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('No comment found for comment_id: 20')
            })
    })
    test('PATCH 400 if passed inc_votes value not an integer', () => {
        const newVote = { inc_votes: 10.5 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (invalid_text_representation)')
            })
    })
    test('PATCH 400 passed object does not have inc_votes property', () => {
        const newVote = { wrong_key: 10 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "rogersop", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid input (not_null_violation)')
            })
    })
    test('PATCH 400 if user trying to vote on one of their own comments', () => {
        const newVote = { inc_votes: 1 }
        const uuid = crypto.randomUUID()
        const csrfToken = crypto.createHmac('sha256', csrfSecret).update(uuid).digest('hex')
        const token = jwt.sign({ username: "butter_bridge", uuid: uuid, csrf: csrfToken }, jwtSecret, { expiresIn: '1h' })
        return request(app)
            .patch('/api/comments/1')
            .send(newVote)
            .set('Cookie', [`jwt-token=${token}`, `csrf-token=${csrfToken}`])
            .set('X-XSRF-TOKEN', csrfToken)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('You can\'t vote on your own content')
            })
    })
})