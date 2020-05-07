const ConnectionUtility = require('../db/utilities/ConnectionUtility');
const ConnectionRequestUtility = require('../db/utilities/ConnectionRequestUtility');
const errors = require("../errors");
const _ = require("lodash");
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const LoginUtility = require('../db/utilities/LoginUtility');

class ConnectionService {
    constructor() {
        this.connectionUtilityInst = new ConnectionUtility();
        this.connectionRequestUtilityInst = new ConnectionRequestUtility();
        this.loginUtilityInst = new LoginUtility();
    }

    async followMember(requestedData = {}) {
        try {
            await this.followMemberValiation(requestedData);
            let connection_of_sent_by = await this.connectionUtilityInst.findOne({ user_id: requestedData.sent_by }, { followings: 1 });
            let connection_of_send_to = await this.connectionUtilityInst.findOne({ user_id: requestedData.send_to }, { followers: 1 });

            if (!connection_of_sent_by && !connection_of_send_to) {
                await this.createConnectionsAddFollwingsAddFollowers(requestedData.sent_by, requestedData.send_to);
            }
            else if (connection_of_sent_by && !connection_of_send_to) {
                await this.addFollowings(connection_of_sent_by, requestedData.sent_by, requestedData.send_to);
                await this.createConnectionAddFollowers(requestedData.sent_by, requestedData.send_to);
            }
            else if (!connection_of_sent_by && connection_of_send_to) {
                await this.createConnectionAddFollowings(requestedData.sent_by, requestedData.send_to);
                await this.addFollowers(requestedData.sent_by, requestedData.send_to, connection_of_send_to);
            }
            else {
                let following = await this.connectionUtilityInst.findOne({
                    user_id: requestedData.sent_by, followings: requestedData.send_to
                }, { followings: 1, _id: 0 });

                if (!_.isEmpty(following)) {
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ALREADY_FOLLOWED));
                }
                await this.addFollowings(connection_of_sent_by, requestedData.sent_by, requestedData.send_to);
                await this.addFollowers(requestedData.sent_by, requestedData.send_to, connection_of_send_to);
            }
            return Promise.resolve();
        }
        catch (e) {
            console.log("Error in followMember() of ConnectionService", e);
            return Promise.reject(e);
        }
    }

    async followMemberValiation(requestedData = {}) {
        if (requestedData.send_to === requestedData.sent_by) {
            return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.CANNOT_FOLLOW_YOURSELF));
        }
        if (requestedData.send_to) {
            let to_be_followed_member = await this.loginUtilityInst.findOne({ user_id: requestedData.send_to });
            if (_.isEmpty(to_be_followed_member)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.MEMBER_TO_BE_FOLLOWED_NOT_FOUND));
            }
        }
        return Promise.resolve();
    }

    async createConnectionsAddFollwingsAddFollowers(sent_by, send_to) {
        let records = [{ user_id: sent_by, followings: [send_to] }, { user_id: send_to, followers: [sent_by] }];
        await this.connectionUtilityInst.insertMany(records);
    }

    async createConnectionAddFollowings(sent_by, send_to) {
        let record = { user_id: sent_by, followings: [send_to] };
        await this.connectionUtilityInst.insert(record);
    }

    async createConnectionAddFollowers(sent_by, send_to) {
        let record = { user_id: send_to, followers: [sent_by] };
        await this.connectionUtilityInst.insert(record);
    }

    async addFollowers(sent_by, send_to, connection_of_send_to) {
        let followers_of_send_to = connection_of_send_to.followers || [];
        followers_of_send_to.push(sent_by);
        await this.connectionUtilityInst.updateOne({ user_id: send_to }, { followers: followers_of_send_to });
    }

    async addFollowings(connection_of_sent_by, sent_by, send_to) {
        let followings_of_sent_by = connection_of_sent_by.followings || [];
        followings_of_sent_by.push(send_to);
        await this.connectionUtilityInst.updateOne({ user_id: sent_by }, { followings: followings_of_sent_by });
    }

    async unfollowMember(requestedData = {}) {
        try {
            let data = await this.unfollowMemberValiation(requestedData);
            let followers = data.followers, followings = data.followings;
            _.remove(followings, function (member) {
                return member === requestedData.send_to;
            })
            await this.connectionUtilityInst.updateOne({ user_id: requestedData.sent_by }, { followings: followings });

            _.remove(followers, function (member) {
                return member === requestedData.sent_by;
            })
            await this.connectionUtilityInst.updateOne({ user_id: requestedData.send_to }, { followers: followers });
            return Promise.resolve();
        }
        catch (e) {
            console.log("Error in unfollowMember() of ConnectionService", e);
            return Promise.reject(e);
        }
    }

    async unfollowMemberValiation(requestedData = {}) {
        if (requestedData.send_to === requestedData.sent_by) {
            return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.CANNOT_UNFOLLOW_YOURSELF));
        }
        if (requestedData.send_to) {
            let to_be_followed_member = await this.loginUtilityInst.findOne({ user_id: requestedData.send_to });
            if (_.isEmpty(to_be_followed_member)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.MEMBER_TO_BE_UNFOLLOWED_NOT_FOUND));
            }
        }
        let connection_of_sent_by = await this.connectionUtilityInst.findOne({
            user_id: requestedData.sent_by, followings: requestedData.send_to
        }, { followings: 1, _id: 0 });
        let connection_of_send_to = await this.connectionUtilityInst.findOne({
            user_id: requestedData.send_to, followers: requestedData.sent_by
        }, { followers: 1, _id: 0 });

        if (_.isEmpty(connection_of_sent_by) || _.isEmpty(connection_of_send_to)) {
            return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ALREADY_UNFOLLOWED));
        }

        return Promise.resolve({ followings: connection_of_sent_by.followings, followers: connection_of_send_to.followers });
    }
}
module.exports = ConnectionService;