const express = require('express');
const router = express.Router();

const { 
    getProducts, 
    getIndex, 
    getCart,
    postCart, 
    getCheckout, 
    getOrders, 
    getProduct,
    postCartDeleteItem } = require('../controllers/shop');

// index page with all product list
router.get('/', getIndex);

// product list page with product details
router.get('/products', getProducts);

router.get('/products/:id', getProduct);

// to have all items in cart
router.get('/cart', getCart);

// to add a product to '/cart'
router.post('/cart', postCart);

// to delete a product only in '/shop/cart'
router.post('/cartDeleteItem', postCartDeleteItem);

router.get('/orders', getOrders);
router.get('/checkout', getCheckout);

module.exports = router;