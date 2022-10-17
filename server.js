const express = require("express")
const app = express()
const importData = require("./data.json")



app.get("/", (req, res) => {
    res.send("hello")
})

app.get("/products", (req, res) => {
    res.send(importData)
})




app.listen(3500)

