const coacheRoleSchema = require("../schemas/CoachRoleSchema");
const BaseUtility = require("./BaseUtility");

class CoachRoleUtility extends BaseUtility {
  constructor() {
    super(coacheRoleSchema);
  }
}

module.exports = CoachRoleUtility;
