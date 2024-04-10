const uuid = require('uuid/v4');
const mongoose = require('mongoose');
const DOCUMENT_STATUS = require('../../constants/DocumentStatus');
const DOCUMENT_TYPE = require('../../constants/DocumentType');
const AttachmentType = require('../../constants/AttachmentType');
const Schema = mongoose.Schema;
const MEMBER = require('../../constants/MemberType');
const TYPE = require('../../constants/ClubAcademyType');

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
    country_code: {
      type: String,
    },
    deleted_at: {
      type: Date,
    },
    name: {
      type: String,
    },
    member_type: {
      type: String,
      enum: [MEMBER.CLUB, MEMBER.ACADEMY],
    },
    type: {
      type: String,
      enum: [TYPE.RESIDENTIAL, TYPE.NON_RESIDENTIAL],
    },
    founded_in: {
      type: String,
    },
    state: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    country: {
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
      name: {
        type: String,
      },
    },
    address: {
      full_address: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    mobile_number: {
      type: String,
    },
    stadium_name: {
      type: String,
    },
    short_name: {
      type: String,
    },
    documents: [
      {
        type: {
          type: String,
          enum: [
            DOCUMENT_TYPE.AIFF,
            DOCUMENT_TYPE.COI,
            DOCUMENT_TYPE.PAN,
            DOCUMENT_TYPE.TIN,
          ],
        },
        added_on: {
          type: Date,
        },
        document_number: {
          type: String,
        },
        media: {
          attachment_type: {
            type: String,
            enum: [AttachmentType.IMAGE, AttachmentType.PDF],
          },
          doc_front: {
            type: String,
          },
          doc_back: {
            type: String,
          },
          user_photo: {
            type: String,
          },
          document: {
            type: String,
          },
        },
        status: {
          type: String,
          enum: [
            DOCUMENT_STATUS.PENDING,
            DOCUMENT_STATUS.APPROVED,
            DOCUMENT_STATUS.DISAPPROVED,
          ],
          default: DOCUMENT_STATUS.PENDING,
        },
        remark: {
          type: String,
        },
      },
    ],
    trophies: [
      {
        name: { type: String },
        year: { type: String },
        position: { type: String },
        id: {
          type: String,
          required: true,
          default: function () {
            return uuid();
          },
        },
      },
    ],
    league: {
      type: String,
    },
    league_other: {
      type: String,
    },
    association: {
      type: String,
    },
    association_other: {
      type: String,
    },
    top_signings: [
      {
        name: { type: String },
      },
    ],
    registration_number: {
      type: String,
    },
    bio: {
      type: String,
    },
    avatar_url: {
      type: String,
    },
    social_profiles: {
      facebook: {
        type: String,
      },
      youtube: {
        type: String,
      },
      twitter: {
        type: String,
      },
      instagram: {
        type: String,
      },
      linked_in: {
        type: String,
      },
    },
    contact_person: [
      {
        name: {
          type: String,
        },
        email: {
          type: String,
        },
        mobile_number: {
          type: String,
        },
        designation: {
          type: String,
        },
      },
    ],
    login_details: {
      type: Schema.Types.ObjectId,
      ref: "login_details",
    },
  },

  schemaName: "club_academy_details",

  options: {
    timestamps: true,
  },
};
