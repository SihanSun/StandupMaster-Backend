import dynamoose from 'dynamoose';

const userInTeamSchema = {
  userEmail: {
    type: String,
    hashKey: true,
  },
  teamId: String,
};

const UserInTeamModel = dynamoose.model('UserInTeam', userInTeamSchema, {create: false});

export default UserInTeamModel;
