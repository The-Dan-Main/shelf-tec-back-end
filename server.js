const express = require('express');
const cors = require('cors');
const app = express();
const connection = require('./config');

const authRouter = require('./routes/auth.route');
const cartRouter = require('./routes/cart.route');
const ordersRouter = require('./routes/orders.route');
const productsRouter = require('./routes/products.route');
const usersRouter = require('./routes/user.route');
const emailRouter = require('./routes/email.route');

// creating Connection to MYSQL and Start App
connection.connect((err) => {
  if (err) throw err;
  console.log('Successfully connected to the database');
});
app.use(express.json());

//Allow CORS and Access-Control-Allow Origin
app.use(cors({ origin: '*' }));
app.use(function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);
app.use('/email', emailRouter);

// Port and Listener
const port = 3031;
app.listen(process.env.PORT || port, (err) => {
  if (err) throw err;
  console.log(`App is listening at ${port}`);
});
