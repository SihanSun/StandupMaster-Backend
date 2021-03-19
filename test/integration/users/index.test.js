import request from 'supertest';
import jwtEncode from 'jwt-encode';

import app from 'src/app';
import UserModel from 'src/models/user';

jest.mock('src/models/user', () => {
  return {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
});


const user = {
  email: 'cs439@yale.edu',
  displayName: 'StandupMaster',
  firstName: 'Standup',
  lastName: 'Master',
};
const token = 'Bearer ' + jwtEncode({email: user.email}, 'secret');


describe('GET /users/{email}', () => {
  const url = `/users/${user.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user not exists', (done) => {
    UserModel.get.mockResolvedValue(undefined);

    request(app)
        .get(url)
        .expect(404)
        .then((response) => {
          expect(UserModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
          done();
        });
  });

  it('should work', (done) => {
    UserModel.get.mockResolvedValue(user);

    request(app)
        .get(url)
        .expect(200)
        .then((response) => {
          expect(UserModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
          expect(response.body)
              .toEqual(user);
          done();
        });
  });
});


describe('PUT /users/{email}', () => {
  const url = `/users/${user.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if displayName missing', (done) => {
    request(app)
        .put(url)
        .expect(400, done);
  });

  it('should return 401 if requester email mismatch', (done) => {
    request(app)
        .put(url)
        .send(user)
        .set('Authorization', jwtEncode({email: 'bad@email.com'}, 'secret'))
        .expect(401, done);
  });

  it('should return 404 if user not found', (done) => {
    UserModel.get.mockResolvedValue(undefined);

    request(app)
        .put(url)
        .send(user)
        .set('Authorization', token)
        .expect(404)
        .then((response) => {
          expect(UserModel.get).toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    const oldUser = {
      email: 'cs439@yale.edu',
      displayName: 'StandupBeginner',
      firstName: 'Standup',
      lastName: 'Beginner',
    };
    const body = {
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    UserModel.get.mockResolvedValue(oldUser);
    UserModel.update.mockResolvedValue(user);

    request(app)
        .put(url)
        .send(body)
        .set('Authorization', token)
        .expect(200)
        .then((response) => {
          expect(UserModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
          expect(UserModel.update)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user);
          expect(response.body)
              .toEqual(user);
          done();
        });
  });
});


describe('POST /users/{email}', () => {
  const url = `/users`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no email', (done) => {
    const body = {};

    request(app)
        .post(url)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if bad email', (done) => {
    const body = {
      email: 'bad email',
    };

    request(app)
        .post(url)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if no displayName', (done) => {
    const body = {
      email: user.email,
    };

    request(app)
        .post(url)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if user already exists', (done) => {
    UserModel.create.mockRejectedValue(undefined);

    request(app)
        .post(url)
        .send(user)
        .expect(400)
        .then((response) => {
          expect(UserModel.create)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user);
          done();
        });
  });

  it('should work', (done) => {
    UserModel.create.mockResolvedValue(user);

    request(app)
        .post(url)
        .send(user)
        .expect(200)
        .then((response) => {
          expect(UserModel.create)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user);
          expect(response.body)
              .toEqual(user);
          done();
        });
  });
});
