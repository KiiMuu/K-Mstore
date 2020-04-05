const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    service: 'SendGrid',
    auth: {
        api_key: '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'
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInputs: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg, // get the first error message
            oldInputs: {
                email,
                password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid email or password',
                oldInputs: {
                    email,
                    password
                },
                validationErrors: []
            });
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save((err) => {
                    console.log(err);
                    res.redirect('/');
                });
            }
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid email or password',
                oldInputs: {
                    email,
                    password
                },
                validationErrors: []
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        });
    }).catch(err => {
        const error =  new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup',
        errorMessage: message,
        oldInputs: {
            email: '',
            password: '', 
            confirmPassword: ''
        },
        validationErrors: []
    });
};

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            path: '/signup',
            errorMessage: errors.array()[0].msg, // get the first error message
            // keep user inputs in fields if errors exist
            oldInputs: {
                email,
                password, 
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
            email,
            password: hashedPassword,
            cart: {
                items: []
            }
        });
        return user.save();
    }).then(result => {
        res.redirect('/login');
        return transporter.sendMail({
            to: email,
            from: 'karimmuhamadfci@gmail.com',
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
        });
    }).catch(err => {
        const error =  new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex'); // token must be stored in db
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found!');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000; // one hour
            return user.save();
        }).then(result => {
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: 'karimmuhamadfci@gmail.com',
                subject: 'Password reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:8080/reset/${token}">link</a> to set a new password</p>
                `
            });
        }).catch(err => {
            const error =  new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    });
}


exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now()} }).then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-password', {
            pageTitle: 'New Password',
            path: '/new-password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    }).catch(err => {
        const error =  new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ 
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId 
    }).then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    }).then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login');
    }).catch(err => {
        const error =  new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}