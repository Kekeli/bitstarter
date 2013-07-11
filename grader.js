#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://blooming-sands-7854.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("Error: File %s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlValid = function(url) {
    // todo: verify it begins with http  etc.
    return url.toString();;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(html) {
    return cheerio.load(html);
}

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);

    return checkHtml($, checksfile);
};

var checkUrl = function(data, checksfile) {
	$ = cheerioUrl(data); 
	return checkHtml($, checksfile);
};

var checkHtml = function(cheerioInput, checksfile) {
    $ = cheerioInput;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Url of file to check', clone(assertUrlValid), URL_DEFAULT)
        .option('-v, --verbose', 'Verbose mode')
        .parse(process.argv);

    if (program.verbose) {
	console.log("Input");
	console.log("  Checks: %s", program.checks);
	console.log("  Url: %s", program.url);
	console.log("  File: %s", program.file);
    }
    if (program.url) {
	rest.get(program.url)
	    .on('success', function(result) {
		var checkJson = checkUrl(result, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    })
	    .on('error', function(result) {
		console.log("Error: Invalid url %s. Exiting.", program.url);
		process.exit(1);
	    });
    }
    else {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = checkUrl;
}
