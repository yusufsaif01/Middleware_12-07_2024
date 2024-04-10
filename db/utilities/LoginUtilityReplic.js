const LoginSchemaReplica = require("../schemas/LoginSchemaReplica");
const BaseUtility = require("./BaseUtility");

class LoginUtilityReplica extends BaseUtility {
	constructor() {
		super(LoginSchemaReplica);
	}	
}

module.exports = LoginUtilityReplica;