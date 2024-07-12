const POST_TYPE = require("../constants/PostType");
const ROLE = require("../constants/Role");
const AbilityUtility = require("../db/utilities/AbilityUtility");
const AttributeUtility = require("../db/utilities/AttributeUtility");
const errors = require("../errors");
const ResponseMessage = require("../constants/ResponseMessage");
const vimeoLib = require("../lib/vimeo");
const PostUtility = require("../db/utilities/PostUtility");
const PostMedia = require("../constants/PostMedia");
const PostStatus = require("../constants/PostStatus");
const VideoQueueService = require("./VideoQueueService");
const config = require("../config");
const VideoResponseMapper = require("../dataModels/responseMapper/VideoResponseMapper");
const LoginUtility = require("../db/utilities/LoginUtility");
const FootPlayerUtility = require("../db/utilities/FootPlayerUtility");
const ClubAcademyUtility = require("../db/utilities/ClubAcademyUtility");
const PostType = require("../constants/PostType");
const FootPlayerStatus = require("../constants/FootPlayerStatus");
const _ = require("lodash");
const ConnectionUtility = require('../db/utilities/ConnectionUtility');
const abilityInst = new AbilityUtility();
const attributeInst = new AttributeUtility();
const postInst = new PostUtility();
const loginInst = new LoginUtility();
const footPlayerInst = new FootPlayerUtility();

module.exports = class VideoService {
  constructor() {
    this.videoQueueService = new VideoQueueService();
    this.connectionUtilityInst = new ConnectionUtility();
    this.clubacademyutility = new ClubAcademyUtility();
  }

  async uploadVideo(authUser, type, { tags, media, others, text }) {

    try { 
      console.log("inside video upload")
      const totalUpload =  await this.getUploadLimit( authUser.role, type)
      const hasUploaded = await this.hasUploadedInWeek(authUser, type, totalUpload)
       
      if (hasUploaded <totalUpload){
     
        const videoOptions = this.getUploadOptions(authUser, type);
        
      const tagsData = await this.validateAttributesAndAbilities(tags);
      const videoResponse = await this.uploadToVimeo(media, videoOptions);

      const postDocument = await this.addPost(
        authUser,
        type,
        tagsData,
        videoResponse,
        others,
        text
      );
      await this.videoQueueService.addToQueue({
        post_id: postDocument.id,
        uri: videoResponse.uri,
      });

      console.log("video uploaded -- test")
      console.log(videoResponse.uri);
    }
  else{
    console.log("error in uploading --limit exceeded");
    throw new errors.ValidationFailed(ResponseMessage.VIDEO_LIMIT_EXCEEDED());
  }
  } catch (error) {

      return Promise.reject(error);
    }
  }
  
 async  getUploadOptions(authUser, type) {
    const options = {
      [POST_TYPE.TIMELINE]: {
        max_duration: 60 * 6,
      },
      [POST_TYPE.LEARNING_OR_TRAINING]: {
        max_duration: 60 * 40,
      },
      [POST_TYPE.MATCH]: {
        max_duration: 200 * 60,
      },
    };

    if ([ROLE.CLUB, ROLE.ACADEMY].includes(authUser.role)) {
      options[POST_TYPE.TIMELINE].max_duration = 60 * 5;
    }

    return options[type];
  }
  //

 async  getUploadLimit(role, type) {
  const uploadLimits = {
    [ROLE.PLAYER]: {
      [POST_TYPE.TIMELINE]: 4,
    },
    [ROLE.CLUB]: {
      [POST_TYPE.TIMELINE]: 4,
      [POST_TYPE.LEARNING_OR_TRAINING]: 2,
      [POST_TYPE.MATCH]: 50,
    },
    [ROLE.ACADEMY]: {
      [POST_TYPE.TIMELINE]: 4,
      [POST_TYPE.LEARNING_OR_TRAINING]: 2,
      [POST_TYPE.MATCH]: 50,
    },
    [ROLE.coach]: {
      [POST_TYPE.TIMELINE]: 10,
    },
  };

  return uploadLimits[role][type] || 0;
}

async  hasUploadedInWeek(authUser, POST_TYPE, totalUpload) {
try {
    
const today = new Date();
const todayISOString = today.toISOString();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay());
startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
startOfWeek.setUTCMilliseconds(-startOfWeek.getTimezoneOffset() * 60 * 1000);
const startOfWeekISOString = startOfWeek.toISOString();
const endOfWeek = new Date(today);
endOfWeek.setDate(startOfWeek.getDate() + 6);
endOfWeek.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
endOfWeek.setUTCMilliseconds(-endOfWeek.getTimezoneOffset() * 60 * 1000); 
const endOfWeekISOString = endOfWeek.toISOString();
console.log('Today:', todayISOString);
console.log('Start of the week:', startOfWeekISOString);
console.log('End of the week:', endOfWeekISOString);
//const userId1 = { id: 'c13eff28-1ec6-477d-970c-3682911c8aea' }; 
const userId1 = { id: authUser.user_id }; 
console.log(userId1.id, " user id 1 value");
//post_type:POST_TYPE
    const conditions =  {posted_by:  userId1.id.toString() , "media.media_type" : "video", 
    post_type: POST_TYPE,  
    created_at: { $gte: startOfWeek.getTime(), $lte: endOfWeek.getTime() }
  }
let  count = await postInst.countList(conditions);
//const postCounts = { [userId1.id]: count };
// console.log(postCounts, "count of posts")
console.log(`Number of posts by ${userId1.id}: ${count}`);
console.log(count)
return count
// console.log(postCounts);
  } 
  catch (error) {
    console.log("Error in checking video uploads for the week", error);
    // throw new errors.ValidationFailed(ResponseMessage.UPLOAD_LIMIT_EXCEEDED);

  }
}

  async validateAttributesAndAbilities(tags) {
    try {
      const data=JSON.parse(tags);
      const abilityIdArray = data.map((tag) => tag.ability);
      let abilitiesDB = await abilityInst.aggregate([
        { $match: { id: { $in: abilityIdArray } } },
        {
          $lookup: {
            from: "attributes",
            localField: "id",
            foreignField: "ability_id",
            as: "attributes",
          },
        },
        {
          $project: { _id: 0, id: 1, name: 1, attributes: { id: 1, name: 1 } },
        },
      ]);

      let mappedData = {};
      abilitiesDB.forEach((abilities) => {
        mappedData[abilities.id] = abilities;
      });

      return data.map((tag) => {
        if (!mappedData[tag.ability]) {
          return null;
        }

        const ability = mappedData[tag.ability];

        return {
          ability_id: ability.id,
          ability_name: ability.name,
          attributes: ability.attributes
            .filter((attr) => tag.attributes.includes(attr.id))
            .map((filteredAttr) => ({
              attribute_id: filteredAttr.id,
              attribute_name: filteredAttr.name,
            })),
        };
      });
    } catch (error) {
      console.log("Error in processing mapped attributes", error);
      throw new errors.ValidationFailed(ResponseMessage.ERROR_IN_TAGS);
    }
  }

  async uploadToVimeo(media, { max_duration }) {
    try {
      const { uri } = await vimeoLib.uploadToVimeo(media, {
        maxDuration: max_duration,
      });
      const videoInfo = await vimeoLib.getVideoInfo(uri);

      const payload = {
        uri: videoInfo.uri,
        link: videoInfo.link,
        embedCode: videoInfo.embed.html,
      };

      return payload;
    } catch (error) {
      console.log("There was an error in uploading video to Vimeo server");
      return Promise.reject(error);
    }
  }

  async addPost(authUser, type, dataTags, videoResponse, others, text) {
    try {
      console.log("text inside addPost",text)
      const data = {
        posted_by: authUser.user_id,
        created_at: Date.now(),
        media: {
          media_url: videoResponse.link,
          media_thumbnail: {
            url: config.vimeo.video_in_processing_thumbnail,
          },
          media_type: PostMedia.VIDEO,
        },
        status: PostStatus.PENDING,
        post_type: type,
        caption:text,
        meta: {
          abilities: dataTags,
          others: others,
        },
      };
      const document = await postInst.insert(data);
      return Promise.resolve(document);
    } catch (error) {
      console.log("There was error in adding post", error);
      return Promise.reject(error);
    }
  }

  async updateVideo(postId, authUser, { tags, others }) {
    try {
      const tagsData = await this.validateAttributesAndAbilities(tags);
      const $where = {
        id: postId,
        posted_by: authUser.user_id,
        "media.media_type": PostMedia.VIDEO,
      };
      await this.getVideo($where);
      await postInst.updateOne($where, {
        "meta.abilities": tagsData,
        "meta.others": others,
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getVideo(query) {
    try {
      query["is_deleted"] = false;
      const video = await postInst.findOne(query);

      if (!video) {
        throw new errors.NotFound(ResponseMessage.VIDEO_NOT_FOUND);
      }

      return video;
    } catch (error) {
      console.log("Error getting video", error);
      throw error;
    }
  }

  async getVideosList({ query, pagination }) {
    try {
      const skipCount = (pagination.page_no - 1) * pagination.limit;
      const options = {limit: pagination.limit, skip: skipCount };
      console.log("query is ===>")
      console.log(query)
      let user_id_array = [query.user_id];
      if(query.post_type!=='timeline'){
      let connection = await this.connectionUtilityInst.findOne({ user_id: query.user_id }, { followings: 1 });
      console.log("connection is =>")
      console.log(connection)
     
      //let user_id_array = [query.user_id];

      console.log("1st user id array")
      console.log(user_id_array)

      if (connection && connection.followings) {
          user_id_array = user_id_array.concat(connection.followings);
        console.log("2nd user id array")
        console.log(user_id_array)
        //let connection = await this.connectionUtilityInst.findOne({ user_id: query.user_id }, { followings: 1 });
      }
    }
    console.log("final user id array is")
    console.log(user_id_array)
      const $where = await this.listMatchCriteria(query,user_id_array);

      $where["is_deleted"] = false;

      if (query.attribute) {
        const attribute = query.attribute.split(",");
        $where["meta.abilities.attributes.attribute_name"] = {
          $in: attribute,
        };
      }
      const pipelines = [
        {
          $match: $where,
        },
        {
          $project: {
            id: 1,
            media: 1,
            post_type: 1,
            status: 1,
            created_at: 1,
            meta: 1,
          },
        },
        {
          $sort: { "post.createdAt": -1 },
        },
        { $skip: options.skip },
        { $limit: options.limit },
      ];
      let posts = await postInst.aggregate(pipelines);

      if (query.others) {
        const $whereOthers = await this.listMatchCriteria(query,id);

        $whereOthers["is_deleted"] = false;
        const others = query.others.split(",");
        $whereOthers["meta.others"] = {
          $in: others,
        };

        const othersPipelines = [
          {
            $match: $whereOthers,
          },
          {
            $project: {
              id: 1,
              media: 1,
              post_type: 1,
              status: 1,
              created_at: 1,
              meta: 1,
            },
          },
          {
            $sort: { "post.createdAt": -1 },
          },
          { $skip: options.skip },
          { $limit: options.limit },
        ];
        const otherPost = await postInst.aggregate(othersPipelines);
        posts = [...posts, ...otherPost];
        posts = _.uniqBy(posts, 'id');       
      }

      let totalCount = posts.length;

      return this.processVideoListResponse(
        {
          total: totalCount,
          records: VideoResponseMapper.map(posts),
          
          posted_by: await loginInst.find(
            {
            //  posted_by: { $in: user_id_array_for_post },
              user_id: {$in:user_id_array},
              is_deleted: false,
            },
            { member_type: 1, user_id: 1, _id: 0 }
          ),
        },
        query,
        user_id_array,
      );
    } catch (error) {
      console.log("Error in getVideosList() of VideoService", error);
      return Promise.reject(error);
    }
  }

  async processVideoListResponse(data, query,id) {
    if (
      [ROLE.CLUB, ROLE.ACADEMY, ROLE.PLAYER].includes(data.posted_by.member_type) &&
      query.authUser.user_id != query.user_id
    ) {
      const ifExists = await footPlayerInst.find({
       // posted_by: { $in: user_id_array_for_post },
        sent_by: {$in:id},
        "send_to.user_id": query.authUser.user_id,
        status: FootPlayerStatus.ADDED,
      });
      ifExists ? (data.is_footplayer = true) : (data.is_footplayer = false);
    }

    return data;
  }

  async listMatchCriteria(query,id) {
    try {
      const defaults = {
        posted_by: {$in: id},
        post_type: query.post_type,
        "media.media_type": query.media_type,
      };

      if (query.mode == "public") {
        return await this.getPublicMatchCriteria(query);
      }

      return defaults;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getPublicMatchCriteria(query) {
    try {
      const defaults = {
        posted_by: query.user_id,
        post_type: query.post_type,
        "media.media_type": query.media_type,
      };

      if (query.user_id == query.authUser.user_id) {
        return defaults;
      }

      defaults.status = PostStatus.PUBLISHED;

      await this.matchesPublicCriteria(query);
      return defaults;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async matchesPublicCriteria(query) {
    const userLoginDetails = await this.getUserLogin(query.user_id);

    if ([ROLE.CLUB, ROLE.ACADEMY].includes(userLoginDetails.role)) {
      const ifExists = await footPlayerInst.findOne({
        sent_by: userLoginDetails.user_id,
        "send_to.user_id": query.authUser.user_id,
        status: FootPlayerStatus.ADDED,
      });

      if (!ifExists && query.post_type != PostType.TIMELINE) {
        // defaults.post_type = PostType.TIMELINE
        throw new errors.NotFound();
      }
    }
  }

  async getUserLogin(userId) {
    const user = await loginInst.findOne({ user_id: userId });
    if (!user) {
      throw new errors.NotFound(ResponseMessage.USER_NOT_FOUND);
    }
    return user;
  }
};
