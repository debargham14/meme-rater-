//creating the http server using js
const express = require("express");
const redis = require ('redis');

require ('dotenv').config();

const app = express();

const hbs = require("express-handlebars");
const path = require("path");

app.use(express.json()); //allows to post the json data when we make a post request

//serving common static files
app.use(express.static(path.join(__dirname, "public")));

//connect mongodb database
require("./server/database/database")();
//setup view engine
app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultView: "default",
    layoutsDir: path.join(__dirname, "views"),
    partialDir: path.join(__dirname, "views"),
  })
);

//setting up the redis port
const port_redis = process.env.PORT || 6379;
var port = process.env.PORT || 8080;

//configuring the redis client on port 6379
const redis_client = redis.createClient (port_redis);
console.log(redis_client);

async function dataFetch () {
  const all_images = await UploadModel.find().sort({postedon: -1});
  for(var idx = 0; idx < Math.min(all_images.length, 10); idx++){
    redis_client.setex (idx, 3600, JSON.stringify(all_images[idx]));
  }
  //to store the image count of the 
  redis_client.setex ("image_count", 3600, Math.min(all_images.length, 10));
  return 1;
} 

setInterval(async () => {
    let check = await dataFetch();
}, 3000);


exports.getRedisClient = function () {return redis_client;}
//calling routes
app.use("/", require("./server/router/router"));
app.listen(port, () =>
  console.log(`Server is stated on http://localhost:${port}`)
);

