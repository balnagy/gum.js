var sinon = require("sinon"), 
	assert = require("assert"),
	test_load = require("../loader").load;
	
var gum = test_load("gum.js");
	
describe("Gum", function() {
	
	var sandbox;
	var msg_bus;
	var mock_publish;
	var mock_subscribe;
	var mock_connect;
		
	before(function(){
		sandbox = sinon.sandbox.create();
		msg_bus = test_load("msg_bus.js");
	})
	
	beforeEach(function() {
		gum.init();
		mock_connect = sandbox.stub(msg_bus, "connect");
		mock_publish = sandbox.stub(msg_bus, "publish");
		mock_subscribe = sandbox.stub(msg_bus, "subscribe");
	})

	afterEach(function() {
		sandbox.restore();
	})
	
	
	describe("Init", function() {
		var initcheck = function() {
			assert.ok(gum);
			assert.ok(gum.chew);
			assert.ok(gum.init);
			assert.equal(Object.keys(gum).length, 2);
		}
		
		it("should init", function() {
			initcheck();
		})
		
		it("should remove old functions", function() {
			// given
			gum.bubba = {
				"func": function() {}
			}
			// when
			gum.init();
			// then
			initcheck();
		})
	})
	
	describe("Chew", function() {
		it("should keep original functions if no node type defined", function() {
			// given
			var func = function() {};
			gum.bubba = {
				"func": func
			}
			// when
			gum.chew();
			// then
			assert.equal(gum.bubba.func, func);
		})
		
		it("should not connectif no node type defined", function() {
			// given
			// when
			gum.chew();
			// then
			assert(!mock_connect.called);
		})
		
		it("should keep the original functions on a defined node type", function(done) {
			// given
			var func = function() {
				done();
			};
			gum.bubba = {
				"func": func
			}
			// when
			gum.chew(["bubba", "db"]);
			// then
			assert.equal(gum.bubba.func, func);
			gum.bubba.func();
		})
		
		it("should stub on a not defined node type", function() {
			// given
			var func = function() {};
			gum.bubba = {
				"func": func
			}
			// when
			gum.chew(["db"]);
			// then
			assert.notEqual(gum.bubba.func, func);
		})
		
		it("should listen on a defined node type", function() {
			// given
			gum.db = {
				"func": function() {}
			}
			// when
			gum.chew(["db"]);
			// then
			assert(mock_connect.calledOnce);
			assert(mock_subscribe.calledOnce);
			assert(mock_subscribe.calledWith("db"));
		})
		
		it("should call init", function() {
			// given
			var init = sandbox.spy();
			gum.db = {
				"init": init
			}
			// when
			gum.chew(["db"]);
			// then
			assert(init.calledOnce);
		})
	})
	
	describe("Stub", function() {
		it("should publish a message", function() {
			// given
			var func = sandbox.spy();
			gum.db = {
				"insert": func
			}
			gum.chew(["bubba"]);
			// when
			gum.db.insert("param1", "param2");
			// then
			assert(mock_publish.calledOnce);
			assert(mock_publish.calledWith('db', {
				method: 'insert', 
				params: ["param1", "param2"]
			}));
		})
	})
	
	describe("Listening", function() {
		it("should call proper function upon message", function() {
			// given
			var receive_callback;
			msg_bus.subscribe.restore();
			var mock_subscribe = sandbox.stub(msg_bus, "subscribe", function(queue, callback) {
				receive_callback = callback;
			});
			var mock_function_spy = sandbox.spy();
			gum.db = {
				"insert": mock_function_spy 
			}
			gum.chew(["db"]);
			// when
			receive_callback({
				method: "insert",
				params: ["param1", "param2"]
			});
			// then
			assert(mock_function_spy.calledOnce);
			assert(mock_function_spy.calledWith("param1", "param2"));
		})
	})
});
