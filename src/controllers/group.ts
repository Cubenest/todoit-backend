import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { check, sanitize, validationResult } from "express-validator";
import "../config/passport";
import {Group} from "../models/Group";
import mongoose from "mongoose";
import { Status } from "../config/globals";


 /* POST /api/group
 * Create Groups Page.
 */
export const postGroup = async (req: Request, res: Response, next: NextFunction) => {
    await check("name", "Name should be between 3-15 Characters").isLength({ min:3,max: 15 }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json(errors.array());
    }

    const user = req.user as UserDocument;
    
    const group = new Group(
        {
            name: req.body.name,
            users: [user.email],
            userId :user._id
        }
    );

    group.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send("Group created");
    });
};

/* GET /api/group
 * Get Groups Page.
 */

export const getAllGroups = (req: Request, res: Response) =>{

    const user = req.user as UserDocument;
    let page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const query: any = {};
    if(page < 0 || page === 0) {
        page = 1;
    }
    
    Group.countDocuments({users: {$elemMatch:{$eq:user.email}}, status:{$ne: Status.Trashed}},(err,totalCount) => {
        if(err) {
           return res.send(err);
        }
    query.skip = size * (page - 1);
    query.limit = size;
    if (totalCount<=query.skip){
        query.skip = 0;
    }
    
    Group.find({users: {$elemMatch:{$eq:user.email}}, status:{$ne: Status.Trashed}},{},query, (err, group) => {
    if(err){
        return res.send(err);
    }
    const result = {"groups": group, "count": totalCount};
    res.json(result);
    });
});
    
};

/* GET /api/group
 * Get Single Group Page.
 */
export const getGroup = (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    Group.find({_id: req.params.groupId, users: {$elemMatch:{$eq:user.email}}}, (err, group) => {
        if(err){
           return res.status(404).send({
                msg: "Group not Found"
            });
        }
        res.json(group);
    });
};

/* POST /api/group/:groupId
 * Update Groups Name.
 */

export const updateGroupName = async (req: Request, res: Response, next: NextFunction) => {
    await check("name", "Name should be between 3-15 Characters").isLength({ min:3,max: 25 }).run(req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // req.flash("errors", errors.array());
        return next(errors);
    }
    const user = req.user as UserDocument;
    Group.findOneAndUpdate({ _id: req.params.groupId, users: {$elemMatch:{$eq:user.email}} }, req.body, { new: true }, (err, group) => {
        if(err){
            return res.status(404).send({
                msg: "Group not Found"
            });
        }
        res.json(group);
    });
   
};

/* POST /api/group/users/:groupId
 * Update Groups Users.
 */

export const updateGroupUsers = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        
        return next(errors);
    }
    const user = req.user as UserDocument;
    Group.findOne({ _id: req.params.groupId,users: {$elemMatch:{$eq:user.email}} }, (err, group) => {
        if(err){
           return res.status(404).send({
                msg: "Group not Found"
            });
        }
        if(group){
        if(group.users.includes(req.body.email)){
           return res.status(200).json(group);
        }
        group.users.push(req.body.email);
        group.save();
        res.json(group);
    }
    });
   
};

/* DELETE /api/group/:groupId
 * Delete Groups Name.
 */
export const deleteGroup = (req: Request, res: Response) => 
{
    const user = req.user as UserDocument;
    Group.findOne({ _id: req.params.groupId, users: {$elemMatch:{$eq:user.email}},status:{$ne :Status.Trashed} }, (err, group) => 
    {
        if(err){
           return res.status(404).send({
                msg: "Group not Found"
            });
        }
        if(group){
        if(group.users[0] == user.email )
        {
            group.status = Status.Archived;
            group.save();
            return res.status(200).send({
            msg: "Group Deleted"
        });
        }
        else {
            
            const email = user.email;
            group.users=group.users.filter(item => item !== email);
            group.save();
            return res.status(200).send({
                msg: "You have exited from the group"
            });
        } 
        }
        else{
            return res.status(404).send({
                msg: "Group not Found"
            });
        }
    }
    );};