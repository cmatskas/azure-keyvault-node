var adalNode = require('adal-node'); // Used for authentication 
var moment = require('moment');
var azureKeyVault = require('azure-keyvault');

var clientId = '<your Azure AD Application Id>';
var clientSecret = '<your Azure AD Application secret>';
var vaultUri = '<your keyvault base URL>';
var apiVersion = 'api-version=2016-10-01';

var credentials = new azureKeyVault.KeyVaultCredentials(authenticator);
var client = new azureKeyVault.KeyVaultClient(credentials);

function createkey(keyname, callback){
  console.info(`Creating key with name: ${keyname}`);
  let keyType = 'RSA';
  client.createKey(vaultUri, keyname, keyType, getKeyOptions(), function(err, result) {
    if (err) {
        throw err;
    }
    console.info('Key created: ' + JSON.stringify(result));
    callback(result);
  });
}

function deletekey(keyname, callback){
  console.info('Deleting key...');
  client.deleteKey(vaultUri, keyname, function(err, result){
    if(err) {
        throw err;
    }
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
      callback(result.result.toString('base64'));
    });
}

function decrypt(kid, cipherText, callback){
    console.info(`Decrypting value ${cipherText}`);
    client.decrypt(kid,'RSA-OAEP', Buffer.from(cipherText, 'base64'), function (err, result){
        if (err){
            throw err;
        }    
        console.info('Decryption result: ' + JSON.stringify(result));
        callback(result);
    })
}

function createSecret(secretName, secretValue, callback){
    console.info(`Creating new secret with name ${secretName} and value ${secretValue}`);
    var attributes = { expires: moment().add(1, "year") };
    var secretOptions = {
        contentType: 'application/text',
        secretAttributes: attributes
    };

    client.setSecret(vaultUri, secretName, secretValue, secretOptions, function(err, result) {
      if (err) {
          throw err;
      }
      console.info('Secret written: ' + JSON.stringify(result, null, ' '));
      callback(result)
    });
}

function deleteSecret(secretName, callback){
    console.info(`Deleting secret with name ${secretName}`);
    
    client.deleteSecret(vaultUri, secretName, function(err, result) {
      if (err) {
          throw err;
      }
      console.info('Secret deleted successfully');
      callback(result)
    });
}

function getSecret(secretName, secretVersion, callback){
    var secretUri = vaultUri + "/secrets/" + secretName + '/' + secretVersion + '?' + apiVersion;
    console.info(`Retrieving secret: ${secretUri}`);
    client.getSecret(secretUri, null, function(err, result){
        if (err) {
            throw err;
        }
        console.log(`Secret value returned: ${result.value}`);
        callback(result);
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

function getKeyOptions(){
    var attributes = {};
    attributes.enabled = true;
    attributes.notBefore = moment().toNow();
    attributes.expires = moment().add(1,"year");

    let keyOptions = {};
    keyOptions.keySize = 2048;
    keyOptions.keyOps = ['encrypt', 'decrypt', 'sign', 'verify', 'wrapKey', 'unwrapKey'];
    keyOptions.tags = null;
    keyOptions.keyAttributes = JSON.stringify(attributes);

    return JSON.stringify(keyOptions);
}

module.exports.createkey = createkey;
module.exports.deletekey = deletekey;
module.exports.getallkeys = getallkeys;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.createSecret = createSecret;
module.exports.getSecret = getSecret;
module.exports.deleteSecret = deleteSecret;