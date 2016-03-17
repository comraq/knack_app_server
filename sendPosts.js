var http = require("http")
    path = require("path");

(function main() {
  if (process.argv.length < 5) {
    console.log("Invalid arguments!");
    console.log("Usage: node " + path.basename(process.argv[1])
                + " [host] [port] [path] (type)");
    return;
  }
 
  var size = 0;
  switch (process.argv[4]) {
    case "activities":
      size = 7;
      break;
    case "earners":
      size = 6;
      break;
    case "badges":
      size = 19;
      break;
  }

  (function recurse(i) {
    if (i < size)
      sendOneRequest(process.argv.slice(2), i + 1, recurse);
  })(0);
})();

function sendOneRequest(arr, index, cb) {
  var options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };

  var entry = {id: null, name: null};
  var host = arr[0], 
      port = arr[1],
      req_path = "/" + arr[2];

  switch (req_path) {
    case "/activities":
      var type = arr[3];
      if ( type === undefined
          || (type != "tasks" && type != "workshops")) {
        throw new Error("Undefined type for activities!");
      }
      req_path += "?type=" + type;
      entry.description = null;
      entry.employer = null;
      entry.contact = null;
      entry["location"] = null;
      if (type == "tasks")
        entry.salary = null;
      break;

    case "/badges":
      entry.img = null;
      entry.description = null;
      break;

    case "/earners":
      entry["location"] = null;
      entry.img = null;
      entry.contact = null;
      break;

    default:
      throw new Error("Unrecognized path query!");
  }
  options.hostname = host;
  options.port = parseInt(port);
  options.path = req_path;

  var appendStr = "";
  for (var prop in entry) {
    switch(prop) {
      /*case "img":
        appendStr = ".jpg";
        break;*/
      case "contact":
        appendStr = "@example.com";
        break;
      case "description":
        appendStr = " description";
        break;
      default:
        appendStr = "";
    }
    var varStr = prop;
    if (prop == "name") {
      if (arr[3] !== undefined)
        entry[prop] = arr[3].slice(0, -1) + index + appendStr;
      else
        entry[prop] = arr[2].slice(0, -1) + index + appendStr;

    } else if (prop == "description")
      entry[prop] = "This is a description for " + entry.name;

    else if (prop == "employer")
      entry[prop] = varStr + (index % 2 + 1) + appendStr;

    else if (prop == "salary")
      entry[prop] = "$1" + (index % 2 + 1) + ".00/hr";

    else if (prop == "img" && arr[2] == "badges") {
      var prefix = "hs_";
      var i = index;
      if (index > 11) {
        prefix = "ss_";
        i -= 11;
      }
      entry[prop] = prefix + arr[2].slice(0, -1) + i;

    } else if (prop == "contact") {
      if (arr[3] !== undefined)
        entry[prop] = entry.employer + appendStr;
      else
        entry[prop] = entry.name + appendStr;

    } else
      entry[prop] = varStr + index + appendStr;
  }
  entry.id = parseInt(index);

  var req = http.request(options, function(res) {
    res.on("data", function(chunk) {
      console.log(chunk);
    })
    .on("end", function() {
      cb(index);
    });
  });
  req.write(JSON.stringify(entry));
  req.end();
}
