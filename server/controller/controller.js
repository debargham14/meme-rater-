const UploadModel = require("../model/schema");
const fs = require("fs");
const Pusher = require ('pusher');

//creating the new pusher 
const pusher = new Pusher ({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER
});

//will return the images according to latest arrival
exports.home = async (req, res) => {
  
  const all_images = await UploadModel.find().sort({postedon: -1});
  res.render("main", { images: all_images });
};

//will return images according to upvote count (high - low)
exports.orderByUpvotes = async (req, res) => {  
  const all_images = await UploadModel.find().sort({upvotes: -1});
  res.render("main", { images: all_images });
};

//will return images according to downvote count (low - high)
exports.orderByDownvotes = async (req, res) => {  
  const all_images = await UploadModel.find().sort({downvotes: 1});
  res.render("main", { images: all_images });
};

//to update the upvote count in the meme and the notify other clients involved about the change
exports.updateVotes = (req, res, next) => {
  const action = req.body.action;
  if (action == "Upvote") { //increment the count of the upvotes  
    UploadModel.updateOne(
      { _id: req.params.id }, 
      { $inc: { upvotes: 1 } },
      {},
      (err, numberAffected) => { //generating a trigger to let other connected nodes about the change
        pusher.trigger('post-events', 'postAction', {action: action, postId: req.params.id}, req.body.socketId);
        res.send ('');
      }
    );
  } else { //increment the count of downvotes
    UploadModel.updateOne(
      { _id: req.params.id },
      { $inc: { downvotes: 1 } },
      {},
      (err, numberAffected) => { //generating a pusher trigger 
        pusher.trigger('post-events', 'postAction', {action: action, postId: req.params.id}, req.body.socketId);
        res.send("");
      }
    );
  }
};

exports.uploads = (req, res, next) => {
  const files = req.files;
  const username = req.body.username;
  const caption = req.body.caption;
  if (!files) {
    const error = new Error("please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding
  let imgArray = files.map((file) => {
    let img = fs.readFileSync(file.path);
    return (encode_image = img.toString("base64"));
  });

  let result = imgArray.map((src, index) => {
    //create object to store data in the database
    let finalImg = {
      username: username,
      filename: files[index].originalname,
      caption: caption,
      contentType: files[index].mimetype,
      imageBase64: src,
    };
    let newUpload = new UploadModel(finalImg);
    return newUpload
      .save()
      .then(() => {
        return { msg: `${files[index].originalname} Uploaded Successfully..!` };
      })
      .catch((error) => {
        if (error) {
          if (error.name === `MongoError` && error.code === 11000)
            return Promise.reject({
              error: `Duplicate ${files[index].originalname}.file already exists...!`,
            });
        }
        return Promise.reject({
          error:
            error.message ||
            `Cannot Upload ${files[index].originalname} something missing`,
        });
      });
  });

  Promise.all(result)
    .then((msg) => {
      res.redirect("/");
    })
    .catch((err) => {
      res.json(err);
    });
};
