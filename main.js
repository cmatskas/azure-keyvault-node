var http = require('http');
var restify = require('restify');
var kvservice = require('./kvservice');

var port = 3000;

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser()); 

server.post('/createkey/:keyname', function(req, res, next){
  kvservice.createkey(req.params.keyname, function(result){
    res.send(`key created successfully: ${result.key.kid}`);
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
    res.send(result);
  });
  next();
})

server.post('/encrypt/', function(req, res, next){
    kvservice.encrypt(req.body.keyId, req.body.data, function(result){
        res.send(result);
    });
    next();
})

server.post('/decrypt/', function(req, res, next){
    kvservice.decrypt(req.body.keyId, req.body.data, function(result){
        res.send(result.result.toString('utf8'));
    });
    next();
})

server.post('/createsecret/:secretname/:secretvalue', function(req, res, next){
    kvservice.createSecret(req.params.secretname, req.params.secretvalue, function(result){
        res.send(result.id);
    });
    next();
})

server.get('/getsecret/:secretname/:secretversion', function(req, res, next){
  kvservice.getSecret(req.params.secretname, req.params.secretversion, function(result){
    res.send(result.value.toString());
  });
  next();
})

server.del('/deletesecret/:secretname', function(req, res, next){
  kvservice.deleteSecret(req.params.secretname, function(result){
    res.send('Secret deleted successfully');
  })
  next();
});

server.listen(port, function(){
  console.log(`${server.name} listening at ${server.url}`);
});