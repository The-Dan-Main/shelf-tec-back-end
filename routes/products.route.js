const express = require('express');
const router = express.Router();
const connection = require('../config');

// Products

// GET ALL Products         /products
router.get('/', (req, resp) => {
  connection.query('SELECT * FROM product', (err, results) => {
    if (err) resp.status(500).json(err);

    const products = results;
    resp.status(200).json(products);
  });
});

// GET Product by ID        /products/:id
router.get('/:id', (req, resp) => {
  const productID = req.params.id;
  connection.query('SELECT * FROM product WHERE id = ?', productID, (err, res) => {
    if (err) resp.status(500).json(err);
    const products = res;
    products.length > 0
      ? resp.status(200).json(products)
      : resp.status(400).json({ message: `Product with ID'${productID}' does not exist` });
  });
});

// POST new Product(s)         /products/
router.post('/', (req, resp) => {
  const formData = req.body;
  // to create a single new product
  if (formData.length <= 1) {
    connection.query('INSERT INTO product set ?', [formData], (err, res) => {
      if (err) resp.status(500).json(err);
      const newProductId = res.insertId;
      connection.query('SELECT * FROM product WHERE id = ?', newProductId, (err, res) => {
        if (err) resp.status(500).json(err);
        const newProduct = res;
        resp.status(200).send(newProduct);
      });
    });
  }
  // in case multiple new products should be created
  if (formData.length > 1) {
    formData.forEach((item) => {
      connection.query('INSERT INTO product set ?', [item], (err, res) => {
        if (err) resp.status(500).json(err);
        const newProductId = res.insertId;
        connection.query('SELECT * FROM product WHERE id = ?', newProductId, (err, res) => {
          if (err) resp.status(500).json(err);
        });
      });
    });
    resp.status(200).json({
      message: `${formData.length} products has been added to the database`
    });
  }
});

// UPDATE Product by ID     /products/:id
router.put('/:id', (req, resp) => {
  const productID = req.params.id;
  const formData = req.body;

  connection.query('UPDATE product SET ? WHERE id =?', [formData, productID], (err, res) => {
    if (err) resp.status(500).json(err);

    connection.query('SELECT * FROM product WHERE id = ?', productID, (err, res) => {
      if (err) resp.status(500).json(err);
      const updatedProduct = res;
      resp.status(200).json(updatedProduct);
    });
  });
});

// DELETE Product by ID     /products/del-req/:id
router.delete('/del-req/:id', (req, resp) => {
  const productId = req.params.id;
  connection.query('DELETE FROM product WHERE ID = ?', productId, (err, res) => {
    if (err) resp.status(500).json(err);
    res.affectedRows > 0
      ? resp.status(200).json({
          message: 'The product was successfully deleted'
        })
      : resp.status(400).json({
          message: 'The product was not found in the database'
        });
  });
});

module.exports = router;
