const errors = require("../errors");
const ResponseMessage = require("../constants/ResponseMessage");
const CoachRoleUtility = require("../db/utilities/CoachRoleUtility");
const CoachTraningStyleUtility = require("../db/utilities/CoachTraningStyleUtility");
const coachSpecilisationUtility = require("../db/utilities/CoachSpecilisationUtility");
const MemberType = require("../constants/MemberType");


class CoachService {
  constructor() {
    this.coachRoleUtilityInst = new CoachRoleUtility();
    this.coachSpecilisationUtilityInst = new coachSpecilisationUtility();
    this.coachTraningStyleUtilityInst = new CoachTraningStyleUtility();
  }

  async getCoachRole() {
    
    let result = await this.coachRoleUtilityInst.find({});
  
    const resultArray = [];
    resultArray.push(result);
    if (!result) {
      throw new errors.NotFound(ResponseMessage.USER_NOT_FOUND);
    }
   
    return resultArray;
  }

  async getSpecilisation() {
    console.log("inside find coach role");
    let result = await this.coachSpecilisationUtilityInst.find({});
    console.log("result of coach specilisation", result);
    const resultArray = [];
    resultArray.push(result);
    if (!result) {
      throw new errors.NotFound(ResponseMessage.USER_NOT_FOUND);
    }
  
    return resultArray;
  }
 
  async getTraningStyle() {
    console.log("inside find coach role");
    let result = await this.coachTraningStyleUtilityInst.find({});

    const resultArray = [];
    resultArray.push(result);
    if (!result) {
      throw new errors.NotFound(ResponseMessage.USER_NOT_FOUND);
    }
    
    return resultArray;
  }
}

module.exports = CoachService;
