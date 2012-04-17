var libpath = process.env['GUM_COV'] ? './lib-cov/' : './lib/';

exports.load = function(file) {
	return require(libpath + file);
}
