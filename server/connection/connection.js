/* eslint no-console: 0 */

let mongoose = require('mongoose');

// create mongo connection
function createMongoConnection() {
  mongoose.connect( (process.env.MONGO_URL || 'mongodb://localhost:27017/notesDB') );
  // mongoose.set('debug', true);
}

// get mongo connection object
function getMongoConnection() {
  return mongoose.connection;
}

// Event listener for mongo "error" event.
function onError(err) {
 console.log('Error in database connection...', err);
}

//Event listener for mongo "open" event
function onSuccess() {
 console.log('Connected to mongo database');
}

module.exports = {
  createMongoConnection,
  getMongoConnection,
  onError,
  onSuccess
} 