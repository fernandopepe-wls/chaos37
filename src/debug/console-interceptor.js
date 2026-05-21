const MAX_ENTRIES = 1000;

const entries = [];
const subscribers = [];

const originals = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

function serialize(args) {
  return args.map((a) => {
    if (a === null) return 'null';
    if (a === undefined) return 'undefined';
    if (a instanceof Error) return `${a.name}: ${a.message}\n${a.stack || ''}`;
    if (typeof a === 'object') {
      try { return JSON.stringify(a, null, 2); }
      catch { return String(a); }
    }
    return String(a);
  }).join(' ');
}

function intercept(level) {
  console[level] = (...args) => {
    originals[level](...args);
    const entry = {
      id: entries.length,
      level,
      message: serialize(args),
      timestamp: Date.now(),
      count: 1,
    };

    if (entries.length > 0) {
      const last = entries[entries.length - 1];
      if (last.level === level && last.message === entry.message) {
        last.count++;
        last.timestamp = entry.timestamp;
        notify();
        return;
      }
    }

    entries.push(entry);
    if (entries.length > MAX_ENTRIES) entries.shift();
    notify();
  };
}

function notify() {
  for (const fn of subscribers) fn();
}

export const ConsoleInterceptor = {
  install() {
    for (const level of Object.keys(originals)) intercept(level);

    window.addEventListener('error', (e) => {
      const entry = {
        id: entries.length,
        level: 'error',
        message: `[Uncaught] ${e.message}\n  at ${e.filename}:${e.lineno}:${e.colno}`,
        timestamp: Date.now(),
        count: 1,
      };
      entries.push(entry);
      if (entries.length > MAX_ENTRIES) entries.shift();
      notify();
    });

    window.addEventListener('unhandledrejection', (e) => {
      const reason = e.reason instanceof Error
        ? `${e.reason.message}\n${e.reason.stack || ''}`
        : String(e.reason);
      const entry = {
        id: entries.length,
        level: 'error',
        message: `[UnhandledRejection] ${reason}`,
        timestamp: Date.now(),
        count: 1,
      };
      entries.push(entry);
      if (entries.length > MAX_ENTRIES) entries.shift();
      notify();
    });
  },

  getEntries() { return entries; },

  clear() {
    entries.length = 0;
    notify();
  },

  subscribe(fn) {
    subscribers.push(fn);
    return () => {
      const i = subscribers.indexOf(fn);
      if (i !== -1) subscribers.splice(i, 1);
    };
  },

  getCounts() {
    const counts = { all: 0, log: 0, warn: 0, error: 0, info: 0, debug: 0 };
    for (const e of entries) {
      counts.all++;
      counts[e.level]++;
    }
    return counts;
  },
};
