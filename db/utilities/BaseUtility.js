const _ = require("lodash");
const Model = require("../model");
const errors = require("../../errors");
const LoginUtility = require("./LoginUtility");

class BaseUtility {
  constructor(schemaObj) {
    this.schemaObj = schemaObj;
  }

  async getModel() {
    this.model = await Model.getModel(this.schemaObj);
  }

  async find(conditions = {}, projection = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      if (options && (!options.sort || !Object.keys(options.sort).length)) {
        options.sort = { createdAt: -1 };
      }

      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };

      const result = await this.model.find(conditions);

      return result;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async otpVerify(conditions = {}) {
    try {
      console.log("inside otpVerify");
      const projection = {};
      const options = {};
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }

      console.log("condition issssss", conditions);
      const result = await this.model.findOne(conditions);
      if (result) {
        console.log("result in loginnn");
        console.log(result);
      }
      console.log("result is", result);
      return result;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async findOneForToken(conditions = {}) {
    try {
      console.log("inside otpVerify");
      const projection = {};
      const options = {};
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }

      console.log("condition issssss", conditions);
      const result = await this.model.findOne(conditions);

      console.log("result in find one in tokem");
      console.log(result);
      return result.forgot_password_token;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async countList(conditions = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      let count = await this.model.countDocuments(conditions);
      return count;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async insertOtp(requestData = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      const result = await this.model.create(requestData);
      return result;
    } catch (e) {
      console.log(
        `Error in insert() while inserting data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async insert(record = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      console.log("record issssss");
      console.log(record);
      let result = await this.model.create(record);
      console.log("data after insert is===>");
      console.log(result);
      return result;
    } catch (e) {
      console.log(
        `Error in insert() while inserting data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async insertMany(recordsToInsert = []) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      let result = await this.model.insertMany(recordsToInsert);
      return result;
    } catch (e) {
      if (e.code === 11000) {
        return Promise.reject(new errors.Conflict(e.errmsg));
      }
      console.log(
        `Error in insertMany() while inserting data for ${this.schemaObj.schemaName} :: ${e}`
      );
      return Promise.reject(new errors.DBError(e.errmsg));
    }
  }

  async updateMany(conditions = {}, updatedDoc = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };
      console.log("request inside updateManyyyyy");
      let result = await this.model.update(conditions, updatedDoc, options);
      return result;
    } catch (e) {
      console.log(
        `Error in updateMany() while updating data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async updateOne(conditions = {}, updatedDoc = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };
      console.log("conditions is=>",conditions)
      let result = await this.model.updateOne(conditions, updatedDoc, options);
      console.log("request inside updateOneee");
      console.log(result);
      return result;
    } catch (e) {
      console.log(
        `Error in updateOne() while updating data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async findOneAndUpdate(conditions = {}, updatedDoc = {}, options = {}) {
    try {
      console.log("condition is=>", conditions);
      let entity = await this.findOne(conditions, null, options);
      console.log("entity is=>", entity);
      if (!entity) {
        return Promise.reject(new errors.NotFound());
      }
      conditions.deleted_at = { $exists: false };
      options.new = true;

      console.log("inside findOneAndUpdate =====>");
      console.log("conditions", conditions);
      console.log("options", options);
      return this.model.findOneAndUpdate(conditions, updatedDoc, options);
    } catch (e) {
      console.log(
        `Error in findOneAndUpdate() while updating data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async populate(baseOptions = {}, toBePopulatedOptions = {}) {
    try {
      baseOptions.projection = !_.isEmpty(baseOptions.projection)
        ? baseOptions.projection
        : { _id: 0, __v: 0 };
      toBePopulatedOptions.projection = !_.isEmpty(
        toBePopulatedOptions.projection
      )
        ? toBePopulatedOptions.projection
        : { _id: 0, __v: 0 };

      const data = await this.model
        .find(
          baseOptions.conditions || {},
          baseOptions.projection || null,
          baseOptions.options || {}
        )
        .populate({
          path: toBePopulatedOptions.path,
          match: toBePopulatedOptions.condition || {},
          select: toBePopulatedOptions.projection || null,
        })
        .exec();
      //console.log(data)
      return data;
    } catch (e) {
      console.log(
        `Error in populate() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async aggregate(aggregations = []) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      const data = await this.model.aggregate(aggregations);
      return data;
    } catch (e) {
      console.log(
        `Error in aggregate() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async cursor(conditions = {}, projection = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      if (options && (!options.sort || !Object.keys(options.sort).length)) {
        options.sort = { createdAt: -1 };
      }
      console.log("request also come in cursor function");
      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };
      return this.model.find(conditions, projection, options).cursor();
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async findOneForPersonal(conditions = {}, projection = [], options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
     
      conditions.deleted_at = { $exists: false };
      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };
      let result = await this.model.findOne(conditions);
      
      Object.assign({member_type : 'player' });
     
      return result;
    } catch (e) {
      console.log(
        `Error in findOne() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async findOneForCoachProfessional(
    conditions = {},
    projection = [],
    options = {}
  ) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
    
      conditions.deleted_at = { $exists: false };
      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };
      let result = await this.model.findOne(conditions);

      return result;
    } catch (e) {
      console.log(
        `Error in findOne() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async findOne(conditions = {}, projection = [], options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
   
      conditions.deleted_at = { $exists: false };
      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };
      let result = await this.model.findOne(conditions, projection, options);
      return result;
    } catch (e) {
      console.log(
        `Error in findOne() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async findOneByToken(conditions = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      console.log("inside findOneByToken function");
      conditions.is_deleted = false;
      conditions.profile_status = { status: "non-verified" };
      let result = await this.model.findOne(conditions).lean();
      return result;
    } catch (e) {
      console.log(
        `Error in findOne() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async insertInReplica(conditions = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }

      let result = await this.model.create(conditions);

      return result;
    } catch (e) {
      console.log(
        `Error in findOne() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async findOneByTokenAndDelete(conditions = {}) {
    try {
      conditions.is_deleted = false;
      conditions.profile_status = { status: "non-verified" };
      let result = await this.model.findOneAndDelete(conditions);
      return result;
    } catch (error) {}
  }

  async removeFromReplica(conditions) {
    try {
      console.log("username inside removefrom replica");
      console.log(username);
      console.log(this.model);
      let result = await this.model.findOneAndDelete(conditions);
      return result;
    } catch (error) {}
  }
}

module.exports = BaseUtility;
