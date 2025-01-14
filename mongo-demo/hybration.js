const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


const genreSchema = new mongoose.Schema({
  name:  {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
})

const Movie = mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  }
}))

async function createMovie(title, genreId, numberInStock, dailyRentalRate) {

  const genre = await Genre.findById(genreId);

  const movie = new Movie({
    title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock,
    dailyRentalRate
  });

  const result = await movie.save();
  console.log(result);
}