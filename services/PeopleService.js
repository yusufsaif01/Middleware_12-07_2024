const errors = require("../errors");
const _ = require("lodash");
const RESPONSE_MESSAGE = require("../constants/ResponseMessage");
const PlayerUtility = require("../db/utilities/PlayerUtility");
const LoginUtility = require("../db/utilities/LoginUtility");
const Role = require("../constants/Role");
const ProfileStatus = require("../constants/ProfileStatus");
const AccountStatus = require("../constants/AccountStatus");
const DocumentType = require("../constants/DocumentType");

const loginInst = new LoginUtility();

class PeopleService {
  constructor() {}

  async listAll(params) {
    try {
      const aggregatePipes = [];

      this.validateParams(params);

      aggregatePipes.push(this.addMatchPipeline(params));
      aggregatePipes.push(this.addLookupPipeline());
      aggregatePipes.push(this.addProjectionPipeline());
      aggregatePipes.push(this.addProjectionPipeline2());

      let records = await loginInst.aggregate(aggregatePipes);

      return Promise.resolve(records);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  addMatchPipeline(params) {
    return {
      $match: {
        is_deleted: false,
        role: params.role || "",
        status: AccountStatus.ACTIVE,
        "profile_status.status": ProfileStatus.VERIFIED,
      },
    };
  }

  addLookupPipeline() {
    return {
      $lookup: {
        from: "club_academy_details",
        localField: "user_id",
        foreignField: "user_id",
        as: "userDetail",
      },
    };
  }

  addProjectionPipeline() {
    return {
      $project: {
        userDetail: { $arrayElemAt: ["$userDetail", 0] },
      },
    };
  }
  addProjectionPipeline2() {
    return {
      $project: {
        role: 1,
        user_id: 1,
        userDetail: {
          name: 1,
          email: 1,
          address: "$userDetail.address.full_address",
          mobile_number:1,
          documentsRequired: {
            $filter: {
              input: "$userDetail.documents",
              as: "document",
              cond: { $eq: ["$$document.type", DocumentType.AIFF] },
            },
          },
        },
      },
    };
  }

  validateParams(params) {
    if (params.role) {
      if ([Role.CLUB, Role.ACADEMY].indexOf(params.role) == -1) {
        params.role = "";
      }
    }
  }
}

module.exports = PeopleService;
