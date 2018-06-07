let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Schema defines how the user data will be stored in MongoDB
let groupSchema = new Schema({
  groupId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  description: {
    type: String
  },
  userId: {
    type: String,
    required: true
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
module.exports = mongoose.model('group', groupSchema);