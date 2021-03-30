import UserInTeamModel from '../models/userInTeam';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: 'us-east-2',
  signatureVersion: 'v4',
});
const bucket = 'standup-master-dev';


/*
 * To determine if user1 is allowed to view user2
 */
const checkTwoUsersInSameTeam = async (userEmail1, userEmail2) => {
  const userInTeam1 = await UserInTeamModel.get(userEmail1);
  const userInTeam2 = await UserInTeamModel.get(userEmail2);

  // shortcut to allow user not in a team to view himself
  if (userInTeam1 === undefined && userEmail1 === userEmail2) {
    return true;
  }

  if (userInTeam1 === undefined || userInTeam2 === undefined || userInTeam1.teamId !== userInTeam2.teamId) {
    return false;
  }

  return true;
};

const generateSignedUrlForProfilePicture = async (path) => {
  const url = await s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: `profile-pictures/${path}/picture`,
    Expires: 24 * 60 * 60,
  });
  return url;
};

const setDefaultProfilePicture = async (path, isTeam) => {
  const CopySource = `/${bucket}/default-${isTeam ? 'team-' : ''}profile-picture`;
  await s3.copyObject({
    Bucket: bucket,
    CopySource,
    Key: `profile-pictures/${path}/picture`,
  }).promise();
};

const uploadProfilePicture = async (path, picture) => {
  await s3.putObject({
    Bucket: bucket,
    Key: `profile-pictures/${path}/picture`,
    Body: picture,
  }).promise();
};

export {
  checkTwoUsersInSameTeam,
  generateSignedUrlForProfilePicture,
  setDefaultProfilePicture,
  uploadProfilePicture,
};
