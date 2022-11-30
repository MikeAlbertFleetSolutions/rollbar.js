/* eslint-disable no-console */
import "console-polyfill";
import detection from "./detection";
import _ from "../utility";

function error() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift('Rollbar:');
  if (detection.ieVersion() <= 8) {
    console.error(_.formatArgsAsString(args));
  } else {
    console.error.apply(console, args);
  }
}

function info() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift('Rollbar:');
  if (detection.ieVersion() <= 8) {
    console.info(_.formatArgsAsString(args));
  } else {
    console.info.apply(console, args);
  }
}

function log() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift('Rollbar:');
  if (detection.ieVersion() <= 8) {
    console.log(_.formatArgsAsString(args));
  } else {
    console.log.apply(console, args);
  }
}

/* eslint-enable no-console */

module.exports = {
  error: error,
  info: info,
  log: log
};
