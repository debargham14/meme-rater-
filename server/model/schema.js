const mongoose = require("mongoose");

//schema to hold the memes
const uploadSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    unique: true,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  imageSourceUrl: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Array,
    required: true,
    default: []
  },
  downvotes: {
    type: Array,
    required: true,
    default: []
  },
  postedon: {
      type: Date,
      default: Date.now(),
  },

  comments :{
    type: Array,
    default: [],
  },
});

module.exports = UploadModel = mongoose.model("uploads", uploadSchema);
