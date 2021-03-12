const express = require('express');
const cors = require('cors');

const swagger = require('./swagger.js');
const teams = require('./routes/teams.js');
const users = require('./routes/users.js');

const app = express();
const port = 3000;

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use('/docs', swagger);
app.use('/teams', teams);
app.use('/users', users);

if (!process.env.LAMBDA) {
  require('./aws');
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}

module.exports = app;
