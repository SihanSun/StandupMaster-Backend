import UserInTeamModel from '../models/userInTeam';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {S3Client, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';

const checkTwoUsersInSameTeam = async (userEmail1, userEmail2) => {
  const userInTeam1 = await UserInTeamModel.get(userEmail1);
  const userInTeam2 = await UserInTeamModel.get(userEmail2);

  if (userInTeam1 === undefined || userInTeam2 === undefined || userInTeam1.teamId !== userInTeam2.teamId) {
    return false;
  }

  return true;
};

const generateSignedUrlForProfilePicture = async (email) => {
  const client = new S3Client({region: 'us-east-2'});
  const command = new GetObjectCommand({
    Bucket: 'standup-master-dev',
    Key: `profile-pictures/${email}`,
    Region: 'us-east-2',
  });
  const url = await getSignedUrl(client, command, {expiresIn: 24 * 60 * 60}); // expire in 1 day
  return url;
};

const uploadProfilePicture = async (email, picture) => {
  const client = new S3Client({region: 'us-east-2'});
  const command = new PutObjectCommand({
    Bucket: 'standup-master-dev',
    Key: `profile-pictures/${email}`,
    Region: 'us-east-2',
    Body: picture,
  });
  await client.send(command);
};

export {
  checkTwoUsersInSameTeam,
  generateSignedUrlForProfilePicture,
  uploadProfilePicture,
};
