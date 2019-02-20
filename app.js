const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.set('view engine', 'ejs');
// app.set('views', 'views');

// connection are up! ******************************************************8
const sequelize = require('./utils/database');

const adminRouters = require('./routes/admin');
const shopRouters = require('./routes/shop'); 
const { pageNotFound } = require('./controllers/pageNotFound');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouters);
app.use(shopRouters);

app.use(pageNotFound);

// All the models up ************************************************************* 
//  and create their tables (if the tables do not exist) and relations; 
sequelize.sync()
    .then((result) => {
                
        // finally after all models (tables) are created
        //      of course, and all the apps (express) correctly are up as weel
        //  listen to requests form the client.
        app.listen(3000, () => {

            console.log('Port: 3000')
        
        });

    })
    .catch(e => {
        console.log(e);
    });