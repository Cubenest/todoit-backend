import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import nodemailer from "nodemailer";
import { check, sanitize, validationResult } from "express-validator";
import {Group} from "../models/Group";
import { Status } from "../config/globals";

/* invite /api/group/:groupId/invite
 * Invite user to group
 */

export const inviteUser = async (req: Request, res: Response, done: Function) => 
{
 
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json(errors.array());
    }
    const inviteurl = req.protocol + "://" + req.get("host") +"/invitation?groupId="+ req.params.groupId+"&email="+ req.body.email;
    const loggeduser = req.user as UserDocument;
    User.findOne({email: req.body.email}, (err,user) =>{
        if(err){
            return res.status(500).send({
                msg: "Unable to invite"
            });
        }
        if(user){
            user.invite.push(req.params.groupId);
            user.save();
            const transporter = nodemailer.createTransport({
                host: "smtp.sendgrid.net",
                port: 587,
                auth: {
                    user: "apikey",
                    pass: "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"
                }
            });
            const mailOptions = {
                to: req.body.email,
                from: "mohammedshoaib@cigma.in",
                subject: "Todoit group invitation",
                text: `Hey there,\n\n ${loggeduser.email} has invited you to join a Group on Todoit.\n
                Click on the link to join the group ${inviteurl}`,
                html:`<p>Hey there,<br><br> <b>${loggeduser.email}</b> has invited you to join a Group on Todoit.\n
                Click on the button to join the group <br><br><a href="${inviteurl}" target="_blank"><button>Accept</button></a>`
            };
            transporter.sendMail(mailOptions, (err) => {
                res.json({ msg: "Success! Your invitation has been sent." });
                done(err);
            });
        }
    });

}

/* Invite Accept
* api/user/invite/accept/:groupId
*/

export const acceptInvite= (req: Request, res: Response) =>
{
    const user = req.user as UserDocument;
    user.invite=user.invite.filter(item => item !== req.params.groupId);
    user.save();
    Group.findOne({ _id: req.params.groupId }, (err, group) => {
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

}

/* Reject Accept
* api/user/invite/reject/:groupId
*/

export const rejectInvite= (req: Request, res: Response) =>
{
    const user = req.user as UserDocument;
    user.invite=user.invite.filter(item => item !== req.params.groupId);
    user.save();
    Group.findOne({ _id: req.params.groupId }, (err, group) => {
        if(err){
           return res.status(404).send({
                msg: "Group not Found"
            });
        }
        if(group){
        
            const email = user.email;
            group.users=group.users.filter(item => item !== email);
            group.save();
            return res.status(200).send({
                msg: "You have rejected the invite"
            });
    }
    });

}