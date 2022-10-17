const express = require("express")
const app = express()
const importData = require("./data.json")


app.get("/", (req, res) => {
    res.send("hello")
})

app.get("/products", (req, res) => {
    res.send(importData)
})



var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
server.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});



