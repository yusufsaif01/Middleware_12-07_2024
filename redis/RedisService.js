const client = require("./index")
const _ = require("lodash");

class RedisService {

    async setKeyValuePair(key, value) {
        try {
            client.set(key, value);
            
            return Promise.resolve();
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    async deleteByKey(key) {
        try {
            client.del(key);
            return Promise.resolve();
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    async getUserFromCacheByKey(key) {
        try {
            let result = await client.getAsync(key);
        
            result = JSON.parse(result)
        
            return result;
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    getUserIdFromCacheByKey(key) {
        try {
            let result = client.getAsync(key);
            
           
            return result;
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    async setUserCache(tokenForAuthentication, userData) {
        try {
            let userFromCache = await this.getUserFromCacheByKey(userData.user_id);
            let tokenArray = [tokenForAuthentication];
            if (userFromCache && userFromCache.tokenArray) {
                userFromCache.tokenArray.push(tokenForAuthentication);
                tokenArray = userFromCache.tokenArray;
            }
            userData.tokenArray = tokenArray;
            client.set(tokenForAuthentication, userData.user_id);
            client.set(userData.user_id, JSON.stringify(userData));
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    async clearAllTokensFromCache(user_id) {
        try {
            let userFromCache = await this.getUserFromCacheByKey(user_id);
            if (userFromCache && userFromCache.tokenArray) {
                for (const token of userFromCache.tokenArray) {
                    client.del(token);
                }
                client.del(user_id);
            }
            return Promise.resolve();
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    async setCacheForForgotPassword(user_id, tokenForForgetPassword, userData) {
        try {
            let userFromCache = await this.getUserFromCacheByKey(user_id);
            if (userFromCache && userFromCache.tokenArray) {
                userData.tokenArray = userFromCache.tokenArray;
            }
            client.set(`keyForForgotPassword${tokenForForgetPassword}`, user_id);
            client.set(user_id, JSON.stringify(userData));
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }

    async clearCurrentTokenFromCache(current_token, user_id) {
        try {
            client.del(current_token);
            let userFromCache = await this.getUserFromCacheByKey(user_id);
            if (userFromCache.tokenArray) {
                _.remove(userFromCache.tokenArray, function (token) {
                    return token === current_token;
                })
                client.set(user_id, JSON.stringify(userFromCache));
            }
            return Promise.resolve();
        }
        catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }
}

module.exports = new RedisService();

