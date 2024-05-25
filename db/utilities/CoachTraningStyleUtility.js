const coachTraningStyleSchema = require("../schemas/CoachTraningStyleSchema");
const BaseUtility = require("./BaseUtility");

class CoachTraningStyleUtility extends BaseUtility {
  constructor() {
    super(coachTraningStyleSchema);
  }
}

module.exports = CoachTraningStyleUtility;
