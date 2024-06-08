const forgotPassword = require("./forgotPasswordMailTemplate");
const emailVerification = require("./activationLinkMailTemplate");
const welcome = require("./welcomeMailTemplate");
const changePassword = require("./changePasswordMailTemplate");
const profileVerified = require("./profileVerifiedTemplate");
const profileDisapproved = require("./profileDisapprovedTemplate");
const footplayerRequest = require("./footplayerRequestMailTemplate");
const footplayerInvite = require("./footplayerInviteMailTemplate");
const employmentContractDisapprovalByPlayer = require("./employmentContractDisapprovalByPlayer");
const employmentContractDisapprovalByClubAcademy = require("./employmentContractDisapprovalByClubAcademy");
const employmentContractApprovalByClubAcademy = require("./employmentContractApprovalByClubAcademy");
const employmentContractApprovalByPlayer = require("./employmentContractApprovalByPlayer");
const employmentContractCreatedClubAcademy = require("./employmentContractCreatedClubAcademy");
const employmentContractCreatedPlayer = require("./employmentContractCreatedPlayer");
const footPlayerInviteAccepted = require("./footPlayerInviteAccepted");
const postEmailConfirmation = require("./postEmailConfirmation");
const reportCardAdded = require("./reportCardAddedMailTemplate");
const sendOtpEmail = require("./sendOtpEmailTemplate");
const forgotPasswordOtp = require("./forgotPasswordOtpTemplate")
/** Admin */
const employmentContractApprovalAdmin = require('./employmentContractApprovalTemplateAdmin');
const employmentContractDisapprovalAdmin = require('./employmentContractDisapprovalTemplateAdmin');


module.exports = {
  forgotPassword,
  emailVerification,
  welcome,
  postEmailConfirmation,
  changePassword,
  profileVerified,
  profileDisapproved,
  footplayerRequest,
  footplayerInvite,
  employmentContractDisapprovalByPlayer,
  employmentContractDisapprovalByClubAcademy,
  employmentContractApprovalByClubAcademy,
  employmentContractApprovalByPlayer,
  employmentContractCreatedClubAcademy,
  employmentContractCreatedPlayer,
  footPlayerInviteAccepted,
  reportCardAdded,
  sendOtpEmail,
  forgotPasswordOtp,

  /** Admin */
  employmentContractApprovalAdmin,
  employmentContractDisapprovalAdmin,
};
