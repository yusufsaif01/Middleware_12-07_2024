const { checkAuthToken, checkRole } = require('../middleware/auth');
const responseHandler = require('../ResponseHandler');
const UserProfileService = require('../services/UserProfileService');
const LoginUtility = require('../db/utilities/LoginUtility');
const UserService = require('../services/UserService');
const userValidator = require("../middleware/validators").userValidator;
const FileService = require('../services/FileService');
const errors = require("../errors");

module.exports = (router) => {
    /**
     * @api {get} /profile member profile
     * @apiName Profile
     * @apiGroup Profile
     *
     * @apiSuccess {String} status success
     * @apiSuccess {String} message Successfully done
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "message": "Successfully done",
     *       "data": { 
     *                  "first_name": "name",
     *                  "last_name": "last name",
     *                  "documents": [],
     *                  "position": [],
     *                  "email": "newp@newp.com",
     *                  "avatar_url": "/uploads/avatar/user-avatar.png",
     *                  "state": "mumbai",
     *                  "country": "india",
     *                  "phone": "1111111111",
     *                  "member_type": "player"
     *               }  
     *     }
     * 
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "message": "Successfully done",
     *       "data": {
     *                 "top_players": [],
     *                 "documents": [],
     *                 "email": "newclub@newclub.com",
     *                 "name": "breakers",
     *                 "avatar_url": "/uploads/avatar/user-avatar.png",
     *                 "state": "delhi",
     *                 "country": "india",
     *                 "phone": "222222222222",
     *                 "contact_person": [],
     *                 "trophies": [],
     *                 "top_signings": [],
     *                 "associated_players": 100,
     *                 "member_type": "club"
     *                }
     *     }
     * 
     * @apiErrorExample {json} UNAUTHORIZED
	 *     HTTP/1.1 401 Unauthorized
	 *     {
	 *       "message": "Unauthorized",
     *       "code": "UNAUTHORIZED",
     *       "httpCode": 401
	 *     }
     * 
     * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
     *     HTTP/1.1 500 Internal server error
     *     {
     *       "message": "Internal Server Error",
     *       "code": "INTERNAL_SERVER_ERROR",
     *       "httpCode": 500
     *     }
     *
     */
    router.get('/profile', checkAuthToken, async function (req, res) {
        try {
            let serviceInst = new UserService();
            let userServiceInst = new UserProfileService();

            responseHandler(req, res, serviceInst.getDetails(req.authUser).then((user) => {
                return userServiceInst.toAPIResponse(user);
            }));
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }

    });
    /**
     * @api {put} /update-details update profile details
     * @apiName Update profile details
     * @apiGroup Profile
     *
     * @apiParam (body) {String} player_type player type can be grassroot/amateur/professional
     * @apiParam (body) {String} first_name player first name
     * @apiParam (body) {String} last_name player last name
     * @apiParam (body) {String} dob player date of birth
     * @apiParam (body) {String} player_height_feet player height feett
     * @apiParam (body) {String} player_height_inches player height inches
     * @apiParam (body) {String} weight player weight
     * @apiParam (body) {String} country member country
     * @apiParam (body) {String} state player state
     * @apiParam (body) {String} city member city
     * @apiParam (body) {String} school player school
     * @apiParam (body) {String} college player college
     * @apiParam (body) {String} university player university
     * @apiParam (body) {String} phone member phone number
     * @apiParam (body) {String} position player position 
     * @apiParam (body) {String} strong_foot player strong foot
     * @apiParam (body) {String} weak_foot player weak foot
     * @apiParam (body) {String} head_coach_name head coach name
     * @apiParam (body) {String} head_coach_email head coach email
     * @apiParam (body) {String} head_coach_phone head coach phone number
     * @apiParam (body) {String} former_club player former club
     * @apiParam (body) {String} pincode club/academy pincode
     * @apiParam (body) {String} address club/academy address
     * @apiParam (body) {String} document_type club/academy document_type
     * @apiParam (body) {String} type club/academy type
     * @apiParam (body) {String} number academy PAN/ COI/ Tin Number
     * @apiParam (body) {String} reg_number club AIFF Registration Number
     * @apiParam (body) {String} stadium_name club/academy stadium name
     * @apiParam (body) {string} trophies club/academy trophies
     * @apiParam (body) {string} associated_players club/academy associated_players 
     * @apiParam (body) {string} name club/academy name
     * @apiParam (body) {string} league club/academy league
     * @apiParam (body) {string} league_other club/academy other league
     * @apiParam (body) {string} short_name club/academy short name
     * @apiParam (body) {string} founded_in club/academy founded year
     * @apiParam (body) {string} owner club/academy owner
     * @apiParam (body) {string} manager club/academy manager
     * @apiParam (body) {string} top_signings club/academy top_signings
     * @apiParam (body) {string} top_players club/academy top_players
     * @apiParam (body) {string} contact_person club/academy contact person
     *   
     * 
     * @apiSuccess {String} status success
     * @apiSuccess {String} message Successfully done
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "message": "Successfully done",
     *       "data": {"n": 1,
     *                "nModified": 1,
     *                "ok": 1}
     *     }
     *
     * @apiErrorExample {json} Unauthorized
	 *     HTTP/1.1 401 Unauthorized
	 *     {
	 *       "message": "Unauthorized",
     *       "code": "UNAUTHORIZED",
     *       "httpCode": 401
	 *     }
     * 
     * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
     *     HTTP/1.1 500 Internal server error
     *     {
     *       "message": "Internal Server Error",
     *       "code": "INTERNAL_SERVER_ERROR",
     *       "httpCode": 500
     *     }
     *
     */
    router.put('/update-details', checkAuthToken, userValidator.updateDetailsAPIValidation, async function (req, res) {
        try {
            let serviceInst = new UserProfileService();
            let reqObj = await serviceInst.uploadProfileDocuments(req.body, req.files);

            responseHandler(req, res, serviceInst.updateProfileDetails({
                member_type: req.authUser.member_type,
                id: req.authUser.user_id,
                updateValues: reqObj
            }));
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    });
/**
     * @api {put} /update-bio update profile bio and social profiles
     * @apiName Update profile bio and social profiles
     * @apiGroup Profile
     *   
     * @apiParam (body) {String} bio bio of member
     * @apiParam (body) {String} facebook facebook profile link of member
     * @apiParam (body) {String} twitter twitter profile link of member
     * @apiParam (body) {String} instagram instagram profile link of member
     * @apiParam (body) {String} youtube youtube profile link of member
     * 
     * @apiSuccess {String} status success
     * @apiSuccess {String} message Successfully done
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "message": "Successfully done",
     *       "data": {"n": 1,
     *                "nModified": 1,
     *                "ok": 1}
     *     }   
     * 
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "message": "Successfully done",
     *       "data": {"n": 1,
     *                "nModified": 1,
     *                "ok": 1,
     *                "avatar_url": "\uploads\documents\Sample.jpg"
     *               }
     *     }
     *
     * @apiErrorExample {json} Unauthorized
	 *     HTTP/1.1 401 Unauthorized
	 *     {
	 *       "message": "Unauthorized",
     *       "code": "UNAUTHORIZED",
     *       "httpCode": 401
	 *     }
     * 
     * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
     *     HTTP/1.1 500 Internal server error
     *     {
     *       "message": "Internal Server Error",
     *       "code": "INTERNAL_SERVER_ERROR",
     *       "httpCode": 500
     *     }
     *
     */
    router.put('/update-bio', checkAuthToken, userValidator.updateBioAPIValidation, async function (req, res) {
        try {
            let serviceInst = new UserProfileService();
            let reqObj = req.body;

            if (req.files) {
                const _fileInst = new FileService();
                if (req.files.avatar) {
                    let avatar_url = await _fileInst.uploadFile(req.files.avatar, "./documents/", req.files.avatar.name);
                    reqObj.avatar_url = avatar_url;
                }
            }
            responseHandler(req, res, serviceInst.updateProfileBio({
                member_type: req.authUser.member_type,
                id: req.authUser.user_id,
                updateValues: reqObj
            }));
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    });
        /**
     * @api {delete} /avatar delete avatar
     * @apiName Delete avatar
     * @apiGroup Profile
     *
     * @apiSuccess {String} status success
     * @apiSuccess {String} message Successfully done
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "message": "Successfully done"
     *     }
     *
     * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
     *     HTTP/1.1 500 Internal server error
     *     {
     *       "message": "Internal Server Error",
     *       "code": "INTERNAL_SERVER_ERROR",
     *       "httpCode": 500
     *     }
     *
     * @apiErrorExample {json} UNAUTHORIZED
	 *     HTTP/1.1 401 Unauthorized
	 *     {
	 *       "message": "Unauthorized",
     *       "code": "UNAUTHORIZED",
     *       "httpCode": 401
	 *     }
     * 
     */
    router.delete('/avatar', checkAuthToken, async function (req, res) {
        try {
            let serviceInst = new UserProfileService();
            responseHandler(req, res, serviceInst.updateProfileBio({
                member_type: req.authUser.member_type,
                id: req.authUser.user_id,
                updateValues: {
                    avatar_url: "/uploads/avatar/user-avatar.png"
                }
            }));
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    });
};



