const coacheSchema = require("../schemas/CoacheSchema");
const BaseUtility = require("./BaseUtility");

class coacheUtility extends BaseUtility {
  constructor() {
    super(coacheSchema);
  }
}

module.exports = coacheUtility;
