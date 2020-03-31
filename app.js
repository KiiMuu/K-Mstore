const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const db = require('./util/database');


// get routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db connection
db.execute('SELECT * FROM products');

// get controllers
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'img')));


// set template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// use routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 page
app.use(errorController.get404);

// listen to port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App is up on port ${PORT}`);
});