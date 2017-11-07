var express     = require('express'),
    mongoose    = require('mongoose'),
    app         = express();

var port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/imagesearch', {useMongoClient: true });
app.use('/static', express.static(__dirname + '/public'));

app.get("/", function(req, res) {
    res.send("This is a test!");
});

app.listen(port, function() {
    console.log("Image Search service is running!");
});