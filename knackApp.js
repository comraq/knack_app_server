var express = require("express"),
    bodyParser = require("body-parser"),
    fs = require("fs");

var app = express(),
    port = process.argv[2] || process.env.PORT || 8080,
    JSON_PATH = "resources/json/";

app.use(bodyParser.json());

app.get("*", function(req, res) {
  var fn = getFn(req);
  if (fn === undefined) {
    //Bad Request
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad GET Request! Unrecognized Query.");
    return;
  }

  readJson(fn, endGet);
  function endGet(data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(data); 
  }
});

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
  var fn = getFn(req, type);
  if (fn === undefined) {
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Bad POST Request! Unrecognized Query.");
    return;
  }

  var type;
  if (fn == JSON_PATH + "tasks_workshops.json") {
    if (req.query.type === undefined
        || (req.query.type != "tasks" && req.query.type != "workshops")) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("Bad POST Request! Undefined Activity Type.");
      return;
    }
    type = req.query.type;
  } else
    type = req.params[0].substring(1);

  readJson(fn, updateJson);
  function updateJson(data) {
    var id = req.body.id;
    if (id === undefined) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("Bad POST Request! Missing ID for input "
              + type + " json.");
      return;
    }

    var targetObj = {id: id};
    data = JSON.parse(data);

    //Searching for json in target file by id
    for (var i = 0; i < data[type].length; ++i) {
      if (data[type][i].id == id) {
        targetObj = data[type][i];
        break;
      }
    }
    //Updating target obj with updated properties in POST body
    for (var prop in req.body)
      targetObj[prop] = req.body[prop];

    writeJson(fn, JSON.stringify(data), endPost);
  }

  function endPost(data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(data); 
  }
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
