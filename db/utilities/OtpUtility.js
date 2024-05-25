const otpSchema = require("../schemas/OtpSchema");
const BaseUtility = require("./BaseUtility");

class OtpUtility extends BaseUtility {
  constructor() {
    super(otpSchema);
  }
}

module.exports = OtpUtility;
