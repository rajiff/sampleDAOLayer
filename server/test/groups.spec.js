const async = require('async');
const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;

const COLLECTION_GROUPS = 'groups';
const groupsDAO = require('../modules').groupsDAO;
const mockGroupsObj = require('../mock_group_obj.json');
const initializeMongooseConnection = require('../modules').initializeMongooseConnection;

// All scenarios will be tested first against only one user
const USER_ID = 'SR_MEAN_USER';
const USER_ID_2 = 'SR_MEAN_USER_2';

let dbConnection = undefined;

function getCollectionCount(collnName, query, cb) {
	if (!dbConnection) return cb('no connection');

	dbConnection
		.collection(collnName)
		.count(query, {}, cb);
}

describe('DAO Layer Test Cases for Groups', function() {

	before(function(done) {
		initializeMongooseConnection();
		//This will need access to DB as well, hence create and initialize a local DB connection
		MongoClient.connect(process.env.MONGO_URL, (err, client) => {
			if (err) return done(err);

			dbConnection = client.db();
			// Don't we have to drop the collections ? lets assume they are fresh in TEST environment

			done();
		});
	});

	after(function(done) {
		// Free the reference so that connection is collected by GC
		dbConnection = undefined;
		done();
	})

	describe('DAO Method for createGroup(userId, groupObj, done)', function() {
		it('Add a valid mock group object for a user', function(done) {
			// 1. Check the count of the collection before insert
			// 2. Do the insert and make insert returns object with same keys as what was passed as input
			// 3. Check the count again and ensure it is incremented by one
			// 4. Get the last inserted object and check that is same what we inserted

			let userId = USER_ID;
			async.waterfall([
				getCollectionCount.bind(null, COLLECTION_GROUPS, {}), // check the count of the groups before adding a new one

				function(beforeCount, next){
					let groupObj = Object.assign({}, mockGroupsObj);

					groupsDAO.createGroup(userId, groupObj, (err, result) => {
						if (err) return next(err);

						expect(result).to.not.equal(undefined);
						expect(result).to.be.an('object');

						// This we are doing because if student is passing back mongoose returned object, which is not a pure POJO, hence we need to convert to string to get the actual POJO by parsing it back to JSON object
						let resultObj = JSON.parse(JSON.stringify(result));
						expect(Object.keys(resultObj)).to.include.members(Object.keys(mockGroupsObj));

						next(null, beforeCount, result);
					});
				},

				function(beforeCount, result, next) {
					// check the count of groups after adding new group
					getCollectionCount(COLLECTION_GROUPS, {}, (err, afterCount) => {
						expect((beforeCount + 1)).to.be.equal(afterCount);
						next(null, result);
					});
				},

				function(result, next) {
					// get the last inserted Group object and compare
					dbConnection
						.collection(COLLECTION_GROUPS)
						.find({}, { $sort: { $natural: -1 }})
						.limit(1)
						.toArray((err, lastGroup) => {
							if (err) return done(err);
							expect(lastGroup).to.not.equal(undefined);
							expect(lastGroup).to.be.an('array');
							expect(lastGroup[0]).to.be.an('object');

							expect(Object.keys(lastGroup[0])).to.include.members(Object.keys(mockGroupsObj));
							next(null, lastGroup);
						});
				}], done);
		});
	});

	describe('DAO Method for addNoteToGroup(userId, groupId, noteId, done)', function() {
		it('Add a random note to a random group', function(done) {
			// pass a irrelevant groupId, noteId, and expect it not to make any change or update any group,
			// it should probably return an error, if no error at all, fail the test case
			// if callback is returned without error but updatedObject is not null then fail the test case
			let userId = USER_ID;
			async.waterfall([
				getCollectionCount.bind(null, COLLECTION_GROUPS, {}), // check the count of the groups before updating

				function(beforeCount, next) {
					groupsDAO.addNoteToGroup(userId, "324232-4d47-11e8-9c2d-fa7ae01bbebc", 
					"837261de-4d47-11e8-1237U-fa7ae01bbebc", (err, result) => {
						expect(err).to.not.equal(null, 'Was expecting error, as the IDs are random');
						expect(result).to.equal(null, 'This should not have added/updated a group as groupId was random');
						next(null, beforeCount)
					});
				},

				function(beforeCount, next) {
					//check the count of the group after trying to add a fake note to group.
					getCollectionCount(COLLECTION_GROUPS, {}, (err, afterCount) => {
						if (err) done(err);
						expect(beforeCount).to.be.equal(afterCount, 'No documents should have updated for a random Group');
						next(null);
					});
				}
			], done);
		})
	})

	describe('DAO Method for removeNoteFromGroup(userId, groupId, noteId, done)', function() {
		it('Remove a random note from a random group', function(done) {
			// same as addNoteToGroup, try with irrelevant groupId, noteId and expect nothing to be removed
			// Probably error will be thrown or callback get undefined result object
			let userId = USER_ID;
			groupsDAO.removeNoteFromGroup(userId, "c0d6d45e-4d9e-11e8-9c2d-fa7ae01bbebc",
			"c0d6d99a-4d9e-11e8-9c2d-fa7ae01bbebc", (err, result) => {
				expect(err).to.not.equal(null, 'Was expecting an error to be thrown as the IDs were random');
				expect(result).to.equal(null);
				done();
			});
		})
	})

	describe('getGroup(userId, groupId, done)', function() {
		it('Try to fetch random groups', function(done) {
			// pass a irrelevant groupId, which does not exist and expect nothing to be returned, if returns fail the test case
			let userId = USER_ID;
			groupsDAO.getGroup(userId, "89b9e99c-4d9f-11e8-9c2d-fa7ae01bbebc", (err, result) => {
				expect(err).to.equal(null);
				expect(result).to.equal(null);
				done();
			});
		})

		it('Fetch group for a different user', function(done) {
			// Pass a irrelevant usreId & groupId and expect it not to return any thing not even error
			let userId = USER_ID_2;
			groupsDAO.getGroup(userId, "57d59556-4da0-11e8-9c2d-fa7ae01bbebc", (err, result) => {
				expect(err).to.equal(null);
				expect(result).to.equal(null);
				done();
			});
		})
	})

})
