const FootCoachSchema = require("../schemas/FootCoachSchema");
const BaseUtility = require("./BaseUtility");

class FootCoachUtility extends BaseUtility {
  constructor() {
    super(FootCoachSchema);
  }
}

module.exports = FootCoachUtility;
