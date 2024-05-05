const CoacheSchema = require("../schemas/CoacheSchema");
const BaseUtility = require("./BaseUtility");

class CoacheUtility extends BaseUtility {
  constructor() {
    super(CoacheSchema);
  }
}

module.exports = CoacheUtility;
