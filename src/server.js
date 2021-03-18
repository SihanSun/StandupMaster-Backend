import app from './app';
import './aws';

const port = 3000;
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
  console.log('docs: https://petstore.swagger.io/?url=http://localhost:3000/docs/api-docs.json');
});
