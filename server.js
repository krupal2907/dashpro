const express = require('express');
const config = require('config');
const dbConnect = require('./config/db');
dbConnect();

const app = express();

//Init middleware
app.use(express.json({
    extended: false
}));

//Routes of the app goes here
app.use('/worker', require('./routes/api/worker'));

//Defining a PORT and listening
const PORT = process.env.PORT || config.get('PORT');
app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});