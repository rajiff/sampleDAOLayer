const express = require('express');
const app = express();
const db = require('./connection');
// import modules which you required


// write middlewares here those will be executed before processing any request
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//creating db connection with mongo
db.createMongoConnection();
const dbConnection = db.getMongoConnection();
dbConnection.on('error', db.onError);
dbConnection.once('open', db.onSuccess);


app.use((req, res)=>{
  res.sendStatus(404);
});


module.exports = app;