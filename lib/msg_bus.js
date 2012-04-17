var amqp = require('amqp');

var connection;
var connection_ready = false;

var do_it_with_connection = function(what) {
	if(!connection) {
		connect();
	}
	if(!connection_ready) {
		connection.on('ready', what);
	} else {
		what();
	}
}

exports.connect = function() {
	connection = amqp.createConnection({ host: 'localhost' });
	connection.on('ready', function() {
		connection_ready = true;
	});
}

exports.subscribe = function(queue, callback) {
	//console.log(connection);
	do_it_with_connection(function() {
		connection.queue(queue, function(q){
			//console.log(queue);
			// Catch all messages
			q.bind('#');
			// Receive messages
			q.subscribe(function (message) {
    			callback(message);
  			});
	  	});
	})
};

exports.publish = function(queue, message) {
	//console.log("Publish on queue '" + queue + "':" + message);
	do_it_with_connection(function() {
		connection.publish(queue, message);
	})
};

