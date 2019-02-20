const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {

    res.render('admin/editProducts', {
        docTitle: 'Add Products',
        path: '/admin/addProducts',
        editing: false
      
    });

}

exports.getEditProduct = (req, res, next) => {

    console.log('req.query: ', req.query); // => req.query:  { edit: 'true', new: 'title' }

    const editMode = req.query.edit;

    if(!editMode) return res.redirect('/');

    const id = req.params.id;

    Product.findByPk(id)

        // here product itself is an instance of Product !!!***************
        .then(product => {
            
            if(!product) res.redirect('/');
            
            res.render('admin/editProducts', {
                product,
                docTitle: 'Edit Product',
                path: '/admin/editProducts',
                // to differentiate getAddProduct
                editing: editMode
            });

        })

    // With a json file
    // Product.findProductById(id, product => {

    //     if(!product) res.redirect('/');

    //     res.render('admin/editProducts', {
    //         docTitle: 'Edit Product',
    //         path: '/admin/editProducts',
    //         // to differentiate getAddProduct
    //         editing: editMode,
    //         product
    //     });
        
    // });

}

// --------------------------------------------------------------------------------------------------------

exports.postEditProduct = (req, res, next) => {

    const { id, title, imageUrl, description, price  } = req.body;
    if(!id || !title || !imageUrl || !description || !price) throw new Error('Invalid Input');
    // const updatedTitle = title;
    // const updatedImageUrl = imageUrl;
    // const updatedDescription = description;
    // const updatedPrice = price;
    
    // It is like findOne that returns instance.
    //  which is same as mongoose.
    Product.findByPk(id)
        .then(product => {
            // const { id, title, price, imageUrl, description } = product;
            product.id = id;
            product.title = title;
            product.price = price;
            product.imageUrl = imageUrl;
            product.description = description; 

            // here 'product' is an instance of Product.
            return product.save();
        }).then(() => {
            console.log('Successfully Updated!');
            res.redirect('/admin/products');
        }).catch(e => {console.log(e)});

    // const updatedProduct = new Product(id, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice);

    // updatedProduct.save();

    // res.redirect('/admin/products');
    
}

// to get all data and render data to /admin/products and then to /admin/products ejs file
exports.getProducts = (req, res, next) => {

    // With sequelize

    Product.findAll()
        .then(products => {
            res.render('admin/products', {
                products,
                docTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(e => { console.log(e)});

    // With the json file
    // Product.fetchAll(products => {

    //     res.render('admin/products', { 
    //         products, 
    //         docTitle: 'Admin Products', 
    //         path: '/admin/products'
      
    //     });

    // });

}

// to transfer 'user input data' to the database
exports.postAddProducts = (req, res, next) => {
    
    const {title, imageUrl, description, price } = req.body;
    
    // with sequelize
    // [INSERT]
    // create: immediately create element data(value) 
    //      and automaticall save the value in the table.
    // build: (in javascript code) create element data(value)
    //      and manually save the value with another cod.

    // query is structured by Promise()
    Product.create({
        title,
        price,
        imageUrl,
        description
    })
    .then(result => {
        console.log(result);
        res.redirect('/admin/products');
    })
    .catch(e => {console.log(e)});

    // only with mysql2 
    // 'product' for a particular document, not for all ducuments in a collectionn. 
    // const product = new Product(null, title, imageUrl, description, price);
    
    // // save =>  insert
    // product
    //     .save()
    //     .then(() => {
    //         res.redirect('/');
    //     })
    //     .catch(err => {console.log(err)});

}

exports.deleteProduct = (req, res, next) => {
    const { id } = req.body;

    // With sequelize: destroy() 
    Product.findByPk(id)
        .then(product => {
            return product.destroy();
        })
        .then(product => {
            res.redirect('/admin/products');
            console.log(`Delete ${product.title} out of the database`);
        })
        .catch(e => { console.log(e)});

    // Only with a json file
    // Product.deleteById(id);

}