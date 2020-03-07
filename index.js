const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  session({
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: "aurkyakarsaktehai!",
    cookie: {
      maxAge: 60 * 60 * 2 * 1000,
      sameSite: false,
      secure: false
    }
  })
);

//multer

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
var upload = multer({ storage: storage });

var users = [
  {
    id: 1,
    username: "inkers",
    password: "inkers",
    images: [
      "http://res.cloudinary.com/stillhungry/image/upload/v1583550931/cycles/2020-03-07T03:15:29.525Z.png"
    ],
    loginTime: []
  },
  {
    id: 2,
    username: "rohit",
    password: "saini",
    images: [
      "http://res.cloudinary.com/stillhungry/image/upload/v1583550931/cycles/2020-03-07T03:15:29.525Z.png"
    ],
    loginTime: []
  },
  {
    id: 3,
    username: "sahil",
    password: "saini",
    images: [
      "http://res.cloudinary.com/stillhungry/image/upload/v1583550931/cycles/2020-03-07T03:15:29.525Z.png"
    ],
    loginTime: []
  }
];

//cloudinary

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "YOUR_CLOUD_NAME",
  api_key: "YOUR-API_KEY",
  api_secret: "YOUR-API-SECRET"
});

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/");
  } else {
    next();
  }
};

app.get("/login", redirectHome, (req, res) => {
  res.render("login.ejs", {});
});

app.get("/", redirectLogin, (req, res) => {
  // res.render("login.ejs", {});

  const { userId } = req.session;
  // console.log("initial  in first get req. " + userId);

  return res.render("image-upload.ejs", {});
});

app.get("/logs", redirectLogin, (req, res) => {
  // res.render("login.ejs", {});

  const { userId } = req.session;
  const userDetail = users.find(user => user.id === userId);
  //console.log("initial  in logs get req. " + userId);
  // console.log(users);
  return res.render("logs.ejs", {
    images: userDetail.images
  });

  // return res.send(
  //   `<p> here goes the logs of your images and logins" + userDetail.username + "</p> <br>  <img height="500px" width="auto" src="${userDetail.images[1]}" />`
  // );
});

app.get("/timelogs", redirectLogin, (req, res) => {
  // res.render("login.ejs", {});

  const { userId } = req.session;
  const userDetail = users.find(user => user.id === userId);
  //console.log("initial  in logs get req. " + userId);
  //console.log(users);
  return res.render("login-logs.ejs", {
    timeLog: userDetail.loginTime
  });

  // return res.send(
  //   `<p> here goes the logs of your images and logins" + userDetail.username + "</p> <br>  <img height="500px" width="auto" src="${userDetail.images[1]}" />`
  // );
});
app.get("/hi", redirectLogin, (req, res) => {
  // res.render("login.ejs", {});
  return res.render("image-upload-hindi.ejs", {});
});

function isUser(obj, uname) {
  return obj.username === uname;
}
function isUserId(obj, id) {
  return obj.id === id;
}

app.post("/login", (req, res) => {
  var userCred = req.body;
  // console.log(userCred);

  const validate = users.find(({ username }) => username === userCred.username);
  // console.log(validate);
  if (
    userCred.username == validate.username &&
    userCred.password == validate.password
  ) {
    const { userId } = req.session;

    const currentTime = new Date().toLocaleString();
    req.session.userId = validate.id;

    //  console.log("validate id on login" + validate.id);
    const userDetail = users.find(user => user.id === validate.id);
    //  console.log("userdetail" + userDetail);

    userDetail.loginTime.push(currentTime);
    // console.log(req.session);
    //console.log(userDetail.loginTime);

    return res.redirect("/");
  }
  return res.send("nhi login hua");
});

app.post("/signup", (req, res) => {
  var newUser = req.body;
  //users.push(newUser);
  // console.log("newuser" + newUser);

  var nayaUser = {
    id: users.length + 1,
    username: req.body.username,
    password: req.body.password,
    images: [],
    loginTime: []
  };

  //console.log("naya User" + nayaUser);

  users.push(nayaUser);

  // console.log(users);

  return res.render("success.ejs");
});

app.post("/image", upload.single("myFile"), (req, res) => {
  const { userId } = req.session;
  const userDetail = users.find(user => user.id === userId);
  const file = req.file;
  //console.log(file);

  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  var today = new Date();

  // console.log(file);

  var path2 = file.path;
  const uniqueFilename = new Date().toISOString();
  cloudinary.uploader.upload(
    path2,
    { public_id: `cycles/${uniqueFilename}`, tags: `images` }, // directory and tags are optional
    function(err, image) {
      if (err) return res.send(err);
      // console.log("file uploaded to Cloudinary");

      fs.unlinkSync(path2);
      // return image details
      //console.log(image);
      userDetail.images.push(image.url);
      res.render("image-details.ejs", {
        imageLink: image.url
      });
    }
  );
});

// app.get("/success", (req, res) => {
//   res.render("success.ejs");
// });

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("sid");
    return res.redirect("/login");
  });
});

var port = process.env.PORT || 80;

app.listen(port, () => {
  console.log("app it 3000");
});
