const express = require('express');
const router = express.Router();
const connection = require('../config');

// Users

// GET User by ID                           /users/:user_id
router.get('/:user_id', (req, resp) => {
  const { user_id } = req.params;
  connection.query(
    `
    SELECT * FROM user
    WHERE user.id = ?`,
    [user_id],
    (err, res) => {
      if (err) resp.status(500).json(err);
      res.length > 0
        ? resp.status(200).json([...res])
        : resp.status(400).json({ message: `User with ID:'${user_id}' does not exists!'` });
    }
  );
});

// GET ALL Users                            /users/:user_id
router.get('/', (req, resp) => {
  console.log('GET ALL USERS');

  connection.query(
    `
    SELECT * FROM user`,
    (err, res) => {
      if (err) resp.status(500).json(err);
      resp.status(200).json(res);
    }
  );
});

// POST (Create user & cart simult.)        /users/
router.post('/', (req, resp) => {
  const formData = req.body;
  connection.query('INSERT INTO user SET ?', [formData], (err, res) => {
    if (err) resp.status(500).json(err);
    const newUserId = res.insertId;
    connection.query(`INSERT INTO cart (user_id) VALUES (?)`, [newUserId], (err, res) => {
      if (err) resp.status(500).json(err);
      resp
        .status(200)
        .send({ message: `The user and cart were successfully created with ID:'${newUserId}'` });
    });
  });
});

// DELETE User by ID                        /users/:user_id
router.delete('/:user_id', (req, resp) => {
  const { user_id } = req.params;
  connection.query(`DELETE FROM user WHERE ID = ?;`, [user_id], (err, res) => {
    if (err) resp.status(500).json(err);
    res.affectedRows > 0
      ? resp.status(200).json({
          message: 'The user was successfully deleted'
        })
      : resp.status(400).json({
          message: 'The user was not found in the database'
        });
  });
});

// UPDATE User by ID                        /users/:user_id
router.put('/:user_id', (req, resp) => {
  const { user_id } = req.params;
  const formData = req.body;
  connection.query(`UPDATE user SET ? WHERE id = ?`, [formData, user_id], (err, res) => {
    if (err) resp.status(500).json(err);
    res.affectedRows > 0
      ? resp.status(200).json({
          message: 'The user was successfully updated'
        })
      : resp.status(400).json({
          message: 'The user was not found in the database'
        });
  });
});

module.exports = router;
