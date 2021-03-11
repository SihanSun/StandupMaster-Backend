const express = require('express');

const swagger = require('./swagger.js');
const teams = require('./routes/teams.js');

const app = express();
const port = 3000;

app.use('/docs', swagger);
app.use('/teams', teams);

if (!process.env.LAMBDA) {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}

module.exports = app;
