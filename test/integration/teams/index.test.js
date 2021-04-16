import request from 'supertest';
import jwtEncode from 'jwt-encode';

import app from 'src/app';
import helpers from 'src/utils/helpers';
import UserModel from 'src/models/user';
import UserStatus from 'src/models/userStatus';
import UserInTeamModel from 'src/models/userInTeam';
import TeamModel from 'src/models/team';

jest.mock('src/models/user', () => {
  return {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    batchGet: jest.fn(),
  };
});
jest.mock('src/models/userStatus', () => {
  return {
    create: jest.fn(),
  };
});
jest.mock('src/models/userInTeam', () => {
  return {
    get: jest.fn(),
    create: jest.fn(),
  };
});
jest.mock('src/models/team', () => {
  return {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
});
jest.mock('src/utils/helpers', () => {
  return {
    checkTwoUsersInSameTeam: jest.fn(),
    generateSignedUrlForProfilePicture: jest.fn(),
    uploadProfilePicture: jest.fn(),
    setDefaultProfilePicture: jest.fn(),
  };
});

const owner = {
  email: 'cs539@yale.edu',
};
const ownerToken = 'Bearer ' + jwtEncode({email: owner.email}, 'secret');

const member = {
  email: 'cs439@yale.edu',
  displayName: 'StandupMaster',
  firstName: 'Standup',
  lastName: 'Master',
};
const memberToken = 'Bearer ' + jwtEncode({email: member.email}, 'secret');

const outSider = {
  email: 'cs000@yale.edu',
};
const outSiderToken = 'Bearer ' + jwtEncode({email: outSider.email}, 'secret');

const userInTeam = {
  userEmail: owner.email,
  teamId: 'team1',
  pending: false,
};

const team = {
  id: 'team1',
  name: 'team1',
  ownerEmail: owner.email,
  memberEmails: [owner.email],
  pendingMemberEmails: [],
};

const teamNew = {
  id: 'team1',
  name: 'team2',
  ownerEmail: owner.email,
  memberEmails: [owner.email],
  pendingMemberEmails: [member.email],
};

describe('GET /teams/{id}', () => {
  const url = `/teams/${team.id}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if the team doesn\'t exists', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    request(app)
        .get(url+'foo')
        .set('Authorization', ownerToken)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(team.id+'foo');
          done();
        });
  });

  it('should return 401 if requester not in the team', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .get(url)
        .set('Authorization', outSiderToken)
        .expect(401, done);
  });

  it('should return the team info if the requester is in the team', (done) => {
    UserModel.batchGet.mockResolvedValue([owner]);
    UserInTeamModel.get.mockResolvedValue(userInTeam);
    TeamModel.get.mockResolvedValue({...team});
    helpers.generateSignedUrlForProfilePicture.mockResolvedValue('url');

    request(app)
        .get(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(team.id);
          done();
        });
  });

  it('should return the team info with pending memeber if the requester is in the team', (done) => {
    UserModel.batchGet.mockResolvedValue([owner]);
    UserInTeamModel.get.mockResolvedValue(userInTeam);
    TeamModel.get.mockResolvedValue({...teamNew});
    helpers.generateSignedUrlForProfilePicture.mockResolvedValue('url');

    request(app)
        .get(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1)
              .toHaveBeenCalledWith(teamNew.id);
          done();
        });
  });
});

describe('POST /teams', () => {
  const url = `/teams`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if bad token', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    const body = {
      name: team.name,
      ownerEmail: owner.email,
    };

    request(app)
        .post(url)
        .set('Authorization', outSiderToken)
        .send(body)
        .expect(401, done);
  });

  it('should return 400 if user already in a team', (done) => {
    UserInTeamModel.get.mockResolvedValue(userInTeam);

    const body = {
      name: team.name,
      ownerEmail: owner.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if team already exists', (done) => {
    TeamModel.create.mockResolvedValue({...team});
    UserInTeamModel.create.mockResolvedValue(userInTeam);
    UserInTeamModel.get.mockResolvedValue(undefined);
    UserInTeamModel.create.mockRejectedValue(undefined);

    const body = {
      name: team.name,
      ownerEmail: owner.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(400, done);
  });

  it('should create the team', (done) => {
    TeamModel.create.mockResolvedValue({...team});
    UserInTeamModel.create.mockResolvedValue(userInTeam);
    UserInTeamModel.get.mockResolvedValue(undefined);

    const body = {
      name: team.name,
      ownerEmail: owner.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(TeamModel.create)
              .toHaveBeenCalledTimes(1);
          expect(UserInTeamModel.create)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });
});


describe('PUT /teams/{id}', () => {
  const url = `/teams/${team.id}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team does not exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    const body = {
      name: team.name,
      ownerEmail: owner.email,
    };

    request(app)
        .put(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(404, done);
  });

  it('should return 401 if bad token', (done) => {
    TeamModel.get.mockResolvedValue(team);

    const body = {
      name: team.name,
      ownerEmail: owner.email,
    };

    request(app)
        .put(url)
        .set('Authorization', outSiderToken)
        .send(body)
        .expect(401, done);
  });

  it('should return 401 if try to change owner', (done) => {
    TeamModel.get.mockResolvedValue(team);

    const body = {
      name: team.name,
      ownerEmail: member.email,
    };

    request(app)
        .put(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(401, done);
  });

  it('should update the team', (done) => {
    TeamModel.get.mockResolvedValue(team);
    TeamModel.update.mockResolvedValue(teamNew);

    const body = {
      name: teamNew.name,
      ownerEmail: owner.email,
    };

    request(app)
        .put(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.name)
              .toEqual(teamNew.name);
          done();
        });
  });

  it('should update the team with picture', (done) => {
    TeamModel.get.mockResolvedValue(team);
    TeamModel.update.mockResolvedValue(teamNew);
    helpers.uploadProfilePicture.mockResolvedValue();

    const body = {
      name: teamNew.name,
      ownerEmail: owner.email,
      profilePicture: 'url',
    };

    request(app)
        .put(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.name)
              .toEqual(teamNew.name);
          done();
        });
  });
});
