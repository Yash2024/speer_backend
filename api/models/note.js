const mongoose = require('mongoose');

const noteSchema = {
    _id: mongoose.Schema.Types.ObjectId,
    noteid: {type: String},
    title: {type: String},
    content: {type: String},
    email: {type: String},
    sharedWith: [{
        useremail: {type: String}
      }]
}

module.exports = mongoose.model('Note', noteSchema);