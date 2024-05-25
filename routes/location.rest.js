const LocationService = require("../services/LocationService");
const responseHandler = require("../ResponseHandler");
const { checkAuthToken, checkRole } = require("../middleware/auth");
const ROLE = require("../constants/Role");

module.exports = (router) => {
  /**
   * @api {get} /master/location/stats location stats
   * @apiName location stats
   * @apiGroup Location
   *
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "message": "Successfully done",
   *       "data": [ {
   *                  "country": "India",
   *                  "country_id": "3bcda0b2-2bc6-4c0c-bc42-82c4aa42ec39",
   *                  "no_of_state": 10,
   *                  "no_of_district": 10 }
   *               ]
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

  router.get("/master/location/stats", function (req, res) {
    let serviceInst = new LocationService();
    return responseHandler(req, res, serviceInst.getLocationStats());
  });
  /**
   * @api {get} /master/state/list/:country_id state listing
   * @apiName state listing
   * @apiGroup Location
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
   *         "total":1,
   *         "records":[
   *           {
   *             "name": "Delhi",
   *             "id": "7b2aae40-b92d-41c9-a1b5-84c0b20d9996"
   *           }
   *         ]
   *     }
   *
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
   *       "message": "Country not found",
   *       "code": "NOT_FOUND",
   *       "httpCode": 404
   *     }
   *
   */

  router.get("/master/state/list/:country_id", function (req, res) {
    console.log("requrest come in state api");
    console.log(req.params.country_id);
    let serviceInst = new LocationService();
    return responseHandler(
      req,
      res,
      serviceInst.getStateList(req.params.country_id)
    );
  });
  /**
   * @api {get} /master/district/list/:country_id/:state_id?page_size=<10>&page_no=<1>&search=<text> district listing
   * @apiName district listing
   * @apiGroup Location
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
   *         "total":1,
   *         "records":[
   *           {
   *             "name": "New Delhi",
   *             "id": "7b2aae40-b92d-41c9-a1b5-84c0b20d9996"
   *           }
   *         ]
   *     }
   *
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

  router.get(
    "/master/district/list/:country_id/:state_id",
    function (req, res) {
      let paginationOptions = {};
      let filter = {};
      console.log("district hittttttttttttt");
      paginationOptions = {
        page_no: req.query && req.query.page_no ? req.query.page_no : 1,
        limit:
          req.query && req.query.page_size ? Number(req.query.page_size) : 10,
      };
      filter = {
        search: req.query && req.query.search ? req.query.search : null,
      };
      let serviceInst = new LocationService();
      return responseHandler(
        req,
        res,
        serviceInst.getDistrictList({
          country_id: req.params.country_id,
          state_id: req.params.state_id,
          paginationOptions,
          filter,
        })
      );
    }
  );
};
