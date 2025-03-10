# sipa-live-server

[![npm package](https://img.shields.io/npm/v/sipa-live-server?color=default&style=plastic&logo=npm)](https://www.npmjs.com/package/typifier)
![downloads](https://img.shields.io/npm/dt/sipa-live-server?color=blue&style=plastic)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg?style=plastic&logo=mit)](LICENSE)

> A web development http server with live reload and hot reload capabilities.

This project was originally forked by [live-server](https://github.com/tapio/live-server) and then heavily revised and extended.

**TALBE OF CONTENTS**
* [Common information](#common-information)
* [Installation](#installation)
* [Usage](#usage)
* [Documentation](#documentation)
* [Contributing](#contributing)



<a name="common-information"></a>
## Common information
This is web a development server with live reload and hot reload capability for JavaScript web developers.

It was developed especially for use with [sipa web framework](https://github.com/sipa-js/sipa), but can also be used independently, thanks to a separate configuration file.

* Basically it just serves your static files through http/https instead of using the `file://` protocol, to allow using AJAX calls for example.
* Page reload automatically happens if some specified files are changed
* Hot style sheet reload support: CSS files can be automatically refreshed without page reload
* Hot javascript class reloading support: JS classes can be replaced automatically without page reload

All the mentioned features can be configured to specify the webservers actions on specified file modifications.

There is no need for browser plugins, etc. Everything works just out of the box.




<a name="installation"></a>
## Installation


### Requirements
Before you can start with the installation of `sipa-live-sever`, you need to have installed

* [Node.js](https://nodejs.org/en/download/) runtime version 16.x or above

After installation you can check if it has been succeeded successfully, by running the following on the command line:

```bash
node -v
```

You should get a output of the node version like this

```bash
v16.18.0
```



### Setup
To install the server and its CLI, run the following command:

```bash
npm install -g sipa-live-server
```

After installation you can check if it has been succeeded successfully, by running the following on the command line:

```bash
sipa-live-server -v
```

You should get a output of the server version like this

```bash
sipa-live-server 1.4.0 @ 2024-02-03T17:45:36.170Z`
```




<a name="usage"></a>
## Usage

Issue the command `sipa-live-server` in your project's directory. Alternatively you can add the path to serve as a command line parameter.

This will automatically launch the default browser. When you make a change to any file, the browser will reload the page - unless it was a CSS file in which case the changes are applied without a reload.

Command line parameters:

* `--port=NUMBER` - select port to use, default: PORT env var or 8080
* `--host=ADDRESS` - select host address to bind to, default: IP env var or 0.0.0.0 ("any address")
* `--no-browser` - suppress automatic web browser launching
* `--browser=BROWSER` - specify browser to use instead of system default
* `--quiet | -q` - suppress logging
* `--verbose | -V` - more logging (logs all requests, shows all listening IPv4 interfaces, etc.)
* `--open=PATH` - launch browser to PATH instead of server root
* `--watch=PATH` - comma-separated string of paths to exclusively watch for changes (default: watch everything)
* `--ignore=PATH` - comma-separated string of paths to ignore ([anymatch](https://github.com/es128/anymatch)-compatible definition)
* `--ignorePattern=RGXP` - Regular expression of files to ignore (ie `.*\.jade`) (**DEPRECATED** in favor of `--ignore`)
* `--no-css-inject` - reload page on CSS change, rather than injecting changed CSS
* `--middleware=PATH` - path to .js file exporting a middleware function to add; can be a name without path nor extension to reference bundled middlewares in `middleware` folder
* `--entry-file=PATH` - serve this file (server root relative) in place of missing files (useful for single page apps)
* `--mount=ROUTE:PATH` - serve the paths contents under the defined route (multiple definitions possible)
* `--spa` - translate requests from /abc to /#/abc (handy for Single Page Apps)
* `--wait=MILLISECONDS` - (default 100ms) wait for all changes, before reloading
* `--htpasswd=PATH` - Enables http-auth expecting htpasswd file located at PATH
* `--cors` - Enables CORS for any origin (reflects request origin, requests with credentials are supported)
* `--https=PATH` - PATH to a HTTPS configuration module
* `--https-module=MODULE_NAME` - Custom HTTPS module (e.g. `spdy`)
* `--proxy=ROUTE:URL` - proxy all requests for ROUTE to URL
* `--help | -h` - display terse usage hint and exit
* `--version | -v` - display version and exit

Default options:

If a file `~/.sipa-live-server.json` exists it will be loaded and used as default options for sipa-live-server on the command line. See "Usage from node" for option names.




### Usage from node
```javascript
var sipa_live_server = require("sipa-live-server");

var params = {
	port: 8181, // Set the server port. Defaults to 8080.
	host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
	root: "/public", // Set root directory that's being served. Defaults to cwd.
	open: false, // When false, it won't load your browser by default.
	ignore: 'scss,my/templates', // comma-separated string for paths to ignore
	file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
	wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
	mount: [['/components', './node_modules']], // Mount a directory to a route.
	logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
	middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};
sipa_live_server.start(params);
```




### HTTPS
In order to enable HTTPS support, you'll need to create a configuration module.
The module must export an object that will be used to configure a HTTPS server.
The keys are the same as the keys in `options` for [tls.createServer](https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener).

For example:

```javascript
var Fs = require("fs");

module.exports = {
	cert: Fs.readFileSync(__dirname + "/server.cert"),
	key: Fs.readFileSync(__dirname + "/server.key"),
	passphrase: "12345"
};
```

If using the node API, you can also directly pass a configuration object instead of a path to the module.




### HTTP/2
To get HTTP/2 support one can provide a custom HTTPS module via `--https-module` CLI parameter (`httpsModule` option for Node.js script). **Be sure to install the module first.**
HTTP/2 unencrypted mode is not supported by browsers, thus not supported by `sipa-live-server`. See [this question](https://http2.github.io/faq/#does-http2-require-encryption) and [can I use page on HTTP/2](http://caniuse.com/#search=http2) for more details.

For example from CLI(bash):

	sipa-live-server \
		--https=path/to/https.conf.js \
		--https-module=spdy \
		my-app-folder/


### Troubleshooting
* No reload on changes
	* Open your browser's console: there should be a message at the top stating that live reload is enabled. Note that you will need a browser that supports WebSockets. If there are errors, deal with them. If it's still not working, [file an issue](https://github.com/sipa-js/sipa-live-server/issues).
* Error: watch <PATH> ENOSPC
	* See [this suggested solution](http://stackoverflow.com/questions/22475849/node-js-error-enospc/32600959#32600959).
* Reload works but changes are missing or outdated
	* Try using `--wait=MS` option. Where `MS` is time in milliseconds to wait before issuing a reload.




## How it works

The server is a simple node app that serves the working directory and its subdirectories. It also watches the files for changes and when that happens, it sends a message through a web socket connection to the browser instructing it to reload. In order for the client side to support this, the server injects a small piece of JavaScript code to each requested html file. This script establishes the web socket connection and listens to the reload requests. CSS files can be refreshed without a full page reload by finding the referenced stylesheets from the DOM and tricking the browser to fetch and parse them again.


## Contributing
We welcome contributions! See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details.
