import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import cors from "cors";
import { MONGODB_URI } from "./util/secrets";

// Controllers (route handlers)
import * as userController from "./controllers/user";
import * as groupController from "./controllers/group";
import * as todoController from "./controllers/todo";
import * as searchController from "./controllers/search";
import * as inviteController from "./controllers/invite";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import { UserDocument } from "./models/User";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    })
    .catch((err) => {
        console.log(
            "MongoDB connection error. Please make sure MongoDB is running. " +
                err
        );
        // process.exit();
    });

// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.post("/api/login", userController.postLogin);
app.post("/api/forgot", userController.postForgot);
app.get("/api/reset/:token", userController.getReset);
app.post("/api/reset/:token", userController.postReset);
app.post("/api/signup", userController.postSignup);
app.get(
    "/api/account",
    passportConfig.isAuthenticated,
    userController.getAccount
);
app.post(
    "/api/account/password",
    passportConfig.isAuthenticated,
    userController.postUpdatePassword
);
app.get(
    "/api/account/unlink/:provider",
    passportConfig.isAuthenticated,
    userController.getOauthUnlink
);

/**
 * API Group routes.
 */
app.post(
    "/api/group",
    passportConfig.isAuthenticated,
    groupController.postGroup
);
app.get(
    "/api/group",
    passportConfig.isAuthenticated,
    groupController.getAllGroups
);
app.get(
    "/api/group/:groupId",
    passportConfig.isAuthenticated,
    groupController.getGroup
);
app.post(
    "/api/group/:groupId",
    passportConfig.isAuthenticated,
    groupController.updateGroupName
);
app.post(
    "/api/group/users/:groupId",
    passportConfig.isAuthenticated,
    groupController.updateGroupUsers
);
app.delete(
    "/api/group/:groupId",
    passportConfig.isAuthenticated,
    groupController.deleteGroup
);

/**
 * API Todo routes.
 */
app.post(
    "/api/group/:groupId/todo/",
    passportConfig.isAuthenticated,
    todoController.createTodo
);
app.get(
    "/api/group/:groupId/todos/",
    passportConfig.isAuthenticated,
    todoController.getAllTodos
);
app.get(
    "/api/group/:groupId/todos/:status",
    passportConfig.isAuthenticated,
    todoController.getRequiredTodos
);
app.get(
    "/api/group/:groupId/todo/:todoId",
    passportConfig.isAuthenticated,
    todoController.getTodo
);
app.post(
    "/api/group/:groupId/todo/:todoId",
    passportConfig.isAuthenticated,
    todoController.updateTodo
);
app.delete(
    "/api/group/:groupId/todo/:todoId",
    passportConfig.isAuthenticated,
    todoController.deleteTodo
);

/**
 * API Search routes.
 */
app.get(
    "/api/search",
    passportConfig.isAuthenticated,
    searchController.searchAllTodos
);

/**
 * Group Invite routes.
 */
app.post(
    "/api/group/:groupId/invite",
    passportConfig.isAuthenticated,
    inviteController.inviteUser
);
app.get(
    "/api/user/invite/accept/:groupId",
    passportConfig.isAuthenticated,
    inviteController.acceptInvite
);
app.get(
    "/api/user/invite/reject/:groupId",
    passportConfig.isAuthenticated,
    inviteController.rejectInvite
);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);
app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/" }),
    (req, res) => {
        const token = req.user as UserDocument;
        res.cookie("auth", token.jwtToken);
        res.redirect("/");
    }
);

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
    }),
    (req, res) => {
        const token = req.user as UserDocument;
        res.cookie("auth", token.jwtToken);
        res.redirect("/");
    }
);

export default app;
