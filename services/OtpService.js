const Promise = require("bluebird");
const errors = require("../errors");
const LoginUtility = require("../db/utilities/LoginUtility");
const PlayerUtility = require("../db/utilities/PlayerUtility");
const coacheUtility = require("../db/utilities/CoacheUtility");
const ClubAcademyUtility = require("../db/utilities/ClubAcademyUtility");
const UserService = require("./UserService");
const uuid = require("uuid/v4");
const OtpUtility = require("../db/utilities/OtpUtility");
const EmailService = require("./EmailService");
const config = require("../config");
const _ = require("lodash");
const ResponseMessage = require("../constants/ResponseMessage");

class OtpService {
  constructor() {
    this.otpUtilityInst = new OtpUtility();
    this.loginUtility = new LoginUtility();
    this.emailService = new EmailService();
  }

  async otp_generate(email, account_active_url, name) {
    try {
      // Function to generate OTP

      let digits = "0123456789";
      let OTP = "";
      let len = digits.length;
      for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * len)];
      }
      const requetData = {
        email: email,
        otp: OTP,
        name: name,
      };
      const returnData = await this.otpUtilityInst.insertOtp(requetData);
      this.emailService.emailVerification(email, OTP);
      console.log("data insert in otp schema");
      console.log(returnData);
      return OTP;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  async otpVerify(bodyObj) {
    try {
      const returnData = await this.otpUtilityInst.otpVerify(bodyObj);

      if (!returnData) {
        console.log("insde nulll");
        throw new errors.NotFound();
      } else {
        console.log("gdsg", returnData);
        //  const obj = {}
        //  obj.username = returnData.email
        //  obj.status= 'pending'
        //  const fetchtken = await this.loginUtility.findOneForToken(obj)
        //  console.log("fpttt",fetchtken)
        // returnData[account_activate_token] = fetchtken;
        //   console.log("final",returnData)
        return returnData;
      }

      // throw new errors.Unauthorized("otp not found");
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = OtpService;
