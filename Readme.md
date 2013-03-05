# jam'd

  jam'd (pronounced 'jammed') stands for Javascript AMD, and is an AMD implementation aiming to provide full AMD functionality, without requiring (but supporting) scripts to actually be loaded asyncronously, or requiring any pre/post build steps.

## Why?

  Simply because the exact feature-set we wanted for several projects couldn't be found in existing libs. RequireJS is the best out there, but isn't quite what we want.

## Author(s)

  Luke Schafer
  
## Quick Start

    define('foo', function() {
        this.exports.value = 1
    });
    define('bar', ['foo'], function(foo, module) {
        module.exports.fn = function() { alert(foo.value); };
    });
    require('bar', 'foo', function(bar, foo) {
        foo.value = foo.value + 1;
		bar.fn(); //alerts 2
    });

    //note: define == jamd and require == jamd.require
    //      define and require are only added to local scope if no existing methods exist
    
## A bit more

  If you require 'lib/foo' and it is not defined, jamd will try and load it from {current_path}/lib/foo.js

  You can change the base path by calling:
  
    jamd.config({scriptRoot: '/Scripts'}); //without a trailing slash

  which resolves to /Scripts/lib/foo.js which, of course is from the root of your host
  
  You can set the default timeout period for loading scripts, default 10,000ms
  
    jamd.config({scriptTimeout: 2000}); // 2 seconds 
	
## Tests

  QUnit, found in tests/
  
  PhantomJs in tests/phantomjs ban be used to run the qunit tests. run phantomRunner.bat
  
## To do

  * allow explicit mapping of key to source, so map require('someScript', ... to 'http://www.test.com/js/someScript.js'
  * more events? 
  * investigate whether to disallow muliple concurrent attempts to load async-load a module (subsequent attempts should wait) - at the moment it kinda just works...

## License: The MIT License

Copyright (c) 2011 Luke Schafer

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
