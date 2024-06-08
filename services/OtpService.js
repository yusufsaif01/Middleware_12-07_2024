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

  async otp_generate(email, name) {
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
      return OTP;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  async otp_generate_for_forgot_password(email, name) {
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
      this.emailService.forgotPassword(email, OTP);
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
        return Promise.reject(
          new errors.OtpNotMatch(ResponseMessage.OTP_NOT_FOUND)
        );
      }
      return returnData;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async otpVerifyForPasswordVerify(bodyObj) {
    try {
      const returnData = await this.otpUtilityInst.otpVerify(bodyObj);

      if (!returnData) {
        return Promise.reject(
          new errors.OtpNotMatch(ResponseMessage.OTP_NOT_FOUND)
        );
      }
      return returnData;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async reSendOtp(bodyObj) {
    try {
      console.log("objectBody is=>", bodyObj);
      const returnData = await this.otpUtilityInst.otpVerify(bodyObj);

      if (returnData) {
        return returnData;
      }

      throw new errors.OtpNotMatch(ResponseMessage.OTP_NOT_FOUND);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = OtpService;
