import rollbar from "../rollbar";

if ((typeof window !== 'undefined') && !window._rollbarStartTime) {
  window._rollbarStartTime = (new Date()).getTime();
}

module.exports = rollbar;
