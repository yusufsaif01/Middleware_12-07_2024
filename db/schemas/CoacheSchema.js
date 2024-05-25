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
    nationality: {
      type: String,
    },
    country_code: {
      type: String,
    },
    deleted_at: {
      type: Date,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    height: {
      feet: {
        type: String,
      },
      inches: {
        type: String,
      },
    },
    weight: {
      type: String,
    },
    dob: {
      type: String,
    },
    gender: {
      type: String,
      enum: [GENDER.MALE, GENDER.FEMALE],
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
      name: {
        type: String,
      },
    },
    email: {
      type: String,
    },
    // phone field is being used for mobile_number
    phone: {
      type: String,
    },
    institute: {
      school: {
        type: String,
      },
      college: {
        type: String,
      },
      university: {
        type: String,
      },
    },
    documents: [
      {
        type: {
          type: String,
          enum: [DOCUMENT_TYPE.AADHAR, DOCUMENT_TYPE.EMPLOYMENT_CONTRACT],
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
            enum: [ATTACHMENT_TYPE.IMAGE, ATTACHMENT_TYPE.PDF],
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
          default: DOCUMENT_STATUS.APPROVED,
        },
        remark: {
          type: String,
        },
      },
    ],
    bio: {
      type: String,
    },
    position: [
      {
        priority: {
          type: String,
        },
        name: {
          type: String,
        },
        id: {
          type: String,
        },
      },
    ],
    year_of_exp: {
      type: String,
    },
    academy_name: {
      type: String,
    },
    club_academy_details: {
      head_coache_name: {
        type: String,
      },
      head_coache_phone: {
        type: String,
      },
      head_coache_email: {
        type: String,
      },
    },
    former_club_academy: {
      type: String,
    },
    player_type: {
      type: String,
      enum: [PLAYER.GRASSROOT, PLAYER.AMATEUR, PLAYER.PROFESSIONAL],
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
    coache_certificate: {
      type: String,
    },
    area_of_spec: {
      type: String,
    },
    other_traning_style: {
      type: String,
    },

    language: {
      type: String,
    },

    current_role: {
      type: String,
    },
    other_specilisation: {
      type: String,
    },
    other_current_role: {
      type: String,
    },
    login_details: {
      type: Schema.Types.ObjectId,
      ref: "login_details",
    },
  },

  schemaName: "coache_details",

  options: {
    timestamps: true,
  },
};
