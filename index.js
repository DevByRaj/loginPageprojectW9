const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const noCache = require("nocache");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(noCache());

// Session 
app.use(
  session({
    secret: "raj12raj", 
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, maxAge: 600000},
  })
);

// Predefined credentials
const USER = [
    {username: "rajmohan", password: "12345" },
    {username: "mohanraj", password: "mohan12" }
];
  
// Authentication middleware
function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    next();
  }
  else {
    res.redirect("/");
  }
}

// Routes
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home");
  }
  res.render("login", {error: null});
});

app.post("/login", (req, res) => {
  const {username, password} = req.body;
  const users = USER.find(u => u.username === username && u.password === password)
  // if (username === USER.username && password === USER.password) {
  if(users){
    req.session.user = username;
   
    return res.redirect("/home");
  } else {
    return res.render("login", {error: "Incorrect username or password"});
  }
});


app.get("/home", authMiddleware, (req, res) => {

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

   if (!req.session.user) {
    return res.redirect("/");
  }
   return res.render("home", {username: req.session.user} );
   
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
  
});


// Start server
app.listen(5000, () => {
  console.log("Server running on 5000");
});