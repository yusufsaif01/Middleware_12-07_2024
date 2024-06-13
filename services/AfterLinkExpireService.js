const Promise = require("bluebird");
const errors = require('../errors');
const config = require('../config');
const ActivityService = require('./ActivityService');
const AuthUtility = require('../db/utilities/AuthUtility');
const ClubAcademyUtility = require('../db/utilities/ClubAcademyUtility');
const AdminUtility = require('../db/utilities/AdminUtility');
const PlayerUtility = require('../db/utilities/PlayerUtility');
//const LoginUtility = require('../db/utilities/LoginUtility');
const ActivityUtility = require('../db/utilities/ActivityUtility');
const EmailService = require('./EmailService');
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const ACCOUNT = require('../constants/AccountStatus');
const MEMBER = require('../constants/MemberType');
const ROLE = require('../constants/Role');
const ACTIVITY = require('../constants/Activity');
const redisServiceInst = require('../redis/RedisService');
const UtilityService = require("./UtilityService");
const ProfileStatus = require('../constants/ProfileStatus')
const LoginUtility = require('../db/utilities/LoginUtility');
const LoginUtilityReplica = require('../db/utilities/LoginUtilityReplic');
class AfterLinkExpire {

    constructor() {
       // this.authUtilityInst = new AuthUtility();
       this.loginUtility = new LoginUtility();
       this.LoginUtilityReplica = new LoginUtilityReplica();
    }

    async afterlinkexpire(token) {
        try {

             console.log("inside Authservice link")
             
             let loginDetails = await this.loginUtility.findOneByToken({ forgot_password_token: token });
          
            if(loginDetails) 
            //add validation
            {
                let LoginUtilityReplicaDetails = await this.LoginUtilityReplica.insertInReplica(loginDetails);
            
                if(LoginUtilityReplicaDetails)
                {
                    let loginDetailsDelete = await this.loginUtility.findOneByTokenAndDelete({ forgot_password_token: token });
                  
                }
            }
            
            } catch (e) {

            console.log("Error in resendEmailVerificationLink() of AuthService", e);
            return Promise.reject(e);
        }
    }
}

module.exports = AfterLinkExpire;
