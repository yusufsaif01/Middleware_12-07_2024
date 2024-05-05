const errors = require('../../errors');
const AuthUtility = require('../../db/utilities/AuthUtility');
const redisServiceInst = require('../../redis/RedisService')


var _checkRole = (req, roles) => {
    if (!req.authUser || !req.authUser.role) {
        return false;
    }
    return roles.includes(req.authUser.role);
};

const _checkToken = async (req, isCheckStatus, isCheckForgotPassToken) => {
    try {
       
     
        const token = req.headers.authorization || req.body.token;
        const refresh_token = req.headers.authorization || req.body.refresh_token;
        
        if (token || refresh_token) {
            
            const authUtilityInst = new AuthUtility();
            
            const user = await authUtilityInst.getUserByToken(token,refresh_token, isCheckStatus, isCheckForgotPassToken);
            
            return user;
        }
        throw new errors.Unauthorized();

    } catch (err) {
       
        return Promise.reject(err);
    }
};

module.exports = {
    checkRole(roles) {
        roles = Array.isArray(roles) ? roles : [roles];
        return (req, res, next) => {
         
            if (!_checkRole(req, roles)) {
                return next(new errors.Unauthorized());
            }
            return next();
        }
    },

    async checkAuthToken(req, res, next) {
        try {
            const user = await _checkToken(req, true, false);
            req.authUser = user;
            return next();
        } catch (err) {
            console.log(err);
            return next(err);
        }

    },

    async removeAuthToken(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (token) {
                token = token.split(' ')[1];
                let user_id = await redisServiceInst.getUserIdFromCacheByKey(token);
                if (user_id) {
                    let user = await redisServiceInst.getUserFromCacheByKey(user_id);
                    if (user) {
                        user.token = token;
                    }
                    req.authUser = user;
                }
                return next();
            }
            throw new errors.Unauthorized();
        } catch (err) {
            console.log(err);
            return next(err);
        }
    },

    async checkTokenForAccountActivation(req, res, next) {
        try {
            
            const user = await _checkToken(req, false, true);
           
            req.authUser = user;
          
            return next();
        } catch (err) {
            console.log("inside checkauth0000")
            //console.log(req)
            console.log(err);
            return next(err);
        }
    }
};
