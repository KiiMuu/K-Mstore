const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const MONGO_URI = 'mongodb://localhost/kim-store';

const app = express();
const store = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// const sequelize = require('./util/database');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');
const Order = require('./models/order');

// get routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// get controllers
const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(flash());

// use some local variables via entire app
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        if (!user) {
            return next();
        }
        req.user = user;
        res.locals.cartItems = user.cart.items; // global variable
        next();
    }).catch(err => {
        next(new Error(err));
    });
});

// set template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// use routes
app.post('/create-order', isAuth, shopController.postOrder);
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// server error page
app.get('/500', errorController.get500);
// not found page
app.use(errorController.get404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('500', {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
});

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