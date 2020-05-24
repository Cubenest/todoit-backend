import passport from "passport";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import _ from "lodash";
import {Strategy,ExtractJwt, VerifiedCallback} from "passport-jwt";
import  passportGoogle from "passport-google-oauth2";

import { User, UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import {JWT_SECRET} from "../util/secrets";
import { sign } from "jsonwebtoken";
const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = passportGoogle.Strategy;


passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
        if (err) { return done(err); }
        if (!user) {
            return done(undefined, false, { message: `Email ${email} not found.` });
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(undefined, user);
            }
            return done(undefined, false, { message: "Invalid email or password." });
        });
    });
}));


/**
 * OAuth Strategy Overview
 *
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, update the details.
 *       - Else create a new account.
 */


/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["name", "email", "link", "locale", "timezone"],
    passReqToCallback: true
}, (req: any, accessToken, refreshToken, profile, done) => {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            
            if (existingUser) {
                existingUser.jwtToken = existingUser.generateJWT();
                return done(undefined, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
                if (err) { return done(err); }
                if (existingEmailUser) {
                        existingEmailUser.facebook = profile.id;
                        existingEmailUser.tokens.push({ kind: "facebook", accessToken });
                        existingEmailUser.profile.name = existingEmailUser.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
                        existingEmailUser.profile.gender = existingEmailUser.profile.gender || profile._json.gender;
                        existingEmailUser.profile.picture = existingEmailUser.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
                        existingEmailUser.jwtToken = existingEmailUser.generateJWT();
                        existingEmailUser.save((err: Error) => {
                            done(err, existingEmailUser);
                        });
                } else {
                    const user: any = new User();
                    user.email = profile._json.email;
                    user.facebook = profile.id;
                    user.tokens.push({ kind: "facebook", accessToken });
                    user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = profile._json.gender;
                    user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.profile.location = (profile._json.location) ? profile._json.location.name : "";
                    user.save((err: Error) => {
                        done(err, user);
                    });
                }
            });
        });
    
}));

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
  },(req: any, accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) =>{

    process.nextTick(function () {
        if (req.user) {
            User.findOne({ google: profile.id }, (err, existingUser) => {
                if (err) { return done(err); }
                if (existingUser) {
                    done(err);
                } else {
                    User.findById(req.user.id, (err, user: any) => {
                        if (err) { return done(err); }
                        user.google = profile.id;
                        user.tokens.push({ kind: "google", accessToken });
                        user.profile.name = user.profile.name || profile.displayName;
                        user.profile.gender = user.profile.gender || profile.gender;
                        user.profile.picture = user.profile.picture || profile.picture;
                        user.save((err: Error) => {
                            // req.flash("info", { msg: "Facebook account has been linked." });
                            done(err, user);
                        });
                    });
                }
            });
        } else {
            User.findOne({ google: profile.id }, (err, existingUser) => {
                // if (err) { return done(err); }
                
                if (existingUser) {
                    existingUser.jwtToken = existingUser.generateJWT();
                    return done(undefined, existingUser);
                }
                User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
                    if (err) { return done(err); }
                    if (existingEmailUser) {
    
                        // req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
                            existingEmailUser.google = profile.id;
                            existingEmailUser.tokens.push({ kind: "google", accessToken });
                            existingEmailUser.profile.name = existingEmailUser.profile.name || profile.displayName;
                            existingEmailUser.profile.gender = existingEmailUser.profile.gender || profile.gender;
                            existingEmailUser.profile.picture = existingEmailUser.profile.picture || profile.picture;
                            existingEmailUser.jwtToken = existingEmailUser.generateJWT();
                            existingEmailUser.save((err: Error) => {
                                done(err, existingEmailUser);
                            });
                    } else {
                        const user: any = new User();
                        user.email = profile._json.email;
                        user.google = profile.id;
                        user.tokens.push({ kind: "google", accessToken });
                        user.profile.name = profile.displayName;
                        user.profile.gender = profile.gender;
                        user.profile.picture = profile.picture;
                        user.profile.location = "";
                        user.save((err: Error) => {
                            done(err, user);
                        });
                    }
                });
            });
        }
    });
  }
));

//This verifies that the token sent by the user is valid
passport.use(new Strategy({
    //secret we used to sign our JWT
    secretOrKey : JWT_SECRET,
    //we expect the user to send the token as a query parameter with the name 'secret_token'
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken()
  }, async (token, done) => {
    try {
      //Pass the user details to the next middleware
      return done(null, token.user);
    } catch (error) {
      done(error);
    }
  }));

/**
 * Login Required middleware.
 */
export const isAuthenticated = passport.authenticate("jwt", { session : false });

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];

    const user = req.user as UserDocument;
    if (_.find(user.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};
