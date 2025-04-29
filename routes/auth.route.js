const express = require('express'),
  router = express.Router(),
  connection = require('../config'),
  bcrypt = require('bcrypt'),
  secrets = require('../secrets'),
  sendEmail = require('../utils/sendEmail');

// jwt strategy modules
const jwt = require('jsonwebtoken'),
  JWTStrategy = require('passport-jwt').Strategy,
  ExtractJWT = require('passport-jwt').ExtractJwt;

// Passport modules for local strategy
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: secrets.access_Token
    },
    (jwtPayload, cb) => {
      return cb(null, jwtPayload);
    }
  )
);

router.get('/profile', passport.authenticate('jwt', { session: false }), (_, response) => {
  response.send('User can view the profile');
});

passport.use(
  'local',
  new LocalStrategy(
    {
      // The email and password is received from the login route
      usernameField: 'email',
      passwordField: 'password',
      session: false
    },
    (email, password, callback) => {
      connection.query(
        `SELECT *, cart.id as Cart_id FROM user JOIN cart on cart.user_id = user.id WHERE user.email = ?`,
        email,
        (err, foundUser) => {
          // If generic error return the callback with the error message
          if (err) return callback(err);

          // If there is no user found send back incorrect email
          if (!foundUser || !foundUser.length)
            return callback(null, false, { message: 'Incorrect email.' });

          // If there is a user with that email but password is incorrect
          if (!bcrypt.compareSync(password, foundUser[0].password)) {
            return callback(null, false, {
              message: 'Incorrect password.'
            });
          }

          // If password and email is correct send user information to callback
          return callback(null, foundUser[0]);
        }
      );
    }
  )
);

// LOGIN                     /auth/login
router.post('/login', function (request, response) {
  passport.authenticate(
    'local',
    // Passport callback function below
    (err, user, info) => {
      if (err) return response.status(500).send(err);
      if (!user) return response.status(400).json({ message: info.message });
      const token = jwt.sign(JSON.stringify(user), secrets.access_Token);
      const { password, ...foundUser } = user;
      return response.json({ foundUser, token });
    }
  )(request, response);
});

// RESET password           /auth/passwordReset
router.post('/resetPassword', function (req, resp) {
  const userEmail = req.body.email,
    newPassword = req.body.newPassword;
  passport.authenticate('local', (err, user, info) => {
    if (err) resp.status(500).send(err);
    if (!user) resp.status(400).json({ message: info.message });
    else {
      bcrypt.hash(newPassword, 10, (err, hash) => {
        connection.query(
          `UPDATE user SET password = ? WHERE email = ?`,
          [hash, userEmail],
          (err, res) => {
            if (err) resp.status(500).json(err);
            if (res.affectedRows > 0) console.log('update successfully');
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
                                        If you did not update your password by yourself, please get in contact with me! You can just reply to this message for support.
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

            sendEmail(
              'ShelfTec - Password has been reset',
              output,
              req.body.email,
              "'Shelftec' <noreply.shelfec@gmail.com>",
              "'Shelftec' <noreply.shelfec@gmail.com>"
            );
          }
        );
        return resp.json({ message: 'Passwort updated and Email succesfully sent!' });
      });
    }
  })(req, resp);
});

// POST new User            /auth/signup
router.post('/signup', (req, resp) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) resp.status(500).json({ error: err.message });

    const { email, first_name, last_name } = req.body;
    const sql = `INSERT INTO user (email, password, first_name, last_name) VALUES (?,?,?,?)`;

    connection.query(sql, [email, hash, first_name, last_name], (err, res) => {
      if (err) {
        resp.status(500).json({ error: err.message });
      } else {
        const newUserId = res.insertId;
        connection.query(`INSERT INTO cart (user_id) VALUES (?)`, [newUserId], (err, res) => {
          if (err) {
            console.log(err);
            resp.status(500).json(err);
            return;
          }
          resp
            .status(200)
            .send({ flash: `The user and cart were successfully created with ID:'${newUserId}'` });
        });
      }
    });
  });
});

// Token middleware
const authenticateWithJsonWebToken = (request, response, next) => {
  if (request.headers.authorization !== undefined) {
    const token = request.headers.authorization.split(' ')[1];
    // TODO: write env variables for the jwt secret
    jwt.verify(token, secrets.access_Token, (err, decoded) => {
      if (err) {
        response.status(401).json({ errorMessage: "you're not allowed to access this data" });
      } else {
        request.user_id = decoded.id;
        next();
      }
    });
  } else {
    response.status(401).json({ errorMessage: "you're not allowed to access this data" });
  }
};

router.get('/verify-token', authenticateWithJsonWebToken, (request, response) => {
  const user_id = request.user_id;
  connection.query(
    'SELECT *, cart.id as cart_id FROM user JOIN cart on cart.user_id = user.id WHERE user.id = ?',
    [user_id],
    (err, results) => {
      if (err) response.status(500).send(err);
      else response.status(200).send({ ...results[0], password: 'hidden' });
    }
  );
});

module.exports = router;
