process.env = require('./.env.js')(process.env.NODE_ENV || 'development');
const port = process.env.PORT || 9000;
const connectDB = require('./config/db');
require('colors');
const express = require('express');
const body_parser = require('body-parser')


let whatsaapRoutes = require('./routes/whatsaapRoute.js');
let userRoutes = require('./routes/userRoute')

const bodyParser = require('body-parser');

const main = async () => {
    connectDB()
    const app = express()
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    app.use('/', whatsaapRoutes);
    app.use('/api/user',userRoutes)

    //app.use('*', (req, res) => res.status(404).send('404 Not Found'));
    app.listen(port, () =>
        console.log(`App now running and listening on port ${port.red}`)
    );
};
main();