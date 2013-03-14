function teardown() { jamd._clear(); }
jamd.config({scriptTimeout: 2000});

module("basic tests", { teardown: teardown });

test("can define and require a module", function() {
	var underTest;
	define('foo', function() { this.exports.foo = 'foo'; });
	require('foo', function(foo) { 
		ok('foo' == foo.foo);
	});
});

test("can require many modules", function() {
	createModule('foo');
	createModule('bar');
	require('foo', 'bar', function(foo, bar) {
		ok(foo.myName == 'foo');
		ok(bar.myName == 'bar');
	});
});

test("can depend on many modules", function() {
	createModule('foo');
	createModule('bar');
	define('baz', ['foo', 'bar'], function(foo, bar) {
		this.exports = foo.myName + bar.myName;
	});
	
	require('baz', function(baz) {
		ok(baz == 'foobar');
	});
});

test("should get module param even with dependencies", function() {
	createModule('foo');
	createModule('bar');
	define('baz', ['foo', 'bar'], function(foo, bar, module) {
		this.exports.inputModule = module;
	});
	
	require('baz', function(baz) {
		ok(baz.inputModule === baz.inputModule.exports.inputModule)
	});
});

test("can remove a module", function() {
	define('foo', function() {  });
	jamd.module('foo').remove();
	ok(!jamd.module('foo'));
});

module("export tests", { teardown: teardown });

test("can export via 'this'", function() {
	define('foo', function() { this.exports.foo = 'foo'; });
	require('foo', function(foo) { 
		ok('foo' == foo.foo);
	});
});

test("can export via return", function() {
	define('foo', function() { return {foo : 'foo'}; });
	require('foo', function(foo) { 
		ok('foo' == foo.foo);
	});
});

test("can export via setting module.exports", function() {
	define('foo', function(module) { module.exports = {foo : 'foo'}; });
	require('foo', function(foo) { 
		ok('foo' == foo.foo);
	});
});

test("can export via adding to module.exports", function() {
	define('foo', function(module) { module.exports.foo = 'foo'; });
	require('foo', function(foo) { 
		ok('foo' == foo.foo);
	});
});

module("event tests", { teardown: teardown });

test("load events should trigger", function() {
	define('foo', function() { this.exports.foo = 'foo'; });
	jamd.module('foo').on('load', function(foo) {
		ok('foo' == foo.foo);
	});
	require('foo', function(foo) { });
});

test("remove events should trigger", function() {
	define('foo', function() { this.exports.foo = 'foo'; });
	jamd.module('foo').on('remove', function() {
		ok(!jamd.module('foo'));
	});
	jamd.module('foo').remove();
});

module("async tests", { teardown: teardown });

asyncTest("can load async with extension", function() {
	var start = failUnlessStarted();
	require('test_modules/t1.js', function(t1) {
		ok(t1.myName == 't1');
		start();
	});
});

asyncTest("can load async without extension", function() {
	var start = failUnlessStarted();
	require('test_modules/t1', function(t1) {
		ok(t1.myName == 't1');
		start();
	});
});

asyncTest("can load many async", function() {
	var start = failUnlessStarted();
	require('test_modules/t1', 'test_modules/t2', function(t1, t2) {
		ok(t1.myName == 't1' && t2.myName == 't2');
		start();
	});
});

asyncTest("get null on async load not found", function() {
	var start = failUnlessStarted();
	require('test_modules/doesntexist', function(t1) {
		ok(t1 === null);
		start();
	});
});

asyncTest("multiple requires on async should load same module", function() {
	var start = failUnlessStarted();
	var firstFetch, secondFetch;
	require('test_modules/t1', function(t1) {
		firstFetch = t1;
		t1.first = true;
		if (secondFetch) compare();
	});
	require('test_modules/t1', function(t1) {
		secondFetch = t1;
		t1.second = true;
		if (firstFetch) compare();
	});
	function compare() {
		ok(firstFetch === secondFetch && firstFetch.second && secondFetch.first);
		start();
	}
});

asyncTest("multiple requires with wait on async should load same module", function() {
	var start = failUnlessStarted();
	var firstFetch, secondFetch;
	require('test_modules/t1', function(t1) {
		firstFetch = t1;
		t1.first = true;
		if (secondFetch) compare();
	});
	setTimeout(function() {
		require('test_modules/t1', function(t1) {
			secondFetch = t1;
		t1.second = true;
			if (firstFetch) compare();
		});
	},100);
	function compare() {
		ok(firstFetch === secondFetch && firstFetch.second && secondFetch.first);
		start();
	}
});

module("mapping tests", { teardown: teardown });

asyncTest('can map a label to a source file', function () {
	var start = failUnlessStarted();
	
	jamd.map('testing', 'test_modules/t1.js');
	
	require('testing', function(t1) {
	debugger;
		ok(t1.myName == 't1');
		start();
	});
});

function failUnlessStarted() {
	var called;
	setTimeout(function() {
		if (called) return;
		start();
		throw 'async test didn\'t finish';
	}, 3000);
	return function() {
		called = true;
		start();
	}
}

function createModule(name) {
	define(name, function() {
		this.exports.myName = name;
	});
}