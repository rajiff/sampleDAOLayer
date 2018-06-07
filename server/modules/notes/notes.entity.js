let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Schema defines how the user data will be stored in MongoDB
let noteSchema = new Schema({
  noteId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  favourite: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    required: true
  },
  groupId: {
    type: String
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  modifiedOn: {
    type: Date,
    default: Date.now()
  }
});

// Export the Model
module.exports = mongoose.model('note', noteSchema);