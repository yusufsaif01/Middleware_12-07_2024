const uuidv4 = require("uuid/v4");

module.exports = {
  fields: {
    otp_id: {
      type: String,
      required: true,
      default: function () {
        return uuidv4();
      },
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
  },

  schemaName: "otpSchema",

  options: {
    timestamps: true,
  },
};
