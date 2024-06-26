const { checkAuthToken } = require("../middleware/auth");
const responseHandler = require("../ResponseHandler");
const VideoService = require("../services/VideoService");
const PostService = require("../services/PostService");
const PostMedia = require("../constants/PostMedia");

const videoServiceInst = new VideoService();
const postServiceInst = new PostService();

const {
  middleware: validatePostType,
  userCanUploadVideo,
  validateData,
  checkUploadedVideo,
} = require("../middleware/validators/postTypeValidator");
const {
  postListQueryValidation,
} = require("../middleware/validators/postValidator");

module.exports = (router) => {
  /**
   * @api {post} /video Upload Video
   * @apiName Upload Video
   * @apiGroup Video
   *
   * @apiParam (query) {String} type Video type [timeline|learning_or_training|match]
   *
   * @apiParam (body) {Object} tags Abilities and attributes object.
   * @apiParam (body) {File} media Video to upload.
   *
   * @apiParamExample {json} Request-Example:
   * {
   *     "tags": [
   *         {
   *             "ability": "299cf30d-d417-46c1-a70c-5b7f420f4fd8",
   *             "attributes": ["92c078c9-1225-45fc-add7-44c816be3f60"]
   *         }
   *     ],
   *     "others": ["Team Play"]
   * }
   *
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   * }
   */
  router.post(
    "/video",
    checkAuthToken,
    validatePostType,
    userCanUploadVideo,
    checkUploadedVideo,
    //validateData,
    async (req, res, next) => {
      const { type } = req.query;

      const reqBody = {
        tags: req.body.tags,
        media: req.files.media,
        others: req.body.others,
        text:req.body.text
      };
      console.log("9999999999999999999999");
      console.log(reqBody);
      try {
        return responseHandler(
          req,
          res,
          videoServiceInst.uploadVideo(req.authUser, type, reqBody)
        );
      } catch (error) {
        return responseHandler(req, res, Promise.reject(error));
      }
    }
  );

  /**
   * @api {put} /video/:id Edit Video
   * @apiName Edit Video
   * @apiGroup Video
   *
   * @apiParam (body) {Object} tags Abilities and attributes object.
   *
   * @apiParamExample {json} Request-Example:
   * {
   *     "tags": [
   *         {
   *             "ability": "299cf30d-d417-46c1-a70c-5b7f420f4fd8",
   *             "attributes": ["92c078c9-1225-45fc-add7-44c816be3f60"]
   *         }
   *     ],
   *     "others": ["Team Play"]
   * }
   *
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   * }
   */
  router.put(
    "/video/:id",
    checkAuthToken,
    validateData,
    async (req, res, next) => {
      const { id } = req.params;
      const reqBody = req.body;
      try {
        return responseHandler(
          req,
          res,
          videoServiceInst.updateVideo(id, req.authUser, reqBody)
        );
      } catch (error) {
        return responseHandler(req, res, Promise.reject(error));
      }
    }
  );

  /**
   * @api {get} /video?page_no=1&page_size=20&comments=1 Video listing
   * @apiName Video Listing
   * @apiGroup Video
   *
   * @apiParam (query) {Number} page_no page number.
   * @apiParam (query) {Number} page_size records per page
   * @apiParam (query) {Number} comments 0 for no data in comments object, 1 for data in comments object
   * @apiParam (query) {String} attributes Comma separated list of attributes name to filter videos
   * @apiParam (query) {String} others Comma separated list of other tags name to filter videos
   *
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *     "status": "success",
   *     "message": "Successfully done",
   *     "data": {
   *         "total": 1,
   *         "records": [
   *             {
   *                 "id": "4bb031b7-1a42-404c-8d67-1ae109db0550",
   *                 "post": {
   *                     "text": "",
   *                     "media_url": "https://vimeo.com/447456562",
   *                     "media_type": "video",
   *                     "media_thumbnail": {
   *                         "sizes": [
   *                           {
   *                             "width": 200,
   *                             "height": 150,
   *                             "link": "",
   *                             "link_with_play_button": ""
   *                           },
   *                           {
   *                             "width": 1920,
   *                             "height": 1080,
   *                             "link": "",
   *                             "link_with_play_button": ""
   *                           },
   *                           {
   *                             "width": 960,
   *                             "height": 540,
   *                             "link": "",
   *                             "link_with_play_button": ""
   *                           }
   *                         ],
   *                         "url": "public/video-in-processing.jpg"
   *                       },
   *                     "meta": {
   *                         "abilities": [
   *                             {
   *                                 "abilities": "Mental",
   *                                 "attributes": [
   *                                     "endurance"
   *                                 ]
   *                             }
   *                         ],
   *                         "others": ["Team Play"]
   *                     },
   *                     "status": "pending"
   *                 },
   *                 "posted_by": {
   *                     "avatar": "/uploads/avatar/user-avatar.png",
   *                     "user_id": "49c9f40f-cb50-436f-900e-e98e6e76915b",
   *                     "name": "acad5",
   *                     "member_type": "academy",
   *                     "type": "Residential"
   *                 },
   *                 "is_liked": false,
   *                 "likes": 0,
   *                 "comments": {
   *                     "total": 0
   *                 }
   *             }
   *         ]
   *     }
   * }
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
  router.get(
    "/video",
    checkAuthToken,
    validatePostType,
    postListQueryValidation,
    (req, res, next) => {
      const { type } = req.query;

      let paginationOptions = {
        page_no: req.query && req.query.page_no ? req.query.page_no : 1,
        limit:
          req.query && req.query.page_size ? Number(req.query.page_size) : 12,
      };

      let commentOptions = {
        comments:
          req.query && req.query.comments ? Number(req.query.comments) : 0,
      };

      let filters = {
        type,
        attribute: req.query.attribute ? req.query.attribute : null,
        others: req.query.others ? req.query.others : null,
        media_type: PostMedia.VIDEO,
      };
console.log("{{{{{{{{{{{}}}}}}}}}}}}}}}")
      responseHandler(
        req,
        res,
        postServiceInst.getPostsList({
          paginationOptions,
          commentOptions,
          user_id: req.authUser.user_id,
          filters,
        })
      );
    }
  );

  /**
   * @api {get} /video/gallery Video Gallery
   * @apiName Video Gallery
   * @apiGroup Video
   *
   * @apiParam (query) {String} type Type of posts to filter.
   * @apiParam (query) {Number} page_no page number.
   * @apiParam (query) {Number} page_size records per page
   * @apiParam (query) {String} attributes Comma separated list of attributes name to filter videos
   * @apiParam (query) {String} others Comma separated list of other tags name to filter videos
   *
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "status": "success",
   *      "message": "Successfully done",
   *      "data": {
   *          "total": 1,
   *          "records": [
   *              {
   *                  "id": "db72f50f-e297-41ae-a4f6-b02d1ce2b1c4",
   *                  "media": {
   *                      "media_thumbnail": {
   *                          "sizes": [
   *                              {
   *                                  "width": 200,
   *                                  "height": 150,
   *                                  "link": "",
   *                                  "link_with_play_button": ""
   *                              },
   *                              {
   *                                  "width": 1920,
   *                                  "height": 1080,
   *                                  "link": "",
   *                                  "link_with_play_button": ""
   *                              },
   *                              {
   *                                  "width": 960,
   *                                  "height": 540,
   *                                  "link": "",
   *                                  "link_with_play_button": ""
   *                              }
   *                          ],
   *                          "url": "public/video-in-processing.jpg"
   *                      },
   *                      "media_url": "https://vimeo.com/448783922",
   *                      "media_type": "video"
   *                  },
   *                  "type": "timeline",
   *                  "status": "published",
   *                  "meta": {
   *                      "abilities": [
   *                          {
   *                              "ability": "Mental",
   *                              "attributes": [
   *                                  "endurance"
   *                              ]
   *                          }
   *                      ]
   *                  }
   *              }
   *          ]
   *      }
   *  }
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
  router.get(
    "/video/gallery",
    checkAuthToken,
    validatePostType,
    postListQueryValidation,
    (req, res, next) => {
      const { type } = req.query;

      let paginationOptions = {
        page_no: req.query && req.query.page_no ? req.query.page_no : 1,
        limit:
          req.query && req.query.page_size ? Number(req.query.page_size) : 12,
      };
      // let connection = this.connectionUtilityInst.findOne({ user_id: requestedData.user_id }, { followings: 1 });
      let query = {
        post_type: type,
        attribute: req.query.attribute ? req.query.attribute : null,
        others: req.query.others ? req.query.others : null,
        user_id: req.authUser.user_id,
        authUser: req.authUser,
        media_type: PostMedia.VIDEO,
      };
console.log("inside videoooooo galleryyyyyyyyy")
      responseHandler(
        req,
        res,
        videoServiceInst.getVideosList({
          query,
          pagination: paginationOptions,
        })
      );
    }
  );
  /**
   * @api {get} /video/public/gallery/:user_id Video Gallery Public Api
   * @apiName Video Gallery Public
   * @apiGroup Video
   *
   * @apiParam (url) {String} user_id videos uploaded by this user id.
   *
   * @apiParam (query) {String} type Type of posts to filter.
   * @apiParam (query) {Number} page_no page number.
   * @apiParam (query) {Number} page_size records per page
   * @apiParam (query) {String} attributes Comma separated list of attributes name to filter videos
   * @apiParam (query) {String} others Comma separated list of other tags name to filter videos
   *
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   * @apiSuccess {Boolean} [data.is_footplayer] Checks whether active authUer(player) is footPlayer of club/academy. only visible in player viewing profile of club/academy
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "status": "success",
   *      "message": "Successfully done",
   *      "data": {
   *          "total": 1,
   *          "records": [
   *              {
   *                  "id": "db72f50f-e297-41ae-a4f6-b02d1ce2b1c4",
   *                  "media": {
   *                      "media_thumbnail": {
   *                          "sizes": [
   *                              {
   *                                  "width": 200,
   *                                  "height": 150,
   *                                  "link": "",
   *                                  "link_with_play_button": ""
   *                              },
   *                              {
   *                                  "width": 1920,
   *                                  "height": 1080,
   *                                  "link": "",
   *                                  "link_with_play_button": ""
   *                              },
   *                              {
   *                                  "width": 960,
   *                                  "height": 540,
   *                                  "link": "",
   *                                  "link_with_play_button": ""
   *                              }
   *                          ],
   *                          "url": "public/video-in-processing.jpg"
   *                      },
   *                      "media_url": "https://vimeo.com/448783922",
   *                      "media_type": "video"
   *                  },
   *                  "type": "timeline",
   *                  "status": "published",
   *                  "created_at": "2020-08-21T13:24:12.921Z",
   *                  "meta": {
   *                      "abilities": [
   *                          {
   *                              "ability": "Mental",
   *                              "attributes": [
   *                                  "endurance"
   *                              ]
   *                          }
   *                      ]
   *                  }
   *              }
   *          ],
   *          "posted_by": {
   *            "member_type": "academy",
   *            "user_id": "49c9f40f-cb50-436f-900e-e98e6e76915b"
   *          },
   *          "is_footplayer": true
   *      }
   *  }
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
  router.get(
    "/video/public/gallery/:user_id",
    checkAuthToken,
    validatePostType,
    postListQueryValidation,
    (req, res, next) => {
      const { type } = req.query;
      const { user_id } = req.params;

      let paginationOptions = {
        page_no: req.query && req.query.page_no ? req.query.page_no : 1,
        limit:
          req.query && req.query.page_size ? Number(req.query.page_size) : 12,
      };

      let query = {
        post_type: type,
        attribute: req.query.attribute ? req.query.attribute : null,
        others: req.query.others ? req.query.others : null,
        user_id,
        authUser: req.authUser,
        media_type: PostMedia.VIDEO,
        mode: "public",
      };

      responseHandler(
        req,
        res,
        videoServiceInst.getVideosList({
          query,
          pagination: paginationOptions,
        })
      );
    }
  );

  /**
   * @api {get} /video/:id Video view one
   * @apiName Video View One
   * @apiGroup Video
   *
   * @apiParam (url) {String} id video id
   *
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *     "status": "success",
   *     "message": "Successfully done",
   *     "data": {
   *          "id": "4bb031b7-1a42-404c-8d67-1ae109db0550",
   *          "post": {
   *              "text": "",
   *              "media_url": "https://vimeo.com/447456562",
   *              "media_type": "video",
   *              "media_thumbnail": {
   *                  "sizes": [
   *                    {
   *                      "width": 200,
   *                      "height": 150,
   *                      "link": "",
   *                      "link_with_play_button": ""
   *                    },
   *                    {
   *                      "width": 1920,
   *                      "height": 1080,
   *                      "link": "",
   *                      "link_with_play_button": ""
   *                    },
   *                    {
   *                      "width": 960,
   *                      "height": 540,
   *                      "link": "",
   *                      "link_with_play_button": ""
   *                    }
   *                  ],
   *                  "url": "public/video-in-processing.jpg"
   *                },
   *              "meta": {
   *                  "abilities": [
   *                      {
   *                          "abilities": "Mental",
   *                          "attributes": [
   *                              "endurance"
   *                          ]
   *                      }
   *                  ],
   *                  "others": ["Team Play"]
   *              },
   *              "status": "pending"
   *          },
   *          "posted_by": {
   *              "avatar": "/uploads/avatar/user-avatar.png",
   *              "user_id": "49c9f40f-cb50-436f-900e-e98e6e76915b",
   *              "name": "acad5",
   *              "member_type": "academy",
   *              "type": "Residential"
   *          },
   *          "is_liked": false,
   *          "likes": 0,
   *          "comments": {
   *              "total": 0
   *          }
   *      }
   * }
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
  router.get("/video/:id", checkAuthToken, async (req, res, next) => {
    const { id } = req.params;

    const query = {
      id: id,
      user_id: req.authUser.user_id,
      media_type: PostMedia.VIDEO,
    };
console.log(":::::::::::::::::::::::::::")
    responseHandler(req, res, postServiceInst.getPost(query));
  });

  /**
   * @api {get} /video/public/gallery/:user_id/:video_id Video view one public
   * @apiName Video View One Public
   * @apiGroup Video
   *
   * @apiParam (url) {String} user_id videos uploaded by this user id.
   * @apiParam (url) {String} user_id videos uploaded by this user id.
   *
   *
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *     "status": "success",
   *     "message": "Successfully done",
   *     "data": {
   *          "id": "4bb031b7-1a42-404c-8d67-1ae109db0550",
   *          "post": {
   *              "text": "",
   *              "media_url": "https://vimeo.com/447456562",
   *              "media_type": "video",
   *              "media_thumbnail": {
   *                  "sizes": [
   *                    {
   *                      "width": 200,
   *                      "height": 150,
   *                      "link": "",
   *                      "link_with_play_button": ""
   *                    },
   *                    {
   *                      "width": 1920,
   *                      "height": 1080,
   *                      "link": "",
   *                      "link_with_play_button": ""
   *                    },
   *                    {
   *                      "width": 960,
   *                      "height": 540,
   *                      "link": "",
   *                      "link_with_play_button": ""
   *                    }
   *                  ],
   *                  "url": "public/video-in-processing.jpg"
   *                },
   *              "meta": {
   *                  "abilities": [
   *                      {
   *                          "abilities": "Mental",
   *                          "attributes": [
   *                              "endurance"
   *                          ]
   *                      }
   *                  ],
   *                  "others": ["Team Play"]
   *              },
   *              "status": "pending"
   *          },
   *          "posted_by": {
   *              "avatar": "/uploads/avatar/user-avatar.png",
   *              "user_id": "49c9f40f-cb50-436f-900e-e98e6e76915b",
   *              "name": "acad5",
   *              "member_type": "academy",
   *              "type": "Residential"
   *          },
   *          "is_liked": false,
   *          "likes": 0,
   *          "comments": {
   *              "total": 0
   *          }
   *      }
   * }
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
  router.get(
    "/video/public/gallery/:user_id/:video_id",
    checkAuthToken,
    async (req, res, next) => {
      const { user_id, video_id } = req.params;

      const query = {
        id: video_id,
        user_id: user_id,
        authUser: req.authUser,
        mode: "public",
        media_type: PostMedia.VIDEO,
      };

      responseHandler(req, res, postServiceInst.getPublicVideo(query));
    }
  );
};
