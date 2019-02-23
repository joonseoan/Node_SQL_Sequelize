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

    console.log('id:========================================> ', id);

    // 2) With Assoication
    // It is logically more clear because it is from the user who is using the associated table 
    //      by using 'join'
    //  Looking for product's id to render current exsiting product information.
    // It returns info in an array.
    // ex) SELECT * FROM product whiere id = 1;
    req.user.getProducts({ where: { id } })
    
    // 1) Without Associations
    // It works but it is not clear where the qurry is from the admin or the user
    // Product.findByPk(id)

        // here product itself is an instance of Product !!!***************
        .then(product => {

            // const product = products[0];
            
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
    
    // It is not required to change because as we render getEditProduct 
    // with req.user, we can assume that this product belongs to the current req.user.
    
    // We do not need to use req.'user.getProducts()' here
    //  because it is from 'getEditProduct' above which is 
    //  arleady signed in.
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

    // Only with the json file.
    // const updatedProduct = new Product(id, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice);

    // updatedProduct.save();

    // res.redirect('/admin/products');
    
}

// to get all data and render data to /admin/products and then to /admin/products ejs file
exports.getProducts = (req, res, next) => {

    // With Associations
    // Just need to get user's products, not all users' products
    // 2)
    req.user.getProducts()
        .then(products => {

            res.render('admin/products', {
                products,
                docTitle: 'Admin Products',
                path: '/admin/products'
            });

        })
        .catch(e => { console.log(e)});

    // // With sequelize
    // 1)
    // Product.findAll()
    //     .then(products => {
    //         res.render('admin/products', {
    //             products,
    //             docTitle: 'Admin Products',
    //             path: '/admin/products'
    //         });
    //     })
    //     .catch(e => { console.log(e)});

    // With the json file
    // Product.fetchAll(products => {

    //     res.render('admin/products', { 
    //         products, 
    //         docTitle: 'Admin Products', 
    //         path: '/admin/products'
      
    //     });

    // });

}

// to INSERT 'user input data' to the database
exports.postAddProducts = (req, res, next) => {
    
    const {title, imageUrl, description, price } = req.body;
    
    // with sequelize
    // [INSERT]
    // create: immediately create element data(value) 
    //      and automaticallY save the value in the table.
    // build: (in javascript code) create element data(value)
    //      and required to manually save the value with another code.

    // 3) More Elegant way : Product.create() => createProduct({})
    //  because when we create the schema in model, define(product)
    //      creates a function with a name like 'createProduct()' in 'Product class'!!!
    //      and then define a parameter(/ an object) like the ones below.

    // Then, the class is instantiated with the child class with the instance
    //   that is from User to access to the parent class's method.
    // By the way, it uses promise() to return the result.
    // The function name is strict!!!!

    // if user is an instance itself, we can use user.createProduct()
    // user.hasMany(Product) => user.set/get/create({})
    req.user.createProduct({

        title,
        price,
        imageUrl,
        description
    
    })
    .then(() => {
        res.redirect('/');
    })
    .catch(err => {
        console.log(err);
    });

    // 2) With association
    // Product.create({
    //     title,
    //     price,
    //     imageUrl,
    //     description,
    //     // must be same name as in database *****
    //     // the name(alias?) is automatically populated ****
    //     //   when the primary key names are same????
    //     userId : req.user.id
    // })
    // .then(result => {
    //     console.log(result);
    //     res.redirect('/admin/products');
    // })
    // .catch(e => {console.log(e)});

    // 1) Without association
    // query is structured by Promise()
    // Product.create({
    //     title,
    //     price,
    //     imageUrl,
    //     description
    // })
    // .then(result => {
    //     console.log(result);
    //     res.redirect('/admin/products');
    // })
    // .catch(e => {console.log(e)});

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
    // It works but in the business logic point of view,
    
    //  it is more clear to use req.user.getProducts.
    req.user.getProducts({ where: { id }})
    // Product.findByPk(id)
        .then(products => {
            const product = products[0];
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