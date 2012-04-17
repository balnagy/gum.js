var gum = require('gum.js');

exports.write = function(something) {
	console.log(something);
	gum.frontend.finished();
}
