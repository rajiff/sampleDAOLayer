const groupModel = require('./groups.entity');
const noteModel = require('../notes/notes.entity');

const createGroup = (userId, groupObj, done) => {
  let newgroup = new groupModel();
  newgroup.groupId = groupObj.groupId;
  newgroup.title = groupObj.title;
  newgroup.avatar = groupObj.avatar;
  newgroup.description = groupObj.description;
  newgroup.userId = userId;
  newgroup.save(function(err, response) {
    if(err) {
      return done(err);
    } else {
      done(null, response);
    }
  });
}

const getGroup = (userId, groupId, done) => {
  groupModel.findOne({userId: userId, groupId: groupId}, (err, response) => {
  if(err) {
    done(err);
  } else {
    done(null, response);
  }
 });
}

const addNoteToGroup = (userId, groupId, noteId, done) => {
  noteModel.findOne({userId: userId, noteId: noteId}, (err, note) => {
  if(err) {
    done(err);
  } else {
    if(note) {
      note.groupId = groupId;
      note.modifiedOn = new Date();
      note.save((err, response) => {
        if(err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    } else {
      done(Error('unable to add Note to a group'), note);
    }  
  }
 });
}


const removeNoteFromGroup = (userId, groupId, noteId, done) => {
  noteModel.findOne({userId: userId, noteId: noteId}, (err, note) => {
  if(err) {
    done(err);
  } else {
    if(note) {
      note.groupId = '';
      note.modifiedOn = new Date();
      note.save((err, response) => {
        if(err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    } else {
      done(Error('unable to delete Note from a group'), note);
    }  
  }
 });
}

module.exports = {
  createGroup,
  getGroup,
  addNoteToGroup,
  removeNoteFromGroup
}