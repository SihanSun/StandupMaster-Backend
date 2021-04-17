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
    create: jest.fn((e) => e),
    update: jest.fn((e) => e),
    batchGet: jest.fn(),
  };
});
jest.mock('src/models/userStatus', () => {
  return {
    create: jest.fn((e) => e),
  };
});
jest.mock('src/models/userInTeam', () => {
  return {
    get: jest.fn(),
    create: jest.fn((e) => e),
    update: jest.fn((e) => e),
    delete: jest.fn(),
    batchDelete: jest.fn(),
  };
});
jest.mock('src/models/team', () => {
  return {
    get: jest.fn(),
    create: jest.fn((e) => e),
    update: jest.fn((e) => e),
    delete: jest.fn(),
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
        .expect(400)
        .then(() => {
          UserInTeamModel.create = jest.fn((e) => e);
          done();
        });
  });

  it('should create the team', (done) => {
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

describe('POST /teams/{id}/members', () => {
  const url = `/teams/${team.id}/members`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if the team doesn\'t exists', (done) => {
    TeamModel.get.mockResolvedValue(undefined);
    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(404, done);
  });

  it('should return 400 if user does not exist', (done) => {
    TeamModel.get.mockResolvedValue({...team});
    UserModel.get.mockResolvedValue(undefined);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(400, done);
  });


  it('should return 401 if bad token', (done) => {
    TeamModel.get.mockResolvedValue({...team});
    UserModel.get.mockResolvedValue(member);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', outSiderToken)
        .send(body)
        .expect(401, done);
  });

  it('should return 400 if user already in this team', (done) => {
    TeamModel.get.mockResolvedValue({...team});
    UserInTeamModel.get.mockResolvedValue(undefined);
    UserModel.get.mockResolvedValue(owner);

    const body = {
      email: owner.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if user already in another team', (done) => {
    const memberInTeam = {
      userEmail: member.email,
      teamId: 'team2',
      pending: false,
    };

    TeamModel.get.mockResolvedValue({...team});
    UserInTeamModel.get.mockResolvedValue(memberInTeam);
    UserModel.get.mockResolvedValue(member);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(400, done);
  });

  it('should add the team member', (done) => {
    UserModel.get.mockResolvedValue(member);
    TeamModel.get.mockResolvedValue({...team});
    UserInTeamModel.get.mockResolvedValue(undefined);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(UserInTeamModel.create)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.memberEmails)
              .toContain(member.email);
          done();
        });
  });

  it('should add the team member and remove it from pending', (done) => {
    const teamWPending = {
      id: 'team1',
      name: 'team1',
      ownerEmail: owner.email,
      memberEmails: [owner.email],
      pendingMemberEmails: [member.email],
    };
    const memberInTeam = {
      userEmail: member.email,
      teamId: team.id,
      pending: true,
    };
    UserModel.get.mockResolvedValue(member);
    TeamModel.get.mockResolvedValue({...teamWPending});
    UserInTeamModel.get.mockResolvedValue(memberInTeam);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(UserInTeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.memberEmails)
              .toContain(member.email);
          expect(response.body.pendingMemberEmails)
              .not.toContain(member.email);
          done();
        });
  });
});


describe('DELETE /teams/{id}/members/{email}', () => {
  const url = `/teams/${team.id}/members/${member.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 401 if requestor is not owner nor member to be removed', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(401)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 400 if trying to remove owner', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(`/teams/${team.id}/members/${owner.email}`)
        .set('Authorization', ownerToken)
        .expect(400)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 400 if member is not in the team', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(`/teams/${team.id}/members/${outSider.email}`)
        .set('Authorization', ownerToken)
        .expect(400)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    TeamModel.get.mockResolvedValue({...team, memberEmails: [member.email, 'user1@yale.edu']});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(UserInTeamModel.delete)
              .toHaveBeenCalledTimes(1);
          expect(response.body.memberEmails)
              .toEqual(['user1@yale.edu']);
          done();
        });
  });
});

describe('POST /teams/{id}/pending_members', () => {
  const url = `/teams/${team.id}/pending_members`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if the team doesn\'t exists', (done) => {
    TeamModel.get.mockResolvedValue(undefined);
    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', memberToken)
        .send(body)
        .expect(404, done);
  });

  it('should return 400 if user does not exist', (done) => {
    TeamModel.get.mockResolvedValue({...team});
    UserModel.get.mockResolvedValue(undefined);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', memberToken)
        .send(body)
        .expect(400, done);
  });


  it('should return 401 if bad token', (done) => {
    TeamModel.get.mockResolvedValue({...team});
    UserModel.get.mockResolvedValue(member);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', outSiderToken)
        .send(body)
        .expect(401, done);
  });

  it('should return 400 if user already in this team', (done) => {
    const teamWMember = {
      id: 'team1',
      name: 'team1',
      ownerEmail: owner.email,
      memberEmails: [owner.email, member.email],
      pendingMemberEmails: [],
    };
    TeamModel.get.mockResolvedValue({...teamWMember});
    UserInTeamModel.get.mockResolvedValue(undefined);
    UserModel.get.mockResolvedValue(member);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', memberToken)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if user already pending', (done) => {
    const teamWMember = {
      id: 'team1',
      name: 'team1',
      ownerEmail: owner.email,
      memberEmails: [owner.email],
      pendingMemberEmails: [member.email],
    };
    TeamModel.get.mockResolvedValue({...teamWMember});
    UserInTeamModel.get.mockResolvedValue(undefined);
    UserModel.get.mockResolvedValue(member);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', memberToken)
        .send(body)
        .expect(400, done);
  });

  it('should return 400 if user already in another team', (done) => {
    const teamWOMember = {
      id: 'team1',
      name: 'team1',
      ownerEmail: owner.email,
      memberEmails: [owner.email],
      pendingMemberEmails: [],
    };

    const memberInTeam = {
      userEmail: member.email,
      teamId: 'team2',
      pending: false,
    };

    TeamModel.get.mockResolvedValue({...teamWOMember});
    UserInTeamModel.get.mockResolvedValue(memberInTeam);
    UserModel.get.mockResolvedValue(member);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', memberToken)
        .send(body)
        .expect(400, done);
  });

  it('should add the team member as pending', (done) => {
    const teamWOMember = {
      id: 'team1',
      name: 'team1',
      ownerEmail: owner.email,
      memberEmails: [owner.email],
      pendingMemberEmails: [],
    };
    UserModel.get.mockResolvedValue(member);
    TeamModel.get.mockResolvedValue({...teamWOMember});
    UserInTeamModel.get.mockResolvedValue(undefined);

    const body = {
      email: member.email,
    };

    request(app)
        .post(url)
        .set('Authorization', memberToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(UserInTeamModel.create)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.pendingMemberEmails)
              .toContain(member.email);
          done();
        });
  });
});


describe('DELETE /teams/{id}/pending_members/{email}', () => {
  const url = `/teams/${team.id}/pending_members/${member.email}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 401 if requestor is not owner nor pending member to be removed', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(401)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 400 if member is not a pending member', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(400)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    TeamModel.get.mockResolvedValue({...team, pendingMemberEmails: [member.email]});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(UserInTeamModel.delete)
              .toHaveBeenCalledTimes(1);
          expect(response.body.pendingMemberEmails)
              .toEqual([]);
          done();
        });
  });
});


describe('PUT /teams/{id}/announcement', () => {
  const url = `/teams/${team.id}/announcement`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    request(app)
        .put(url)
        .set('Authorization', outSiderToken)
        .send({...team, announcement: 'no meeting today'})
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 401 if requestor is not owner', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .put(url)
        .set('Authorization', outSiderToken)
        .send({...team, announcement: 'no meeting today'})
        .expect(401)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .put(url)
        .set('Authorization', ownerToken)
        .send({...team, announcement: 'no meeting today'})
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.announcement)
              .toEqual('no meeting today');
          done();
        });
  });
});


describe('POST /teams/{id}/meetings', () => {
  const url = `/teams/${team.id}/meetings`;
  const meeting = {
    name: 'standup',
    description: 'share your work',
    weekdayTime: ['9am'],
  };
  const teamWithMeetings = {
    id: 'team1',
    name: 'team1',
    ownerEmail: owner.email,
    meetings: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    const body = {
      ...meeting,
    };

    request(app)
        .post(url)
        .set('Authorization', outSiderToken)
        .send(body)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 401 if requestor is not owner', (done) => {
    TeamModel.get.mockResolvedValue(teamWithMeetings);

    const body = {...meeting};

    request(app)
        .post(url)
        .set('Authorization', outSiderToken)
        .send(body)
        .expect(401)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 400 if meeting name already exist', (done) => {
    TeamModel.get.mockResolvedValue({...teamWithMeetings, meetings: [meeting]});

    const body = {...meeting};

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(400)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    TeamModel.get.mockResolvedValue({...teamWithMeetings});

    const body = {...meeting};

    request(app)
        .post(url)
        .set('Authorization', ownerToken)
        .send(body)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.meetings)
              .toEqual([meeting]);
          done();
        });
  });
});

describe('DELETE /teams/{id}/meetings/{meetingName}', () => {
  const meeting = {
    name: 'standup',
    description: 'share your work',
    weekdayTime: ['9am'],
  };
  const url = `/teams/${team.id}/meetings/${meeting.name}`;
  const teamWithMeetings = {
    id: 'team1',
    name: 'team1',
    ownerEmail: owner.email,
    meetings: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 401 if requestor is not owner', (done) => {
    TeamModel.get.mockResolvedValue(teamWithMeetings);

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(401)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 404 if meeting doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue({...teamWithMeetings});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    TeamModel.get.mockResolvedValue({...teamWithMeetings, meetings: [meeting]});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.update)
              .toHaveBeenCalledTimes(1);
          expect(response.body.meetings)
              .toEqual([]);
          done();
        });
  });
});

describe('DELETE /teams/{id}', () => {
  const url = `/teams/${team.id}`;
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if team doesn\'t exist', (done) => {
    TeamModel.get.mockResolvedValue(undefined);

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(404)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should return 401 if requestor is not owner', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(url)
        .set('Authorization', outSiderToken)
        .expect(401)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work with no pendingMemberEmails', (done) => {
    TeamModel.get.mockResolvedValue({...team});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.delete)
              .toHaveBeenCalledTimes(1);
          expect(UserInTeamModel.batchDelete)
              .toHaveBeenCalledTimes(1);
          done();
        });
  });

  it('should work', (done) => {
    TeamModel.get.mockResolvedValue({...team, pendingMemberEmails: ['user1@yale.edu']});

    request(app)
        .delete(url)
        .set('Authorization', ownerToken)
        .expect(200)
        .then((response) => {
          expect(TeamModel.get)
              .toHaveBeenCalledTimes(1);
          expect(TeamModel.delete)
              .toHaveBeenCalledTimes(1);
          expect(UserInTeamModel.batchDelete)
              .toHaveBeenCalledTimes(2);
          done();
        });
  });
});
