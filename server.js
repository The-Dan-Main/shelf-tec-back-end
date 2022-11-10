const express = require("express")
const cors = require("cors")
const app = express()
const connection = require("./config");
const secrets = require('./secrets');
const authRouter = require("./routes/auth.route");
const cartRouter = require("./routes/cart.route");
const ordersRouter = require("./routes/orders.route");
const productsRouter = require("./routes/products.route");
const usersRouter = require("./routes/user.route")


// Data if  SQL is Offline
const importData = require("./data.json")



// creating Connection to MYSQL and Start App
connection.connect((err) => {
    if (err) throw err;
    console.log("Successfully connected to the database");
});
app.use(express.json());



//Allow CORS and Access-Control-Allow Origin
app.use(cors({ origin: "*" }))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});



// Routes
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);



// Port and Listener
const port = 6000;
app.listen(process.env.PORT || port , (err) => {
    if (err) throw err;
    console.log(`App is listening at ${port}`);
});

