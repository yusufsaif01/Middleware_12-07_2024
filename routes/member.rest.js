const UserService = require('../services/UserService');
const responseHandler = require('../ResponseHandler');
const { checkAuthToken } = require('../middleware/auth');
const errors = require('../errors');
const LoginUtility = require('../db/utilities/LoginUtility');
const userValidator = require("../middleware/validators").userValidator;
const MEMBER = require('../constants/MemberType')
const RESPONSE_MESSAGE = require('../constants/ResponseMessage')
const AchievementService = require('../services/AchievementService');

module.exports = (router) => {
    /**
     * @api {get} /member/public/profile/:user_id Public profile
     * @apiName Public profile
     * @apiGroup Member
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
     *                  "position": [],
     *                  "avatar_url": "/uploads/avatar/user-avatar.png",
     *                  "state": "mumbai",
     *                  "country": "india",
     *                  "member_type": "player",
     *                  "is_followed": false,
     *                  "is_footmate": "Pending/Accepted/Not_footmate"
     *               }  
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
     * @apiErrorExample {json} NOT_FOUND
     *     HTTP/1.1 404 Not found
     *     {
     *       "message": "Member not found",
     *       "code": "NOT_FOUND",
     *       "httpCode": 404
     *     }
     *
     */

    router.get('/member/public/profile/:user_id', checkAuthToken, function (req, res) {
        try {
            let serviceInst = new UserService();
         responseHandler(req, res, serviceInst.getPublicProfileDetails({ sent_by: req.authUser.user_id, user_id: req.params.user_id }))
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    });

    /**
     * @api {get} /member/player/list?page_no=<1>&page_size=<20>&sort_by=<created_at>&sort_order=<1>&search=<text>&from=<from_date>&to=<to_date>&email=<email>&name=<name>&position=<position>&type=<type>&profile_status=<profile_status>&email_verified=<email_verified>  player listing
     * @apiName player listing
     * @apiGroup Member
     * 
	 * @apiParam (query) {String} page_no page number.
	 * @apiParam (query) {String} page_size records per page
     * @apiParam (query) {String} sort_by sort by field name
     * @apiParam (query) {String} sort_order order to sort (-1 - Descending, 1 - Ascending)
     * @apiParam (query) {String} search text search, this search will be done on name, position, email, type, status
     * @apiParam (query) {String} from from date of player register
     * @apiParam (query) {String} to to date of player register
     * @apiParam (query) {String} email email of the player
     * @apiParam (query) {String} name name of the player
     * @apiParam (query) {String} position name of the position
     * @apiParam (query) {String} type grassroot/amateur/professional
     * @apiParam (query) {String} profile_status verified/unverified
     * @apiParam (query) {String} email_verified true/false
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
     *       "data": { 
     *         "total":100,
     *         "records":[
     *           {
     *             "name": "first_name + last_name",
     *             "position": "position of first priority",
     *             "type":"grassroot/professional/amateur",
     *             "email":"email of the player",
     *             "status":"verified/unverified",
     *             "is_email_verified": "true",
     *             "account_status":"active/inactive/blocked/pending",
     *             "user_id": "f9cdd4d4-fe2d-4166-9685-6638fa80e526"
     *           }
     *         ],
     *         "players_count": {
     *           "grassroot":10,
     *           "professional":20,
     *           "amateur":15   
     *       }
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
    router.get('/member/player/list', checkAuthToken, userValidator.playerListQueryValidation, function (req, res) {
        let paginationOptions = {};
        let sortOptions = {};
        let filter = {};

        paginationOptions = {
            page_no: (req.query && req.query.page_no) ? req.query.page_no : 1,
            limit: (req.query && req.query.page_size) ? Number(req.query.page_size) : 10
        };
        sortOptions = {
            sort_by: (req.query && req.query.sort_by) ? req.query.sort_by : "",
            sort_order: (req.query && req.query.sort_order) ? req.query.sort_order : 1
        };
        filter = {
            search: (req.query && req.query.search) ? req.query.search : null
        };
        filterConditions = {
            from: (req.query && req.query.from) ? req.query.from : null,
            to: (req.query && req.query.to) ? req.query.to : null,
            email: (req.query && req.query.email) ? req.query.email : null,
            name: (req.query && req.query.name) ? req.query.name : null,
            position: (req.query && req.query.position) ? req.query.position : null,
            type: (req.query && req.query.type) ? req.query.type : null,
            profile_status: (req.query && req.query.profile_status) ? req.query.profile_status : null,
            email_verified: (req.query && req.query.email_verified) ? req.query.email_verified : null,
        }
        let serviceInst = new UserService();
        responseHandler(req, res, serviceInst.getList({
            paginationOptions, sortOptions, filter, filterConditions,
            member_type: MEMBER.PLAYER
        }));
    });
    /**
     * @api {get} /member/club/list?page_no=1&page_size=20&sort_by=created_at&sort_order=1&search=text&from=<from_date>&to=<to_date>&email=<email>&name=<name>&profile_status=<profile_status>&email_verified=<email_verified> club listing
     * @apiName club listing
     * @apiGroup Member
     *
     * @apiParam (query) {String} page_no page number.
	 * @apiParam (query) {String} page_size records per page
     * @apiParam (query) {String} sort_by sort by field name
     * @apiParam (query) {String} sort_order order to sort (-1 - Descending, 1 - Ascending)
     * @apiParam (query) {String} search text search, this search will be done on name, email, status
     * @apiParam (query) {String} from from date of player register
     * @apiParam (query) {String} to to date of player register
     * @apiParam (query) {String} email email of the player
     * @apiParam (query) {String} name name of the player
     * @apiParam (query) {String} profile_status verified/unverified
     * @apiParam (query) {String} email_verified true/false
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
     *       "data": {  
     *         "total":100,
     *         "records":[
     *           {
     *             "name": "name of the academy",
     *             "email":"email of the academy",
     *             "status":"verified/unverified",
     *             "account_status":"active/inactive/blocked/pending",
     *             "is_email_verified": "true",
     *             "user_id": "f9cdd4d4-fe2d-4166-9685-6638fa80e526"
     *            }
     *         ]
     *       }
     *    }
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
    router.get('/member/club/list', checkAuthToken, userValidator.clubAcademyListQueryValidation, function (req, res) {
        let paginationOptions = {};
        let sortOptions = {};
        let filter = {};

        paginationOptions = {
            page_no: (req.query && req.query.page_no) ? req.query.page_no : 1,
            limit: (req.query && req.query.page_size) ? Number(req.query.page_size) : 10
        };
        sortOptions = {
            sort_by: (req.query && req.query.sort_by) ? req.query.sort_by : "",
            sort_order: (req.query && req.query.sort_order) ? req.query.sort_order : 1
        };
        filter = {
            search: (req.query && req.query.search) ? req.query.search : null
        }

        filterConditions = {
            from: (req.query && req.query.from) ? req.query.from : null,
            to: (req.query && req.query.to) ? req.query.to : null,
            email: (req.query && req.query.email) ? req.query.email : null,
            name: (req.query && req.query.name) ? req.query.name : null,
            profile_status: (req.query && req.query.profile_status) ? req.query.profile_status : null,
            email_verified: (req.query && req.query.email_verified) ? req.query.email_verified : null,
        }

        let serviceInst = new UserService();
        responseHandler(req, res, serviceInst.getList({
            paginationOptions, sortOptions, filter, filterConditions,
            member_type: MEMBER.CLUB
        }));
    });
    /**
     * @api {get} /member/academy/list?page_no=1&page_size=20&sort_by=created_at&sort_order=1&search=text&from=<from_date>&to=<to_date>&email=<email>&name=<name>&profile_status=<profile_status>&email_verified=<email_verified> academy listing
     * @apiName academy listing
     * @apiGroup Member
     *
     * @apiParam (query) {String} page_no page number.
	 * @apiParam (query) {String} page_size records per page
     * @apiParam (query) {String} sort_by sort by field name
     * @apiParam (query) {String} sort_order order to sort (-1 - Descending, 1 - Ascending)
     * @apiParam (query) {String} search text search, this search will be done on name, email, status
     * @apiParam (query) {String} from from date of player register
     * @apiParam (query) {String} to to date of player register
     * @apiParam (query) {String} email email of the player
     * @apiParam (query) {String} name name of the player
     * @apiParam (query) {String} profile_status verified/unverified
     * @apiParam (query) {String} email_verified true/false
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
     *         "total":100,
     *         "records":[
     *           {
     *             "name": "name of the academy",
     *             "email":"email of the academy",
     *             "status":"verified/unverified",
     *             "account_status":"active/inactive/blocked/pending",
     *             "is_email_verified": "true",
     *             "user_id": "f9cdd4d4-fe2d-4166-9685-6638fa80e526"
     *            }
     *         ]
     *       }
     *    }
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
    router.get('/member/academy/list', checkAuthToken, userValidator.clubAcademyListQueryValidation, function (req, res) {
        let paginationOptions = {};
        let sortOptions = {};
        let filter = {};

        paginationOptions = {
            page_no: (req.query && req.query.page_no) ? req.query.page_no : 1,
            limit: (req.query && req.query.page_size) ? Number(req.query.page_size) : 10
        };
        sortOptions = {
            sort_by: (req.query && req.query.sort_by) ? req.query.sort_by : "",
            sort_order: (req.query && req.query.sort_order) ? req.query.sort_order : 1
        };
        filter = {
            search: (req.query && req.query.search) ? req.query.search : null
        }

        filterConditions = {
            from: (req.query && req.query.from) ? req.query.from : null,
            to: (req.query && req.query.to) ? req.query.to : null,
            email: (req.query && req.query.email) ? req.query.email : null,
            name: (req.query && req.query.name) ? req.query.name : null,
            profile_status: (req.query && req.query.profile_status) ? req.query.profile_status : null,
            email_verified: (req.query && req.query.email_verified) ? req.query.email_verified : null,
        }
        let serviceInst = new UserService();
        responseHandler(req, res, serviceInst.getList({
            paginationOptions, sortOptions, filter, filterConditions,
            member_type: MEMBER.ACADEMY
        }));
    });
            
    /**
    * @api {get} /member/public/achievement/:user_id?page_no=1&page_size=20 public profile achievement listing
    * @apiName Public profile achievement listing
    * @apiGroup Member
    *
    * @apiParam (query) {String} page_no page number.
    * @apiParam (query) {String} page_size records per page
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
    *         "total":100,
    *         "records":[
    *           {
    *             "type":"Individual awards",
    *             "name": "Devdar trophy",
    *             "year": "1989",
    *             "position": "First",
    *             "media": "\\uploads\\documents\\Sample.jpg",
    *             "id": "7b2aae40-b92d-41c9-a1b5-84c0b20d9996"
    *           }
    *         ]
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

    router.get('/member/public/achievement/:user_id', checkAuthToken, function (req, res) {
        let paginationOptions = {};

        paginationOptions = {
            page_no: (req.query && req.query.page_no) ? req.query.page_no : 1,
            limit: (req.query && req.query.page_size) ? Number(req.query.page_size) : 10
        };

        let serviceInst = new AchievementService();
        responseHandler(req, res, serviceInst.getList({
            paginationOptions, user_id: req.params.user_id
        }));
    });

    /**
     * @api {put} /member/status-activate/:user_id status activate
     * @apiName Status-activate
     * @apiGroup Member
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
     *@apiErrorExample {json} CONFLICT
	 *     HTTP/1.1 409 Conflict
	 *     {
	 *       "message": "status is already active",
     *       "code": "CONFLICT",
     *       "httpCode": 409
	 *     }
     * 
     */
    router.put('/member/status-activate/:user_id', checkAuthToken, function (req, res) {
        try {
            if (!req.params.user_id) {
                return Promise.reject(new errors.ValidationFailed(
                    RESPONSE_MESSAGE.USER_ID_REQUIRED
                ));
            }
            let user_id = req.params.user_id
            let serviceInst = new UserService();
            responseHandler(req, res, serviceInst.activate(user_id))
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    })
    /**
 * @api {put} /member/status-deactivate/:user_id status deactivate
 * @apiName Status-deactivate
 * @apiGroup Member
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
 *@apiErrorExample {json} CONFLICT
 *     HTTP/1.1 409 Conflict
 *     {
 *       "message": "status is already blocked",
 *       "code": "CONFLICT",
 *       "httpCode": 409
 *     }
 * 
 */
    router.put('/member/status-deactivate/:user_id', checkAuthToken, function (req, res) {
        try {
            if (!req.params.user_id) {
                return Promise.reject(new errors.ValidationFailed(
                    RESPONSE_MESSAGE.USER_ID_REQUIRED
                ));
            }
            let user_id = req.params.user_id
            let serviceInst = new UserService();
            responseHandler(req, res, serviceInst.deactivate(user_id))
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    })
    /**
 * @api {delete} /member/delete/:user_id delete
 * @apiName Delete
 * @apiGroup Member
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
 * @apiErrorExample {json} NOT_FOUND
 *     HTTP/1.1 404 Not found
 *     {
 *       "message": "User not found",
 *       "code": "NOT_FOUND",
 *       "httpCode": 404
 *     }
 * 
 */
    router.delete('/member/delete/:user_id', function (req, res) {
        try {
            if (!req.params.user_id) {
                return Promise.reject(new errors.ValidationFailed(
                    RESPONSE_MESSAGE.USER_ID_REQUIRED
                ));
            }
            let user_id = req.params.user_id
            let serviceInst = new UserService();
            responseHandler(req, res, serviceInst.delete(user_id))
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    })
        
    /**
     * @api {get} /member/search?search=<text>&page_no=<1>&page_size=<20> member search
     * @apiName member search
     * @apiGroup Member
     * 
     * @apiParam (query) {String} search text search, this search will be done on name,email
     * @apiParam (query) {Number} page_no page number.
	 * @apiParam (query) {Number} page_size records per page
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
     *         "total":100,
     *         "records":[
     *           {
     *             "member_type": "player",
     *             "player_type": "grassroot/professional/amateur",
     *             "name": "test result",
     *             "position": "Goalkeeper",
     *             "avatar": "\\uploads\\documents\\Sample.jpg",
     *             "user_id": "f9cdd4d4-fe2d-4166-9685-6638fa80e526"
     *           }]
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

    router.get('/member/search', checkAuthToken, userValidator.memberSearchQueryValidation, function (req, res) {
        let paginationOptions = {
            page_no: (req.query && req.query.page_no) ? req.query.page_no : 1,
            limit: (req.query && req.query.page_size) ? Number(req.query.page_size) : 10
        };
        let filter = {
            search: (req.query && req.query.search) ? req.query.search : null
        };
       
        let serviceInst = new UserService();
        responseHandler(req, res, serviceInst.getMemberList({ filter, paginationOptions }));
    });
};
