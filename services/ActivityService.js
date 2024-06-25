const ActivityUtility = require("../db/utilities/ActivityUtility");

class ActivityService {

	async  loginActivity(user_id , type) {
		try {

			const _activityInst = new ActivityUtility();
			let activity = await _activityInst.insertMany([{
				user_id: user_id,
				type: type,
				activity: new Date()
			}]);

			return activity;
			// next();

		} catch (err) {
			return err;
		}
	}

}

module.exports = new ActivityService();

