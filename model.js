const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

mongoose.connect(process.env.DBPASSWORD);

const UserSchema = Schema({
  email: {
    type: String,
    required: [true, "User MUST have an email"],
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "User MUST have a password"],
  },
});

const WorkoutSchema = Schema({
  Name: {
    type: String,
    required: true,
  },
  muscle: [{ type: String, required: true }],
  instructions: {
    type: String,
    required: false,
  },
  reps: {
    type: Number,
    required: false,
  },
  sets: {
    type: Number,
    required: false,
  },
});

const DaySchema = Schema({
  name: {
    type: String,
    required: [true, "Day needs a name"],
  },
  workouts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: [true, "day needs a workout"],
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A day needs an owner"],
  },
  reviews: {
    type: String,
  },
});

const WeekSchema = Schema({
  name: {
    type: String,
    required: [true, "Week needs a name"],
  },
  dow: {
    type: String,
    required: [true, "Week needs a day of the week"],
  },
  description: {
    type: String,
    required: [true, "Week needs a description"],
  },
  days: [
    {
      type: Schema.Types.ObjectId,
      ref: "Day",
      required: [true, "Week needs days"],
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A week needs an owner"],
  },
  reviews: {
    type: String,
  },
});

UserSchema.methods.setPassword = async function (plainPassword) {
  try {
    let hashedWord = await bcrypt.hash(plainPassword, 12);
    this.password = hashedWord;
  } catch (error) {}
};

UserSchema.methods.verifyPassword = async function (plainPassword) {
  // first param is the plane password from user
  //   second one is the hashed one from the user
  let isGood = await bcrypt.compare(plainPassword, this.password);
  return isGood;
};

const User = mongoose.model("User", UserSchema);
const Workout = mongoose.model("Workout", WorkoutSchema);
const Day = mongoose.model("Day", DaySchema);
const Week = mongoose.model("Week", WeekSchema);

module.exports = {
  User,
  Workout,
  Day,
  Week,
};
