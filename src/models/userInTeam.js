import dynamoose from 'dynamoose';

const userInTeamSchema = {
  userEmail: {
    type: String,
    hashKey: true,
  },
  teamId: String,
  pending: Boolean,
};

const UserInTeamModel = dynamoose.model('UserInTeam', userInTeamSchema, {create: false});

export default UserInTeamModel;
