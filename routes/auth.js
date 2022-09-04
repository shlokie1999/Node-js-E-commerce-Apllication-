const express = require('express');
const router = express.Router();
const {check,body} = require('express-validator')
const authController = require('../controllers/auth')


router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)
router.post('/logout', authController.postLogout)
router.get('/signup', authController.getSignup)
router.post('/signup',check('email').isEmail().withMessage('Invalid Email Address'),body('password').isLength({min:5}).withMessage(`password length must be at least 6 `),body('confirmPassword').custom((val,{req})=>{
    if(val != req.password){
    throw new Error('password does not match')
    }else{
    return true;
    }
}), authController.postSignup)
router.get('/reset',authController.getReset)
router.post('/reset',authController.postReset)
router.get('/reset/:token',authController.setNewPassword)
router.post('/new-password',authController.updatePassword)


module.exports = router