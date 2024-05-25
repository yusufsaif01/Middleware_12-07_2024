const express = require('express');
const authRoutes = require('./auth.rest');
const userProfileRoutes = require('./userProfile.rest');
const locationRoutes = require('./location.rest');
const memberRoutes = require('./member.rest');
const memberTypeRoutes = require('./member-type.rest');
const achievementRoutes = require('./achievement.rest');
const playerSpecializationRoutes = require('./player-specialization.rest');
const connectionsRoutes = require('./connections.rest');
const postRoutes = require('./post.rest');
const playerDocuments = require('./player-documents.rest');
const clubAcademyDocuments = require('./club-academy-documents.rest');
const footplayerRoutes = require('./footplayer.rest');
const peopleRoutes = require('./people.rest');
const employmentContract = require('./employment-contract.rest');
const video = require('./video.rest');
const reportCardRoutes = require('./report-card.rest');
const accessToken = require('./access-token.rest');
const checkAccessToken = require('../middleware/auth/access-token');
const coachRest = require("./coach.rest");
class Route {
	loadRoutes(app) {
		const apiRouter = express.Router();
		const accessTokenRouter = express.Router();

		authRoutes(apiRouter);
		userProfileRoutes(apiRouter);
		locationRoutes(apiRouter);
		memberRoutes(apiRouter);
		memberTypeRoutes(apiRouter);
		achievementRoutes(apiRouter);
		playerSpecializationRoutes(apiRouter);
		connectionsRoutes(apiRouter);
		postRoutes(apiRouter);
		playerDocuments(apiRouter);
		clubAcademyDocuments(apiRouter);
		footplayerRoutes(apiRouter);
		peopleRoutes(apiRouter);
		employmentContract(apiRouter);
		video(apiRouter);
		reportCardRoutes(apiRouter);
		coachRest(apiRouter);
		accessToken(accessTokenRouter);

		app.use("/api/access-token", accessTokenRouter)
		app.use('/api', checkAccessToken(), apiRouter);
		app.use("/apidocs", express.static("apidocs/doc"));
		app.use("/uploads", express.static("uploads"));
		app.use("/public", express.static("public"));

	}
}

module.exports = new Route();
