const mongoose = require('mongoose');

const DB_URI = process.env.DB_URI

const init = () => {
  mongoose
    .connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    .catch((err) => {
      console.error('error: ' + err.stack);
      process.exit(1);
    });
  mongoose.connection.on('open', () => {
    console.log('connected to database');
  });
};

mongoose.Promise = global.Promise;

module.exports = init;
