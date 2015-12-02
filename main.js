var http = require('http');
var restify = require('restify');
var kvservice = require('./kvservice');

var port = 3000;

var server = restify.createServer();

server.get('/createkey/:keyname', function(req, res, next){
  kvservice.createkey(req.params.keyname, function(result){
    res.send('key created successfully: ' + result.key.kid);
  });
  next();
})

server.del('/deletekey/:keyname', function(req, res, next){
  kvservice.deletekey(req.params.keyname, function(result){
    res.send('key deleted successfully');
  });
  next();
})

server.get('/getallkeys/:maxnumber', function(req, res, next){
  kvservice.getallkeys(req.params.maxnumber, function(result){
    res.send(`Retrieved : ${result} keys`);
  });
  next();
})

server.listen(port, function(){
  console.log(`${server.name} listening at ${server.url}`);
});