const express = require('express');
const authRoutes = require('./auth.rest');
const userProfileRoutes = require('./userProfile.rest');
const locationRoutes = require('./location.rest');
const memberRoutes = require('./member.rest');
const memberTypeRoutes = require('./member-type.rest');
const achievementRoutes = require('./achievement.rest');
const playerSpecializationRoutes = require('./player-specialization.rest');

class Route {
	loadRoutes(app) {
		const apiRouter = express.Router();

		authRoutes(apiRouter);
		userProfileRoutes(apiRouter);
		locationRoutes(apiRouter);
		memberRoutes(apiRouter);
		memberTypeRoutes(apiRouter);
		achievementRoutes(apiRouter);
		playerSpecializationRoutes(apiRouter);

		app.use('/api', apiRouter);
		app.use("/apidocs", express.static("apidocs/doc"));
		app.use("/uploads", express.static("uploads"));
	}
}

module.exports = new Route();
