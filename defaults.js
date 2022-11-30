import { version as _version, plugins, defaults, cdn } from './package.json';

var version = _version;

export const __NOTIFIER_VERSION__ = JSON.stringify(_version);
export const __JQUERY_PLUGIN_VERSION__ = JSON.stringify(plugins.jquery.version);
export const __DEFAULT_SERVER_SCRUB_FIELDS__ = JSON.stringify(defaults.server.scrubFields);
export const __DEFAULT_SERVER_SCRUB_HEADERS__ = JSON.stringify(defaults.server.scrubHeaders);
export const __DEFAULT_ENDPOINT__ = JSON.stringify(defaults.endpoint);
export const __DEFAULT_LOG_LEVEL__ = JSON.stringify(defaults.logLevel);
export const __DEFAULT_REPORT_LEVEL__ = JSON.stringify(defaults.reportLevel);
export const __DEFAULT_UNCAUGHT_ERROR_LEVEL = JSON.stringify(defaults.uncaughtErrorLevel);
export const __DEFAULT_ROLLBARJS_URL__ = JSON.stringify('https://' + cdn.host + '/rollbarjs/refs/tags/v' + version + '/rollbar.min.js');
export const __DEFAULT_MAX_ITEMS__ = defaults.maxItems;
export const __DEFAULT_ITEMS_PER_MIN__ = defaults.itemsPerMin;
