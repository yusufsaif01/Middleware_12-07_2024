const { extname } = require("path");
const ResponseHandler = require("../../ResponseHandler");
const PostType = require("../../constants/PostType");
const errors = require("../../errors");
const ResponseMessage = require("../../constants/ResponseMessage");
const Role = require("../../constants/Role");
const Joi = require("@hapi/joi");
const CustomMessages = require("./CustomMessages");
const PostMedia = require("../../constants/PostMedia");
const PostOtherTags = require("../../constants/PostOtherTags");
const LoginUtility = require("../../db/utilities/LoginUtility");
const ProfileStatus = require("../../constants/ProfileStatus");
const AccountStatus = require("../../constants/AccountStatus");

const loginUtilityInst = new LoginUtility();

module.exports = {
  middleware(req, res, next) {
    const { type } = req.query;
    if (!PostType.ALLOWED_POST_TYPES.includes(type)) {
      return ResponseHandler(
        req,
        res,
        Promise.reject(
          new errors.ValidationFailed(ResponseMessage.INVALID_POST_TYPE)
        )
      );
    }
    next();
  },
  async userCanUploadVideo(req, res, next) {
    try {
      const { type } = req.query;

      if (type != PostType.TIMELINE && req.authUser.role == Role.PLAYER) {
        throw new errors.ValidationFailed(
          ResponseMessage.NOT_ALLOWED_TO_UPLOAD_VIDEO
        );
      }

      const loginUser = await loginUtilityInst.findOne(
        {
          user_id: req.authUser.user_id,
          is_deleted: false,
        },
        { profile_status: 1, status: 1 }
      );

      if (!loginUser) {
        throw new errors.ValidationFailed(ResponseMessage.USER_NOT_FOUND);
      }

      if (loginUser.status != AccountStatus.ACTIVE)
        throw new errors.ValidationFailed(
          ResponseMessage.ACCOUNT_NOT_ACTIVATED
        );

      if (loginUser.profile_status.status != ProfileStatus.VERIFIED) {
        throw new errors.ValidationFailed(
          ResponseMessage.PROFILE_NOT_VERIFIED_VIDEO
        );
      }

      next();
    } catch (error) {
      return ResponseHandler(req, res, Promise.reject(error));
    }
  },
  async validateData(req, res, next) {
    const playerRestrictions = {
      max_attributes: 3,
      max_abilities: 2,
    };

    let abilitiesSchema = Joi.array().unique("ability");
    let attributesSchema = Joi.array().unique();

    let others = req.body.others;

    try {
      if (typeof others == "string") {
        others = JSON.parse(others);
      }
    } catch (error) {
      return ResponseHandler(
        req,
        res,
        Promise.reject(
          new errors.ValidationFailed(ResponseMessage.INVALID_JSON)
        )
      );
    }

    if (!others || (Array.isArray(others) && others.length == 0)) {
      abilitiesSchema = abilitiesSchema.required().min(1);
      attributesSchema = attributesSchema.required().min(1);
    }

    if (req.authUser.role == Role.PLAYER) {
      abilitiesSchema = abilitiesSchema.max(playerRestrictions.max_abilities);
      attributesSchema = attributesSchema.max(
        playerRestrictions.max_attributes
      );
    }

    abilitiesSchema = abilitiesSchema.error(
      CustomMessages(
        {
          "any.required": ResponseMessage.ABILITY_REQUIRED,
          "array.min": ResponseMessage.ABILITY_MIN_VALIDATION,
          "array.unique": ResponseMessage.ABILITY_UNIQUE_VALIDATION,
          "array.max": ResponseMessage.ABILITY_MAX_VALIDATION(
            playerRestrictions.max_abilities
          ),
        },
        ResponseMessage.ABILITY_INVALID_VALIDATION
      )
    );
    attributesSchema = attributesSchema.error(
      CustomMessages(
        {
          "any.required": ResponseMessage.ATTRIBUTE_REQUIRED,
          "array.min": ResponseMessage.ATTRIBUTE_MIN_VALIDATION,
          "array.unique": ResponseMessage.ATTRIBUTE_UNIQUE_VALIDATION,
          "array.max": ResponseMessage.ATTRIBUTE_MAX_VALIDATION(
            playerRestrictions.max_abilities
          ),
        },
        ResponseMessage.ATTRIBUTE_INVALID_VALIDATION
      )
    );

    const schema = Joi.object().keys({
      tags: abilitiesSchema.items(
        Joi.object().keys({
          ability: Joi.string().required(),
          attributes: attributesSchema.items(Joi.string().required()),
        })
      ),
      others: Joi.array()
        .unique()
        .items(
          Joi.string()
            .valid(PostOtherTags.VALID_POST_TAGS)
            .error(() => ResponseMessage.TAG_IS_INVALID)
        ),
    });

    try {
      const body = await Joi.validate(req.body, schema);
      req.body = body;
      next();
    } catch (error) {
      console.log(error);
      return ResponseHandler(
        req,
        res,
        Promise.reject(new errors.ValidationFailed(error.details[0].message))
      );
    }
  },

  checkUploadedVideo(req, res, next) {
    if (req.files && req.files.media) {
      let uploadedMedia = req.files.media;

      // allow only one video at a time.
      if (Array.isArray(uploadedMedia)) {
        uploadedMedia = uploadedMedia[0];
      }

      const { name } = uploadedMedia;

      if (PostMedia.ALLOWED_VIDEO_EXTENSIONS.includes(extname(name))) {
        req.files.media = uploadedMedia;
        return next();
      } else {
        return ResponseHandler(
          req,
          res,
          Promise.reject(
            new errors.ValidationFailed(ResponseMessage.INVALID_VIDEO_FORMAT)
          )
        );
      }
    }

    return ResponseHandler(
      req,
      res,
      Promise.reject(
        new errors.ValidationFailed(ResponseMessage.VIDEO_IS_REQUIRED)
      )
    );
  },
};
