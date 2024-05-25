const PlayerUtility = require("../db/utilities/PlayerUtility");
const coacheUtility = require("../db/utilities/CoacheUtility");
const ClubAcademyUtility = require("../db/utilities/ClubAcademyUtility");

module.exports = class UtilityService {
  constructor() {
    this.coacheUtility = new coacheUtility();
    this.playerUtilityInst = new PlayerUtility();
    this.clubAcademyUtilityInst = new ClubAcademyUtility();
  }

  async getClubDetails(userID, projection = {}) {
    return await this.clubAcademyUtilityInst.findOne(
      {
        user_id: userID,
      },
      projection
    );
  }
  async getPlayerDetails(userID, projection = {}) {
    return await this.playerUtilityInst.findOne(
      {
        user_id: userID,
      },
      projection
    );
  }
  async getCoachDetails(userID, projection = {}) {
    return await this.coacheUtility.findOne(
      {
        user_id: userID,
      },
      projection
    );
  }
};
