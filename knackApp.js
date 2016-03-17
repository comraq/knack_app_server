var express = require("express"),
    bodyParser = require("body-parser"),
    path = require("path"),
    mongoWrapper = require("./my_mongo_connector/mongoWrapper"),
    fs = require("fs");

var app = express(),
    port = process.argv[2] || process.env.PORT || 8080,
    dbClient = mongoWrapper.client(),
    COLL_PREFIX = "knack_",
    JSON_PATH = "resources/json/";

app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/static/index.html"));
});

app.get("/resources/*", function(req, res) {
  var fn = req.url;
  res.sendFile(path.join(__dirname + fn));
});

app.get("*", function(req, res) {
  console.log("Received GET request! URL: " + req.url);

  var fn = getFn(req);
  if (fn === undefined) {
    //Bad Request
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad GET Request! Unrecognized Query.");
    return;
  }

  readJson(fn, endGet);

/*
  var coll = getColl(req);
  if (coll === undefined) {
    //Bad Request
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad GET Request! Unrecognized Query.");
    return;
  }
*/

  function endGet(data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(data); 
  }
});

function getColl(req) {
  switch (req.params[0]) {
    case "/activities":
    case "/badges":
    case "/earners":
      return COLL_PREFIX + req.params[0].slice(1);
    default:
      //Bad Query
  }
}

function getFn(req) {
  switch (req.params[0]) {
    case "/activities":
      return JSON_PATH + "tasks_workshops.json";
    case "/badges":
      return JSON_PATH + "badges.json";
    case "/earners":
      return JSON_PATH + "earners.json";
    default:
      //Bad Query
  }
}

app.post("*", function(req, res) {
  console.log("Received POST Request! url: " + req.url);
  var fn = getFn(req, type);
  if (fn === undefined) {
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad POST Request! Unrecognized Query.");
    console.log("Bad POST Request! Unrecognized Query.");
    return;
  }

  if (req.body === undefined) {
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad POST Request! Undefined request body.");
    console.log("Bad POST Request! Undefined request body.");
    return;
  }

  var type;
  if (fn == JSON_PATH + "tasks_workshops.json") {
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

  function endPost(err, results) {
    if (err) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("Error updating database!"); 
    }

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(results));
  }

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
  else {
    console.log("collection: " + coll);
    console.log(req.body);
    dbClient.updateOne(coll, req.body, endPost);
  }

/*
  readJson(fn, updateJson);
  function updateJson(data) {
    var id = req.body.id, del = req.body["delete"];
    if (id === undefined) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("Bad POST Request! Missing ID for input "
              + type + " json.");
      console.log("Bad POST Request! Missing ID for input "
              + type + " json.");
      console.log("body: " + JSON.stringify(req.body));
      return;
    }

    var targetObj = {id: id};
    data = JSON.parse(data);

    if (del) {
      for (var i = 0; i < data[type].length; ++i) {
        if (data[type][i].id == id) {
          data[type].splice(i, 1);
          writeJson(fn, JSON.stringify(data), endPost);
          return;
        }
      }
      return;
    }
    //Searching for json in target file by id
    var found = false;
    for (var i = 0; i < data[type].length; ++i) {
      if (data[type][i].id == id) {
        targetObj = data[type][i];
        found = true;
        break;
      }
    }
    if (!found)
      data[type][data[type].length] = targetObj;

    //Updating target obj with updated properties in POST body
    for (var prop in req.body) {
      if (prop == "id")
        targetObj[prop] = parseInt(req.body[prop]);
      else
        targetObj[prop] = req.body[prop];
    }

    writeJson(fn, JSON.stringify(data), endPost);
  }
*/

});

function readJson(fn, cb) {
  fs.readFile(fn, "utf8", function(err, data) {
    if (err) throw err;

    cb(data);
  });
}

function writeJson(fn, data, cb) {
  fs.writeFile(fn, data, "utf8", function(err, data) {
    if (err) throw err;

    cb(data);
  });
}

app.listen(port);
