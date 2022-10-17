const express = require("express")
const app = express()
const importData = require("./data.json")

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("hello")
})

app.get("/products", (req, res) => {
    res.send(importData)
})



app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});



