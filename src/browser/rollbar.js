import Rollbar from "./core";
import telemeter from "../telemetry";
import instrumenter from "./telemetry";
import polyfillJSON from "../utility/polyfillJSON";
import wrapGlobals from "./wrapGlobals";
import scrub from "../scrub";
import truncation from "../truncation";

Rollbar.setComponents({
  telemeter: telemeter,
  instrumenter: instrumenter,
  polyfillJSON: polyfillJSON,
  wrapGlobals: wrapGlobals,
  scrub: scrub,
  truncation: truncation
});

module.exports = Rollbar;
