const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// const sequelize = require('./util/database');
// const mongoConnect = require('./util/database').mongoConnect;


// get routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// get controllers
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'img')));


// set template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use((req, res, next) => {
    next();
});

// use routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 page
app.use(errorController.get404);

// sequelize db connection
// sequelize.sync().then(result => {
//     console.log(result);
// }).catch(err => {
//     console.log(err);
// });

// mongoConnect(() => {
//     // listen to port
//     const PORT = process.env.PORT || 8080;
//     app.listen(PORT, () => {
//         console.log(`App is up on port ${PORT}`);
//     });
// });

mongoose.connect('mongodb://localhost/kim-store').then(result => {
    // listen to port
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`App is up on port ${PORT}`);
    });
}).catch(err => {
    console.log(err);
});

