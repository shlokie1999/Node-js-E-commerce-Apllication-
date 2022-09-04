const path = require('path');
const {check,body} = require('express-validator')

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const isAuthenticated = require('../middleware/is-LoggedIn')

// /admin/add-product => GET
router.get('/add-product',isAuthenticated, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',body('title').isLength({min:3}).withMessage(`title length must be at least 3 `),body('price').isLength({min:1}).withMessage(`price length must be at least 1$`),body('description').isLength({min:6}).withMessage(`description length must be at least 6`),isAuthenticated, adminController.postAddProduct);
router.post('/delete-product',isAuthenticated,adminController.deleteProduct);
router.post('/edit-product',isAuthenticated,adminController.editProduct)
router.post('/update-product',body('title').isLength({min:3}).withMessage(`title length must be at least 3 `),body('price').isLength({min:1}).withMessage(`price length must be at least 1$`),body('description').isLength({min:6}).withMessage(`description length must be at least 6`),isAuthenticated,adminController.updateProduct);

module.exports = router;
