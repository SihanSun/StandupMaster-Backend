import {when} from 'jest-when';
import AWS from 'aws-sdk';

import * as helpers from 'src/utils/helpers';
import UserInTeamModel from 'src/models/userInTeam';

jest.mock('src/models/userInTeam', () => {
  return {
    get: jest.fn(),
  };
});

jest.mock('aws-sdk', () => {
  const mockS3Client = {
    getSignedUrl: jest.fn(() => 'url'),
    copyObject: jest.fn(() => ({promise: jest.fn()})),
    putObject: jest.fn(() => ({promise: jest.fn()}))
  };
  return {
    S3: jest.fn(() => mockS3Client),
  };
});

describe('checkTwoUsersInSameTeam', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if requester is not in a team but tries to view himself', async (done) => {
    UserInTeamModel.get.mockResolvedValue(undefined);

    expect(await helpers.checkTwoUsersInSameTeam('user1', 'user1'))
        .toEqual(true);
    done();
  });

  it('should return false if requester is not in the same team as user', async (done) => {
    // case 1
    when(UserInTeamModel.get).calledWith('user1').mockResolvedValue(undefined);

    expect(await helpers.checkTwoUsersInSameTeam('user1', 'user2'))
        .toEqual(false);
    
    jest.clearAllMocks();

    // case 2
    when(UserInTeamModel.get).calledWith('user1').mockResolvedValue({teamId: 'team1'});
    when(UserInTeamModel.get).calledWith('user2').mockResolvedValue(undefined);

    expect(await helpers.checkTwoUsersInSameTeam('user1', 'user2'))
        .toEqual(false);

    jest.clearAllMocks();

    // case 3
    when(UserInTeamModel.get).calledWith('user1').mockResolvedValue({teamId: 'team1'});
    when(UserInTeamModel.get).calledWith('user2').mockResolvedValue({teamId: 'team2'});

    expect(await helpers.checkTwoUsersInSameTeam('user1', 'user2'))
        .toEqual(false);

    done();
  });

  it('should return true if requester is in the same team as user', async (done) => {
    when(UserInTeamModel.get).calledWith('user1').mockResolvedValue({teamId: 'team1'});
    when(UserInTeamModel.get).calledWith('user2').mockResolvedValue({teamId: 'team1'});

    expect(await helpers.checkTwoUsersInSameTeam('user1', 'user2'))
        .toEqual(true);

    done();
  });
});

it('generateSignedUrlForProfilePicture', async () => {
  const s3Client = new AWS.S3();
  expect(await helpers.generateSignedUrlForProfilePicture('user1'))
      .toEqual('url');
  expect(s3Client.getSignedUrl).toHaveBeenCalledTimes(1);
});

it('setDefaultProfilePicture', async () => {
  const s3Client = new AWS.S3();
  await helpers.setDefaultProfilePicture('user1', true);
  expect(s3Client.copyObject).toHaveBeenCalledTimes(1);

  await helpers.setDefaultProfilePicture('user1', false);
  expect(s3Client.copyObject).toHaveBeenCalledTimes(2);
});

it('uploadProfilePicture', async () => {
  const s3Client = new AWS.S3();
  await helpers.uploadProfilePicture('user1', 'image');
  expect(s3Client.putObject).toHaveBeenCalledTimes(1);
});