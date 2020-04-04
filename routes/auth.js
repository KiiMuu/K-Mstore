const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignUp);
router.post(
    '/login',
    [
        body('email')
        .isEmail()
        .withMessage('Invalid email')
        .normalizeEmail(),
        body('password', 'Wrong password')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ], 
    authController.postLogin
);
router.post(
    '/signup',
    [
        check('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .custom((value, {req}) => {
            // if (value === 'test@test.com') {
            //     throw new Error('This email is rejected');
            // }
            // return true;
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already exists!');
                }
            });
        })
        .normalizeEmail(),
        body('password', 'Password required at least 5 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
        body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to Match!');
            }
            return true;
        })
    ],
    authController.postSignUp
);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);



module.exports = router;