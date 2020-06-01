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
    var q = req.query.q;

    var search =<any>{userId: user._id};

    if(req.query.q){
        search.title = new RegExp(q ,'i')
    }
    if(req.query.status == 0 || req.query.status == 1 || req.query.status == 2 || req.query.status == 3){
        search.status = req.query.status
    }
    if (req.query.status =="0,1")
    {
        search.status=  { $in: [0, 1] }
    }
    if(req.query.dueDate){
        search.dueDate = req.query.dueDate
    }
    if(req.query.groupId){
        search.groupId = req.query.groupId
    }
    

    var findGroups = new Promise((resolve, reject) => {
        
        Group.find({name: new RegExp(q ,'i'),userId: user._id}, function(err, group) {
            if (err) reject(err);
            resolve(group)                   
         });
      })  
    
      var findTodos = new Promise((resolve, reject) => {
        Todo.find(search, function(err, todo) {
            if (err) reject(err);
            resolve(todo)                   
         });
      }) 
      
      return Promise.all([findGroups, findTodos])
                    .then(array => {
                        
                       res.json(array)
                  })
                  .catch(function(err) {
                    res.status(404).send({
                        msg: "No results"
                    });
                  });
                }