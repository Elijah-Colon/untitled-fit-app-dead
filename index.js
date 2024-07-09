const express = require("express");
const cors = require("cors");
const model = require("./model");
const session = require("express-session");
const { request } = require("http");
const e = require("express");
const { Quiz } = require("../../week6/kahoot-backend/model");

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

app.get("/users", async (request, response) => {
  try {
    let users = await model.User.find({}, { password: 0 });
    response.send(users);
  } catch (error) {
    console.log(error);
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

app.get("/days/:daysid", async function(req, res) {
  try{
    console.log(req.params.daysid);
    let day = await model.Day.findOne({_id: req.params.daysid});
    console.log(day);
    if(!day){
      console.log("Day not found");
      res.status(404).send("day not found");
      return
    }
    res.json(day);
  }catch(error){
    console.log(error);
    console.log("bad request (Get day)");
    res.status(400).send("day is not found")
  }
});

app.get("/weeks/:weeksid", async function (res,req) {
  try{
    console.log(req.params.weekid);
    let week = await model.Week.Findone({_id:req.params.weekid});
    console.log(week);
    if(!week){
      console.log("week not found");
      res.status(404).send("week not found");
      return
    }
    res.json(week);
  }catch(error){
    console.log(error);
    console.log("bad requst (Get week)")
    res.status(400).send("week not found")
  }
})

app.get("/days", async function (request, response) {
  try {
    let day = await model.Day.find()
      .populate("owner", "-password")
      .populate("workouts");
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

app.post("/days", AuthMiddleware, async function (req, res) {
  try {
    const newDay = new model.Day({
      name: req.body.name,
      workouts: req.body.workouts,
      owner: req.session.userID,
      reviews: req.body.reviews,
    });

    const error = await newDay.validateSync();
    if (error) {
      res.status(422).send(error);
      console.error(error);
      return;
    }

    await newDay.save();
    res.status(201).send("Created Day :3");
  } catch (error) {
    console.error(error);
    res.status(422).send(error);
  }
});

app.get("/session", (response, request) => {
  response.send(request.session);
});

app.delete("/session", function (request, response) {
  request.session.userID = undefined;
  response.status(204).send();
});

app.post("/session", async (request, response) => {
  try {
    let user = await model.User.findOne({ email: request.body.email });
    if (!user) {
      return response.status(401).send("Authentication failed");
    }
    let isGoodPassword = await user.verifyPassword(request.body.password);
    if (!isGoodPassword) {
      return response.status(401).send("Authentication failed");
    }
    request.session.userID = user._id;
    request.session.name = user.name;
    response.status(204).send(request.session);
  } catch (error) {
    response.status(500);
    console.log(error);
  }
});
app.put("/days/:id", AuthMiddleware, async function (request, response) {
  try {
    let day = await model.Day.findOne({
      _id: request.params.id,
      owner: request.session.userID,
    }).populate("owner");
    console.log(day);
    if (!day) {
      response.status(404).send("Could not find that workout");
      return;
    }
    console.log(request.session._id, day.owner);
    if (request.userID.toString() !== day.owner.toString()) {
      console.log("miau");
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

app.get("/weeks", async function (req, res) {
  try {
    let week = await model.Week.find()
      .populate("owner", "-password")
      .populate("days");
    if (!week) {
      res.status(404).send("Weeks not found");
      return;
    }
    res.json(week);
  } catch (error) {
    console.log(error);
    res.status(404).send("Wees not found");
  }
});

app.post("/weeks", AuthMiddleware, async function (req, res) {
  try {
    const newWeek = new model.Week({
      name: req.body.name,
      dow: req.body.dow,
      description: req.body.description,
      days: req.body.days,
      owner: req.session.userID,
      reviews: req.body.reviews,
    });

    const error = await newWeek.validateSync();
    if (error) {
      res.status(422).send(error);
      console.log(error);
      return;
    }

    await newWeek.save();
    res.status(201).send("Week created :3");
  } catch (error) {
    console.error(error);
    res.status(422).send(error);
  }
});

app.listen(8080, function () {
  console.log("server is running on http://localhost:8080...");
});
