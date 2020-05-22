const PostUtility = require('../db/utilities/PostUtility');
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const POST_MEDIA = require('../constants/PostMedia');
const errors = require("../errors");
const ConnectionUtility = require('../db/utilities/ConnectionUtility');
const CommentUtility = require('../db/utilities/CommentUtility');
const LikeUtility = require('../db/utilities/LikeUtility');
const PostsListResponseMapper = require("../dataModels/responseMapper/PostsListResponseMapper");

class PostService {

    constructor() {
        this.postUtilityInst = new PostUtility();
        this.connectionUtilityInst = new ConnectionUtility();
        this.commentUtilityInst = new CommentUtility();
        this.likeUtilityInst = new LikeUtility();
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
            await this.postUtilityInst.insert(record)
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
        if (!requestedData.reqObj.text && !requestedData.reqObj.media) {
            return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.TEXT_OR_IMAGE_REQUIRED));
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
            created_at: Date.now()
        };
        let reqObj = requestedData.reqObj;
        if (reqObj.text && !reqObj.media) {
            record.media = { text: reqObj.text };
        }
        if (!reqObj.text && reqObj.media) {
            record.media = {
                media_url: reqObj.media_url,
                media_type: POST_MEDIA.ALLOWED_MEDIA_TYPE
            }
        }
        if (reqObj.text && reqObj.media) {
            record.media = {
                text: reqObj.text,
                media_url: reqObj.media_url,
                media_type: POST_MEDIA.ALLOWED_MEDIA_TYPE
            }
        }
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
            let skipCount = (paginationOptions.page_no - 1) * paginationOptions.limit;
            let options = { limit: paginationOptions.limit, skip: skipCount };
            let data = await this.connectionUtilityInst.aggregate([{ $match: { user_id: requestedData.user_id, is_deleted: false } },
            { $project: { user_id_for_post: { $concatArrays: ["$followings", ["$user_id"]] }, _id: 0 } }, { $unwind: { path: "$user_id_for_post" } },
            { "$lookup": { "from": "posts", "localField": "user_id_for_post", "foreignField": "posted_by", "as": "post" } },
            { $unwind: { path: "$post" } }, { $match: { "post.is_deleted": false } }, { $project: { post: { id: 1, posted_by: 1, media: 1, created_at: 1 } } },
            { "$lookup": { "from": "likes", "localField": "post.id", "foreignField": "post_id", "as": "like_documents" } },
            { $project: { post: 1, filtered_likes: { $filter: { input: "$like_documents", as: "likeDocument", cond: { $eq: ["$$likeDocument.is_deleted", false] } } } } },
            { $project: { post: 1, likes: { $size: "$filtered_likes" }, likedByMe: { $filter: { input: "$filtered_likes", as: "likeDocument", cond: { $eq: ["$$likeDocument.liked_by", requestedData.user_id] } } } } },
            { "$lookup": { "from": "comments", "localField": "post.id", "foreignField": "post_id", "as": "comment_documents" } },
            { $project: { post: 1, likedByMe: 1, likes: 1, comments: { $size: { $filter: { input: "$comment_documents", as: "commentDocument", cond: { $eq: ["$$commentDocument.is_deleted", false] } } } } } },
            { $sort: { "post.created_at": -1 } }, { $skip: options.skip }, { $limit: options.limit }
            ]);
            let totalPosts = await this.connectionUtilityInst.aggregate([{ $match: { user_id: requestedData.user_id, is_deleted: false } },
            { $project: { user_id_for_post: { $concatArrays: ["$followings", ["$user_id"]] }, _id: 0 } }, { $unwind: { path: "$user_id_for_post" } },
            { "$lookup": { "from": "posts", "localField": "user_id_for_post", "foreignField": "posted_by", "as": "post" } },
            { $unwind: { path: "$post" } }, { $match: { "post.is_deleted": false } }, { $project: { post: { id: 1, posted_by: 1, media: 1, created_at: 1 } } },
            ]);
            data = new PostsListResponseMapper().map(data);
            let record = { total: totalPosts.length, records: data }
            return Promise.resolve(record)
        }
        catch (e) {
            console.log("Error in getPostsList() of PostService", e);
            return Promise.reject(e);
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
            let updatedRecord = await this.prepareUpdatedPostData(requestedData, currentDataOfPost);
            await this.postUtilityInst.updateOne({ id: requestedData.post_id }, updatedRecord);
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
            let foundPost = await this.postUtilityInst.findOne({ id: requestedData.post_id, posted_by: requestedData.user_id });
            if (!foundPost) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.POST_NOT_FOUND));
            }
            if (!requestedData.reqObj.text && !requestedData.reqObj.media) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.TEXT_OR_IMAGE_REQUIRED));
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
            updated_at: Date.now()
        };
        let reqObj = requestedData.reqObj;
        if (reqObj.text && !reqObj.media) {
            if (currentDataOfPost.media && currentDataOfPost.media.text && !currentDataOfPost.media.media_url) {
                record.media = { text: reqObj.text };
            }
            if (currentDataOfPost.media && currentDataOfPost.media.text && currentDataOfPost.media.media_url) {
                currentDataOfPost.media.text = reqObj.text;
                record.media = currentDataOfPost.media;
            }
        }
        if (!reqObj.text && reqObj.media) {
            if (currentDataOfPost.media && !currentDataOfPost.media.text && currentDataOfPost.media.media_url) {
                record.media = {
                    media_url: reqObj.media_url,
                    media_type: POST_MEDIA.ALLOWED_MEDIA_TYPE
                }
            }
            if (currentDataOfPost.media && currentDataOfPost.media.text && currentDataOfPost.media.media_url) {
                currentDataOfPost.media.media_url = reqObj.media_url;
                currentDataOfPost.media.media_type = POST_MEDIA.ALLOWED_MEDIA_TYPE;
                record.media = currentDataOfPost.media;
            }
        }
        if (reqObj.text && reqObj.media) {
            record.media = {
                text: reqObj.text,
                media_url: reqObj.media_url,
                media_type: POST_MEDIA.ALLOWED_MEDIA_TYPE
            }
        }
        return Promise.resolve(record);
    }
}

module.exports = PostService;