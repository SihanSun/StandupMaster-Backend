var serverlessExpress = require('@vendia/serverless-express');

process.env.LAMBDA = true;
var app = require('./src/index.js');

module.exports = serverlessExpress({ app });
