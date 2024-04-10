const Joi = require('@hapi/joi');
const errors = require("../../errors");
const responseHandler = require("../../ResponseHandler");
const MEMBER = require('../../constants/MemberType');
const TYPE = require('../../constants/ClubAcademyType');
const PLAYER = require('../../constants/PlayerType');
const STRONG_FOOT = require('../../constants/StrongFoot');
const SORT_ORDER = require('../../constants/SortOrder');
const PROFILE = require('../../constants/ProfileStatus');
const EMAIL_VERIFIED = require('../../constants/EmailVerified');
const RESPONSE_MESSAGE = require('../../constants/ResponseMessage');
const DOCUMENT_TYPE = require('../../constants/DocumentType');
const AADHAR_MEDIA_TYPE = require('../../constants/AadharMediaType');
const STATE_ASSOCIATIONS = require('../../constants/StateAssociations');
const PROFILE_DETAIL = require('../../constants/ProfileDetailType');
const GENDER = require('../../constants/gender');
const ASSOCIATED_CLUB_ACADEMY = require('../../constants/AssociatedClubAcademy');
const LEAGUE = require('../../constants/League');
const customMessage = require("./CustomMessages");
const CONTACT_PERSON = require('../../constants/ContactPerson');
const moment = require("moment");

class UserValidator {

    async createAPIValidation(req, res, next) {
        console.log(req.body)
        console.log("inside createAPIValidation");
        let registerRule = {
            
            "phone": Joi.string().allow(""),
            "country_code":Joi.string().allow(""),
            // required().
            // regex(/^[0-9]{10}$/).
            // error(
            //     customMessage(
            //         {
            //             "any.required": RESPONSE_MESSAGE.PHONE_REQUIRED,
            //         },
            //         // RESPONSE_MESSAGE.PHONE_NUMBER_INVALID
            //     )
            // ),
            
            "member_type": Joi.string().valid(MEMBER.PLAYER, MEMBER.CLUB, MEMBER.ACADEMY,MEMBER.COACHE).required(),
            "type": Joi.when("member_type", {
                is: MEMBER.PLAYER,
                then: Joi.string().allow(""),
                otherwise: Joi.string().valid(TYPE.RESIDENTIAL, TYPE.NON_RESIDENTIAL).required()
            }),
            "name": Joi.when("member_type", {
                is: MEMBER.PLAYER,
                then: Joi.string().allow(""),
                otherwise: Joi.string().min(1).required().regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/).error(
                    customMessage(
                        {
                            "any.required": RESPONSE_MESSAGE.NAME_REQUIRED,
                        },
                        RESPONSE_MESSAGE.NAME_INVALID
                    )
                )
            }),
            "first_name": Joi.when("member_type", {
                is: MEMBER.PLAYER,
                then: Joi.string().min(1).required().regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/).error(
                    customMessage(
                        {
                            "any.required": RESPONSE_MESSAGE.FIRST_NAME_REQUIRED,
                        },
                        RESPONSE_MESSAGE.FIRST_NAME_INVALID
                    )
                ),
                otherwise: Joi.string().allow(""),
            }),
            "last_name": Joi.when("member_type", {
                is: MEMBER.PLAYER,
                then: Joi.string().min(1).required().regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/).error(
                    customMessage(
                        {
                            "any.required": RESPONSE_MESSAGE.LAST_NAME_REQUIRED,
                        },
                        RESPONSE_MESSAGE.LAST_NAME_INVALID
                    )
                ),
                otherwise: Joi.string().allow(""),
            }),
            "email": Joi.string().email({ minDomainSegments: 2 }).required(),
            "dob": Joi.when("member_type", {
                is: MEMBER.PLAYER,
                then: Joi.date().iso().required().max(moment().format("YYYY-MM-DD")),
                otherwise: Joi.date(),
            }),
            "termsAccepted": Joi.boolean().required()

        };

        if (req.body.type && req.body.member_type) {
            if (req.body.member_type === MEMBER.PLAYER) {
                req.body.first_name = req.body.first_name ? req.body.first_name.trim() : req.body.first_name
                req.body.last_name = req.body.last_name ? req.body.last_name.trim() : req.body.last_name
            }
            else {
                req.body.name = req.body.name ? req.body.name.trim() : req.body.name
            }
        }
        const schema = Joi.object().keys(registerRule);

        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }

    async profileAPIParamsValidation(req, res, next) {
        const params = Joi.object().keys({
            "_category": Joi.string().required().valid([PROFILE_DETAIL.PERSONAL, PROFILE_DETAIL.PROFESSIONAL, PROFILE_DETAIL.DOCUMENT]),
        });
        try {
            await Joi.validate(req.params, params);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }

    async updateDetailsAPIValidation(req, res, next) {
        let playerPersonalDetail = {
            "first_name": Joi.string().trim().min(1).required().regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/).error(
                customMessage(
                    {
                        "any.required": RESPONSE_MESSAGE.FIRST_NAME_REQUIRED,
                    },
                    RESPONSE_MESSAGE.FIRST_NAME_INVALID
                )
            ),
            "last_name": Joi.string().trim().min(1).required().regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/).error(
                customMessage(
                    {
                        "any.required": RESPONSE_MESSAGE.LAST_NAME_REQUIRED,
                    },
                    RESPONSE_MESSAGE.LAST_NAME_INVALID
                )
            ),
            "bio": Joi.string().max(350).allow(""),
            "weight": Joi.string().trim().allow(""),
            "height_feet": Joi.string().trim().required(),
            'height_inches': Joi.string().trim().required(),
            "gender": Joi.string().trim().required().valid([GENDER.MALE, GENDER.FEMALE]),
            "phone": Joi.string().required().regex(/^[0-9]{10}$/).error(
                customMessage(
                    {
                        "any.required": RESPONSE_MESSAGE.PHONE_REQUIRED,
                    },
                    RESPONSE_MESSAGE.PHONE_NUMBER_INVALID
                )
            ),
            "dob": Joi.date().iso().max(moment().format("YYYY-MM-DD")),
            "country": Joi.string().required(),
            "state": Joi.string().required(),
            "district": Joi.string().required(),
            "school": Joi.string().trim().allow(""),
            "college": Joi.string().trim().allow(""),
            "university": Joi.string().trim().allow(""),
            "facebook": Joi.string().allow(""),
            "youtube": Joi.string().allow(""),
            "twitter": Joi.string().allow(""),
            "instagram": Joi.string().allow(""),
            "linked_in": Joi.string().allow(""),
        };
        let playerProfessionalDetail = {
            "position": Joi.string().required(),
            "strong_foot": Joi.string().trim().min(1).valid(STRONG_FOOT.RIGHT, STRONG_FOOT.LEFT).required(),
            "weak_foot": Joi.number().min(1).max(5),
            "former_club_academy": Joi.string().trim().allow(""),
            "association": Joi.string().required().valid(STATE_ASSOCIATIONS.ALLOWED_VALUES),
            "association_other": Joi.string().allow(""),
            "associated_club_academy": Joi.string().valid([ASSOCIATED_CLUB_ACADEMY.YES, ASSOCIATED_CLUB_ACADEMY.NO]).required(),
            "head_coach_name": Joi.when("associated_club_academy", {
                is: ASSOCIATED_CLUB_ACADEMY.YES,
                then: Joi.string().trim().min(1).required(),
                otherwise: Joi.string().allow(""),
            }),
            "head_coach_email": Joi.string().trim().email({ minDomainSegments: 2 }).allow(""),
            "head_coach_phone": Joi.when("associated_club_academy", {
                is: ASSOCIATED_CLUB_ACADEMY.YES,
                then: Joi.string().required().regex(/^[0-9]{10}$/).error(
                    customMessage(
                        {
                            "any.required": RESPONSE_MESSAGE.HEAD_COACH_PHONE_REQUIRED,
                        },
                        RESPONSE_MESSAGE.HEAD_COACH_PHONE_INVALID
                    )
                ),
                otherwise: Joi.string().allow(""),
            })
        }
        let playerDocumentDetail = {
            "aadhar_media_type": Joi.string().valid(AADHAR_MEDIA_TYPE.IMAGE, AADHAR_MEDIA_TYPE.PDF),
            "aadhar_number": Joi.string().regex(/^[0-9]{12}$/).error(() => {
                return {
                    message: RESPONSE_MESSAGE.AADHAR_NUMBER_INVALID,
                };
            })
        }
        let clubAcademyPersonalDetail = {
            "name": Joi.string().min(1).required().regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/).error(
                customMessage(
                    {
                        "any.required": RESPONSE_MESSAGE.NAME_REQUIRED,
                    },
                    RESPONSE_MESSAGE.NAME_INVALID
                )
            ),
            "short_name": Joi.string().trim().allow(""),

            "founded_in": Joi.number().min(1).required(),
            "country": Joi.string().required(),
            "state": Joi.string().required(),
            "district": Joi.string().required(),
            "address": Joi.string().trim().allow(""),
            "pincode": Joi.string().trim().allow(""),
            "phone": Joi.string().regex(/^[0-9]{10}$/).error(() => {
                return {
                    message: RESPONSE_MESSAGE.PHONE_NUMBER_INVALID,
                };
            }),
            "mobile_number": Joi.string().required().regex(/^[0-9]{10}$/).error(
                customMessage(
                    {
                        "any.required": RESPONSE_MESSAGE.MOBILE_NUMBER_REQUIRED,
                    },
                    RESPONSE_MESSAGE.MOBILE_NUMBER_INVALID
                )
            ),
            "stadium_name": Joi.string().trim().allow(""),
            "bio": Joi.string().max(350).allow(""),
            "facebook": Joi.string().allow(""),
            "youtube": Joi.string().allow(""),
            "twitter": Joi.string().allow(""),
            "instagram": Joi.string().allow(""),
            "linked_in": Joi.string().allow(""),
        }
        let clubAcademyProfessionalDetail = {
            "contact_person": Joi.string().required(),
            "trophies": Joi.string(),
            "league": Joi.string().required().valid(LEAGUE.ALLOWED_VALUES),
            "league_other": Joi.string().allow(""),
            "top_signings": Joi.string(),
            "type": Joi.string().trim().valid(TYPE.RESIDENTIAL, TYPE.NON_RESIDENTIAL).required(),
            "association": Joi.string().required().valid(STATE_ASSOCIATIONS.ALLOWED_VALUES),
            "association_other": Joi.string().allow("")
        };
        let clubAcademyDocumentDetail = {
            "document_type": Joi.string().trim().allow(""),
            "aiff_id": Joi.string().trim(),
            "number": Joi.string().trim(),
        };
        let member_type = req.authUser.member_type || "";
        if (member_type === MEMBER.PLAYER) {
            if (req.params._category === PROFILE_DETAIL.PERSONAL) {
                req.body.first_name = req.body.first_name ? req.body.first_name.trim() : req.body.first_name
                req.body.last_name = req.body.last_name ? req.body.last_name.trim() : req.body.last_name
            }
        }
        if (member_type === MEMBER.CLUB) {
            if (req.params._category === PROFILE_DETAIL.DOCUMENT)
                clubAcademyDocumentDetail.document_type = Joi.string().valid(DOCUMENT_TYPE.AIFF);
            if (req.params._category === PROFILE_DETAIL.PERSONAL)
                req.body.name = req.body.name ? req.body.name.trim() : req.body.name
        }
        if (member_type === MEMBER.ACADEMY) {
            if (req.params._category === PROFILE_DETAIL.DOCUMENT)
                clubAcademyDocumentDetail.document_type = Joi.string().valid(DOCUMENT_TYPE.AIFF, DOCUMENT_TYPE.PAN, DOCUMENT_TYPE.TIN, DOCUMENT_TYPE.COI);
            if (req.params._category === PROFILE_DETAIL.PERSONAL) {
                req.body.name = req.body.name ? req.body.name.trim() : req.body.name
            }
        }
        if (req.body.document_type) {
            let document_type = req.body.document_type;
            if (document_type === DOCUMENT_TYPE.PAN) {
                clubAcademyDocumentDetail.number = Joi.string().min(10).max(10).regex(/^[A-Z]{5}[0-9]{4}[A-Z]/).error(() => {
                    return {
                        message: RESPONSE_MESSAGE.PAN_NUMBER_INVALID,
                    };
                })
            }
            if (document_type === DOCUMENT_TYPE.COI) {
                clubAcademyDocumentDetail.number = Joi.string().regex(/^[a-z-A-Z0-9]+$/).error(() => {
                    return {
                        message: RESPONSE_MESSAGE.COI_NUMBER_INVALID,
                    };
                })
            }
            if (document_type === DOCUMENT_TYPE.TIN) {
                clubAcademyDocumentDetail.number = Joi.string().min(9).max(12).regex(/^\d+$/).error(() => {
                    return {
                        message: RESPONSE_MESSAGE.TIN_NUMBER_INVALID,
                    };
                })
            }
        }
        if (req.body.association && req.body.association !== STATE_ASSOCIATIONS.OTHERS) {
            req.body.association_other = "";
        }
        if (req.body.league && req.body.legue !== LEAGUE.OTHER) {
            req.body.league_other = "";
        }
        var schema = {};
        if (req.params._category === PROFILE_DETAIL.PERSONAL)
            schema = member_type === MEMBER.PLAYER ? Joi.object().keys(playerPersonalDetail) : Joi.object().keys(clubAcademyPersonalDetail)
        if (req.params._category === PROFILE_DETAIL.PROFESSIONAL)
            schema = member_type === MEMBER.PLAYER ? Joi.object().keys(playerProfessionalDetail) : Joi.object().keys(clubAcademyProfessionalDetail)
        if (req.params._category === PROFILE_DETAIL.DOCUMENT)
            schema = member_type === MEMBER.PLAYER ? Joi.object().keys(playerDocumentDetail) : Joi.object().keys(clubAcademyDocumentDetail)

        try {
            await Joi.validate(req.body, schema);
            if (req.authUser.member_type == MEMBER.PLAYER && req.body.aadhar_number) {
                var verhoeff = require('node-verhoeff');
                if (!verhoeff.validateAadhaar(req.body.aadhar_number)) {
                    return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.AADHAR_NUMBER_INVALID)));
                }
            }
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }

    async playerListQueryValidation(req, res, next) {

        const query = Joi.object().keys({
            "page_no": Joi.number(),
            "page_size": Joi.number(),
            "sort_order": Joi.number().valid([SORT_ORDER.ASCENDING, SORT_ORDER.DESCENDING]),
            "sort_by": Joi.string(),
            "from": Joi.string(),
            "to": Joi.string(),
            "search": Joi.string(),
            "email": Joi.string(),
            "name": Joi.string(),
            "position": Joi.string(),
            "type": Joi.string(),
            "profile_status": Joi.string().valid([PROFILE.VERIFIED, PROFILE.NON_VERIFIED]),
            "email_verified": Joi.string().valid([EMAIL_VERIFIED.TRUE, EMAIL_VERIFIED.FALSE]),
        })
        try {

            await Joi.validate(req.query, query);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async clubAcademyListQueryValidation(req, res, next) {

        const query = Joi.object().keys({
            "page_no": Joi.number(),
            "page_size": Joi.number(),
            "sort_order": Joi.number().valid([SORT_ORDER.ASCENDING, SORT_ORDER.DESCENDING]),
            "sort_by": Joi.string(),
            "from": Joi.string(),
            "to": Joi.string(),
            "search": Joi.string(),
            "email": Joi.string(),
            "name": Joi.string(),
            "profile_status": Joi.string().valid([PROFILE.VERIFIED, PROFILE.NON_VERIFIED]),
            "email_verified": Joi.string().valid([EMAIL_VERIFIED.TRUE, EMAIL_VERIFIED.FALSE]),
        })
        try {

            await Joi.validate(req.query, query);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async memberSearchQueryValidation(req, res, next) {

        const query = Joi.object().keys({
            "search": Joi.string().trim().min(3),
            "page_size": Joi.number(),
            "page_no": Joi.number()
        })
        try {

            await Joi.validate(req.query, query);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }

    async contactPersonValidation(reqObj) {
        const schema = Joi.object().keys({
            contact_person: Joi.array()
                .items({
                    designation: Joi.string().valid(CONTACT_PERSON.ALLOWED_DESIGNATION).required().error(
                        customMessage(
                            {
                                "any.required": RESPONSE_MESSAGE.DESIGNATION_OF_CONTACT_PERSON_REQUIRED,
                            },
                            `${RESPONSE_MESSAGE.DESIGNATION_OF_CONTACT_PERSON_INVALID}, must be one of [${CONTACT_PERSON.ALLOWED_DESIGNATION}]`
                        )
                    ),
                    name: Joi.string().trim().required().min(1).error(
                        customMessage(
                            {
                                "any.required": RESPONSE_MESSAGE.NAME_OF_CONTACT_PERSON_REQUIRED,
                            },
                            RESPONSE_MESSAGE.NAME_OF_CONTACT_PERSON_INVALID
                        )
                    ),
                    email: Joi.string().email({ minDomainSegments: 2 }).required().error(
                        customMessage(
                            {
                                "any.required": RESPONSE_MESSAGE.EMAIL_OF_CONTACT_PERSON_REQUIRED,
                            },
                            RESPONSE_MESSAGE.EMAIL_OF_CONTACT_PERSON_INVALID
                        )
                    ),
                    mobile_number: Joi.string().required().regex(/^[0-9]{10}$/).error(
                        customMessage(
                            {
                                "any.required": RESPONSE_MESSAGE.MOBILE_NO_OF_CONTACT_PERSON_REQUIRED,
                            },
                            RESPONSE_MESSAGE.MOBILE_NO_OF_CONTACT_PERSON_INVALID
                        )
                    )
                })
        })
        try {
            await Joi.validate(reqObj, schema);
            return Promise.resolve()
        } catch (err) {
            console.log(err.details);
            return Promise.reject(new errors.ValidationFailed(err.details[0].message));
        }
    }

    async trophiesValidation(reqObj) {
        const schema = Joi.object().keys({
            trophies: Joi.array()
                .items({
                    name: Joi.string().trim().error(() => {
                        return {
                            message: RESPONSE_MESSAGE.TROPHY_NAME_INVALID,
                        };
                    }),
                    position: Joi.string().trim().error(() => {
                        return {
                            message: RESPONSE_MESSAGE.TROPHY_POSITION_INVALID,
                        };
                    }),
                    year: Joi.number().error(() => {
                        return {
                            message: RESPONSE_MESSAGE.TROPHY_YEAR_INVALID,
                        };
                    })
                })
        })
        try {
            await Joi.validate(reqObj, schema);
            return Promise.resolve()
        } catch (err) {
            console.log(err.details);
            return Promise.reject(new errors.ValidationFailed(err.details[0].message));
        }
    }

    async topSigningsValidation(reqObj) {
        const schema = Joi.object().keys({
            top_signings: Joi.array()
                .items({
                    name: Joi.string().trim().allow("").error(() => {
                        return {
                            message: RESPONSE_MESSAGE.TOP_SIGNINGS_NAME_INVALID,
                        };
                    })
                })
        })
        try {
            await Joi.validate(reqObj, schema);
            return Promise.resolve()
        } catch (err) {
            console.log(err.details);
            return Promise.reject(new errors.ValidationFailed(err.details[0].message));
        }
    }
}

module.exports = new UserValidator();

