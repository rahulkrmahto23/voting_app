const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;
const  {jwtAuthMiddleware} = require("./jwt");
// Import the router files
const userRoutes = require('./routes/userRoutes');
// Use the routers
app.use('/user', userRoutes);

app.listen(PORT,function(){
    console.log("the server is running..")
})