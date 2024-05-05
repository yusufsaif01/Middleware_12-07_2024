const uuidv4 = require('uuid/v4');
const MEMBER = require('../../constants/MemberType')
const ACCOUNT = require('../../constants/AccountStatus')
const PROFILE = require('../../constants/ProfileStatus')
const ROLE = require('../../constants/Role')
module.exports = {
  fields: {
    user_id: {
      type: String,
      required: true,
      default: function () {
        return uuidv4();
      },
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    profile_status: {
      status: {
        type: String,
        enum: [PROFILE.VERIFIED, PROFILE.NON_VERIFIED, PROFILE.DISAPPROVED],
        default: PROFILE.NON_VERIFIED,
      },
      remarks: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: [
        ACCOUNT.ACTIVE,
        ACCOUNT.INACTIVE,
        ACCOUNT.PENDING,
        ACCOUNT.BLOCKED,
      ],
      default: ACCOUNT.INACTIVE,
    },
    token: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
    forgot_password_token: {
      type: String,
    },
    is_first_time_login: {
      type: Boolean,
      default: false,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    member_type: {
      type: String,
      enum: [MEMBER.PLAYER, MEMBER.CLUB, MEMBER.ACADEMY, MEMBER.COACHE],
    },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.PLAYER, ROLE.CLUB, ROLE.ACADEMY, ROLE.COACHE],
    },
  },

  schemaName: "login_details",

  options: {
    timestamps: true,
  },
};
