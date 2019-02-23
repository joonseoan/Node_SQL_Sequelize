const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.set('view engine', 'ejs');
// app.set('views', 'views');

// connection are up! ******************************************************8
const sequelize = require('./utils/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItems = require('./models/cart_items');

const adminRouters = require('./routes/admin');
const shopRouters = require('./routes/shop'); 
const { pageNotFound } = require('./controllers/pageNotFound');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

// Eventually to gain req.user (logged in user) data 
//  we need to make dummy data in database
// Whenever the client requests something even regardless of routers
//  the current existing user in the database
//  is going to be assgined to req.user.
// Must be ahead of routers
//  because it should be triggered and pulled out any time the user request exists.
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            if(user) req.user = user;
            next();
        })
        .catch(e => { console.log(e) });
});

// routers
app.use('/admin', adminRouters);
app.use(shopRouters);
app.use(pageNotFound);

// [Association]
// Before all the models are up, we need to define associations
// 'onDelete: 'CASCADE'': 
//      If the USER deletes, products will be gone, as well.
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
        User.hasMany(Product);

// ]

// [
        // [One to One Association ] : rule of thumb here, Cart table has the User reference.

        // A cart has only one User        
        Cart.belongsTo(User);
    
        // A user has only one Cart.
        User.hasOne(Cart);

// ]

// [
        // [ Many to Many Association ]
        // A foreign key pair is a primary key.
        // ************IMPORTANT
        // In many to many relation, the either of tables can't take the reference.
        // because each table belongs to the counter partner.
        // In this many to many relation, the third (virtual) table reference
        //  must be create.

        // A Cart has many Products
        // the third (virtual) table here created by using CartItems model.
        Cart.belongsToMany(Product, { through: CartItems });

        // A product has many Cart???
        // Many customers reserve a product.
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

    // Eventually to gain req.user data we need to make dummy data in database
    // Whenever the server tries to connect to database
    //  and to make the tables are available (up!)
    // The table will create the first new user data automatically. 
    // By the way squelelize.sync() is always invokced and run ahead of 
    //  app.use({ req.user = user}) up and above because it has app.listen()
    .then((result) => {
                
        // finally after all models (tables) are created
        //      of course, and all the apps (express) correctly are up as weel
        //  listen to requests form the client.

        return User.findByPk(1);

    })
    .then(user => {
        
        if(!user) return User.create({name: 'Max', email: 'test@test.com' });
        return user;

    }).then(user => {

        if(user) {

            // cart does not a specific attributes except for id
            //  which is not necessary the user type.
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