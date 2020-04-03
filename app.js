const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const MONGO_URI = 'mongodb://localhost/kim-store';

const app = express();
const store = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

// const sequelize = require('./util/database');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

// get routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// get controllers
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'img')));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
});

// use some local variables via entire app
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// set template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// use routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// 404 page
app.use(errorController.get404);

mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(result => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`App is up on port ${PORT}`);
    });
}).catch(err => {
    console.log(err);
});



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