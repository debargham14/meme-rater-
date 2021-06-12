//creating the http server using js
const express = require("express");
const redis = require("redis");

require("dotenv").config();


const hbs = require("express-handlebars");
const handlebars = require('hbs');
const path = require("path");
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


const app = express();

require('./server/passport/passport')(passport);

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
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "views"),
    partialDir: path.join(__dirname, "views"),
  })
);

//Bodyparser
app.use(express.urlencoded({extended: false}));

//Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
//connect flash
app.use(flash());

//Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//setting up the redis port
const port_redis = process.env.PORT || 6379;
const port = process.env.PORT || 8080;

//configuring the redis client on port 6379
const redis_client = redis.createClient({
  port: port_redis,
  host: "localhost",
});

redis_client.on("error", (error) => {
  console.log(error.message);
});

redis_client.on("connect", () => {
  console.log("Successfully connected to redis");
});

async function dataFetch() {
  const all_images = await UploadModel.find().sort({ postedon: -1 });
  for (var idx = 0; idx < Math.min(all_images.length, 10); idx++) {
    redis_client.setex(idx, 3600, JSON.stringify(all_images[idx]));
  }
  //to store the image count of the
  redis_client.setex("image_count", 3600, Math.min(all_images.length, 10));
  return 1;
}

setInterval(async () => {
  let check = await dataFetch();
}, 3000);

exports.getRedisClient = () => {
  return redis_client;
};

//calling routes
app.use("/", require("./server/router/router"));
const server = app.listen(port, () =>
  console.log(`Server is stated on http://localhost:${port}`)
);

let io = require('socket.io')(server);

io.on ('connection', (socket) => {
   console.log(`New Connection: ${socket.id}`);
   
   //Receive events
   socket.on('comment', (data) => {
      socket.broadcast.emit('comment', data);
   })

   socket.on('Vote', (data) => {
     socket.broadcast.emit('Vote', data);
   })
})
