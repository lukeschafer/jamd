/*
	in-built events:
		load: module finished loading (pretty much pointless...);
*/
(function() {
	var moduleCache = {};
	var config = {};
	
	window.jamd = jamd;
	jamd.require = require;
	window.require = window.require || require;
	window.define = window.define || jamd;
	jamd.module = getModule;
	jamd.config = function(cfg) {config = cfg;};
	
	function jamd(name, deps, fn) {
		if (!(deps instanceof Array)) { fn = deps; deps=[] }
		
		var module = {
			name: name,
			_events: [],
			exports: {},
			reset: function() { 
				var newMod = jamd(name,fn);
				module.trigger('reset', [newMod]);
			},
			remove: function() {
				delete moduleCache[name];
				module.trigger('remove');
			},
			on: function(evt, handler) {
				if (typeof handler != 'function') return;
				module._events[evt] = module._events[evt] || [];
				module._events[evt].push(handler);
			},
			trigger: function(evt, paramsArray) {
				var handlers = module._events[evt];
				if (!handlers) return;
				for (var i = 0; i < handlers.length; i++) {
					try {
						handlers[i].apply(module.exports, paramsArray);
					} catch (e) {
						log ("jamd: error handling event '" + evt + "' on module '" + name + "'", e);
					}
				}
			},
			dependencies: deps || []
		};
		var def = moduleCache[name] = {
			resolver: function(deps) {
				deps.push(module);
				var ret = fn.apply(module, deps);
				if (ret) module.exports = ret;
				module.trigger('load');
				return module.exports;
			},
			dependencies: module.dependencies
		}
		return module;
	}
	
	//require('a', fn(a) {});
	//require('a','b', fn(a,b) {});
	//require(['a','b'], fn(a,b) {});
	function require() {
		var args = Array.prototype.slice.call(arguments, 0);
		if (args.length == 0) logAndThrow("jamd: require needs arguments");
		if (args.length == 1 || typeof args[args.length-1] != 'function') logAndThrow("jamd: require needs at least 1 dependency and a callback");

		var deps = (args[0] instanceof Array && args.length == 2) ? args[0] : args.slice(0, args.length-1);
		var callback = args[args.length-1];
		
		var resolved = [];
		for (var i = 0, l = deps .length; i < l; i++) {
			resolve(deps [i], function(m) { 
				resolved.push(m);
				if (deps.length == resolved.length) callback.apply(jamd, resolved);
			});
		}
	}
	
	function loadAsync(name, callback) {
		var complete, s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = (config.scriptRoot ? config.scriptRoot + '/' : '') + name + (name.indexOf('.js') > 0 ? '' : '.js');
		s.onload = s.onreadystatechange = function() {
			if (!complete && (!this.readyState || this.readyState == 'complete')) {
				complete = true;
				setTimeout(function() {resolve(name, function(m){callback(m);})}, 1);
			}
		};
		function add() {
			if (!document.body)
				setTimeout(add, 1);
			else
				document.body.appendChild(s);
		}
		add();
	}
	
	function resolve(name, callback) {
		var cached = moduleCache[name];
		if (!cached) return loadAsync(name, callback);
		if (cached._instance) return callback(cached._instance);
		
		if (!cached.dependencies.length) {
			return callback(cached._instance = cached.resolver([]));
		}
		require(cached.dependencies, function() {
			var args = Array.prototype.slice.call(arguments, 0);
			return callback(cached._instance = cached.resolver(args));
		});
	}
	
	function getModule(name) {
		return moduleCache[name];
	}
	
	function logAndThrow() {
		var args = Array.prototype.slice.call(arguments, 0);
		if (console.log) console.log(arguments);
		throw args.join(', ');
	}
	
	function log() {
		if (console.log) console.log(arguments);
	}
})();