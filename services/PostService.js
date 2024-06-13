const PostUtility = require('../db/utilities/PostUtility');
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const POST_MEDIA = require('../constants/PostMedia');
const errors = require("../errors");
const ConnectionUtility = require('../db/utilities/ConnectionUtility');
const CommentUtility = require('../db/utilities/CommentUtility');
const LikeUtility = require('../db/utilities/LikeUtility');
const PostsListResponseMapper = require("../dataModels/responseMapper/PostsListResponseMapper");
const uuidv4 = require('uuid/v4');
const MEMBER = require('../constants/MemberType');
const PLAYER = require('../constants/PlayerType');
const PlayerUtility = require('../db/utilities/PlayerUtility');
const CommentsListResponseMapper = require("../dataModels/responseMapper/CommentListResponseMapper");
const PostStatus = require('../constants/PostStatus');
const PostType = require('../constants/PostType');
const VideoService = require('./VideoService');

class PostService {
  constructor() {
    this.postUtilityInst = new PostUtility();
    this.connectionUtilityInst = new ConnectionUtility();
    this.commentUtilityInst = new CommentUtility();
    this.likeUtilityInst = new LikeUtility();
    this.playerUtilityInst = new PlayerUtility();
    this.videoService = new VideoService();
  }

  /**
   * add new post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async addPost(requestedData = {}) {
    try {
      await this.addPostValiation(requestedData);
      let record = await this.preparePostData(requestedData);
      await this.postUtilityInst.insert(record);
      return Promise.resolve();
    } catch (e) {
      console.log("Error in addPost() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * validates request Data for addPost
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async addPostValiation(requestedData = {}) {
    if (!requestedData.reqObj.text && !requestedData.reqObj.media_url) {
      return Promise.reject(
        new errors.ValidationFailed(RESPONSE_MESSAGE.TEXT_OR_IMAGE_REQUIRED)
      );
    }
    return Promise.resolve();
  }

  /**
   * prepares post data
   *
   * @param {*} [requestedData={}]
   * @returns post data
   * @memberof PostService
   */
  async preparePostData(requestedData = {}) {
    let record = {
      posted_by: requestedData.user_id,
      created_at: Date.now(),
    };
    let reqObj = requestedData.reqObj;
    if (reqObj.text && !reqObj.media_url) {
      record.media = { text: reqObj.text };
    }
    if (!reqObj.text && reqObj.media_url) {
      record.media = {
        media_url: reqObj.media_url,
        media_type: POST_MEDIA.IMAGE,
      };
    }
    if (reqObj.text && reqObj.media_url) {
      record.media = {
        text: reqObj.text,
        media_url: reqObj.media_url,
        media_type: POST_MEDIA.IMAGE,
      };
    }

    // Default values for timeline post
    record.status = PostStatus.PUBLISHED;
    record.post_type = PostType.TIMELINE;

    return Promise.resolve(record);
  }

  /**
   * get posts list
   *
   * @param {*} [requestedData={}]
   * @returns list of posts
   * @memberof PostService
   */
  async getPostsList(requestedData = {}) {
    try {
      let paginationOptions = requestedData.paginationOptions || {};
      let commentOptions = requestedData.commentOptions || {};
      let skipCount = (paginationOptions.page_no - 1) * paginationOptions.limit;
      let options = { limit: paginationOptions.limit, skip: skipCount };
      let connection = await this.connectionUtilityInst.findOne(
        { user_id: requestedData.user_id },
        { followings: 1 }
      );
      let user_id_array_for_post = [requestedData.user_id];
      if (connection && connection.followings) {
        user_id_array_for_post = user_id_array_for_post.concat(
          connection.followings
        );
      }

      const matchCriteria = {
        posted_by: { $in: user_id_array_for_post },
        is_deleted: false,
        post_type: requestedData.filters.type,
      };

      // disabled for now
      if (false && requestedData.filters.ability) {
        let ability = requestedData.filters.ability;
        ability = ability.split(",");
        if (!Array.isArray(ability)) {
          ability = [ability];
        }
        matchCriteria["meta.abilities.ability_id"] = { $in: ability };
      }
      if (requestedData.filters.attribute) {
        let attribute = requestedData.filters.attribute;
        attribute = attribute.split(",");
        if (!Array.isArray(attribute)) {
          attribute = [attribute];
        }
        matchCriteria["meta.abilities.attributes.attribute_name"] = {
          $in: attribute,
        };
      }

      if (requestedData.filters.others) {
        let others = requestedData.filters.others;
        others = others.split(",");
        if (!Array.isArray(others)) {
          others = [others];
        }
        matchCriteria["meta.others"] = {
          $in: others,
        };
      }

      // filter to be provided by video list controller
      // to get only videos
      if (requestedData.filters.media_type) {
        matchCriteria["media.media_type"] = requestedData.filters.media_type;
      }

      matchCriteria["$or"] = [
        { status: PostStatus.PUBLISHED },
        { posted_by: requestedData.user_id },
      ];

      let data = await this.postUtilityInst.aggregate([
        { $match: matchCriteria },
        {
          $project: {
            post: {
              id: "$id",
              posted_by: "$posted_by",
              media: "$media",
              status: "$status",
              post_type: "$post_type",
              meta: "$meta",
              created_at: "$created_at",
              caption:"$caption"
            },
            _id: 0,
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "post.id",
            foreignField: "post_id",
            as: "like_documents",
          },
        },
        {
          $project: {
            post: 1,
            filtered_likes: {
              $filter: {
                input: "$like_documents",
                as: "likeDocument",
                cond: { $eq: ["$$likeDocument.is_deleted", false] },
              },
            },
          },
        },
        {
          $project: {
            post: 1,
            likes: { $size: "$filtered_likes" },
            likedByMe: {
              $filter: {
                input: "$filtered_likes",
                as: "likeDocument",
                cond: {
                  $eq: ["$$likeDocument.liked_by", requestedData.user_id],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "post.id",
            foreignField: "post_id",
            as: "comment_documents",
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            not_deleted_comments: {
              $filter: {
                input: "$comment_documents",
                as: "commentDocument",
                cond: { $eq: ["$$commentDocument.is_deleted", false] },
              },
            },
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: { $size: "$not_deleted_comments" },
              data: {
                $reverseArray: { $slice: ["$not_deleted_comments", -3] },
              },
            },
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                $cond: {
                  if: { $eq: [commentOptions.comments, 0] },
                  then: [],
                  else: "$comments.data",
                },
              },
            },
          },
        },
        {
          $unwind: { path: "$comments.data", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "club_academy_details",
            localField: "comments.data.commented_by",
            foreignField: "user_id",
            as: "club_academy_detail",
          },
        },
        {
          $unwind: {
            path: "$club_academy_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                created_at: 1,
                comment: 1,
                commented_by: 1,
                club_academy_detail: {
                  avatar_url: "$club_academy_detail.avatar_url",
                  name: "$club_academy_detail.name",
                  member_type: "$club_academy_detail.member_type",
                  user_id: "$club_academy_detail.user_id",
                  type: "$club_academy_detail.type",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "player_details",
            localField: "comments.data.commented_by",
            foreignField: "user_id",
            as: "player_detail",
          },
        },
        {
          $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                created_at: 1,
                comment: 1,
                club_academy_detail: 1,
                player_detail: {
                  first_name: "$player_detail.first_name",
                  last_name: "$player_detail.last_name",
                  avatar_url: "$player_detail.avatar_url",
                  user_id: "$player_detail.user_id",
                  player_type: "$player_detail.player_type",
                  position: "$player_detail.position",
                },
              },
            },
          },
        },
        {
          $group: {
            _id: "$post.id",
            likedByMe: { $first: "$likedByMe" },
            likes: { $first: "$likes" },
            post: { $first: "$post" },
            total_comments: { $first: "$comments.total" },
            data: { $push: "$comments.data" },
          },
        },
        {
          $project: {
            _id: 0,
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: "$total_comments",
              data: {
                $cond: {
                  if: { $eq: ["$total_comments", 0] },
                  then: [],
                  else: "$data",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "club_academy_details",
            localField: "post.posted_by",
            foreignField: "user_id",
            as: "club_academy_detail",
          },
        },
        {
          $unwind: {
            path: "$club_academy_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: 1,
            club_academy_detail: {
              avatar_url: 1,
              name: 1,
              type: 1,
              member_type: 1,
              user_id: 1,
            },
          },
        },
        {
          $lookup: {
            from: "player_details",
            localField: "post.posted_by",
            foreignField: "user_id",
            as: "player_detail",
          },
        },
        {
          $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                $cond: {
                  if: { $eq: [commentOptions.comments, 0] },
                  then: [],
                  else: "$comments.data",
                },
              },
            },
            club_academy_detail: 1,
            player_detail: {
              first_name: 1,
              last_name: 1,
              avatar_url: 1,
              user_id: 1,
              player_type: 1,
              position: 1,
            },
          },
        },
        { $sort: { "post.created_at": -1 } },
        { $skip: options.skip },
        { $limit: options.limit },
      ]);
        let totalPosts = await this.postUtilityInst.countList(matchCriteria);
       
      data = new PostsListResponseMapper().map(data, commentOptions.comments);
        let record = { total: totalPosts, records: data };
      
      return Promise.resolve(record);
    } catch (e) {
      console.log("Error in getPostsList() of PostService", e);
      return Promise.reject(e);
    }
  }

  async getPublicVideo(query) {
    const findWhere = {
      id: query.id,
      posted_by: query.user_id,
      is_deleted: false,
      "media.media_type": query.media_type,
    };
    if (query.user_id != query.authUser.user_id) {
      findWhere["status"] = PostStatus.PUBLISHED;
    }
    const preFetchVideo = await this.postUtilityInst.findOne(findWhere, {
      post_type: 1,
    });

    if (!preFetchVideo) {
      return Promise.reject(
        new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND)
      );
    }

    if (query.user_id != query.authUser.user_id) {
      // user can see his uploaded video
      await this.videoService.matchesPublicCriteria({
        user_id: query.user_id,
        authUser: query.authUser,
        post_type: preFetchVideo.post_type,
      });
    }

    return await this.getPost(query);
  }

  async getPost({ id, user_id, media_type, mode, authUser, post_type }) {
    try {
      const $where = {
        id: id,
        posted_by: user_id,
        is_deleted: false,
        "media.media_type": media_type,
      };

      if (mode == "public") {
        // show only published video to viewers
        if (user_id != authUser.user_id) {
          $where.status = PostStatus.PUBLISHED;
        }
      }

      const commentOptions = {
        comments: 1,
      };

      let data = await this.postUtilityInst.aggregate([
        { $match: $where },
        {
          $project: {
            post: {
              id: "$id",
              posted_by: "$posted_by",
              media: "$media",
              status: "$status",
              post_type: "$post_type",
              meta: "$meta",
              created_at: "$created_at",
            },
            _id: 0,
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "post.id",
            foreignField: "post_id",
            as: "like_documents",
          },
        },
        {
          $project: {
            post: 1,
            filtered_likes: {
              $filter: {
                input: "$like_documents",
                as: "likeDocument",
                cond: { $eq: ["$$likeDocument.is_deleted", false] },
              },
            },
          },
        },
        {
          $project: {
            post: 1,
            likes: { $size: "$filtered_likes" },
            likedByMe: {
              $filter: {
                input: "$filtered_likes",
                as: "likeDocument",
                cond: { $eq: ["$$likeDocument.liked_by", user_id] },
              },
            },
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "post.id",
            foreignField: "post_id",
            as: "comment_documents",
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            not_deleted_comments: {
              $filter: {
                input: "$comment_documents",
                as: "commentDocument",
                cond: { $eq: ["$$commentDocument.is_deleted", false] },
              },
            },
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: { $size: "$not_deleted_comments" },
              data: {
                $reverseArray: { $slice: ["$not_deleted_comments", -3] },
              },
            },
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                $cond: {
                  if: { $eq: [commentOptions.comments, 0] },
                  then: [],
                  else: "$comments.data",
                },
              },
            },
          },
        },
        {
          $unwind: { path: "$comments.data", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "club_academy_details",
            localField: "comments.data.commented_by",
            foreignField: "user_id",
            as: "club_academy_detail",
          },
        },
        {
          $unwind: {
            path: "$club_academy_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                created_at: 1,
                comment: 1,
                commented_by: 1,
                club_academy_detail: {
                  avatar_url: "$club_academy_detail.avatar_url",
                  name: "$club_academy_detail.name",
                  member_type: "$club_academy_detail.member_type",
                  user_id: "$club_academy_detail.user_id",
                  type: "$club_academy_detail.type",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "player_details",
            localField: "comments.data.commented_by",
            foreignField: "user_id",
            as: "player_detail",
          },
        },
        {
          $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                created_at: 1,
                comment: 1,
                club_academy_detail: 1,
                player_detail: {
                  first_name: "$player_detail.first_name",
                  last_name: "$player_detail.last_name",
                  avatar_url: "$player_detail.avatar_url",
                  user_id: "$player_detail.user_id",
                  player_type: "$player_detail.player_type",
                  position: "$player_detail.position",
                },
              },
            },
          },
        },
        {
          $group: {
            _id: "$post.id",
            likedByMe: { $first: "$likedByMe" },
            likes: { $first: "$likes" },
            post: { $first: "$post" },
            total_comments: { $first: "$comments.total" },
            data: { $push: "$comments.data" },
          },
        },
        {
          $project: {
            _id: 0,
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: "$total_comments",
              data: {
                $cond: {
                  if: { $eq: ["$total_comments", 0] },
                  then: [],
                  else: "$data",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "club_academy_details",
            localField: "post.posted_by",
            foreignField: "user_id",
            as: "club_academy_detail",
          },
        },
        {
          $unwind: {
            path: "$club_academy_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: 1,
            club_academy_detail: {
              avatar_url: 1,
              name: 1,
              type: 1,
              member_type: 1,
              user_id: 1,
            },
          },
        },
        {
          $lookup: {
            from: "player_details",
            localField: "post.posted_by",
            foreignField: "user_id",
            as: "player_detail",
          },
        },
        {
          $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            post: 1,
            likedByMe: 1,
            likes: 1,
            comments: {
              total: 1,
              data: {
                $cond: {
                  if: { $eq: [commentOptions.comments, 0] },
                  then: [],
                  else: "$comments.data",
                },
              },
            },
            club_academy_detail: 1,
            player_detail: {
              first_name: 1,
              last_name: 1,
              avatar_url: 1,
              user_id: 1,
              player_type: 1,
              position: 1,
            },
          },
        },
      ]);

      if (data.length == 0) {
        throw new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND);
      }

      data = new PostsListResponseMapper().map(data, commentOptions.comments);

      return Promise.resolve(data[0]);
    } catch (error) {
      console.log("Error in getting post", error);
      return Promise.reject(error);
    }
  }

  /**
   * edit post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async editPost(requestedData = {}) {
    try {
      let currentDataOfPost = await this.editPostValiation(requestedData);
      let updatedRecord = await this.prepareUpdatedPostData(
        requestedData,
        currentDataOfPost
      );
      await this.postUtilityInst.updateOne(
        { id: requestedData.post_id },
        updatedRecord
      );
      return Promise.resolve();
    } catch (e) {
      console.log("Error in editPost() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * validates request data for editPost
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async editPostValiation(requestedData = {}) {
    try {
      let foundPost = await this.postUtilityInst.findOne({
        id: requestedData.post_id,
        posted_by: requestedData.user_id,
      });
      if (!foundPost) {
        return Promise.reject(
          new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND)
        );
      }
      if (!requestedData.reqObj.text && !requestedData.reqObj.media_url) {
        return Promise.reject(
          new errors.ValidationFailed(RESPONSE_MESSAGE.TEXT_OR_IMAGE_REQUIRED)
        );
      }
      return Promise.resolve(foundPost);
    } catch (e) {
      console.log("Error in editPostValidation() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * prepare updated post data
   *
   * @param {*} [requestedData={}]
   * @param {*} [currentDataOfPost={}]
   * @returns updated record
   * @memberof PostService
   */
  async prepareUpdatedPostData(requestedData = {}, currentDataOfPost = {}) {
    let record = {
      updated_at: Date.now(),
    };
    let reqObj = requestedData.reqObj;
    record.media = {
      text:
        reqObj.text ||
        (currentDataOfPost.media ? currentDataOfPost.media.text : ""),
      media_url:
        reqObj.media_url ||
        (currentDataOfPost.media ? currentDataOfPost.media.media_url : ""),
      media_type: currentDataOfPost.media
        ? currentDataOfPost.media.media_type
        : POST_MEDIA.IMAGE,
    };
    return Promise.resolve(record);
  }

  /**
   * delete post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async deletePost(requestedData = {}) {
    try {
      let foundPost = await this.postUtilityInst.findOne({
        id: requestedData.post_id,
        posted_by: requestedData.user_id,
      });
      if (foundPost) {
        await this.postUtilityInst.findOneAndUpdate(
          { id: requestedData.post_id },
          { is_deleted: true, deleted_at: Date.now() }
        );
        return Promise.resolve();
      }
      throw new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND);
    } catch (e) {
      console.log("Error in deletePost() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * like a post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async likePost(requestedData = {}) {
    try {
      let foundPost = await this.postUtilityInst.findOne({
        id: requestedData.post_id,
      });
      if (foundPost) {
        await this.isFollowingPostOwner(requestedData, foundPost);
        let likeRecord = await this.likeUtilityInst.findOne({
          post_id: requestedData.post_id,
          liked_by: requestedData.user_id,
        });
        if (likeRecord && likeRecord.is_deleted === false) {
          return Promise.reject(
            new errors.ValidationFailed(RESPONSE_MESSAGE.ALREADY_LIKED)
          );
        }
        let updatedRecord = {
          id: likeRecord ? likeRecord.id : uuidv4(),
          post_id: requestedData.post_id,
          liked_by: requestedData.user_id,
          created_at: Date.now(),
          is_deleted: false,
        };
        await this.likeUtilityInst.updateOne(
          { post_id: requestedData.post_id, liked_by: requestedData.user_id },
          updatedRecord,
          { upsert: true }
        );
        return Promise.resolve();
      }
      throw new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND);
    } catch (e) {
      console.log("Error in likePost() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * checks if the user follows the post owner
   *
   * @param {*} [requestedData={}]
   * @param {*} [postData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async isFollowingPostOwner(requestedData = {}, postData = {}) {
    try {
      let following = await this.connectionUtilityInst.findOne(
        {
          user_id: requestedData.user_id,
          followings: postData.posted_by,
        },
        { followings: 1, _id: 0 }
      );
      if (!following && requestedData.user_id !== postData.posted_by) {
        return Promise.reject(
          new errors.ValidationFailed(
            RESPONSE_MESSAGE.YOU_DO_NOT_FOLLOW_THE_POST_OWNER
          )
        );
      }
      return Promise.resolve();
    } catch (e) {
      console.log("Error in isFollowingPostOwner() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * dislike a post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async dislikePost(requestedData = {}) {
    try {
      let foundPost = await this.postUtilityInst.findOne({
        id: requestedData.post_id,
      });
      if (foundPost) {
        let likeRecord = await this.likeUtilityInst.findOne({
          post_id: requestedData.post_id,
          liked_by: requestedData.user_id,
          is_deleted: false,
        });
        if (!likeRecord) {
          return Promise.reject(
            new errors.ValidationFailed(RESPONSE_MESSAGE.ALREADY_DISLIKED)
          );
        }
        let updatedRecord = { is_deleted: true };
        await this.likeUtilityInst.updateOne(
          { post_id: requestedData.post_id, liked_by: requestedData.user_id },
          updatedRecord
        );
        return Promise.resolve();
      }
      throw new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND);
    } catch (e) {
      console.log("Error in dislikePost() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * add comment to a post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async addComment(requestedData = {}) {
    try {
      await this.isAllowedToComment(requestedData);
      let foundPost = await this.postUtilityInst.findOne({
        id: requestedData.post_id,
      });
      if (foundPost) {
        await this.isFollowingPostOwner(requestedData, foundPost);
        let record = {
          post_id: requestedData.post_id,
          comment: requestedData.reqObj.comment,
          commented_by: requestedData.user_id,
          created_at: Date.now(),
        };
        await this.commentUtilityInst.insert(record);
        return Promise.resolve();
      }
      throw new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND);
    } catch (e) {
      console.log("Error in addComment() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * checks if the user is allowed to comment on a post
   *
   * @param {*} [requestedData={}]
   * @returns success or error response
   * @memberof PostService
   */
  async isAllowedToComment(requestedData = {}) {
    try {
      if (requestedData.member_type === MEMBER.PLAYER) {
        let playerDetail = await this.playerUtilityInst.findOne(
          { user_id: requestedData.user_id },
          { player_type: 1 }
        );
        if (playerDetail && !playerDetail.player_type) {
          return Promise.reject(
            new errors.ValidationFailed(RESPONSE_MESSAGE.NOT_ALLOWED_TO_COMMENT)
          );
        }
        if (
          playerDetail &&
          playerDetail.player_type &&
          playerDetail.player_type !== PLAYER.PROFESSIONAL
        ) {
          return Promise.reject(
            new errors.ValidationFailed(RESPONSE_MESSAGE.NOT_ALLOWED_TO_COMMENT)
          );
        }
      }
      return Promise.resolve();
    } catch (e) {
      console.log("Error in isAllowedToComment() of PostService", e);
      return Promise.reject(e);
    }
  }

  /**
   * get comments list for a post
   *
   * @param {*} [requestedData={}]
   * @returns list of comments for a post
   * @memberof PostService
   */
  async getCommentsList(requestedData = {}) {
    try {
      let paginationOptions = requestedData.paginationOptions || {};
      let skipCount = (paginationOptions.page_no - 1) * paginationOptions.limit;
      let options = { limit: paginationOptions.limit, skip: skipCount };
      let data = await this.commentUtilityInst.aggregate([
        { $match: { post_id: requestedData.post_id, is_deleted: false } },
        { $project: { comment: 1, commented_by: 1, created_at: 1, _id: 0 } },
        {
          $lookup: {
            from: "club_academy_details",
            localField: "commented_by",
            foreignField: "user_id",
            as: "club_academy_detail",
          },
        },
        {
          $unwind: {
            path: "$club_academy_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            created_at: 1,
            comment: 1,
            commented_by: 1,
            club_academy_detail: {
              avatar_url: 1,
              name: 1,
              member_type: 1,
              user_id: 1,
              type: 1,
            },
          },
        },
        {
          $lookup: {
            from: "player_details",
            localField: "commented_by",
            foreignField: "user_id",
            as: "player_detail",
          },
        },
        {
          $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            created_at: 1,
            comment: 1,
            club_academy_detail: 1,
            player_detail: {
              first_name: 1,
              last_name: 1,
              avatar_url: 1,
              user_id: 1,
              player_type: 1,
              position: 1,
            },
          },
        },
        { $sort: { created_at: -1 } },
        { $skip: options.skip },
        { $limit: options.limit },
      ]);
      data = new CommentsListResponseMapper().map(data);
      let totalComments = await this.commentUtilityInst.countList({
        post_id: requestedData.post_id,
        is_deleted: false,
      });
      let record = { total: totalComments, records: data };
      return Promise.resolve(record);
    } catch (e) {
      console.log("Error in getPostsList() of PostService", e);
      return Promise.reject(e);
    }
  }
}

module.exports = PostService;