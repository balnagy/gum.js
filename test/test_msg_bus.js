var sinon = require("sinon"), 
	assert = require("assert"),
	test_load = require("../loader").load;
	
var msg_bus = test_load("msg_bus.js");
var amqp = require('amqp');
	
describe("Message bus", function() {
	
	var sandbox;
	
	var bind,
		on,
		queue,
		publish,
		subscribe,
		createConnection,
		last_message_cb;
		
	var mock_amqp = function() {
		bind = sandbox.spy();
		subscribe = sandbox.spy(function(message_cb) {
			last_message_cb = message_cb;
		});
		on = sandbox.spy(function(a, cb) {
			cb();
		});
		queue = sandbox.spy(function(name, callback) {
			callback({
				'bind': bind,
				'subscribe': subscribe
			})
		});
		publish = sandbox.spy();
		createConnection = sandbox.stub(amqp, "createConnection", function() {
			return {
				on: on,
				queue: queue,
				publish: publish
			}
		});
	}
		
	before(function(){
		sandbox = sinon.sandbox.create();
	})
	
	afterEach(function() {
		sandbox.restore();
	})
	
	describe("Connect", function() {
		it("should connect to default server", function() {
			// given
			mock_amqp();
			msg_bus.connect();
			// when
			msg_bus.subscribe("db");
			// then
			assert(createConnection.calledOnce);
			assert(createConnection.calledWith({ host: 'localhost' }));
		})
	})

	describe("Subscribe", function() {
		it("should subscribe for queue", function() {
			// given
			mock_amqp();
			msg_bus.connect();
			// when
			msg_bus.subscribe("db");
			// then
			assert(on.calledOnce);
			assert(queue.calledOnce);
			assert(queue.calledWith("db"));
		})
		
		it("should decode message", function() {
			// given
			mock_amqp();
			var cb_spy = sandbox.spy();
			msg_bus.connect();
			msg_bus.subscribe("db", cb_spy);
			// when
			last_message_cb({key: "value"});
			// then
			assert(cb_spy.calledOnce);
			assert(cb_spy.calledWith({key: "value"}));
			//assert(queue.calledWith("db"));
		})
	})
	
	describe("Publish", function() {
		it("should publish for queue", function() {
			// given
			mock_amqp();
			msg_bus.connect();
			// when
			msg_bus.publish("db", {key: "value"});
			// then
			assert(publish.calledOnce);
			assert(publish.calledWith("db", {key: "value"}));
		})
	})
});