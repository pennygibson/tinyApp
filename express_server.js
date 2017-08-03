var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "UserRandomID": {
    id: "UserRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "User2RandomID": {
    id: "User2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * 6));

  return text;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) =>{
  res.json(urlDatabase);
});


// app.get("/urls", (req, res) =>{
//   let templateVars = { urls: urlDatabase};
//   res.render("urls_index", templateVars);
// })
app.get("/urls", (req, res) =>{
  if(req.cookies.user_id){

    let userId = req.cookies.user_id
    let user = users[userid]

    let templateVars = {
      user: user,
      urls: urlDatabase
    }
    res.render("urls_index", templateVars);
 } else {
    let templateVars = {
      urls: urlDatabase,
      user: ""
    }
    res.render("urls_index", templateVars);
 }
});

app.get("/urls/new", (req, res) => {
  let userId = req.cookies.user_id
  let user = users[userid]

  let templateVars = {
    user: user
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) =>{

  res.render("register");
})

app.get("/login", (req, res) =>{

  res.render("login");
});

app.post("/register", (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;
  let userId = generateRandomString();


  const userIdKeys = Object.keys(users) //turns the keys of users{} into an array
  for(let i = 0; i < userIdKeys.length; i++){
    const loopedKey = (userIdKeys[i]) //gets the user id for each object
    const existingEmail = users[loopedKey]["email"]//returns the emails already in the object


  if(existingEmail === email || email === "" || password === ""){
    res.status(400).send("Please enter a valid email and password")
    return
  }
}//end of the for loop
  users[userId] = {
    id: userId,
    email: email,
    password: password
  }

  //set the cookie
  res.cookie('user_id', userId)
  //redirect to home
  res.redirect("urls/")
})


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect("urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

app.post("/urls/:id/update",(req, res) =>{
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls")
})

app.post("/login", (req, res) =>{
  res.cookie('user_id', req.body.email)

  res.redirect("/urls")
})

app.post("/urls/logout", (req, res) =>{
  res.clearCookie('user_id', req.body.logout)

  res.redirect("/urls")
})



app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







