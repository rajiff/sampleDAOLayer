const async = require('async');
const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;

const COLLECTION_NOTES = 'notes';
const { notesDAO, initializeMongooseConnection } = require('../modules');
const mockNotesObj = require('../mock_note_obj.json');
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

describe('DAO Layer Test Cases for Notes', function() {
  before(function(done) {
    initializeMongooseConnection();
    //This will need access to DB as well, hence create and initialize a local DB connection
    // MongoClient.connect(process.env.MONGO_URL, {loggerLevel: 'debug'}, (err, client) => {
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

  describe('DAO Method addNote(userId, noteObj, done)', function() {
    it('Add a valid mock note object for a user', function(done) {
      let userId = USER_ID;
      async.waterfall([
        getCollectionCount.bind(null, COLLECTION_NOTES, {}), //Check the count of notes before adding new one
        function(beforeCount, next) {
          let noteObj = Object.assign({}, mockNotesObj);
          notesDAO.addNote(userId, noteObj, (err, result) => {
            if (err) return done(err);
            expect(result).to.not.equal(undefined);
            expect(result).to.be.an('object');

            // This we are doing because if student is passing back mongoose returned object, which is not a pure POJO, hence we need to convert to string to get the actual POJO by parsing it back to JSON object
            let resultObj = JSON.parse(JSON.stringify(result));
            expect(Object.keys(resultObj)).to.include.members(Object.keys(mockNotesObj));
            next(null, beforeCount, result);
          });
        },
        function(beforeCount, result, next) {
          // Check the count of notes after adding new note
          getCollectionCount(COLLECTION_NOTES, {}, (err, afterCount) => {
            expect((beforeCount + 1)).to.be.equal(afterCount);
            next(null, result);
          });
        },
        function(result, next) {
          // Get the last inserted notes object and compare
          dbConnection
            .collection(COLLECTION_NOTES)
            .find({}, { $sort: { $natural: -1 } })
            .limit(1)
            .toArray((err, lastNote) => {
              expect(lastNote).to.not.equal(undefined);
              expect(lastNote[0]).to.be.an('object');
              // const mockObjectKeys = Object.keys(mockNotesObj)
              // const filteredObj = lodash.pick(lastNote[0], mockObjectKeys);
              // expect(filteredObj).to.deep.equal(mockNotesObj);

              // This we are doing because if student is passing back mongoose returned object, which is not a pure POJO, hence we need to convert to string to get the actual POJO by parsing it back to JSON object
              let resultObj = JSON.parse(JSON.stringify(result));
              expect(Object.keys(resultObj)).to.include.members(Object.keys(mockNotesObj));
              next(null, lastNote);
            });
        }
      ], (err) => {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });
  });

  describe('DAO Method deleteNote(userId, noteId, done)', function() {
    it('Delete note with random noteId', function(done) {
      // Expecting not to delete any thing as noteId is not a valid or not existing
      let userId = USER_ID;
      async.waterfall([
        getCollectionCount.bind(null, COLLECTION_NOTES, {}), //Check the count of notes before finding
        function(beforeCount, next) {
          notesDAO.deleteNote(userId, '1xyz', (err, result) => {
            if(err) return next(err);

            expect(result).to.equal(null);
            next(null, beforeCount);
          });
        },
        function(beforeCount, next) {
          // Check the count of notes deleting a note
          getCollectionCount(COLLECTION_NOTES, {}, (err, afterCount) => {
            if(err) return next(err);

            expect(beforeCount).to.be.equal(afterCount);
            next(null, afterCount);
          });
        }
      ], done);
    });
  });

  describe('DAO Method updateNoteDetails(userId, updateDetails, done)', function() {
    it('update a previously inserted Note for a random field', function(done) {
      let userId = USER_ID;
      async.waterfall([
        function(next) {
          dbConnection
          .collection(COLLECTION_NOTES)
          .find({}, { $sort: { $natural: -1 } })
          .limit(1)
          .toArray((err, beforeUpdate) => {
            next(null, beforeUpdate[0]);
          });
        },
        function(beforeUpdate, next) {
          let updateDetails = Object.assign({}, beforeUpdate);
          notesDAO.updateNoteDetails(userId, '1xyz', updateDetails, (err, result) => {
            expect(result).to.equal(null);
            next(null, beforeUpdate);
          });
        },
        function(beforeUpdate, next) {
          dbConnection
          .collection(COLLECTION_NOTES)
          .find({}, { $sort: { $natural: -1 } })
          .limit(1)
          .toArray((err, afterUpdate) => {
            expect(beforeUpdate).to.deep.equal(afterUpdate[0]);
            next(null, afterUpdate[0]);
          });
        }], (err, result) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    })
  });

  describe('DAO Method getNote(userId, noteId, done)', function() {
    it('Get a note, with random NoteId', function(done) {
      let userId = USER_ID;
      notesDAO.getNote(userId, 'xyzhdjf', (err, result) => {
        if(err) return done(err);

        expect(result).to.equal(null);
        done();
      });
    })
  })

  describe('DAO Method findNotes(userId, {fav, title, groupId, limit, page, order}, done)', function() {
    it('Find notes of the user', function(done) {
      let userId = USER_ID;
      async.waterfall([
        getCollectionCount.bind(null, COLLECTION_NOTES, {}),
        function(beforeCount, next) {

          notesDAO.findNotes(userId, { limit: 999 }, (err, result) => {
            if(err) return next(err);

            expect(result).to.not.equal(null);
            expect(result).to.be.an('array');
            expect(result.length).to.be.equal(beforeCount);

            // This we are doing because if student is passing back mongoose returned object, which is not a pure POJO, hence we need to convert to string to get the actual POJO by parsing it back to JSON object
            let resultObj = JSON.parse(JSON.stringify(result));

            // Just pick a object from the returned collection and see it is similar to mock object structure
            expect(Object.keys(resultObj[resultObj.length - 1])).to.include.members(Object.keys(mockNotesObj));
            next(null, result);
          });
        }
      ], done);
    })

    it('Find notes for other user', function(done) {
      let userId = USER_ID_2;
      notesDAO.findNotes(userId, { limit: 999 }, (err, result) => {
        if(err) return done(err);

        expect(result).to.not.equal(undefined);
        expect(result).to.be.an('array');
        expect(result.length).to.be.equal(0); //because for this user, we never added a note
        done();
      });
    });

    it('Find note with a random title', function(done) {
      let userId = USER_ID;
      notesDAO.findNotes(userId, { title: 'Note with a non-existent title __' }, (err, result) => {
        if(err) return done(err);

        expect(result).to.not.equal(null);
        expect(result).to.be.an('array');
        expect(result.length).to.be.equal(0); //not expecting to find the note of this title
        done(); 
      });
    });
  });
});
