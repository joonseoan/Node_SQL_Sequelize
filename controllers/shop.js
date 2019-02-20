const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {

    Product.findAll()
        .then(products => {
            res.render('shop/productList', { 
                products, 
                docTitle: 'All Products', 
                path: '/products'
            });
        })
        .catch(e => {
            console.log(e);
        })

    // Product.fetchAll()
    //     .then(([products, meta]) => {

    //         res.render('shop/productList', { 
    //             products, 
    //             docTitle: 'All Products', 
    //             path: '/products'
    //          });

    //     })
    //     .catch(err => { console.log('cannot get fetch all')});

        
}

exports.getProduct = (req, res, next) => {
    
    // id must be identified with router.get('/products/:id')
    const id = req.params.id;

    // 'Product' is defined because we need to find a document out of all documents in a collection.
    
    // with sequelize
    // 2) id : id => first one is from column name wd defined
    //      the second one is form the variable above
    // Product.findAll({ where: {id}})
    //     .then(products => {
    //         // products : [{ id, title, price, imageUrl, description }]
    //         // console.log('products:  %%%%%%%%%%%%%%%%%%5', products)
            
    //         // no array here other than the one used by mysql2
    //         res.render('shop/productDetail', {
    //             product: products[0],
    //             docTitle: products[0].title,
    //             path: '/products'
    //         });
    //     })
    //     .catch(e => { console.log(e)});

    // 1) But it is simpler than the one above.
    Product.findByPk(id)
        .then(product => {
            // no array here other than the one used by mysql2
            res.render('shop/productDetail', {
                product,
                docTitle: product.title,
                path: '/products'
            });
        })
        .catch(e => { console.log(e)});

    // -----------------------------------------------------
    // only with mysql2
    // Product.findProductById(id)
    //     .then(([product]) => {
    //         console.log(product, 'products in [product]')
    //         res.render('shop/productDetail', {
    //             // 'product' is still an array.
    //             // We need to extract an element.
    //             product: product[0],
    //             docTitle: product.title,
    //             path: '/products'
    //          });
    //     })
    //     .catch(err => {console.log(err)});

}

exports.getIndex = (req, res, next) => {

    // [ SELECT * FROM Table ]
    // Also, we can set up 'WHERE' in findAll({where: ?})
    // Without {where: ?}, it feches all data.

    Product.findAll()
        .then((products) => {
            // products [ {id, title, price, imageUrl, description}, {id, title, price, imageUrl, description}]
            console.log(products);
            res.render('shop/index', { 
                products,
                docTitle: 'Shop', 
                path: '/'
            });        
        })
        .catch(e => console.log(e));

    // Only with mysql2
    // Product.fetchAll().then(([products, meta ]) => {

    //     console.log(products)
    //     res.render('shop/index', { 
    //         products, 
    //         docTitle: 'Shop', 
    //         path: '/'
    //      });
    // }).catch(err => {
    //     console.log(err);
    // });

 }

exports.getCart = (req, res, next) => {

    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for(product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if(cartProductData) {
                    console.log('cartProductData: ', cartProductData)
                    cartProducts.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });
        });

    });

}

exports.postCart = (req, res, next) => {

    const id = req.body.id;

    Product.findProductById(id, product =>{
        // console.log('product@findProdut : ', product);
        Cart.addProduct(product.id, product.price);
    });

    // It should be run in Promise
    res.redirect('/cart');

}

exports.getOrders = (req, res, next) => {

    res.render('shop/orders', {
        docTitle: 'Your Orders',
        path: '/orders'
    });

}

exports.postCartDeleteItem = ( req, res, next) => {
    const { id }= req.body;

    Product.findProductById(id, product => {
        console.log('deleteCartPRODUCT ITEM: ', product)
        Cart.deleteProduct(id, product.price);
        res.redirect('/cart');
    });

}

exports.getCheckout = (req, res, next) => {

    res.render('shop/checkout', {
        docTitle: 'Checkout',
        path: '/checkout'
    });

}