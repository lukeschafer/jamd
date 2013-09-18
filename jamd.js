/*
	in-built events:
		load: module finished loading (pretty much pointless...);
		remove:
	config: scriptTimeout: milliseconds to wait for script load, default 10000
			scriptRoot: base root of all scripts
*/
(function() {
	var moduleCache = {};
	var config = {};
	var mappings = {};
	var endsInJs = /[.]js$/ig;
	
	window.jamd = jamd;
	jamd.require = require;
	window.require = window.require || require;
	window.define = window.define || jamd;
	jamd.module = getModule;
	jamd.config = function(cfg) {config = cfg;};
	jamd._clear = function() { moduleCache = {}; }; //useful for tests
	jamd.map = map;
	
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
				delete moduleCache[(name||'').replace(endsInJs,'')];
				module.trigger('remove');
			},
			on: function(evt, handler) {
				if (typeof handler != 'function') return;
				module._events[evt] = module._events[evt] || [];
				module._events[evt].push(handler);
			},
			trigger: function(evt, paramsArray) {
				var handlers = module._events[evt];
				paramsArray = paramsArray || [];
				if (!handlers) return;
				for (var i = 0; i < handlers.length; i++) {
					try {
						handlers[i].apply(module, paramsArray);
					} catch (e) {
						log ("jamd: error handling event '" + evt + "' on module '" + name + "'", e);
					}
				}
			},
			dependencies: deps || []
		};
		var def = moduleCache[(name||'').replace(endsInJs,'')] = {
			resolver: function(deps) {
				deps.push(module);
				var ret = fn.apply(module, deps);
				if (ret) module.exports = ret;
				module.trigger('load', [module.exports]);
				return module.exports;
			},
			dependencies: module.dependencies,
			module:module
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
		
		var finished = 0;
		var resolved = [];
		for (var i = 0, l = deps.length; i < l; i++) {
			(function(idx) {
				resolve(deps[idx], function(m) { 
					resolved[idx] = m;
					finished++;
					if (deps.length == finished) setTimeout(function() {callback.apply(jamd, resolved);}, 1);
				});
			})(i);
		}
	}
	
	function loadAsync(name, callback) {
		var location = mappings[name] || (config.scriptRoot ? config.scriptRoot + '/' : '') + name;
		location = location + (endsInJs.test(location) ? '' : '.js');
		
		var complete, s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = location;
		var count = 0;
		s.onload = s.onreadystatechange = function() {
			if (!complete && (!this.readyState || this.readyState == 'complete')) {
				complete = true;
				return setTimeout(done, 1);
			}
		};
		
		setTimeout(function() { if (complete) return; done(); }, config.scriptTimeout || 10000);
		
		function done() {
			try { document.body.removeChild(s); } catch(e) { log('jamd: failed removing script tag', e); }
			if (mappings[name] && !moduleCache[name]) moduleCache[name] = moduleCache[mappings[name]];
			callback();
		}
		
		function add() {
			if (!document.body)
				setTimeout(add, 1);
			else
				document.body.appendChild(s);
		}
		add();
	}
	function resolve(name, callback, failOnNoFind) {
		var cached = moduleCache[(name||'').replace(endsInJs,'')];
		
		if (!cached) {
			if (failOnNoFind) {
				callback(null);
				log('jamd: could not find module ' + name);
				return;
			}
			return loadAsync(name, function done() {
				resolve(name, function(m){
					callback(m);
				}, true)
			});
		}
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
		var loader = moduleCache[(name||'').replace(endsInJs,'')];
		return loader ? loader.module : null;
	}
	
	function logAndThrow() {
		var args = Array.prototype.slice.call(arguments, 0);
		if (console.log) console.log(arguments);
		throw args.join(', ');
	}
	
	function log() {
		if (console.log) console.log(arguments);
	}
	
	function map(label, source) {
		mappings[label] = source.replace(endsInJs,'');
	}
})();