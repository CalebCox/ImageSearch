const express               = require('express'),
      mongoose              = require('mongoose'),
      cognitiveServices     = require('cognitive-services'),
      bodyParser            = require('body-parser'),
      searchQuery           = require('./models/search'),
      app                   = express();

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/imagesearch2', {useMongoClient: true });
app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.json());
require('dotenv').config();

const searchClient = new cognitiveServices.bingImageSearchV7({
    apiKey: process.env.API_KEY,
    endpoint: "api.cognitive.microsoft.com"
});

app.get("/", (req, res) => {
    res.send("This is a test!");
});

app.get("/api/recent", (req, res, next) => {
    searchQuery.find({}, (err, data) => {
        res.json(data);
    })
});

app.get("/api/search/:query*", (req, res, next) => {
    var query = req.params.query;
    var offset = req.query.offset;
    offset = parseInt(offset);

    // is offset defined? if not or it's set to 'page 1', default is 0
    if(offset) {
        if (offset === 1) {
            offset = 0;
        }
    } else {
        offset = 0;
    }

    /* set bing search parameters
        mkt = market/locale
        q = search query
        offset = offset
        count = number of results
        Safe Search = parental controls to return SFW results only.
    */
    var parameters = {
        "mkt": "en-US",
        "q": query,
        "offset": offset * 10,
        "count": 10,
        "safeSearch": "strict"
    };

    const headers = {};

    // setup data object for save state.
    var data = new searchQuery({
        query: query,
        date: new Date()
    });

    // Save searched query for 'recent' list
    data.save(err =>{
        if (err) {
            console.log('Error saving query to database.')
        }
    });

    // Search logic, populates search results and pushes the filtered JSON values to the results array.
    searchClient.search({
        parameters,
        headers
    }).then(response => {
        var results = [];
        for (i=0;i < 10; i++) {
            results.push({
                url: response.value[i].contentUrl,
                snippet: response.value[i].name,
                thumbnail: response.value[i].thumbnailUrl,
                context: response.value[i].hostPageDisplayUrl
            });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log("Image Search service is running!");
});