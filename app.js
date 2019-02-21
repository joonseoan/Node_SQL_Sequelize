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

const adminRouters = require('./routes/admin');
const shopRouters = require('./routes/shop'); 
const { pageNotFound } = require('./controllers/pageNotFound');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

// Eventually to gain req.user (logged in user) data 
//  we need to make dummy data in database
// Whenever the client requests something even regardless of routers
//  the current existing user is going to be assgined to req.user
// Must be ahead of routers
//  because it should be triggered any time user request exists.
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
// Before all the models are up
// we need to define associations
// If the USER deletes, products will be gone, as well.
/*  
    ASSOCIATION is set in console.log()
    userId` INTEGER, PRIMARY KEY (`id`), FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB; */
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE'});
// optional but it should be explicitly defined.
User.hasMany(Product);



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
            app.listen(3000, () => {

                console.log('Port: 3000')
            
            });
        }
    })
    .catch(e => {
        console.log(e);
    });