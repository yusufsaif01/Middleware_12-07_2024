const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var config = require('../../config');
const errors = require('../../errors');
const LoginUtility = require("./LoginUtility");

class AuthUtility {

    constructor() {
        this.loginUtility = new LoginUtility();
    }

    tokenCompare(pass1, pass2) {
        return this.bcryptTokenCompare(pass1, pass2);
    }

    getAuthToken(id, email, member_type) {
        return this.signWithJWT(JSON.stringify({
            id,
            email,
            member_type
        }), config.jwt.jwt_secret, config.jwt.expiry_in);
    }

    randomBytes(len = 20) {
        return crypto.randomBytes(len).toString('hex');
    }

    async bcryptToken(password) {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    }

    async bcryptTokenCompare(pass1, pass2) {
        let isMatched = await bcrypt.compare(pass1, pass2);
        isMatched = (isMatched) ? true : false;
        return Promise.resolve(isMatched);
    }

    signWithJWT(string, secretKey, expiry) {
        return new Promise((resolve, reject) => {
            let data = JSON.parse(string);
            jwt.sign(data, secretKey, { expiresIn: expiry }, (err, token) => {
                if (err) {
                    return reject(err);
                }
                return resolve(token);
            });
        });
    }

    jwtVerification(token, secretKey) {
        return new Promise((resolve, reject) => {
            return jwt.verify(token.split(' ')[1], secretKey, function (err, data) {
                if (err) {
                    console.log(err)
                    return reject(new errors.Unauthorized());
                }
                console.log('jwt', data)
                return resolve(data);
            });
        })
    }

    async getUserByToken(token, isCheckStatus, isCheckForgotPassToken) {
        try {
            const { id } = await this.jwtVerification(token, config.jwt.jwt_secret);
            const project = ["user_id", "username", "role", "member_type", "status", "forgot_password_token"];
            let user = await this.loginUtility.findOne({ user_id: id }, project);
            if (user) {
                if (isCheckStatus) {
                    let status = user.status;
                    if (status === "blocked") {
                        throw new errors.Unauthorized("User is blocked");
                    } else if (status !== "active") {
                        throw new errors.Unauthorized("User is not active");
                    }
                }
                console.log(user);
                if (isCheckForgotPassToken) {
                    if (user.forgot_password_token) {
                        const fpt = 'Bearer ' + user.forgot_password_token
                        const fptUser = await this.jwtVerification(fpt, config.jwt.jwt_secret);
                        if (user.user_id !== fptUser.id)
                            throw new errors.Unauthorized("User authentication failed");
                    } else {
                        throw new errors.Unauthorized("Activation link expired");
                    }
                }
                return user;
            } else {
                throw new errors.Unauthorized();
            }
        } catch (e) {
            console.log(e);
            return Promise.reject(e);
        }
    }
}

module.exports = AuthUtility;