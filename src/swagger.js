import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';

const router = new express.Router();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Standup Master API',
    version: '1.0.0',
  },
  basePath: '/',
};

const options = {
  swaggerDefinition,
  apis: process.env.LAMBDA ?
        ['./dist/routes/*.js', './dist/models/*.js'] :
        ['./src/routes/*.js', './src/models/*.js'],
};
const specs = swaggerJsDoc(options);

router.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

export default router;
