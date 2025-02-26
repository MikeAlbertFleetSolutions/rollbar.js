/**
 * Build and test rollbar.js
 *
 * Test with browserstack:
 *   $> BROWSER_STACK_USERNAME=username BROWSER_STACK_ACCESS_KEY=12345asdf grunt test --browsers=bs_ie_latest
 *
 */


'use strict';

import { sync } from 'glob';
import { basename } from 'path';
import pkg, { version as _version } from './package.json';
import { readFileSync } from 'fs';

import webpackConfig from './webpack.config.js';
import { filter } from './browserstack.browsers';


function findTests(context) {
  if (context !== 'browser') {
    return {};
  }
  var files = sync('test/**/!(server.)*.test.js');
  var mapping = {};

  files.forEach(function(file) {
    var testName = basename(file, '.test.js');
    mapping[testName] = file;
  });

  return mapping;
}

function buildGruntKarmaConfig(singleRun, browsers, tests, reporters) {
  var config = {
    options: {
      configFile: './karma.conf.js',
      singleRun: singleRun,
      files: [
        // Files that the tests will load
        {
          pattern: 'dist/**/*.js',
          included: false,
          served: true,
          watched: false
        },
        {
          pattern: 'src/**/*.js',
          included: false,
          served: true,
          watched: false
        },
        {
          pattern: 'examples/**/*.js',
          included: false,
          served: true,
          watched: false
        },

        // Examples HTML, set `included: true`, but they won't be executed or added
        // to the DOM until loaded explicitly during a test.
        {
          pattern: 'examples/**/*.html',
          included: true,
          served: true,
          watched: false
        }
      ]
    },
  };

  if (browsers && browsers.length) {
    config.options.browsers = browsers;
  }

  if (reporters && reporters.length) {
    config.options.reporters = reporters;
  }

  for (var testName in tests) {
    var testFile = tests[testName];
    var testConfig = config[testName] = {};

    // Special case for testing requirejs integration.
    // Include the requirejs module as a framework so
    // Karma will inclue it in the web page.
    if (testName === 'requirejs') {
      testConfig.files = [
        {src: './dist/rollbar.umd.js', included: false}
      ];
      // NOTE: requirejs should go first in case the subsequent libraries
      // check for the existence of `define()`
      testConfig.frameworks = ['requirejs', 'expect', 'mocha'];
    } else {
      testConfig.files = [{src: [testFile]}];
    }

    // Special config for BrowserStack IE tests
    if (testName.slice(0, 3) === 'bs' && testName.indexOf('ie_') >= 0) {
      // Long timeout since IE 6/7/8 is slow
      testConfig.captureTimeout = 60000 * 10;
    }
  }

  return config;
}


export default function(grunt) {
  require('time-grunt')(grunt);

  var browserTests = findTests('browser');
  var browsers = grunt.option('browsers');
  if (browsers) {
    browsers = browsers.split(',');

    var browserStackAliases = [];
    var nonBrowserStackAliases = [];
    browsers.forEach(function(browserName) {
      if (browserName.slice(0, 3) === 'bs_') {
        browserStackAliases.push(browserName);
      } else {
        nonBrowserStackAliases.push(browserName);
      }
    });

    var expandedBrowsers = filter.apply(null, browserStackAliases);
    var expandedBrowserNames = [];
    expandedBrowsers.forEach(function(browser) {
      expandedBrowserNames.push(browser._alias);
    });
    browsers = nonBrowserStackAliases.concat(expandedBrowserNames);
  }

  var singleRun = grunt.option('singleRun');
  if (singleRun === undefined) {
    singleRun = true;
  }

  var reporters = grunt.option('reporters');
  if (reporters !== undefined) {
    reporters = reporters.split(',');
  }

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-vows');


  var rollbarJsSnippet = readFileSync('dist/rollbar.snippet.js');
  var rollbarjQuerySnippet = readFileSync('dist/plugins/jquery.min.js');

  grunt.initConfig({
    pkg: pkg,
    webpack: webpackConfig,
    vows: {
      all: {
        options: {
          reporter: 'spec'
        },
        src: ['test/server.*.test.js']
      }
    },

    karma: buildGruntKarmaConfig(singleRun, browsers, browserTests, reporters),

    replace: {
      snippets: {
        src: ['*.md', 'src/**/*.js', 'examples/*.+(html|js)', 'examples/*/*.+(html|js)', 'docs/**/*.md'],
        overwrite: true,
        replacements: [
          // Main rollbar snippet
          {
            from: new RegExp('^(.*// Rollbar Snippet)[\n\r]+(.*[\n\r])*(.*// End Rollbar Snippet)', 'm'), // eslint-disable-line no-control-regex
            to: function(match, index, fullText, captures) {
              captures[1] = rollbarJsSnippet;
              return captures.join('\n');
            }
          },
          // jQuery rollbar plugin snippet
          {
            from: new RegExp('^(.*// Rollbar jQuery Snippet)[\n\r]+(.*[\n\r])*(.*// End Rollbar jQuery Snippet)', 'm'), // eslint-disable-line no-control-regex
            to: function(match, index, fullText, captures) {
              captures[1] = rollbarjQuerySnippet;
              return captures.join('\n');
            }
          },
          // README travis link
          {
            from: new RegExp('(https://github\\.com/rollbar/rollbar\\.js/workflows/Rollbar\\.js%20CI/badge\\.svg\\?branch=v)([0-9a-zA-Z.-]+)'),
            to: function(match, index, fullText, captures) {
              captures[1] = _version;
              return captures.join('');
            }
          }
        ]
      }
    }
  });

  grunt.registerTask('build', ['webpack', 'replace:snippets']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['test-server', 'test-browser']);
  grunt.registerTask('release', ['build', 'copyrelease']);

  grunt.registerTask('test-server', function(_target) {
    var tasks = ['vows'];
    grunt.task.run.apply(grunt.task, tasks);
  });

  grunt.registerTask('test-browser', function(target) {
    var karmaTask = 'karma' + (target ? ':' + target : '');
    var tasks = [karmaTask];
    grunt.task.run.apply(grunt.task, tasks);
  });

  grunt.registerTask('copyrelease', function createRelease() {
    var version = _version;
    var builds = ['', '.umd'];

    builds.forEach(function (buildName) {
      var js = 'dist/rollbar' + buildName + '.js';
      var minJs = 'dist/rollbar' + buildName + '.min.js';

      var releaseJs = 'release/rollbar' + buildName + '-' + version + '.js';
      var releaseMinJs = 'release/rollbar' + buildName + '-' + version + '.min.js';

      grunt.file.copy(js, releaseJs);
      grunt.file.copy(minJs, releaseMinJs);
    });
  });

};
