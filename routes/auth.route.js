//  Add in the authentication within this file
const express = require("express");
const router = express.Router();
const connection = require("../config");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const secrets = require('./secrets.js');

// // jwt strategy modules
const jwt = require("jsonwebtoken");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

// // Passport modules for local strategy
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const initializePassport = require("../passport-config")
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

passport.use( 
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: secrets.access_Token,
        },
        (jwtPayload, cb) => {
            return cb(null, jwtPayload);
        }
    )
);

router.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (request, response) => {
        response.send("User can view the profile");
    }
);

passport.use(
    "local",
    new LocalStrategy(
        {
            // The email and password is received from the login route
            usernameField: "email",
            passwordField: "password",
            session: false,
        },
        (email, password, callback) => {
            connection.query(
                `SELECT *, Cart.id as Cart_id FROM User JOIN Cart on Cart.user_id = User.id WHERE User.email = ?`,
                email,
                (err, foundUser) => {
                    // If generic error return the callback with the error message
                    if (err) return callback(err);

                    // If there is no user found send back incorrect email
                    if (!foundUser || !foundUser.length)
                        return callback(null, false, { message: "Incorrect email." });

                    // If there is a user with that email but password is incorrect
                    if (!bcrypt.compareSync(password, foundUser[0].password))
                        return callback(null, false, {
                            message: "Incorrect password.",
                        });

                    // If password and email is correct send user information to callback
                    return callback(null, foundUser[0]);
                }
            );
        }
    )
);

// // http://localhost:5000/auth/login
router.post("/login", function (request, response) {
    passport.authenticate(
        "local",
        // Passport callback function below
        (err, user, info) => {
            if (err) return response.status(500).send(err);
            if (!user) return response.status(400).json({ message: info.message });
            // TODO: write env variables for the jwt secret
            const token = jwt.sign(JSON.stringify(user), secrets.access_Token);
            const { password, ...foundUser } = user;
            return response.json({ foundUser, token });
        }
    )(request, response);
});

// // POST new User            /auth/signup
router.post("/signup", (req, resp) => {
    // try {
        const hashedPassword = bcrypt.hash(req.body.password, 10, (err, hash) => {

            const { email, first_name, last_name } = req.body;
            const formData = [email, hashedPassword, first_name, last_name];
            const sql = `INSERT INTO User SET ?`;
            
            connection.query(sql, formData, (err, res) => {
                if (err) {
                    resp.status(500).json({ error: err.message });
            } else {
                const newUserId = res.insertId;
                connection.query(`INSERT INTO Cart (user_id) VALUES (?)`, [newUserId], (err, res) => {
                    if (err) resp.status(500).json(err);
                    resp.status(200).send({ flash: `The user and cart were successfully created with ID:'${newUserId}'` });
                })
            }
        });
    });
    // } catch (err){
    //     console.log("something went fishy!", err)
    // }
});


router.post("/signup", (request, response) => {
    const password = request.body.password;
    bcrypt.hash(password, 10, (err, hash) => {
      const { email, name, lastname } = request.body;
      const formData = [email, hash, name, lastname];
      const sql =
        "INSERT INTO User (email, password, name, lastname) VALUES (?,?,?,?)";
  
      connection.query(sql, formData, (err, results) => {
        if (err) {
          response.status(500).json({ flash: err.message });
        } else {
          const newUserId = results.insertId;
          connection.query("INSERT INTO Cart (user_id) VALUES (?)", newUserId, (error, results) => {
            if (error) {
              response.status(500).json({ flash: error.message });
            } else {
              response.status(200).json({ flash: "User has been signed up !" });
            }
          })
        }
      });
    });
  });

// // Token middleware
const authenticateWithJsonWebToken = (request, response, next) => {
    if (request.headers.authorization !== undefined) {
        const token = request.headers.authorization.split(' ')[1];
        // TODO: write env variables for the jwt secret
        jwt.verify(token, secrets.access_Token, (err, decoded) => {
            if (err) {
                response
                    .status(401)
                    .json({ errorMessage: "you're not allowed to access this data" });
            } else {
                request.user_id = decoded.id;
                next();
            }
        });
    } else {
        response
            .status(401)
            .json({ errorMessage: "you're not allowed to access this data" });
    }
};

router.get('/verify-token', authenticateWithJsonWebToken, (request, response) => {
    const user_id = request.user_id;
    connection.query(
        'SELECT *, Cart.id as Cart_id FROM User JOIN Cart on Cart.user_id = User.id WHERE User.id = ?',
        [user_id],
        (err, results) => {
            if (err) response.status(500).send(err);
            else response.status(200).send({ ...results[0], password: 'hidden' });
        }
    );
});

module.exports = router;