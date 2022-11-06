const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

var db, collection;

const url =
  "mongodb+srv://khaled:coinflip@cluster0.oscsknn.mongodb.net/test";
const dbName = "coinFlip";

app.listen(5050, () => {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      db = client.db(dbName);
      console.log("Connected to `" + dbName + "`!");
    }
  );
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  db.collection("results")
    .find()
    .toArray((err, allDocuments) => {
      if (err) return console.log(err);
      res.render("index.ejs", { coinFlipResults: allDocuments });
    });
});

app.post("/results", (req, res) => {
  let coinResult = Math.ceil(Math.random() * 2);
  let botResult;

  if (coinResult <= 1) {
    botResult = "heads";
  } else if (coinResult <= 2) {
    botResult = "tails";
  }

  let outcome;

  if (botResult === req.body.userGuess) {
    outcome = "You Win!";
  } else {
    outcome = "You Lose!";
  }

  db.collection("results").insertOne(
    { userGuess: req.body.userGuess, coinFlipResult: botResult, winOrLose: outcome, example: "hi" },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect("/");
    }
  );
});

app.delete('/results', (req, res) => {
  db.collection("results").deleteMany(
    { }
  )
    .then(result => {
      if (result.deletedCount === 0) {
          return res.json('No entry to delete')
        }
      res.json(`Deleted entry`)
    })
    .catch(error => console.error(error))
})