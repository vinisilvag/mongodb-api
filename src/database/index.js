import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/mongodb-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
});

mongoose.Promise = global.Promise;

export default mongoose;
