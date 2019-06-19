const mongoose = require('mongoose');
const config = require('config');
const key = config.get('MONGOURI');

const dbConnect = async () => {
    try {
        await mongoose.connect(key, {
            useNewUrlParser: true,
            useCreateIndex: true
        });
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = dbConnect;