var gcm = require('node-gcm');
var message = new gcm.Message();

var regTokens = ["APA91bEZsNUNtgwVwMsJNL4P58wSjs0d9tUsPXE-RAjpbgu7xM4SPr3hixZhhiaLqYzT2Gr4jarwtm5Dy9_255AU7vCpDBPlrLVOqdok8W_GkgpmDKfarGtO04OxS2mG8LRXC6ilCf5X"];
var sender = new gcm.Sender('AIzaSyBN94xyDvcaz_UHa5VhmgblORq9ENigtL4');

exports.sendMessage = function(regTokens, msg) {
	message.addData('wom', msg)
  sender.send(message, { registrationTokens: regTokens }, function(err, response) {
    if (err) console.error(err);
    else console.log(response);
  });
}

exports.sendMsg = function*(next) {
	message.addData('wom', 'hello')
	sender.send(message, { registrationTokens: regTokens }, function(err, response) {
    if (err) console.error(err);
    else console.log(response);
  });
}
