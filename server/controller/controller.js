const UploadModel = require("../model/schema");
const fs = require("fs");
const Pusher = require("pusher");
const cloudinary = require("cloudinary").v2;
const redis_client = require("../../server").getRedisClient();

let test; //to store the response generated after storing the image in cloudinary

//creating the new pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
});

//to get the redis object
function getRedis(key) {
  return new Promise((resolve, reject) => {

   redis_client.get(key, (err, val) => {
    if (err) {
     reject(err)
     return
    }
    if (val == null) {
     resolve(null)
     return
    }
 
    try {
     resolve(
      JSON.parse(val)
     )
    } catch (ex) {
     resolve(val)
    }
   })
  })
 }

//function to get the images from the cache
//takes the attribute for sorting and returns the array of sorted images
async function getImagesFromCache(property, order) {
  let count = await getRedis("image_count");
  //collect the images from the redis into images and return into the home page
  let images = [];
  for (var key = 0; key < count; key++) {
    let image = await getRedis(key);
    images.push(image);
  }

  //sorting the images
  if (order == 1) {
    images = images.sort((a, b) => {
      return a[property] - b[property];
    });
  } else {
    images = images.sort((a, b) => {
      return b[property] - a[property];
    });
  }
  //modelling the image into an array of  mongoose object
  const all_images = [];
  for (var i = 0; i < images.length; i++) {
    all_images.push(UploadModel(images[i]));
  }
  return all_images;
}

//will return the images according to latest arrival
exports.home = async (req, res) => {
  const all_images = await getImagesFromCache("postedon", 0);
  res.render("main", { images: all_images });
};

//will return images according to upvote count (high - low)
exports.orderByUpvotes = async (req, res) => {
  const all_images = await getImagesFromCache("upvotes", 0);
  res.render("main", { images: all_images });
};

//will return images according to downvote count (low - high)
exports.orderByDownvotes = async (req, res) => {
  const all_images = await getImagesFromCache("downvotes", 1);
  res.render("main", { images: all_images });
};

//to update the upvote count in the meme and the notify other clients involved about the change
exports.updateVotes = (req, res, next) => {
  const action = req.body.action;
  if (action == "Upvote") {
    //increment the count of the upvotes
    UploadModel.updateOne(
      { _id: req.params.id },
      { $inc: { upvotes: 1 } },
      {},
      (err, numberAffected) => {
        //generating a trigger to let other connected nodes about the change
        pusher.trigger(
          "post-events",
          "postAction",
          { action: action, postId: req.params.id },
          req.body.socketId
        );
        res.send("");
      }
    );
  } else {
    //increment the count of downvotes
    UploadModel.updateOne(
      { _id: req.params.id },
      { $inc: { downvotes: 1 } },
      {},
      (err, numberAffected) => {
        //generating a pusher trigger
        pusher.trigger(
          "post-events",
          "postAction",
          { action: action, postId: req.params.id },
          req.body.socketId
        );
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
  cloudinary.config({
    cloud_name: "meme-o-gram",
    api_key: "953418367462681",
    api_secret: "l1ri-DEF76EW9dm5cIRUjSphD8M",
  });
  //upload the image url from cloudinary
  let imgArray = files.map(async (file) => {
    let img = fs.readFileSync(file.path);
    test = await cloudinary.uploader.upload(file.path, (err, result) => {
      //for debugging purposes
    });
    //modelling the mongoose object
    let finalImg = {
      username: username,
      filename: file.originalname,
      caption: caption,
      contentType: file.mimetype,
      imageSourceUrl: test.secure_url,
    };
    let newUpload = new UploadModel(finalImg);
    return newUpload
      .save()
      .then(() => {
        res.redirect("/");
        return { msg: `${file.originalname} Uploaded Successfully..!` };
      })
      .catch((error) => {
        if (error) {
          if (error.name === `MongoError` && error.code === 11000)
            return Promise.reject({
              error: `Duplicate ${file.originalname}.file already exists...!`,
            });
        }
        return Promise.reject({
          error:
            error.message ||
            `Cannot Upload ${file.originalname} something missing`,
        });
      });
  });
};
