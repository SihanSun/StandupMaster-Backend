const serverlessExpress = require('@vendia/serverless-express');

process.env.LAMBDA = true;
const app = require('./src/index.js');

module.exports = serverlessExpress({app});
