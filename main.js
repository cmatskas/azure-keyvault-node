var http = require('http');
var restify = require('restify');
var kvservice = require('./kvservice');

var port = 3000;

var server = restify.createServer();
server.use(restify.queryParser());

server.get('/createkey/:keyname', function(req, res, next){
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

server.get('/encrypt/', function(req, res, next){
    var keyId = 'https://cmtestvault1.vault.azure.net/keys/mykey';
    kvservice.encrypt(keyId, "Some text to encrypt", function(result){
        res.send(result.value);
    });
    next();
})

server.get('/decrypt/', function(req, res, next){
    var keyId = 'https://cmtestvault1.vault.azure.net/keys/mykey';
    var cipher = "g57cL/dQeqPB2stt4y8ZY6pm5+6fhE+zgictjziUp/bWOjjeB+8pujnm8Bv+pplGc3+ECnpbwWru1CkmSCjXW1fCdek2Wd2cxNtKxTFXlpjdgPAYcoqXGPdtBtJRuw1lK7Ii/6MrHjQyn3Q2qRsMN8rHqa32ZpbS13FIZwNkMAOzm6ixZC4rLtniZr3JJDlQ6bh45F1olRFS8MePMcPkI1Fg84XXjDh4/S0S84VFtnU1w/RdH9HIrXl649Vys0Y8qhGBNIlUm/7Ua6lkQE4v6ViQtrNleUprju1Q2SU+F2Rfj8RqoNinAiOgIiE5WkpXCOv7iH64UC7CTUCinjaNsA==";
    kvservice.decrypt(keyId, cipher, function(result){
        res.send(result.value.toString());
    });
    next();
})

server.get('/createsecret/:secretname/:secretvalue', function(req, res, next){
    kvservice.createSecret(req.params.secretname, req.params.secretvalue, function(result){
        res.send(result.id);
    });
    next();
})

server.get('/getsecret/:secretname/:secretversion', function(req, res, next){
  kvservice.getSecret(req.params.secretname, req.params.secretversion, function(result){
    res.send(result.value.toString());
  })
})

server.listen(port, function(){
  console.log(`${server.name} listening at ${server.url}`);
});