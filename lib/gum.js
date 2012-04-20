var msg_bus = require("./msg_bus"),
	argv = require('optimist').argv;
	
var original_keys;
var node_types;

var original = function(property_name) {
	return property_name == "chew" || property_name == "init";
}

var needs_to_be_stub = function(property_name) {
	if(node_types && node_types.indexOf(property_name) < 0) {
		return true;
	}
	return false;
}

var make_stub = function(property_name) {
	var to_stub = exports[property_name];
	for(var function_name in to_stub) {
		if(typeof to_stub[function_name] === 'function') {
			to_stub[function_name] = function() {
				var args = Array.prototype.slice.call(arguments);
				msg_bus.publish(property_name, {
					method: function_name,
					params: args
				});
			}
		}
	}
}

var subscribe = function(property_name) {
	//console.log("subscribed for: " + property_name);
	msg_bus.subscribe(property_name, function(message) {
		//console.log(message);
		var method = message.method;
		var params = message.params;
		exports[property_name][method].apply(exports[property_name], params);
	});	
}

var chew = function(_node_types) {
	var inits = [];
	node_types = _node_types;
	if(typeof argv.g === 'string') {
		node_types = argv.g.split(',');
	}
	if(node_types){
		msg_bus.connect();
	}
	for(var property_name in exports) {
		if(!original(property_name)) {
			if(needs_to_be_stub(property_name)) {
				make_stub(property_name);
			} else {
				if(node_types) {
					subscribe(property_name);		
				}
				if(typeof exports[property_name]['init'] === 'function') {
					inits.push(exports[property_name]['init']);
				}
			}
		}
	}
	for(var init in inits) {
		inits[init]();
	}
}

var init = function() {
	for(var property_name in exports) {
		if(!original(property_name)) {
			delete exports[property_name];
		}
	}
	exports.chew = chew;
	exports.init = init;	
}

init();
