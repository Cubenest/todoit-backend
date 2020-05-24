import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";


// Controllers (route handlers)
import * as userController from "./controllers/user";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import { UserDocument } from "./models/User";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
// app.get("/",);
app.post("/login", userController.postLogin);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.post("/signup", userController.postSignup);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);
app.get("/test",passportConfig.isAuthenticated,userController.testRoute);

/**
 * API examples routes.
 */

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/" }), (req, res) => {
    const token = req.user  as UserDocument;
    res.cookie("auth", token.jwtToken);
    res.redirect("/");
});

app.get("/auth/google",
  passport.authenticate("google", { scope:
  	[ "email", "profile" ] }
));

app.get( "/auth/google/callback",
	passport.authenticate( "google", {
		failureRedirect: "/"
}),(req,res) => {
    const token = req.user  as UserDocument;
    res.cookie("auth", token.jwtToken);
    res.redirect("/");
});

export default app;
