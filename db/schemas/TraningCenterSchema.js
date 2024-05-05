const uuid = require("uuid/v4");
const mongoose = require("mongoose");
const ATTACHMENT_TYPE = require("../../constants/AttachmentType");
const DOCUMENT_TYPE = require("../../constants/DocumentType");
const Schema = mongoose.Schema;
const PLAYER = require("../../constants/PlayerType");
const DOCUMENT_STATUS = require("../../constants/DocumentStatus");
const GENDER = require("../../constants/gender");

module.exports = {
  fields: {
    id: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return uuid();
      },
    },
    user_id: {
      type: String,
    },
    traning_center_name: {
      type: String,
    },
    start_time: {
      type: String,
    },
    academy_user_id: {
      type: String,
    },
    end_time: {
      type: String,
    },

    full_address: {
      type: String,
    },
    pincode: {
      type: String,
    },
    coache_name: {
      type: String,
    },
    opening_days: [
      {
        item_id: Number,
        item_text: String,
      },
    ],
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
    country: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    state: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    district: {
      id: {
        type: String,
      },
      is_deleted: {
        type: Boolean,
        default: false,
      },
      deleted_at: {
        type: Date,
      },
      name: {
        type: String,
      },
    },
  },

  schemaName: "traning_center",

  options: {
    timestamps: true,
  },
};
