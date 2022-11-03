function logger(level: string, method: string) {
  return function (...args) {
    console[method](`- ${level.toUpperCase()}: `, ...args);
  };
}

export default {
  info: logger('info', 'info'),
  debug: logger('debug', 'log'),
  warn: logger('warn', 'warn'),
  error: logger('error', 'error'),
  critical: logger('critical', 'error')
};
