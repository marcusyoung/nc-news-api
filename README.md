# Northcoders News API

This is an API for accessing application data programmatically from a database. It mimics a real world backend service (such as Reddit) where the API would provide information to the front end architecture. The database consists of four tables: users, articles, topics, and comments.

A hosted version of the API is available at [https://nc-news-api-fa1t.onrender.com](https://nc-news-api-fa1t.onrender.com). The API is hosted on Render, and the database is hosted on ElephantSQL. A list of enpoints can be obtained at `/api`.

Note that the API is hosted on the Render free tier and the web services will sleep after 15 minutes of inactivity. If the web service is asleep it will take several seconds to receive a response from an incoming request.

## Setup required to run locally

- Node.js (v21.6.0 or above) and PostgresQL (v14.11 or above).
- Clone this repository to your local machine using the URL [https://github.com/marcusyoung/nc-news-api.git](https://github.com/marcusyoung/nc-news-api.git).
- Run `npm -i` to install any dependencies.
- create .env files to hold the test and development database names (see below for further details).
- Seed the local database by running `npm run setup-dbs`.

### Defining environment variables

Two files: `.env.test` and `.env.development` must be created at the top level of the file structure. These should define the environment variable `PGDATABASE` for the test and development database respectively. Set `PGDATABASE` to equal the name used for the relevant database in your local setup. The two files should be git ignored. 

It is assumed that the password to connect to your PostgreSQL database has been saved to a .pgpass file in your home folder. If not, you may need to define additional environment variables in the .env files.

## Running tests

- Unit and integration test can be run using: `npm test`
- To run only integration tests use: `npm test app`
- To run only unit tests use: `npm test utils`

When running the integration tests, the test database will be seeded with the test data prior to each test being run.
