var assert = require('assert');
var path = require('path');
var fs = require('fs');
var os = require('os');
var exec = require('child_process').execFile;
var cmd = path.join(__dirname, "..", "bin/sipa-live-server.js");
var opts = {
	timeout: 2000,
	maxBuffer: 1024
};
function exec_test(args, execOpts, callback) {
	if (typeof execOpts === 'function') {
		callback = execOpts;
		execOpts = {};
	}
	var runOpts = Object.assign({}, opts, execOpts);
	if (process.platform === 'win32')
		exec(process.execPath, [ cmd ].concat(args), runOpts, callback);
	else
		exec(cmd, args, runOpts, callback);
}

describe('command line usage', function() {
	it('--version', function(done) {
		exec_test([ "--version" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("sipa-live-server") === 0, "version not found");
			done();
		});
	});
	it('--help', function(done) {
		exec_test([ "--help" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Usage: sipa-live-server") === 0, "usage not found");
			done();
		});
	});
	it('--quiet', function(done) {
		exec_test([ "--quiet", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout === "", "stdout not empty");
			done();
		});
	});
	it('--port', function(done) {
		exec_test([ "--port=16123", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Serving") >= 0, "serving string not found");
			assert(stdout.indexOf("at http://127.0.0.1:16123") != -1, "port string not found");
			done();
		});
	});
	it('--host', function(done) {
		exec_test([ "--host=localhost", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Serving") >= 0, "serving string not found");
			assert(stdout.indexOf("at http://localhost:") != -1, "host string not found");
			done();
		});
	});
	it('--htpasswd', function(done) {
		exec_test(
			[ "--htpasswd=" + path.join(__dirname, "data/htpasswd-test"),
				"--no-browser",
				"--test"
			], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("Serving") >= 0, "serving string not found");
			done();
		});
	});
	it('loads local config from cwd first', function(done) {
		var tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sipa-live-server-cli-'));
		var tempHome = path.join(tempRoot, 'home');
		var tempCwd = path.join(tempRoot, 'cwd');
		fs.mkdirSync(tempHome);
		fs.mkdirSync(tempCwd);
		fs.writeFileSync(path.join(tempHome, '.sipa-live-server.json'), JSON.stringify({ port: 16234 }));
		fs.writeFileSync(path.join(tempCwd, '.sipa-live-server.json'), JSON.stringify({ port: 16235 }));

		exec_test([ "--no-browser", "--test" ], {
			cwd: tempCwd,
			env: Object.assign({}, process.env, { HOME: tempHome, USERPROFILE: tempHome })
		}, function(error, stdout, stdin) {
			fs.rmSync(tempRoot, { recursive: true, force: true });
			assert(!error, error);
			assert(stdout.indexOf("at http://127.0.0.1:16235") !== -1, "local config port not used");
			done();
		});
	});
	it('falls back to home config when no local config exists', function(done) {
		var tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sipa-live-server-cli-'));
		var tempHome = path.join(tempRoot, 'home');
		var tempCwd = path.join(tempRoot, 'cwd');
		fs.mkdirSync(tempHome);
		fs.mkdirSync(tempCwd);
		fs.writeFileSync(path.join(tempHome, '.sipa-live-server.json'), JSON.stringify({ port: 16236 }));

		exec_test([ "--no-browser", "--test" ], {
			cwd: tempCwd,
			env: Object.assign({}, process.env, { HOME: tempHome, USERPROFILE: tempHome })
		}, function(error, stdout, stdin) {
			fs.rmSync(tempRoot, { recursive: true, force: true });
			assert(!error, error);
			assert(stdout.indexOf("at http://127.0.0.1:16236") !== -1, "home config port not used");
			done();
		});
	});
});
