const TraningCenterSchema = require("../schemas/TraningCenterSchema");
const BaseUtility = require("./BaseUtility");

class TraningCenterUtility extends BaseUtility {
  constructor() {
    super(TraningCenterSchema);
  }
}

module.exports = TraningCenterUtility;
