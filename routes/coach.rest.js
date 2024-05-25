const { checkAuthToken, checkRole } = require("../middleware/auth");
const responseHandler = require("../ResponseHandler");
const CoachService = require("../services/CoachService");
const userValidator = require("../middleware/validators").userValidator;
const StorageProvider = require("storage-provider");
const config = require("../config");
module.exports = (router) => {

    router.get("/profile/getcoach/role", function (req, res) {
        let serviceInst = new CoachService();
        return responseHandler(req, res, serviceInst.getCoachRole());
        console.log("coache rollllllllllllllllrrrrrrrrrr");
    });
  
  router.get("/profile/get/specilisation", function (req, res) {
     console.log("coache specilisationnnnnnnnn");
     let serviceInst = new CoachService();
     return responseHandler(req, res, serviceInst.getSpecilisation());
     
  });
  
 router.get("/profile/get/traning-style", function (req, res) {
   console.log("coache traning stylee");
   let serviceInst = new CoachService();
   return responseHandler(req, res, serviceInst.getTraningStyle());
 });
};
