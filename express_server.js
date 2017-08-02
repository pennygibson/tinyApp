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

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b> World</b></body></html>\n");
});

// app.get("/urls", (req, res) =>{
//   let templateVars = { urls: urlDatabase};
//   res.render("urls_index", templateVars);
// })
app.get("/urls", (req, res) =>{
  let templateVars = {
  username: req.cookies["username"],
   urls: urlDatabase
  }
console.log('***********',templateVars)
res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


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

app.post("/urls/login", (req, res) =>{
  res.cookie('username', req.body.username)

  res.redirect("/urls")
})

app.post("/urls/logout", (req, res) =>{
  res.clearCookie('username', req.body.logout)

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






