var gum = require('gum.js');

exports.init = function() {
	gum.db.write("bela");
}

exports.finished = function() {
	console.log("ui finished");
}
