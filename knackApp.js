var express = require("express"),
    fs = require("fs");

var app = express();

app.get("*", function(req, res) {
  var query = req.url.substring(1), fn = "";
  switch (query) {
    case "tasks":
    case "workshops":
      fn = "tasks_workshops.json";
      break;
    case "badges":
      fn = "badges.json";
      break;
    case "earners":
      fn = "earners.json";
      break;
    default:
      //Do nothing, leave fn empty
      res.end("Invalid query! query: " + query);
      return;
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  fs.readFile(fn, "utf8", function(err, data) {
    if (err) throw err;

    res.end(data);
  });
});
app.listen(7777);
