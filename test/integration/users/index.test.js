import request from 'supertest';
import jwtEncode from 'jwt-encode';

import app from 'src/app';
import helpers from 'src/utils/helpers';
import UserModel from 'src/models/user';
import UserStatus from 'src/models/userStatus';
import TeamModel from 'src/models/team';
import UserInTeamModel from 'src/models/userInTeam';

jest.mock('src/models/user', () => {
  return {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
});
jest.mock('src/models/userStatus', () => {
  return {
    create: jest.fn(),
  };
});
jest.mock('src/models/team', () => {
  return {
    get: jest.fn(),
  };
});
jest.mock('src/models/userInTeam', () => {
  return {
    get: jest.fn(),
  };
});
jest.mock('src/utils/helpers', () => {
  return {
    checkTwoUsersInSameTeam: jest.fn(),
  };
});

const requester = {
  email: 'cs539@yale.edu',
};
const requesterToken = 'Bearer ' + jwtEncode({email: requester.email}, 'secret');

const user = {
  email: 'cs439@yale.edu',
  displayName: 'StandupMaster',
  firstName: 'Standup',
  lastName: 'Master',
};
const token = 'Bearer ' + jwtEncode({email: user.email}, 'secret');
const userInTeam = {
  userEmail: user.email,
  teamId: 'team1',
};

describe('GET /users/{email}', () => {
  const url = `/users/${user.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if requester and user not in same team', (done) => {
    helpers.checkTwoUsersInSameTeam.mockResolvedValue(false);

    request(app)
        .get(url)
        .set('Authorization', requesterToken)
        .expect(401)
        .then((response) => {
          expect(helpers.checkTwoUsersInSameTeam)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(requester.email, user.email);
          done();
        });
  });

  it('should return with team info if requestor is same as user email', (done) => {
    helpers.checkTwoUsersInSameTeam.mockResolvedValue(true);
    UserModel.get.mockResolvedValue({...user});
    UserInTeamModel.get.mockResolvedValue(userInTeam);
    TeamModel.get.mockResolvedValue({'id': 'team1'});

    request(app)
        .get(url)
        .set('Authorization', token)
        .then((response) => {
          expect(UserModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
          expect(UserInTeamModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith('team1');
          done();
        });
  });

  it('should notreturn with team info if requestor is not the same as user email', (done) => {
    helpers.checkTwoUsersInSameTeam.mockResolvedValue(true);
    UserModel.get.mockResolvedValue({...user});

    request(app)
        .get(url)
        .set('Authorization', requesterToken)
        .expect(200)
        .then((response) => {
          expect(UserModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
          expect(UserInTeamModel.get)
              .toHaveBeenCalledTimes(0);
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
          expect(UserModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user.email);
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

  it('should work and create corresponding UserStatus', (done) => {
    UserModel.create.mockResolvedValue(user);

    request(app)
        .post(url)
        .send(user)
        .expect(200)
        .then((response) => {
          expect(UserModel.create)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(user);
          expect(UserStatus.create)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith({
                email: user.email,
                isBlocked: false,
                presentation: {prevWork: '', planToday: ''},
              });
          expect(response.body)
              .toEqual(user);
          done();
        });
  });
});
