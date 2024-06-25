const ResponseHandler = require("../../ResponseHandler");
const errors = require("../../errors");
const ResponseMessage = require("../../constants/ResponseMessage");
const AccessTokenService = require("../../services/AccessTokenService");
const config = require("../../config");

const accessTokenInst = new AccessTokenService();

const restrictedAccess = config.app.restricted_access;

module.exports = () => {
  if (!restrictedAccess) {
    return function (req, res, next) {
      next();
    };
  }

  return async function (req, res, next) {
    try {
      const accessToken = req.headers["x-access-token"];
      
      if (!accessToken)
        throw new errors.Unauthorized(ResponseMessage.ACCESS_TOKEN_REQUIRED);

      try {
        await accessTokenInst.verifyAccessToken(accessToken);
      } catch (error) {
        if (error.name == "TokenExpiredError") {
          throw new errors.Unauthorized(ResponseMessage.ACCESS_TOKEN_EXPIRED);
        }
        throw new errors.Unauthorized(ResponseMessage.ACCESS_TOKEN_INVALID);
      }
      next();
    } catch (error) {
      ResponseHandler(req, res, Promise.reject(error));
    }
  };
};
