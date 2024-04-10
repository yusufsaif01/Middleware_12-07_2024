const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const config = require("../config");
const modelAutoload = require("./model/autoload");

class Connection {
  constructor() {
    this.config = config.db;
  }

  async connectDB() {
    this.dbConnection = await this.connectMongoDB();
    return this.dbConnection;
  }

  disconnectDB() {
    return mongoose.connection.close();
  }

  async connectMongoDB() {
    try {
      let options = this.config.options || {};
      options.useNewUrlParser = true;
      options.promiseLibrary = Promise;
      options.retryWrites = false;
      let hostURL =
        "mongodb://development-mongo-database:DuLQIpD9ndLmgEStbmeJCiBtmB5Q3DjdtOJcyWzRfVQ00uFGR1rc4z0v5eHlts80CXVhicYkyH1fACDbKNfaDQ%3D%3D@development-mongo-database.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@development-mongo-database@";
      //if (this.config.is_auth_enable) {
      //  hostURL = `${this.config.db_user}:${this.config.db_pass}@${hostURL}`;
    //  }
      //let mongoDbURL = `mongodb://${hostURL}`;

      this.attachEvents();
      //console.log(mongoDbURL)
      return mongoose.connect(hostURL);
    } catch (err) {
      console.error({ err }, "Error in mongo DB connection.");
      throw err;
    }
  }

  attachEvents() {
    let connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("DB Connected");
      modelAutoload(true);
    });

    connection.on("disconnected", (err) => {
      console.log("DB disconnected", err);
    });

    connection.on("close", () => {
      console.log("DB connection close");
    });

    connection.on("reconnected", () => {
      console.log("DB reconnected");
    });

    connection.on("reconnected", () => {
      console.log("DB reconnected");
    });

    connection.on("error", (err) => {
      console.log("DB connection error", err);
    });
  }
}

module.exports = new Connection();
