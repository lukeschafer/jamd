# jamd

  jamd (pronounced 'jammed') stands for Javascript AMD, and is an AMD implementation aiming to provide full AMD functionality, without requiring (but supporting) scripts to actually be loaded asyncronously, or requiring any pre/post build steps.

## Why?

  Simply because the exact feature-set we wanted for several projects couldn't be found in existing libs. RequireJS is the best out there, but isn't quite what we want (support for transparent runtime module minification/combining, etc).

## Author(s)

  Luke Schafer
  
## Quick Start

    define('foo', function() {
        this.exports.value = 1;
        //or
        this.exports = { value: 1};
        //or
        return { value: 1};
    });
    define('bar', ['foo'], function(foo, module) {
        module.exports.fn = function() { alert(foo.value); };
    });
    require('bar', 'foo', function(bar, foo) {
        foo.value = foo.value + 1;
		bar.fn(); //alerts 2
    });

    //note: define === jamd and require === jamd.require
    //      define and require are only added to global scope if no existing methods exist
    
## API

  TIP: If you require 'lib/foo' and it is not defined, jamd will try and load it from {current_path}/lib/foo.js
  
### Configuration

  Usage: jamd.config({ ... });
  
  All options have sensible defaults.
  
<table>
  <tr>
    <th>Option</th><th>Example</th><th>Description</th>
  </tr>
  <tr>
    <td>scriptRoot</td><td>jamd.config({scriptRoot: '/Scripts'});</td><td>Changes the base path for locating modules asyncronously. **No trailing slash.**</td>
  </tr>
  <tr>
    <td>scriptTimeout</td><td>jamd.config({scriptTimeout: 2000});</td><td>Set the default timeout period for loading scripts, default 10,000ms</td>
  </tr>
</table>

### Map

  You can map an alias to a specific file. This is handy for asyncronously loading a module from a different server
  
    jamd.map('testing', 'myscripts/test.js');
    
  or even
  
    jamd.map('testing', 'http://cdn.another.domain.com/scripts/test.js');
    
### Events

  There are several ways to bind to modules:
  
    define('foo', function(module) { module.on('remove', function() { /* this === foo */}) });
    
    jamd.module('foo').on('load', function(a, b) {});
    
  and to trigger manually:
  
    jamd.module('foo').trigger('eventname');
    
    jamd.module('foo').trigger('eventname', [1, 2]); //args used e.g. .on('eventname', function(a, b) {});
    
## Tests

  QUnit, found in tests.js
  
  PhantomJs in tests/phantomjs can be used to run the qunit tests. run phantomRunner.bat
  
## To do
  * more events? 
  * investigate whether to disallow muliple concurrent attempts to load async-load a module (subsequent attempts should wait) - at the moment it kinda just works by magic...

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
