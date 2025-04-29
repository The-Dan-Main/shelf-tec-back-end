const express = require('express');
const router = express.Router();
const connection = require('../config');

// CartProducts

// GET Products from cart         /cart/:cart_id/products
router.get('/:cart_id/products', (req, resp) => {
  const { cart_id } = req.params;
  connection.query(
    `
    SELECT *, cart_product.id as cart_product_id 
    FROM cart 
    JOIN cart_product ON cart_product.cart_id = cart.id
    JOIN product ON cart_product.product_id = product.id 
    WHERE cart.id = ?`,
    [cart_id],
    (err, res) => {
      if (err) resp.status(500).json(err);
      resp.status(200).json(res);
    }
  );
});

// POST product to cart         /cart/:cart_id/products/:product_id
router.post('/:cart_id/products/:product_id', (req, resp) => {
  const { cart_id, product_id } = req.params;
  connection.query(
    `
    INSERT INTO cart_product 
    (product_id, cart_id) 
    VALUES (?,?)`,
    [product_id, cart_id],
    (err, res) => {
      if (err) resp.status(500).json(err);
      connection.query(
        `
            SELECT *, cart_product.id as cart_product_id 
            FROM cart 
            JOIN cart_product ON cart_product.cart_id = cart.id
            JOIN product ON cart_product.product_id = product.id 
            WHERE cart.id = ?`,
        [cart_id],
        (err, res) => {
          if (err) resp.status(500).json(err);
          resp.status(200).json(res);
        }
      );
    }
  );
});

// DELETE product from cart     /cart/:cart_id/products/:product_id
router.delete('/:cart_id/products/:product_id', (req, resp) => {
  const { cart_id, product_id } = req.params;
  connection.query(
    `
    DELETE FROM cart_product 
    WHERE product_id = ? 
    AND cart_id = ?`,
    [product_id, cart_id],
    (err, res) => {
      if (err) resp.status(500).json(err);
      connection.query(
        `
            SELECT *, cart_product.id as cart_product 
            FROM cart 
            JOIN cart_product ON cart_product.cart_id = cart.id
            JOIN product ON cart_product.product_id = product.id 
            WHERE cart.id = ?`,
        [cart_id],
        (err, res) => {
          if (err) resp.status(500).json(err);
          resp.status(200).json(res);
        }
      );
    }
  );
});

// UPDATE Quantity by ID         /cart/:cart_id/products/:product_id/:quantity
router.put('/:cart_id/products/:product_id/:quantity', (req, resp) => {
  const { cart_id, product_id, quantity } = req.params;
  connection.query(
    `
    UPDATE cart_product 
    SET quantity = ?
    WHERE product_id = ? AND cart_id = ?`,
    [quantity, product_id, cart_id],
    (err, res) => {
      if (err) resp.status(500).json(err);
      connection.query(
        `
            SELECT *, cart_product.id as cart_product_id 
            FROM cart 
            JOIN cart_product ON cart_product.cart_id = cart.id
            JOIN product ON cart_product.product_id = product.id 
            WHERE cart.id = ?`,
        [cart_id],
        (err, res) => {
          if (err) resp.status(500).json(err);
          resp.status(200).json(res);
        }
      );
    }
  );
});

module.exports = router;
