const noteModel = require('./notes.entity');

const addNote = (userId, noteObj, done) => {
  let newNote = new noteModel();
  newNote.noteId = noteObj.noteId;
  newNote.title = noteObj.title;
  newNote.userId = userId;
  newNote.content = noteObj.content;
  newNote.groupId = ''
  newNote.save(function(err, response) {
    if(err) {
      done(err);
    } else {
      done(null, response);
    }
  });
}


const getNote = (userId, noteId, done) => {
  noteModel.findOne({userId: userId, noteId: noteId}, (err, response) => {
  if(err) {
    done(err);
  } else {
    done(null, response);
  }
 });
}

const updateNoteDetails = (userId, noteId, updateDetails, done) => {
  updateDetails['modifiedOn'] = new Date();
  noteModel.findOneAndUpdate({userId: userId, noteId: noteId}, updateDetails, {new: true}, (err, response) => {
  if(err) {
    done(err);
  } else {
    done(null, response);
  }
 });
}

const toggleNoteFavStatus = (userId, noteId, done) => {
  noteModel.findOne({userId: userId, noteId: noteId}, (err, note) => {
  if(err) {
    done(err);
  } else {
    if(note) {
      note.favourite = !note.favourite;
      note.modifiedOn = new Date();
      note.save((err, response) => {
        if(err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    } else {
      done(null, note);
    }  
  }
 });
}


const findNotes = (userId, {fav, title, groupId, limit, page, order}, done) =>{
  let searchCondition = {userId: userId, favourite: fav, title: title, groupId: groupId};
  if(page === undefined) {
    page = 0;
  } 
  if(order === undefined) {
    order = -1;
  }
  if(limit === undefined) {
    limit = 0;
  }
  if(fav === undefined) {
    delete searchCondition['favourite']; 
  }
  if(title === undefined) {
    delete searchCondition['title']; 
  }
   if(groupId === undefined) {
    delete searchCondition['groupId'];
  }
  noteModel.find(searchCondition, function(err, response) {
    if(err) {
      done(err);
    } else {
      done(null, response);
    }
  }).skip(page).limit(limit).sort({'modifiedOn': order});
}

const deleteNote = (userId, noteId, done) => {
  noteModel.findOneAndRemove({userId: userId, noteId: noteId}, (err, response) => {
  if(err) {
    done(err);
  } else {
    done(null, response);
  }
 });
}

module.exports = {
  addNote,
  deleteNote,
  updateNoteDetails,
  toggleNoteFavStatus,
  getNote,
  findNotes
}