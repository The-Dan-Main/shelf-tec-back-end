const express = require("express")
const cors = require("cors")
const app = express()
const connection = require("./config");
// const authRouter = require("./routes/auth.route");
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
// app.use("/auth", authRouter);
// TODO: great use of express router here
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);


// TODO: great setup here for when the port is used up on the server
// Port and Listener
const port = 3306;
app.listen(process.env.PORT || port , (err) => {
    if (err) throw err;
    console.log(`App is listening at ${port}`);
});

// TODO: Overall the project is well implemented and has a very good structure
// There are some small things that need to be updated but this is mentioned within the comments
// Anything that is not commented is using the best practices
