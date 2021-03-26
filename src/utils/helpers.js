import UserInTeamModel from '../models/userInTeam';

const checkTwoUsersInSameTeam = async (userEmail1, userEmail2) => {
  const userInTeam1 = await UserInTeamModel.get(userEmail1);
  const userInTeam2 = await UserInTeamModel.get(userEmail2);

  if (userInTeam1 === undefined || userInTeam2 === undefined || userInTeam1.teamId !== userInTeam2.teamId) {
    return false;
  }

  return true;
};

export {checkTwoUsersInSameTeam};
