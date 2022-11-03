const express = require("express")
const app = express()
const cors = require("cors")
const connection = require("./config");
const authRouter = require("./routes/auth.route");
const productsRouter = require("./routes/products.route");
const cartRouter = require("./routes/cart.route");
const ordersRouter = require("./routes/orders.route");

// Data before sql
const importData = require("./data.json")

const port = 5000;

connection.connect((err) => {
    if (err) throw err;
    console.log("Successfully connected to the database");
});

app.use(express.json());
app.use(cors({ origin: "*" }))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);

// app.get("/", (req, res) => {
//     res.send("hello")
// })

// app.get("/products", (req, res) => {
//     res.send(importData)
// })



// var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
// var server_host = process.env.YOUR_HOST || '0.0.0.0';
// app.listen(server_port, server_host, function() {
//     console.log('Listening on port %d', server_port);
// });


app.listen(port, (err) => {
    if (err) throw err;
    console.log(`App is listening at ${port}`);
});
