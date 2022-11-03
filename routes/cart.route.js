const express = require("express");
const router = express.Router();
const connection = require("../config")

// CartProducts
////////////////////////////////////////////////////////////////////////////////

// GET Products from Cart         /cart/:cart_id/products
router.get('/:cart_id/products', (req, resp) => {
    const { cart_id } = req.params;

    connection.query(`
    SELECT *, Cart_product.id as Cart_Product_id 
    FROM Cart 
    JOIN Cart_Product ON Cart_Product.cart_id = Cart.id
    JOIN Product ON Cart_Product.product_id = Product.id 
    WHERE Cart.id = ?`
        , [cart_id], (err, res) => {
            if (err) resp.status(500).json(err);
            resp.status(200).json(res)
        })
});



// POST product to cart         /cart/:cart_id/products/:product_id
router.post('/:cart_id/products/:product_id', (req, resp) => {
    const { cart_id, product_id } = req.params;

    connection.query('INSERT INTO Cart_Product (product_id, cart_id) VALUES (?,?)', [product_id, cart_id], (err, res) => {
        if (err) resp.status(500).json(err);

        const newCartProductId = res.insertId;
        connection.query(`
            SELECT *, Cart_Product.id as cart_product_id 
            From Product 
            JOIN Cart_Product ON Cart_Product.product_id = Product.id 
            WHERE Cart_Product.id = ?`,
            [newCartProductId],
            (err, res) => {
                if (err) {
                    resp.status(500).json(err);
                } else {
                    resp.status(200).json(res);
                }
            }
        )
    })
});



// DELETE Product from Cart     /cart/:cart_id/products/:product_id
router.delete("/:cart_id/products/:product_id", (req, resp) => {
    const { cart_id, product_id } = req.params
    connection.query(`DELETE FROM cart_product WHERE product_id = ? AND cart_id = ?`,
        [product_id, cart_id], (err, res) => {
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



// UPDATE Quantity by ID         /cart/:cart_id/products/:product_id
router.put("/:cart_id/products/:product_id", (req, resp) => {
    const { cart_id, product_id } = req.params
    const quantity = req.query.quantity;
    connection.query(`
    UPDATE cart_product 
    SET quantity = ?
    WHERE product_id = ? AND cart_id = ?`,
        [quantity, product_id, cart_id], (err, res) => {
            if (err) resp.status(500).json(err)
            console.log(resp)
            res.affectedRows > 0 ?
                resp.status(200).json({
                    message: "The product was successfully updated",
                    new_quantity: `the new quantity for ID:'${product_id} is now ${quantity}'`
                })
                :
                resp.status(400).json({
                    message: "The product was not found in the database",
                })
        })
})



module.exports = router;