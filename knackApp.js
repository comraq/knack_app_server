var express = require("express"),
    bodyParser = require("body-parser"),
    path = require("path"),
    mongoWrapper = require("./my_mongo_connector/mongoWrapper"),
    fs = require("fs");

var app = express(),
    port = process.argv[2] || process.env.PORT || 8080,
    dbClient = mongoWrapper.client(),
    COLL_PREFIX = "knack_";

app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/static/index.html"));
});

// Routing required for API demo page
app.get("/resources/*", function(req, res) {
  console.log("Received GET request! URL: " + req.url);

  var fn = req.url;
  res.sendFile(path.join(__dirname + fn));
});

app.get("*", function(req, res) {
  console.log("Received GET request! URL: " + req.url);

  var colls = getColl(req);
  if (colls === undefined) {
    //Bad Request
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad GET Request! Unrecognized Query.");
    return;
  }

  var resJson = {};
  (function queryDbRecurse(i) {
    dbClient.find(colls[i], null, { _id: 0 }, function(err, docs) {
      if (err) {
        // Error Quering Database
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end("Error Querying Database for " + e + " collection !");
        return;
      }
      resJson[colls[i].slice(COLL_PREFIX.length)] = docs;

      if (i == colls.length - 1)
        endGet(JSON.stringify(resJson));
      else
        queryDbRecurse(i + 1);
    });
  })(0);

  function endGet(data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(data); 
  }
});

function getColl(req) {
  switch (req.params[0]) {
    case "/activities":
      return [COLL_PREFIX + "tasks", COLL_PREFIX + "workshops"];
    case "/badges":
    case "/earners":
      return [COLL_PREFIX + req.params[0].slice(1)];
    default:
      //Bad Query
  }
}

app.post("*", function(req, res) {
  console.log("Received POST Request! url: " + req.url);

  var colls = getColl(req);
  if (colls === undefined) {
    //Bad Request
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad GET Request! Unrecognized Query.");
    return;
  }

  if (req.body === undefined) {
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad POST Request! Undefined request body.");
    console.log("Bad POST Request! Undefined request body.");
    return;
  }

  var type;
  if (colls.length == 2) {
    if (req.query.type === undefined
        || (req.query.type != "tasks" && req.query.type != "workshops")) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("Bad POST Request! Undefined Activity Type.");
      console.log("Bad POST Request! Undefined Activity Type.");
      return;
    }
    type = req.query.type;

    var today = new Date(),
        dd = today.getDate(),
        mm = today.getMonth() + 1,
        yyyy = today.getFullYear();
    mm = (mm < 10)? "0" + mm: mm;
    dd = (dd < 10)? "0" + dd: dd;
    req.body.timestamp = mm + "/" + dd + "/" + yyyy;
  } else
    type = req.params[0].substring(1);

  var keyId = req.body.id, del = req.body["delete"];
  if (keyId === undefined) {
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad POST Request! Missing ID for input "
            + type + " json.");
    console.log("Bad POST Request! Missing ID for input "
            + type + " json.");
    console.log("body: " + JSON.stringify(req.body));
    return;
  }

  var coll = COLL_PREFIX + type;
  if (del)
    dbClient.deleteOne(coll, {id: keyId}, endPost);
  else
    dbClient.updateOne(coll, "id", req.body, endPost);

  function endPost(err, results) {
    if (err) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("Error updating database!"); 
    }

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(results));
  }
});

app.listen(port);
