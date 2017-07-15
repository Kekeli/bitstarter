var express = require('express'),
    fs = require('fs'),
    path = require("path");

var app = express();//.createServer(express.logger());

var port = process.env.PORT || 5000;
app.set('port', port)
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    //response.send('Hello World!')
  response.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function() {
  console.log("Node app is running at localhost:" + port)
});
