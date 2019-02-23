const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// connection are up! *****************************************************************
const sequelize = require('./utils/database');

// must run the models before 'sequelize.sync()' donw below. ********************
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItems = require('./models/cart_items');

const adminRouters = require('./routes/admin');
const shopRouters = require('./routes/shop'); 
const { pageNotFound } = require('./controllers/pageNotFound');

app.set('view engine', 'ejs');
// app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

// the path that html can access
app.use(express.static(path.join(__dirname, 'public')));

// Eventually to gain req.user (logged in user) data/value 
// Whenever the client requests something even regardless of routes
//  the current existing user can be found in req.user (logge in).
// Must be ahead of routers
//  because it should be triggered and pulled out any time the user request exists.
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            if(user) req.user = user;
            next();
        })
        .catch(e => { throw new Error('Unable to find the user.') });
});

// routers
app.use('/admin', adminRouters);
app.use(shopRouters);
app.use(pageNotFound);

// [Association]
// Before all the models are up by 'sequelize.sync()', we need to define associations
// 'onDelete: 'CASCADE' (Option): If the USER deletes, products will be gone, as well.

/*  
    ASSOCIATION is set in console window.
    userId` INTEGER, PRIMARY KEY (`id`), FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB; */

// [
        // [One to Many Associations]: Rule of thumb, Product table stores the joining reference.
        
        // One product has only one User.
        Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

        // (hasMany : one to many association)
        /* 

            hasMany is used in a One To Many relationship 
            while belongsToMany refers to a Many To Many relationship.
            They are both distinct relationship types and each require 
            a different database structure - thus they take different parameters.
        
        */
        // A user has many Products
        // automatically user.set/get/createProdutct()
        User.hasMany(Product);

// ]

// [
        // [One to One Association ] : rule of thumb here, Cart table has the User reference.

        // A cart has only one User        
        Cart.belongsTo(User);
    
        // A user has only one Cart.
        // protoType.user= set/get/createCart()
        User.hasOne(Cart);

// ]

// [
        // [ Many to Many Association ]
        // A foreign key pair is a primary key.
        // ************IMPORTANT
        // In a many-to-many relation, the either of tables can't take the reference (a foreign key).
        // because each table belongs to the counter partner.
        // In this many to many relation, the third (virtual) table reference
        //  must be create.

        // A Cart has many Products
        // the third (virtual) table here created by using CartItems model.
        // product.get/set/addCarts() and addCart()
        Cart.belongsToMany(Product, { through: CartItems });

        // A product has many Cart???
        // Many customers reserve a product.
        // cart.get/set/addProducts() and addProduct()
        Product.belongsToMany(Cart, { through: CartItems });

// ]


// All the models up ************************************************************* 
//  and create their tables (if the tables do not exist) and relations; 

// { force: true } : DO NOT USE IT ALWAYS BTW. It will delete the current existing table
// Optional in development: when we need to overrite the data into database.
// Actually, it drops the existing tables, then create the table again, and insert into data again. 
/* 
    Executing (default): DROP TABLE IF EXISTS `products`;
    Executing (default): DROP TABLE IF EXISTS `users`;
    Executing (default): DROP TABLE IF EXISTS `users`;
    Executing (default): CREATE TABLE IF NOT EXISTS `users` (`id` INTEGER NOT NULL auto_increment , `name` VARCHAR(255) NOT NULL, `email` VARCHAR(255) NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
    Executing (default): SHOW INDEX FROM `users`
    Executing (default): DROP TABLE IF EXISTS `products`;
    Executing (default): CREATE TABLE IF NOT EXISTS `products` (`id` INTEGER NOT NULL auto_increment , `title` VARCHAR(255) NOT NULL, `price` DOUBLE PRECISION NOT NULL, `imageUrl` VARCHAR(255) NOT NULL, `description` VARCHAR(255) NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `userId` INTEGER, PRIMARY KEY (`id`), FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;
    Executing (default): SHOW INDEX FROM `products`

*/

// 
// sequelize.sync({ force: true })
sequelize.sync()

    // Eventually to gain req.user data we need to make and store dummy data in database
    // Whenever the server tries to connect to database
    //  and to make the tables are available (up!)
    //  the table will create the first new user data automatically. 
    // By the way squelelize.sync() is always invoked and run ahead of 
    //  app.use({ req.user = user}) up and above because it has app.listen()
    .then(() => {
                
        // finally after all models (tables) are created
        //      of course, and all the apps (express) correctly are up as well
        //  listen to requests form the client.

        return User.findByPk(1);

    })
    .then(user => {
        
        if(!user) return User.create({name: 'Max', email: 'test@test.com' });
        return user;

    }).then(user => {

        if(user) {
            /* 
            
                    { id: 1,
                    name: 'Max',
                    email: 'test@test.com',
                    updatedAt: 2019-02-23T03:54:59.524Z,
                    createdAt: 2019-02-23T03:54:59.524Z },
            
            */
            // console.log(user)

            // cart does not a specific attributes except for id
            //  which is not necessary one the user specifies.
            
            // Insert Data into database with user pk
            // ----------------------------------------------------------------- Just create USER AND CART ASSOCIATION SO FAR, NOT PRODUCT!!!
            return user.createCart();

        }
    }).then(cart =>{

        if(cart) { 

            app.listen(3000, () => {
                console.log('Listening.');
            });

        }
    
    })
    .catch(e => {

        console.log(e);
        
    });