const express = require("express");
const router = express.Router();
const connection = require("../config")
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail")

// Send Email when a new Account is created     /email/createAccount
router.post("/createAccount", (req, resp) => {
    const output = `
    <body style="margin:0; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu, Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;">
        <div style="background-color: #3f5b97; display: flex; gap: 5%; color: #fff; align-items: center;">
            <img src="https://i.postimg.cc/qMV77XNC/logo2.png" alt="" width="200" height="120">
            <br>
            <h1 style="text-decoration: underline;">ShelfTec - New User Account Created</h1>
        </div>
        <main style="font-size: 18px; padding: 0 10px;">
            <br>
            <p>
                Dear ${req.body.firstName}, 
                <br><br>
                Thank you plenty for signing up and checking the depth of this portfolio project. 
                <br>
                To visit your profile and explore further features, 
                click on the link and get back to <a href="https://shelf-tec.netlify.app">Shelftec.</a> 
                <br><br>
                I hope you enjoyed this project and would love to hear your feedback! 
                <br>
                Please reply to this email with you thoughts or contact me on 
                <a href="https://www.dan-weber-main.com">my personal website.</a>
            </p>
            <p>Thanks again and all the best to <strong>YOU</strong>!</p>
            <p>Best regards,</p>
            <p>Dan Weber - Creator of ShelfTec</p>
        </main>
    </body>
    `;
    sendEmail("ShelfTec - Created a new Account", output, req.body.email, "'Shelftec' <noreply.shelfec@gmail.com>", "'Shelftec' <noreply.shelfec@gmail.com>")
    resp.status(200).send({ message: "Email succesfully sent!" })
})

// Send Email when a user forgot his Password     /email/forgotPassword
router.post("/forgotPassword", async (req, resp) => {
    const userEmail = req.body.email;
    try {
        connection.query(`SELECT * FROM User`, (err, res) => {
            if (err) resp.status(500).json(err);
            if (res.filter(item => item.email === userEmail).length > 0) {
                const createNewPassword = () => {
                    var pass = '';
                    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                        'abcdefghijklmnopqrstuvwxyz0123456789@#$';

                    for (let i = 1; i <= 8; i++) {
                        var char = Math.floor(Math.random()
                            * str.length + 1);

                        pass += str.charAt(char)
                    }

                    return pass;
                }
                const newPassword = createNewPassword()
                bcrypt.hash(newPassword, 10, (err, hash) => {
                    connection.query(`UPDATE user SET password = ? WHERE email = ?`, [hash, userEmail], (err, res) => {
                        if (err) resp.status(500).json(err)
                        res.affectedRows > 0 ?
                            console.log("update successfully")
                            :
                            resp.status(400).json({
                                message: "user not found",
                            })
                    })
                    const output = `
                        <body style="margin:0; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu, Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;">
                            <div style="background-color: #3f5b97; display: flex; gap: 5%; color: #fff; align-items: center;">
                                <img src="https://i.postimg.cc/qMV77XNC/logo2.png" alt="" width="200" height="120">
                                <br>
                                <h1 style="text-decoration: underline;">ShelfTec - User Account Forgotten Passwort</h1>
                            </div>
                            <main style="font-size: 18px; padding: 0 10px;">
                                <br>
                                <p>
                                    Dear ${req.body.firstName}, 
                                    <br><br>
                                    Thank you plenty for using ShelfTec! It seems like you forgot your password, so here is a temporary password to access:
                                    <br>
                                    <p style="background-color: #383838; color: white; display: inline-block; padding: 5px; font-weight: bold;">${newPassword}</p>
                                    This password will be valid for 24 hours from now!
                                    <br>
                                    To visit your profile and explore further features, 
                                    click on the link and get back to <a href="https://shelf-tec.netlify.app">Shelftec.</a> 
                                    <br>
                                </p>
                                <p>Thanks again and all the best to <strong>YOU</strong>!</p>
                                <p>Best regards,</p>
                                <p>Dan Weber - Creator of ShelfTec</p>
                            </main>
                        </body>
                        `;

                    sendEmail("ShelfTec - new temporary Password", output, req.body.email, "'Shelftec' <noreply.shelfec@gmail.com>", "'Shelftec' <noreply.shelfec@gmail.com>")
                    resp.status(200).send({ message: "Email succesfully sent!" })
                })
            } else {
                resp.status(400).send({ message: "A user with this email addres does not exists yet!" })
            }
        })
    } catch (error) {
        console.log(error);
    }
})

// Send Email after User updated his Password     /email/resetPassword
router.post("/resetPassword", async (req, resp) => {
    const userEmail = req.body.email;
    const current_password = req.body.current_password
    const newPassword = req.body.newPassword;
    try {
        connection.query(`SELECT * FROM User`, (err, res) => {
            if (err) resp.status(500).json(err);

// TODO: add user verification with password (login from Auth Route)!!!!!

            if (res.filter(item => item.email === userEmail).length > 0) {
                bcrypt.hash(newPassword, 10, (err, hash) => {
                    connection.query(`UPDATE user SET password = ? WHERE email = ?`, [hash, userEmail], (err, res) => {
                        if (err) resp.status(500).json(err)
                        res.affectedRows > 0 ?
                            console.log("update successfully")
                            :
                            resp.status(400).json({
                                message: "user not found",
                            })
                    })
                    const output = `
                        <body style="margin:0; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu, Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;">
                            <div style="background-color: #3f5b97; display: flex; gap: 5%; color: #fff; align-items: center;">
                                <img src="https://i.postimg.cc/qMV77XNC/logo2.png" alt="" width="200" height="120">
                                <br>
                                <h1 style="text-decoration: underline;">ShelfTec - User Account Forgotten Passwort </h1>
                            </div>
                            <main style="font-size: 18px; padding: 0 10px;">
                                <br>
                                <p>
                                    Dear ${req.body.firstName}, 
                                    <br><br>
                                    Thank you plenty for using ShelfTec! The password to your account has been updated.
                                    <br>
                                    If you did not update your password by yourself, please get in contact with you!
                                    <br>
                                    To visit your profile and explore further features, 
                                    click on the link and get back to <a href="https://shelf-tec.netlify.app">Shelftec.</a> 
                                    <br>
                                </p>
                                <p>Best regards,</p>
                                <p>Dan Weber - Creator of ShelfTec</p>
                            </main>
                        </body>
                        `;

                    sendEmail("ShelfTec - Password has been reset", output, req.body.email, "'Shelftec' <noreply.shelfec@gmail.com>", "'Shelftec' <noreply.shelfec@gmail.com>")
                    resp.status(200).send({ message: "Email succesfully sent!" })
                })
            } else {
                resp.status(400).send({ message: "A user with this email addres does not exists yet!" })
            }
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;