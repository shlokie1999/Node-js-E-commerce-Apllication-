const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const isAuthenticated = require('../middleware/is-LoggedIn')

// /admin/add-product => GET
router.get('/add-product',isAuthenticated, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',isAuthenticated, adminController.postAddProduct);
router.post('/delete-product',isAuthenticated,adminController.deleteProduct);
router.post('/edit-product',isAuthenticated,adminController.editProduct)
router.post('/update-product',isAuthenticated,adminController.updateProduct);

module.exports = router;
