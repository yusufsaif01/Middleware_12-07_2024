const uuidv4 = require("uuid/v4");
const POST_TYPE = require("../../constants/PostType");
const POST_MEDIA = require("../../constants/PostMedia");
const POST_STATUS = require("../../constants/PostStatus");

module.exports = {
  fields: {
    id: {
      type: String,
      required: true,
      default: function () {
        return uuidv4();
      },
    },
    posted_by: {
      type: String,
    },
    media: {
      text: {
        type: String,
      },
      media_url: {
        type: String,
      },

      media_thumbnail: {
        url: {
          type: String,
        },
        sizes: {
          type: Array,
        },
      },
      media_type: {
        type: String,
        enum: POST_MEDIA.ALLOWED_MEDIA_TYPES,
      },
    },
    status: {
      type: String,
      enum: POST_STATUS.AVAILABLE_POST_STATUS,
    },
    caption: {
      type: String,
    },
    post_type: {
      type: String,
      enum: POST_TYPE.ALLOWED_POST_TYPES,
      default: POST_TYPE.TIMELINE,
    },
    meta: {
      abilities: [
        {
          ability_id: String,
          ability_name: String,
          attributes: [{ attribute_id: String, attribute_name: String }],
        },
      ],
      others: [String],
    },
    created_at: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
  },

  schemaName: "posts",

  options: {
    timestamps: true,
  },
};
