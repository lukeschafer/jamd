# jam'd

  jam'd stands for Javascript AMD, and is an AMD implementation aiming to provide full AMD functionality, without requiring (but supporting) scripts to actually be loaded asyncronously, or requiring any pre/post build steps.


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

## A bit more

  If you require 'lib/foo' and it is not defined, jamd will try and load it from {current_path}/lib/foo.js

  You can change the base path by calling:
  
    jamd.config({scriptRoot: '/Scripts'}); //without a trailing slash

## Tests

  Coming

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