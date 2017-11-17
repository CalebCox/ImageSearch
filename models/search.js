const mongoose        = require('mongoose'),
      Schema          = mongoose.Schema;

const searchSchema = new mongoose.Schema({
    query: String,
    date: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("searchQuery", searchSchema);