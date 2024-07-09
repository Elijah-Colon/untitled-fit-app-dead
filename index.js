const express = require("express");
const cors = require("cors");
const model = require("./model");
const session = require("express-session");
const { request } = require("http");
const e = require("express");

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

app.get("users", async (request, response) => {
  try {
    let users = await model.User.find({}, { password: 0 });
    response.send(user);
  } catch (error) {
    response.status(500).send("bad Request");
  }
});

app.post("/users", async (request, response) => {
  try {
    let newUser = await new model.User({
      email: request.body.email,
      name: request.body.name,
    });
    await newUser.setPassword(request.body.password);
    const error = await newUser.validateSync();
    if (error) {
      console.log(error);
      response.status(422).send(error);
    }
    await newUser.save();
    response.status(201).send("new User created");
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});
// for the workout one where would we be getting the information and how?
app.get("/workouts", async (request, response) => {
  try {
    let workout = await model.Workout.find();
    response.send(workout);
    console.log(workout);
  } catch (error) {
    console.log(error);
    response.status(500).send("Generic error");
  }
});

app.get("/days", async function (request, response) {
  try {
    let day = await model.Day.find()
      .populate("owner", "-password")
      .populate("workout");
    if (!day) {
      return response.status(404).send("Could not find that workout");
    }
    response.json(day);
    console.log(day);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

app.put("/days/:id", AuthMiddleware, async function (request, response) {
  try {
    let day = await model.Day.find({ _id: request.params.id });
    if (!day) {
      return response.status(404).send("Could not find that workout");
    }
    if (request.user._id.toString() === day.owner.toString()) {
      day.name = request.body.name;
      day.workouts = request.body.workouts;
    }
    const error = await day.validateSync();
    if (error) {
      response.status(402).send(error);
      return;
    }
    await day.save();
    response.status(204).send("Updated");
  } catch (error) {
    console.log(error);
    response.status(500).send("Generic error");
  }
});

app.listen(8080, function () {
  console.log("server is running on http://localhost:8080...");
});
