require('dotenv').config({
  path: `/home/marcus/northcoders/backend/be-nc-news/.env.production`,
});

const password = process.env.DEFAULT_USER_PASSWORD

module.exports = [
  {
    username: 'tickle122',
    name: 'Tom Tickle',
    password: password,
    avatar_url:
      'https://vignette.wikia.nocookie.net/mrmen/images/d/d6/Mr-Tickle-9a.png/revision/latest?cb=20180127221953'
  },
  {
    username: 'grumpy19',
    name: 'Paul Grump',
    password: password,
    avatar_url:
      'https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013'
  },
  {
    username: 'happyamy2016',
    name: 'Amy Happy',
    password: password,
    avatar_url:
      'https://vignette1.wikia.nocookie.net/mrmen/images/7/7f/Mr_Happy.jpg/revision/latest?cb=20140102171729'
  },
  {
    username: 'cooljmessy',
    name: 'Peter Messy',
    password: password,
    avatar_url:
      'https://vignette.wikia.nocookie.net/mrmen/images/1/1a/MR_MESSY_4A.jpg/revision/latest/scale-to-width-down/250?cb=20170730171002'
  },
  {
    username: 'weegembump',
    name: 'Gemma Bump',
    password: password,
    avatar_url:
      'https://vignette.wikia.nocookie.net/mrmen/images/7/7e/MrMen-Bump.png/revision/latest?cb=20180123225553'
  },
  {
    username: 'jessjelly',
    name: 'Jess Jelly',
    password: password,
    avatar_url:
      'https://vignette.wikia.nocookie.net/mrmen/images/4/4f/MR_JELLY_4A.jpg/revision/latest?cb=20180104121141'
  }
];
