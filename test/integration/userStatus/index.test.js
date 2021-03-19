import request from 'supertest';
import jwtEncode from 'jwt-encode';

import app from 'src/app';
import UserStatusModel from 'src/models/userStatus';


jest.mock('src/models/userStatus', () => {
  return {
    get: jest.fn(),
    update: jest.fn(),
  };
});


const userStatus = {
  email: 'cs439@yale.edu',
  isBlocked: true,
  presentation: {
    prevWork: 'task1',
    planToday: 'task2',
  },
};
const token = 'Bearer ' + jwtEncode({email: userStatus.email}, 'secret');


describe('GET /user-status/{email}', () => {
  const url = `/user-status/${userStatus.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user not exists', (done) => {
    UserStatusModel.get.mockResolvedValue(undefined);

    request(app)
        .get(url)
        .expect(404)
        .then((response) => {
          expect(UserStatusModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(userStatus.email);
          done();
        });
  });

  it('should work', (done) => {
    UserStatusModel.get.mockResolvedValue(userStatus);

    request(app)
        .get(url)
        .expect(200)
        .then((response) => {
          expect(UserStatusModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(userStatus.email);
          expect(response.body)
              .toEqual(userStatus);
          done();
        });
  });
});


describe('PUT /user-status/{email}', () => {
  const url = `/user-status/${userStatus.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if isBlocked missing', (done) => {
    request(app)
        .put(url)
        .expect(400, done);
  });

  it('should return 400 if presentation missing', (done) => {
    request(app)
        .put(url)
        .send({isBlocked: true})
        .expect(400, done);
  });

  it('should return 400 if presentation wrong schema', (done) => {
    request(app)
        .put(url)
        .send({isBlocked: true, presentation: {planTomorrow: 'task3'}})
        .expect(400, done);
  });

  it('should return 401 if requester email mismatch', (done) => {
    request(app)
        .put(url)
        .send(userStatus)
        .set('Authorization', jwtEncode({email: 'bad@email.com'}, 'secret'))
        .expect(401, done);
  });

  it('should return 404 if user not found', (done) => {
    UserStatusModel.get.mockResolvedValue(undefined);

    request(app)
        .put(url)
        .send(userStatus)
        .set('Authorization', token)
        .expect(404)
        .then((response) => {
          expect(UserStatusModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(userStatus.email);
          done();
        });
  });

  it('should work', (done) => {
    const oldUserStatus = {
      email: userStatus.email,
      isBlocked: false,
      presentation: {
        prevWork: 'task10',
        planToday: 'task20',
      },
    };
    const body = {
      isBlocked: userStatus.isBlocked,
      presentation: userStatus.presentation,
    };

    UserStatusModel.get.mockResolvedValue(oldUserStatus);
    UserStatusModel.update.mockResolvedValue(userStatus);

    request(app)
        .put(url)
        .send(body)
        .set('Authorization', token)
        .expect(200)
        .then((response) => {
          expect(UserStatusModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(userStatus.email);
          expect(UserStatusModel.update)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(userStatus);
          expect(response.body)
              .toEqual(userStatus);
          done();
        });
  });
});
