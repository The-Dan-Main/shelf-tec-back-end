const { response } = require("express");
const express = require("express");
const router = express.Router();
const connection = require("../config")

// GET ALL Products         /products
router.get('', (req, resp) => {

    connection.query('SELECT * FROM product', (err, results) => {
        if (err) resp.status(500).json(err)

        const products = results;
        resp.status(200).json(products)
    })
});



// GET Product by ID        /products/:id
router.get('/:id', (req, resp) => {
    const productID = req.params.id
    connection.query('SELECT * FROM product WHERE id = ?', productID, (err, res) => {
        if (err) resp.status(500).json(err)
        const products = res;
        products.length > 0 ? resp.status(200).json(products) : resp.status(400).json({message: `Product with ID'${productID}' does not exist`})
    })
});



// POST new Product         /products/
router.post("/", (req, resp) => {
    const formData = req.body;
    // to create a single new product
    if (formData.length <= 1) {
        connection.query('INSERT INTO product set ?', [formData], (err, res) => {
            if (err) resp.status(500).json(err)
            const newProductId = res.insertId
            connection.query("SELECT * FROM product WHERE id = ?", newProductId, (err, res) => {
                if (err) resp.status(500).json(err)
                const newProduct = res
                resp.status(200).send(newProduct)
            })
        })
    }
    // in case multiple new products should be created
    if (formData.length > 1) {
        formData.forEach(item => {
            connection.query('INSERT INTO product set ?', [item], (err, res) => {
                if (err) resp.status(500).json(err)
                const newProductId = res.insertId
                connection.query("SELECT * FROM product WHERE id = ?", newProductId, (err, res) => {
                    if (err) resp.status(500).json(err)
                })
            })
        });
        resp.status(200).json({
            message: `${formData.length} products has been added to the database`
        })
    }
})



// UPDATE Product by ID     /products/:id
router.put("/:id", (req, resp) => {
    const productID = req.params.id;
    const formData = req.body;

    connection.query("UPDATE product SET ? WHERE ?", [formData, productID], (err, res) => {
        if (err) resp.status(500).json(err)

        connection.query("SELECT * FROM product WHERE id = ?", productID, (err, res) => {
            if (err) resp.status(500).json(err)
            const updatedProduct = res;
            resp.status(200).json(updatedProduct)
        })
    })


})




// DELETE Product by ID     /products/del-req/:id
router.delete('/del-req/:id', (req, resp) => {
    const productId = req.params.id
    connection.query('DELETE FROM product WHERE ID = ?', productId, (err, res) => {
        if (err) resp.status(500).json(err)
        res.affectedRows > 0 ?
            resp.status(200).json({
                message: "The product was successfully deleted",
            })
            :
            resp.status(400).json({
                message: "The product was not found in the database",
            })
    })

})



// DELETE all Products      /products/deleteall
router.delete("/deleteall", (req, resp) => {
    const ensurance = req.query.reallydeleteall
    // ensurance is only a extra security step, which needs a boolean as query params to check if it is 100% on purpose!
    // URL Must then be "localhost:5000/products/deleteall?reallydeleteall=true"
    if (ensurance === "true") {
        connection.query("DELETE FROM product WHERE id <> 99999", (err, res) => {
            if (err) resp.status(500).json(err)
            connection.query("ALTER TABLE product AUTO_INCREMENT = 1")
            res.affectedRows > 0 
            ?
            resp.status(200).json({
                message: "all Products got deleted"
            })
            :
            resp.status(500).json({
                message: "empty database - no products to delete"
            })
        })       
    }
    else {
        resp.status(400).json({
            message: "looks like you are not 100% that you want to do delete them all ;)"
        })
    }
})


module.exports = router;