const coachSpecilisationSchema = require("../schemas/CoachSpecilisationSchema");
const BaseUtility = require("./BaseUtility");

class CoachSpecilisationUtility extends BaseUtility {
  constructor() {
    super(coachSpecilisationSchema);
  }
}

module.exports = CoachSpecilisationUtility;
