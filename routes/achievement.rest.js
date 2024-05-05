const AchievementService = require('../services/AchievementService');
const TraningCenterService = require("../services/CreateTraningCenterService");
const responseHandler = require('../ResponseHandler');
const { checkAuthToken } = require('../middleware/auth');
const achievementValidator = require("../middleware/validators").achievementValidator;
const StorageProvider = require('storage-provider');
const config = require("../config");
const STORAGE_PROVIDER_LOCAL = require('../constants/StorageProviderLocal');
const DocumentMediaType = require('../constants/DocumentMediaType');

module.exports = (router) => {
    /**
 * @api {get} /achievement/stats?user_id=<user_id_of_the_user_in_case_of_public> achievement stats
 * @apiName achievement stats
 * @apiGroup Achievement 
 * 
 * @apiParam (query) {String} user_id user_id of the user in case of public
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
 *                 "achievements":10,
 *                 "tournaments":10
 *               }
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
    router.get('/achievement/stats', checkAuthToken, function (req, res) {
        let user_id = (req.query && req.query.user_id) ? req.query.user_id : req.authUser.user_id;
        let serviceInst = new AchievementService();
        responseHandler(req, res, serviceInst.stats(user_id));
    });

    /**
 * @api {get} /achievement/list?page_no=1&page_size=20 achievement listing
 * @apiName achievement listing
 * @apiGroup Achievement
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
 *             "from": "2010",
 *             "to": "2011",
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

    router.get("/traning/center_list/:user_id", checkAuthToken, function (req, res) {
        let paginationOptions = {};
         paginationOptions = {
           page_no: req.query && req.query.page_no ? req.query.page_no : 1,
           limit:
             req.query && req.query.page_size
               ? Number(req.query.page_size)
               : 10,
         };
        let serviceInst = new TraningCenterService();
        responseHandler(
          req,
          res,
          serviceInst.getList({
            paginationOptions,
            user_id: req.authUser.user_id,
          })
        );
    });

 router.delete("/traning-center/:id", checkAuthToken, function (req, res) {
   try {
     let serviceInst = new TraningCenterService();
     responseHandler(
       req,
       res,
       serviceInst.delete({
         id: req.params.id,
         user_id: req.authUser.user_id,
       })
     );
   } catch (e) {
     console.log(e);
     responseHandler(req, res, Promise.reject(e));
   }
 });

    router.get("/achievement/list", checkAuthToken, function (req, res) {
         let paginationOptions = {};

         paginationOptions = {
           page_no: req.query && req.query.page_no ? req.query.page_no : 1,
           limit:
             req.query && req.query.page_size
               ? Number(req.query.page_size)
               : 10,
         };

         let serviceInst = new AchievementService();
         responseHandler(
           req,
           res,
           serviceInst.getList({
             paginationOptions,
             user_id: req.authUser.user_id,
           })
         );
       });
    /**
 * @api {post} /achievement/add add achievement
 * @apiName add achievement
 * @apiGroup Achievement
 *   
 * @apiParam (body) {String} type type of achievement
 * @apiParam (body) {String} name name of achievement
 * @apiParam (body) {String} from from year of achievement
 * @apiParam (body) {String} to to year of achievement
 * @apiParam (body) {String} position position achieved
 * @apiParam (body) {String} achievement achievement image
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
    router.post('/achievement/add', checkAuthToken, achievementValidator.addAchievementAPIValidation, async function (req, res) {
        let reqObj = req.body
        try {
            if (req.files) {
                const configForLocal = config.storage;
                let options = STORAGE_PROVIDER_LOCAL.UPLOAD_OPTIONS
                options.allowed_extensions =
                  DocumentMediaType.ALLOWED_MEDIA_EXTENSIONS;
                let storageProviderInst = new StorageProvider(configForLocal);
                if (req.files.achievement) {
                    let uploadResponse = await storageProviderInst.uploadDocument(req.files.achievement, options);
                    reqObj.media_url = uploadResponse.url;
                }
            }
            let serviceInst = new AchievementService();
            responseHandler(req, res, serviceInst.add({
                reqObj: reqObj,
                user_id: req.authUser.user_id
            }));
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    });
    /**
* @api {put} /achievement/:id edit achievement
* @apiName edit achievement
* @apiGroup Achievement
*   
* @apiParam (body) {String} type type of achievement
* @apiParam (body) {String} name name of achievement
* @apiParam (body) {String} from from year of achievement
* @apiParam (body) {String} to to year of achievement
* @apiParam (body) {String} position position achieved
* @apiParam (body) {String} achievement achievement image
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
* @apiErrorExample {json} NOT_FOUND
*     HTTP/1.1 404 Not found
*     {
*       "message": "Achievement not found",
*       "code": "NOT_FOUND",
*       "httpCode": 404
*     }
* 
*/
    router.put('/achievement/:id', checkAuthToken, achievementValidator.addAchievementAPIValidation, async function (req, res) {
        let reqObj = req.body
        try {
            if (req.files) {
                const configForLocal = config.storage;
                let options = STORAGE_PROVIDER_LOCAL.UPLOAD_OPTIONS
                options.allowed_extensions = DocumentMediaType.ALLOWED_MEDIA_EXTENSIONS;
                let storageProviderInst = new StorageProvider(configForLocal);
                if (req.files.achievement) {
                    let uploadResponse = await storageProviderInst.uploadDocument(req.files.achievement, options);
                    reqObj.media_url = uploadResponse.url;
                }
            }
            let serviceInst = new AchievementService();
            responseHandler(req, res, serviceInst.edit({
                reqObj: reqObj,
                id: req.params.id,
                user_id: req.authUser.user_id
            }));
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    });
    /**
 * @api {delete} /achievement/:id delete achievement
 * @apiName delete achievement
 * @apiGroup Achievement
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
 *       "message": "Achievement not found",
 *       "code": "NOT_FOUND",
 *       "httpCode": 404
 *     }
 * 
 */
    router.delete('/achievement/:id', checkAuthToken, function (req, res) {
        try {
            let serviceInst = new AchievementService();
            responseHandler(req, res, serviceInst.delete({
                id: req.params.id,
                user_id: req.authUser.user_id
            }))
        } catch (e) {
            console.log(e);
            responseHandler(req, res, Promise.reject(e));
        }
    })
}