import request from 'supertest';

import app from 'src/app';

describe('GET /docs/api-docs.json', () => {
  const url = '/docs/api-docs.json';
  it('should work', (done) => {
    request(app)
        .get(url)
        .expect(200)
        .then(response => {
          done();
        });
  });
});
