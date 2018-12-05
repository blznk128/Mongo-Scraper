var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var port = process.env.PORT ||8080;
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.Promise = Promise;
var databaseUri = 'mongodb://localhost/NYT';
if(process.env.MONGODB_URI){
	databaseUri=process.env.MONGODB_URI;
}
mongoose.connect(databaseUri,{
	useMongoClient:true
});

var test = mongoose.connection;
test.on('error',function(err){
  console.log('Mongoose Error:', err);
})

app.get("/scrape", function(req, res) {
  axios.get("http://www.nytimes.com/section/world?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=World&WT.nav=page").then(function(response) {
    var $ = cheerio.load(response.data);
    var results = new Array();
    $(".story-body").each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children(".headline")
        .text().replace(/ +(?= )/g,'').replace(/\n/g,'');
      result.summary = $(this)
        .children(".summary")
        .text();
      if (result.title.length > 5){
        console.log(result);
        results.push(result);
      }
    });
    res.json(results);
  });
});

app.post("/api/save", function(req, res){
  db.Article
    .create(req.body)
    .then(function(dbArticle) {
      console.log("Article saved");
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles", function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err);
    });

});


app.delete("/api/article/:id", function(req, res){
  db.Article
    .remove({"_id":req.params.id})
    .then(function(dbArticle){
      res.json(dbArticle)
    })
});


app.get("/articles/:id", function(req, res) {
  
  db.Article
    .findOne({"_id":req.params.id})
    .populate("comment")
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err);
    });

});

app.post("/api/new_comment/:id", function(req, res) {
    db.Comment
    .create(req.body)
    .then(function(dbComment){
      //res.json(dbArticle)
      return db.Article.findOneAndUpdate(
        {_id:req.params.id},
        {comment:dbComment._id},
        {new:true} 
        );
    })
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
});

app.delete("/comment/:id", function(req, res){
  db.Comment
  .remove({"_id":req.params.id})
  .then(function(dbArticle){
    res.json(dbArticle)
  })
});

app.listen(port, function() {
  console.log("App running on port " + port + "!");
});
