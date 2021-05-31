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
    type: Number,
    required: true,
    default: 0,
  },
  downvotes: {
    type: Number,
    required: true,
    default: 0,
  },
  postedon: {
      type: Date,
      default: Date.now(),
  }
});

module.exports = UploadModel = mongoose.model("uploads", uploadSchema);
