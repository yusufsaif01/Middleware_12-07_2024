const PostUtility = require('../db/utilities/PostUtility');
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const POST_MEDIA = require('../constants/PostMedia');
const errors = require("../errors");

class PostService {

    constructor() {
        this.postUtilityInst = new PostUtility();
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
        if (!requestedData.reqObj.text && !requestedData.reqObj.media_url) {
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
        if (reqObj.text && !reqObj.media_url) {
            record.media = { text: reqObj.text };
        }
        if (!reqObj.text && reqObj.media_url) {
            record.media = {
                media_url: reqObj.media_url,
                media_type: POST_MEDIA.ALLOWED_MEDIA_TYPE
            }
        }
        if (reqObj.text && reqObj.media_url) {
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