var adalNode = require('adal-node'); // Used for authentication 
var azureKeyVault = require('azure-keyvault');

var clientId = '1bbb4fd3-e903-4b00-afcb-afb9582b68b8';
var clientSecret = '9wDEgDndxLkxvZzuVm78Ux4cUcY/sYTt3kW77N3SLSA=';

var credentials = new azureKeyVault.KeyVaultCredentials(authenticator);
var client = new azureKeyVault.KeyVaultClient(credentials);

var vaultUri = 'https://CmTestVault1.vault.azure.net';
var kid;
var cipherText;

function createkey(keyname, callback){
  var request = { kty: "RSA", key_ops: ["encrypt", "decrypt"] };
  console.info('Creating key...');
  client.createKey(vaultUri, keyname, request, function(err, result) {
    if (err) {
        throw err;
    }
    console.info('Key created: ' + JSON.stringify(result));
    kid = result.key.kid;
    callback(result);
  });
}

function deletekey(keyname, callback){
  console.info('Deleting key...');
  client.deleteKey(vaultUri, keyname, function(err, result){
    if(err) {
        throw err;
    }
    kid = null;
    console.info('Key deleted: ' + JSON.stringify(result));
    callback(result);
  })
}

function getallkeys(maxresults, callback){
  console.info(`Retrieving ${maxresults} keys...`);
  client.getKeys(vaultUri, maxresults, function(err, result){
    if(err) {
        throw err;
    }
    console.info(`${result.value.length} keys returned.`);
    callback(result);
  })
}

function encrypt(kid, textToEncrypt, callback){
  console.info(`Encrypting ${textToEncrypt}`);
  client.encrypt(kid, 'RSA-OAEP', new Buffer(textToEncrypt), function(err, result) {
      if (err) {
          throw err;
      }
      console.info('Encryption result: ' + JSON.stringify(result));
      cipherText = result.value;
      callback(result);
    });
}

function decrypt(kid, cipherText, callback){
    console.info(`Decrypting value ${cipherText}`);
    client.decrypt(kid,'RSA-OAEP', cipherText, function (err, result){
        if (err){
            throw err;
        }    
        console.info('Decryption result: ' + JSON.stringify(result));
        callback(result);
    })
}

function createSecret(secretName, secretValue, callback){
    var request = {'value': secretValue};
    client.setSecret(vaultUri, secretName, request, function(err, result) {
      if (err) {
          throw err;
      }
      console.info('Secret written: ' + JSON.stringify(result, null, ' '));
      callback(result)
    });
}

function authenticator(challenge, callback) {
  // Create a new authentication context. 
  var context = new adalNode.AuthenticationContext(challenge.authorization);
  // Use the context to acquire an authentication token. 
  return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function(err, tokenResponse) {
      if (err) throw err;
      // Calculate the value to be set in the request's Authorization header and resume the call. 
      var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
      return callback(null, authorizationValue);
  });
}

module.exports.createkey = createkey;
module.exports.deletekey = deletekey;
module.exports.getallkeys = getallkeys;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.createSecret = createSecret;
module.exports.kid = kid;