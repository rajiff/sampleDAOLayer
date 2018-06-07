const groupsDAO = require('./modules/groups/');
const notesDAO = require('./modules/notes');
const initializeMongooseConnection = require('./connection').createMongoConnection;

module.exports = {
	groupsDAO,
	notesDAO,
	initializeMongooseConnection
}
