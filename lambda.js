const serverlessExpress = require('@vendia/serverless-express');

process.env.LAMBDA = true;
const app = require('./dist/app.js').default;

module.exports = serverlessExpress({app});
