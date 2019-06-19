const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        required: true
    }
});

module.exports = mongoose.model('project', projectSchema);