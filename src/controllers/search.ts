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
import { Todo } from "../models/Todo";
import mongoose from "mongoose";
import { Status } from "../config/globals";
mongoose.Promise = global.Promise;
/* GET /api/search
 * Get All todos Page.
 */

 export const searchAllTodos = (req: Request, res: Response) =>{
    const user = req.user as UserDocument;  
    const q = req.query.q;

    const search: any ={userId: user._id,status:{$ne:Status.Trashed}};
    if(req.query.q){
        search.title = new RegExp(q ,"i");
    }
   
    if (req.query.status)
    {
        search.status=  { $in: req.query.status.split(",") };
    }
    if (req.query.priority)
    {
        search.priority=  { $in: req.query.priority.split(",") };
    }
    if(req.query.dueDate){
        search.dueDate = req.query.dueDate;
    }
    if(req.query.groupId){
        search.groupId = req.query.groupId;
    }
    if(req.query.labels){
        search.labels = {$elemMatch:{$eq:req.query.labels}};
    }
    

    const findGroups = new Promise((resolve, reject) => {
        
        Group.find({name: new RegExp(q ,"i"),users: {$elemMatch:{$eq:user.email}}, status:{$ne:Status.Trashed}}, function(err, group) {
            if (err) reject(err);
            resolve(group);                   
         });
      });  
    
      const findTodos = new Promise((resolve, reject) => {
        Todo.find(search, function(err, todo) {
            if (err) reject(err);
            resolve(todo);                   
         });
      }); 
      
      return Promise.all([findGroups, findTodos])
                    .then(array => {
                        
                       res.json(array);
                  })
                  .catch(function(err) {
                    res.status(404).send({
                        msg: "No results"
                    });
                  });
                };