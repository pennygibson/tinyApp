// Import Requirements (app dependencies)
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const path = require('path');


// Setup Express Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['sessionKey'],
  maxAge: 24 * 60 * 60 * 1000
}));

// Tell Express to use ejs
app.set("view engine", "ejs");


// Database setup
var urlDatabase = {};

var users = {};


// Helper Functions

function generateRandomString(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * 6));

  return text;
}

// find all the links for a given user id
function urlsForUser(id){
  // create an object to hold our results
  let userLinks = {}
  // loop through all the links in our database
  for(var links in urlDatabase){
    // if the link belongs to the user
    if(urlDatabase[links].userId === id){
      // save it to our results object
      userLinks[links] = urlDatabase[links];
    }
  }
  // return our results
  return userLinks
}

// Express server router

// Home route (http://localhost:8080/)
app.get("/", (req, res) => {
  //if the user is not logged in redirect to login
  //if the user IS logged in redirect to urls
  if(req.session.userId){
    res.redirect("/urls");
  } else {
    res.redirect("/login")
 }
});

// Get URLs Database as JSON.
app.get("/urls.json", (req, res) =>{
  res.json(urlDatabase);
});

// -------- USER ROUTES (Login/Register/Logout) ----------------


// GET /register - Show registration form
app.get("/register", (req, res) =>{
  let templateVars = {
      user: req.session.userId,
      urls: urlDatabase
    }
  res.render("register", templateVars);
})

// POST /register - Process the registration, taking user input and saving a user to our database.
app.post("/register", (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;
  let hashed_password = bcrypt.hashSync(password, 10);
  let userId = generateRandomString();


  const userIdKeys = Object.keys(users) //turns the keys of users{} into an array
  for(let i = 0; i < userIdKeys.length; i++){
    const loopedKey = (userIdKeys[i]) //gets the user id for each object
    const existingEmail = users[loopedKey]["email"]//returns the emails already in the object

    console.log(existingEmail)
    if(existingEmail === email || email === "" || password === ""){
      res.status(400).send("Please enter a valid email and password")
      return
    }
  }
  users[userId] = {
    id: userId,
    email: email,
    password: hashed_password
  }

  //set the cookie
  req.session.userId = userId;
  //userId is naming the cookie
  //redirect to home
  res.redirect("/urls")
})

// GET /login - Show login form
app.get("/login", (req, res) =>{
  let templateVars = {
      user: req.session.userId,
      urls: urlDatabase
    }
  res.render("login", templateVars);
});

// POST /login - Process a login.
app.post("/login", (req, res) =>{

  //res.cookie('userId', req.body.email)
  for(let i in users) {
    if(users[i].email === req.body.email){
      if (bcrypt.compareSync(req.body.password, users[i].password)) {
        req.session.userId = i
        res.redirect("/urls")
        return
      }
    }
  }
  res.status(403).send("Email and password are not matching")
})

// POST /logout - Process logout
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls")
})



// ---------------- URL Routes (CRUD for URLs) -----------------------

// GET /urls - Get the logged in user urls. If not logged in redirects to /register.
app.get("/urls", (req, res) =>{
  if(req.session.userId){
    let userId = req.session.userId
    let userURLS = urlsForUser(userId)


    let templateVars = {
      user: req.session.userId,
      urls: userURLS
    }
    res.render("urls_index", templateVars);
  }

    res.redirect("/register");
});

// GET /urls/new - Show the new URL form to the user.
app.get("/urls/new", (req, res) => {
  let userId = req.session.userId;
  let user = users[userId]

  let templateVars = {
    user: user
  }
  if (!user){
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

// POST /urls - Process a new url to be added to the urlsDatabase.
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  // urlDatabase[shortURL] = req.bodylongURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session.userId   // TODO: don't hardlode user
  }

  res.redirect("/urls");
});


// POST /urls/b2xVn2/delete - Delete a url from the URLs Database
app.post("/urls/:id/delete", (req, res) =>{


   const urlObject = urlDatabase[req.params.id] //this gets the key of the urlDatabase object
   if(urlObject.userId === req.session.userId) {
    delete urlDatabase[req.params.id]
    }
    res.redirect("/urls")
});

// POST /urls/b2xVn2/update - Change the longURL of the given shortURL.
app.post("/urls/:id/update",(req, res) =>{
  const urlObject = urlDatabase[req.params.id]
  if(urlObject.userId === req.session.userId) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userId: urlObject.userId
    }
  }
  console.log(urlDatabase);

  res.redirect("/urls")
})

// GET /urls/b2xVn2 - View details of a single URL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.session.userId]
  };
  res.render("urls_show", templateVars);
});


// ------------------ Redirect to Long URL -----------------------


// GET /u/b2xVn2 - Redirect to the longURL associated to the shortURL.
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params)
   let urlInfo = urlDatabase[req.params.shortURL];
   // console.log(urlDatabase)
   // console.log(req.params.shortURL)
   // console.log(longURL)
   res.redirect(urlInfo.longURL);
   // res.send(longURL)

});


// Run the server on the given PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!, :) :)`);
});







