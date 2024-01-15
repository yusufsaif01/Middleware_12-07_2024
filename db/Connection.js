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
			let hostURL = "mongodb://dyt-mongodb:68OtZYS0mzwnhtuWKL5xBS5x35npFzyPvUEgrnBkekT6vvdRmMb2K8boGQljU3Vmjm5sSIulzCFmACDbBdiWOg%3D%3D@dyt-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=true&maxIdleTimeMS=120000&appName=@dyt-mongodb@";
			if(this.config.is_auth_enable) {
				hostURL = `${this.config.db_user}:${this.config.db_pass}@${hostURL}`;
			}
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

module.exports = new Connection;

