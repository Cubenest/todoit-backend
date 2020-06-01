import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { check, sanitize, validationResult } from "express-validator";
import { Status } from "../config/globals";
import "../config/passport";/**


 * POST group/:groupId/todo
 * Todos Page.
 */
import { isDate } from "util";
import { Group } from "../models/Group";
import { Todo } from "../models/Todo";

export const createTodo = async (req: Request, res: Response, next: NextFunction) => {
    await check("title", "Title should be between 3-100 Characters").isLength({ min:3,max: 100 }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json(errors.array());
    }

    Group.findById(req.params.groupId, (err, group) => {
        if(err){
           return res.status(404).send({
                msg: "Group not Found"
            });
        }
        

    var dueDatecheck = new Date(req.body.dueDate);
    if(dueDatecheck.toString() == "Invalid Date"){
        return res.status(500).send({
            msg: "Invalid Date"
        });
    }
    const user = req.user as UserDocument;
    const todo = new Todo(
        {
            title: req.body.title,
            groupId: req.params.groupId,
            labels: req.body.labels,
            dueDate: new Date(req.body.dueDate),
            status: req.body.status,
            priority: req.body.priority,
            desc: req.body.desc,
            userId :user._id


        });

    todo.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send("Todo created");
    });
});
};
/* GET /api/group/:groupId/todo
 * Get Todo Page.
 */

export const getAllTodos = (req: Request, res: Response) =>{
    const user = req.user as UserDocument;
    Todo.find({groupId : req.params.groupId,userId: user._id}, (err, todo) => {
        if(err){
            return res.send(err);
        }
        res.json(todo);
    });
};

/* GET /api/group/:groupId/todo/:status
 * Get Required Todo Page.
 */

export const getRequiredTodos = (req: Request, res: Response) =>{
    const user = req.user as UserDocument;
    Todo.find({groupId : req.params.groupId, status:req.params.status,userId: user._id}, (err, todo) => {
        if(err){
            return res.send(err);
        }
        res.json(todo);
    });
};

/* GET /api/group/:groupId/todo/:todoId
 * Get Single Todo Page.
 */
export const getTodo = (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    Todo.find({groupId : req.params.groupId, _id:req.params.todoId,userId: user._id}, (err, group) => {
        if(err){
           return res.status(404).send({
                msg: "Todo not Found"
            });
        }
        res.json(group);
    });
};

/* POST /api/group/:groupId/todo/:todoId
 * Update todo
 */

export const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
    await check("title", "title should be between 3-100 Characters").isLength({ min:3,max:100 }).run(req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // req.flash("errors", errors.array());
        return next(errors);
    }
    if(req.body.dueDate){

    var dueDatecheck = new Date(req.body.dueDate);
    if(dueDatecheck.toString() == "Invalid Date"){
        return res.status(500).send({
            msg: "Invalid Date"
        });
    }
}
    const user = req.user as UserDocument;
    Todo.findOneAndUpdate({groupId : req.params.groupId, _id:req.params.todoId,userId: user._id}, req.body, { new: true }, (err, todo) => {
        if(err){
            return res.status(404).send({
                msg: "Todo not Found"
            });
        }
        res.json(todo);
    });
   
};

/* DELETE /api/group/:groupId/todo/:todoId
 * Delete Groups Name.
 */

export const deleteTodo = (req: Request, res: Response) => 
{
    const user = req.user as UserDocument;
    Todo.findOne({ _id : req.params.todoId, groupId: req.params.groupId,userId: user._id }, (err, todo) => 
    {
        if(err){
           return res.status(404).send({
                msg: "Todo not Found"
            });
        }
        if(todo)
        {
        todo.status = Status.Archived;
        todo.save();
        return res.status(200).send({
            msg: "Todo Deleted"
        });
        }
    });
};