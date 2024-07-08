const express = require("express");
const cors = require("cors");
const model = require("./model");
const session = require("express-session");

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret:
      "jkgajfidpafjkdla;jreihvnaejklfjdaipeipdnkavajdfiejaifdkvbaghifiejkl;",
    saveUninitialized: true,
    resave: false,
  })
);

//this one might not need to be here
app.use(express.static("public"));


async function AuthMiddleware(request, response, next) {
  // step one check if they have a session
  if (request.session && request.session.userID) {
    //  step two check if that session user id connects to a user in our database
    let user = await model.User.findOne({ _id: request.session.userID });
    if (!user) {
      return response.status(401).send("unauthenticated");
    }
    // if they are autheticated just pass them to the endpoint
    request.user = user;
    next();
  } else {
    return response.status(401).send("unauthenticated");
  }
}


app.listen(8080, function () {
  console.log("server is running on http://localhost:8080...");
});
