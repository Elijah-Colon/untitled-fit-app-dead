const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

mongoose.connect(process.env.YOURPASSWORD);



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


module.exports = {
};
