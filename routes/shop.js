const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();
const isAuthenticated = require('../middleware/is-LoggedIn')

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);
router.get('/product/:productId', isAuthenticated, shopController.getProductById);
// router.post('/create-order', isAuthenticated, shopController.postOrder)

router.get('/cart', isAuthenticated, shopController.getCart);
router.post('/cart', isAuthenticated, shopController.postCart);
router.post('/cart/removeItem', isAuthenticated, shopController.removeItem);

router.get('/orders', shopController.getOrders);

router.get('/order/:orderId', isAuthenticated, shopController.getInvoice)

router.post('/checkout', isAuthenticated, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess)
router.get('/checkout/cancel', shopController.getCheckout)

module.exports = router;
