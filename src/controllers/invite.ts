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
    const url =req.protocol + "://" + req.get("host");
    const accepturl =  url+"/api/user/invite/accept/"+ req.params.groupId+"&email="+ req.body.email;
    const rejectturl =  url+"/api/user/invite/reject/"+ req.params.groupId+"&email="+ req.body.email;
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
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: req.body.email,
                from: "TodoIt <mytodoitapp@gmail.com>",
                subject: "Todoit group invitation",
                text: `Hey there,\n\n ${loggeduser.email} has invited you to join a Group on Todoit.\n
                Click on the link to join the group ${accepturl}`,
                html:`<table border="1" cellpadding="0" cellspacing="0" style="text-align:center;">
                <tbody>
                  <tr>
                    <td style="line-height:22px; text-align:left;padding:6px 6px 6px 6px;" height="100%" valign="top" bgcolor="" role="module-content" colspan="2"><div><div style="font-family: inherit">Hey there,<br>
                      <br>
                      <strong>${loggeduser.email}</strong> has invited you to join a Group on Todoit.<br>
                    Click on the button to join the group.</div>
                    <div style="font-family: inherit"><br></div><div></div></div></td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#0f1f87" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                      <a href="${accepturl}" style="background-color:#0f1f87; border:1px solid #333333; border-color:#333333; border-radius:6px; border-width:1px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid;" target="_blank">Accept</a>
                    </td>
                    <td align="center" bgcolor="#d80f0f" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                      <a href="${rejectturl}" style="background-color:#d80f0f; border:1px solid #333333; border-color:#333333; border-radius:6px; border-width:1px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid;" target="_blank">Reject</a>
                    </td>
                  </tr>
                </tbody>
              </table>`
            };
            transporter.sendMail(mailOptions, (err) => {
                res.json({ msg: "Success! Your invitation has been sent." });
                done(err);
            });
        }
    });

};

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

};

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

};