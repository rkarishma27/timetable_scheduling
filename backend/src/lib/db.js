const mongoose = require("mongoose");

const mongoUri =
  process.env.MONGO_URI ||
  "mongodb+srv://timetablescheduler:TS1234@timetablescheduler.jgeqfqk.mongodb.net/?appName=timetablescheduler";

let connectPromise = null;

function getDbState() {
  return mongoose.connection.readyState;
}

function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(mongoUri).catch((err) => {
      connectPromise = null;
      throw err;
    });
  }

  return connectPromise;
}

module.exports = {
  connectToDatabase,
  getDbState,
};
