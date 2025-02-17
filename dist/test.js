(function () {
  'use strict';

  /**
   * Utility module to work with key-value stores.
   *
   * @module map
   */

  /**
   * Creates a new Map instance.
   *
   * @function
   * @return {Map<any, any>}
   *
   * @function
   */
  const create$6 = () => new Map();

  /**
   * Copy a Map object into a fresh Map object.
   *
   * @function
   * @template X,Y
   * @param {Map<X,Y>} m
   * @return {Map<X,Y>}
   */
  const copy = m => {
    const r = create$6();
    m.forEach((v, k) => { r.set(k, v); });
    return r
  };

  /**
   * Get map property. Create T if property is undefined and set T on map.
   *
   * ```js
   * const listeners = map.setIfUndefined(events, 'eventName', set.create)
   * listeners.add(listener)
   * ```
   *
   * @function
   * @template T,K
   * @param {Map<K, T>} map
   * @param {K} key
   * @param {function():T} createT
   * @return {T}
   */
  const setIfUndefined = (map, key, createT) => {
    let set = map.get(key);
    if (set === undefined) {
      map.set(key, set = createT());
    }
    return set
  };

  /**
   * Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
   *
   * @function
   * @template K
   * @template V
   * @template R
   * @param {Map<K,V>} m
   * @param {function(V,K):R} f
   * @return {Array<R>}
   */
  const map$1 = (m, f) => {
    const res = [];
    for (const [key, value] of m) {
      res.push(f(value, key));
    }
    return res
  };

  /**
   * Tests whether any key-value pairs pass the test implemented by `f(value, key)`.
   *
   * @todo should rename to some - similarly to Array.some
   *
   * @function
   * @template K
   * @template V
   * @param {Map<K,V>} m
   * @param {function(V,K):boolean} f
   * @return {boolean}
   */
  const any = (m, f) => {
    for (const [key, value] of m) {
      if (f(value, key)) {
        return true
      }
    }
    return false
  };

  /**
   * Utility module to work with strings.
   *
   * @module string
   */

  const fromCharCode = String.fromCharCode;

  /**
   * @param {string} s
   * @return {string}
   */
  const toLowerCase = s => s.toLowerCase();

  const trimLeftRegex = /^\s*/g;

  /**
   * @param {string} s
   * @return {string}
   */
  const trimLeft = s => s.replace(trimLeftRegex, '');

  const fromCamelCaseRegex = /([A-Z])/g;

  /**
   * @param {string} s
   * @param {string} separator
   * @return {string}
   */
  const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`));

  /* istanbul ignore next */
  /** @type {TextEncoder} */ (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null);

  /* istanbul ignore next */
  let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

  /* istanbul ignore next */
  if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
    // Safari doesn't handle BOM correctly.
    // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
    // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
    // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
    // Another issue is that from then on no BOM chars are recognized anymore
    /* istanbul ignore next */
    utf8TextDecoder = null;
  }

  /**
   * Often used conditions.
   *
   * @module conditions
   */

  /**
   * @template T
   * @param {T|null|undefined} v
   * @return {T|null}
   */
  /* istanbul ignore next */
  const undefinedToNull = v => v === undefined ? null : v;

  /* global localStorage, addEventListener */

  /**
   * Isomorphic variable storage.
   *
   * Uses LocalStorage in the browser and falls back to in-memory storage.
   *
   * @module storage
   */

  /* istanbul ignore next */
  class VarStoragePolyfill {
    constructor () {
      this.map = new Map();
    }

    /**
     * @param {string} key
     * @param {any} newValue
     */
    setItem (key, newValue) {
      this.map.set(key, newValue);
    }

    /**
     * @param {string} key
     */
    getItem (key) {
      return this.map.get(key)
    }
  }

  /* istanbul ignore next */
  /**
   * @type {any}
   */
  let _localStorage = new VarStoragePolyfill();
  let usePolyfill = true;

  try {
    // if the same-origin rule is violated, accessing localStorage might thrown an error
    /* istanbul ignore next */
    if (typeof localStorage !== 'undefined') {
      _localStorage = localStorage;
      usePolyfill = false;
    }
  } catch (e) { }

  /* istanbul ignore next */
  /**
   * This is basically localStorage in browser, or a polyfill in nodejs
   */
  const varStorage = _localStorage;

  /**
   * Isomorphic module to work access the environment (query params, env variables).
   *
   * @module map
   */

  /* istanbul ignore next */
  // @ts-ignore
  const isNode = typeof process !== 'undefined' && process.release && /node|io\.js/.test(process.release.name);
  /* istanbul ignore next */
  const isBrowser = typeof window !== 'undefined' && !isNode;
  /* istanbul ignore next */
  typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

  /**
   * @type {Map<string,string>}
   */
  let params;

  /* istanbul ignore next */
  const computeParams = () => {
    if (params === undefined) {
      if (isNode) {
        params = create$6();
        const pargs = process.argv;
        let currParamName = null;
        /* istanbul ignore next */
        for (let i = 0; i < pargs.length; i++) {
          const parg = pargs[i];
          if (parg[0] === '-') {
            if (currParamName !== null) {
              params.set(currParamName, '');
            }
            currParamName = parg;
          } else {
            if (currParamName !== null) {
              params.set(currParamName, parg);
              currParamName = null;
            }
          }
        }
        if (currParamName !== null) {
          params.set(currParamName, '');
        }
      // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
      } else if (typeof location === 'object') {
        params = create$6()
        // eslint-disable-next-line no-undef
        ;(location.search || '?').slice(1).split('&').forEach(kv => {
          if (kv.length !== 0) {
            const [key, value] = kv.split('=');
            params.set(`--${fromCamelCase(key, '-')}`, value);
            params.set(`-${fromCamelCase(key, '-')}`, value);
          }
        });
      } else {
        params = create$6();
      }
    }
    return params
  };

  /**
   * @param {string} name
   * @return {boolean}
   */
  /* istanbul ignore next */
  const hasParam = name => computeParams().has(name);

  /**
   * @param {string} name
   * @param {string} defaultVal
   * @return {string}
   */
  /* istanbul ignore next */
  const getParam = (name, defaultVal) => computeParams().get(name) || defaultVal;
  // export const getArgs = name => computeParams() && args

  /**
   * @param {string} name
   * @return {string|null}
   */
  /* istanbul ignore next */
  const getVariable = name => isNode ? undefinedToNull(process.env[name.toUpperCase()]) : undefinedToNull(varStorage.getItem(name));

  /**
   * @param {string} name
   * @return {boolean}
   */
  /* istanbul ignore next */
  const hasConf = name => hasParam('--' + name) || getVariable(name) !== null;

  /* istanbul ignore next */
  hasConf('production');

  /**
   * Utility module to work with EcmaScript Symbols.
   *
   * @module symbol
   */

  /**
   * Return fresh symbol.
   *
   * @return {Symbol}
   */
  const create$5 = Symbol;

  /**
   * Working with value pairs.
   *
   * @module pair
   */

  /**
   * @template L,R
   */
  class Pair {
    /**
     * @param {L} left
     * @param {R} right
     */
    constructor (left, right) {
      this.left = left;
      this.right = right;
    }
  }

  /**
   * @template L,R
   * @param {L} left
   * @param {R} right
   * @return {Pair<L,R>}
   */
  const create$4 = (left, right) => new Pair(left, right);

  /**
   * @template L,R
   * @param {Array<Pair<L,R>>} arr
   * @param {function(L, R):any} f
   */
  const forEach$1 = (arr, f) => arr.forEach(p => f(p.left, p.right));

  /* eslint-env browser */

  /* istanbul ignore next */
  /**
   * @type {Document}
   */
  const doc = /** @type {Document} */ (typeof document !== 'undefined' ? document : {});

  /**
   * @param {string} name
   * @return {HTMLElement}
   */
  /* istanbul ignore next */
  const createElement = name => doc.createElement(name);

  /**
   * @return {DocumentFragment}
   */
  /* istanbul ignore next */
  const createDocumentFragment = () => doc.createDocumentFragment();

  /**
   * @param {string} text
   * @return {Text}
   */
  /* istanbul ignore next */
  const createTextNode = text => doc.createTextNode(text);

  /* istanbul ignore next */
  /** @type {DOMParser} */ (typeof DOMParser !== 'undefined' ? new DOMParser() : null);

  /**
   * @param {Element} el
   * @param {Array<pair.Pair<string,string|boolean>>} attrs Array of key-value pairs
   * @return {Element}
   */
  /* istanbul ignore next */
  const setAttributes = (el, attrs) => {
    forEach$1(attrs, (key, value) => {
      if (value === false) {
        el.removeAttribute(key);
      } else if (value === true) {
        el.setAttribute(key, '');
      } else {
        // @ts-ignore
        el.setAttribute(key, value);
      }
    });
    return el
  };

  /**
   * @param {Array<Node>|HTMLCollection} children
   * @return {DocumentFragment}
   */
  /* istanbul ignore next */
  const fragment = children => {
    const fragment = createDocumentFragment();
    for (let i = 0; i < children.length; i++) {
      appendChild(fragment, children[i]);
    }
    return fragment
  };

  /**
   * @param {Element} parent
   * @param {Array<Node>} nodes
   * @return {Element}
   */
  /* istanbul ignore next */
  const append = (parent, nodes) => {
    appendChild(parent, fragment(nodes));
    return parent
  };

  /**
   * @param {EventTarget} el
   * @param {string} name
   * @param {EventListener} f
   */
  /* istanbul ignore next */
  const addEventListener = (el, name, f) => el.addEventListener(name, f);

  /**
   * @param {string} name
   * @param {Array<pair.Pair<string,string>|pair.Pair<string,boolean>>} attrs Array of key-value pairs
   * @param {Array<Node>} children
   * @return {Element}
   */
  /* istanbul ignore next */
  const element = (name, attrs = [], children = []) =>
    append(setAttributes(createElement(name), attrs), children);

  /**
   * @param {string} t
   * @return {Text}
   */
  /* istanbul ignore next */
  const text = createTextNode;

  /**
   * @param {Map<string,string>} m
   * @return {string}
   */
  /* istanbul ignore next */
  const mapToStyleString = m => map$1(m, (value, key) => `${key}:${value};`).join('');

  /**
   * @param {Node} parent
   * @param {Node} child
   * @return {Node}
   */
  /* istanbul ignore next */
  const appendChild = (parent, child) => parent.appendChild(child);

  doc.ELEMENT_NODE;
  doc.TEXT_NODE;
  doc.CDATA_SECTION_NODE;
  doc.COMMENT_NODE;
  doc.DOCUMENT_NODE;
  doc.DOCUMENT_TYPE_NODE;
  doc.DOCUMENT_FRAGMENT_NODE;

  /**
   * JSON utility functions.
   *
   * @module json
   */

  /**
   * Transform JavaScript object to JSON.
   *
   * @param {any} object
   * @return {string}
   */
  const stringify = JSON.stringify;

  /* global requestIdleCallback, requestAnimationFrame, cancelIdleCallback, cancelAnimationFrame */

  /**
   * Utility module to work with EcmaScript's event loop.
   *
   * @module eventloop
   */

  /**
   * @type {Array<function>}
   */
  let queue = [];

  const _runQueue = () => {
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
    }
    queue = [];
  };

  /**
   * @param {function():void} f
   */
  const enqueue = f => {
    queue.push(f);
    if (queue.length === 1) {
      setTimeout(_runQueue, 0);
    }
  };

  /**
   * Common Math expressions.
   *
   * @module math
   */

  const floor = Math.floor;
  const ceil = Math.ceil;
  const abs = Math.abs;
  const round = Math.round;
  const log10 = Math.log10;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The sum of a and b
   */
  const add = (a, b) => a + b;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The smaller element of a and b
   */
  const min = (a, b) => a < b ? a : b;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The bigger element of a and b
   */
  const max = (a, b) => a > b ? a : b;
  /**
   * Base 10 exponential function. Returns the value of 10 raised to the power of pow.
   *
   * @param {number} exp
   * @return {number}
   */
  const exp10 = exp => Math.pow(10, exp);

  /**
   * @param {number} n
   * @return {boolean} Wether n is negative. This function also differentiates between -0 and +0
   */
  const isNegativeZero = n => n !== 0 ? n < 0 : 1 / n < 0;

  /**
   * Utility module to convert metric values.
   *
   * @module metric
   */

  const prefixUp = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const prefixDown = ['', 'm', 'μ', 'n', 'p', 'f', 'a', 'z', 'y'];

  /**
   * Calculate the metric prefix for a number. Assumes E.g. `prefix(1000) = { n: 1, prefix: 'k' }`
   *
   * @param {number} n
   * @param {number} [baseMultiplier] Multiplier of the base (10^(3*baseMultiplier)). E.g. `convert(time, -3)` if time is already in milli seconds
   * @return {{n:number,prefix:string}}
   */
  const prefix = (n, baseMultiplier = 0) => {
    const nPow = n === 0 ? 0 : log10(n);
    let mult = 0;
    while (nPow < mult * 3 && baseMultiplier > -8) {
      baseMultiplier--;
      mult--;
    }
    while (nPow >= 3 + mult * 3 && baseMultiplier < 8) {
      baseMultiplier++;
      mult++;
    }
    const prefix = baseMultiplier < 0 ? prefixDown[-baseMultiplier] : prefixUp[baseMultiplier];
    return {
      n: round((mult > 0 ? n / exp10(mult * 3) : n * exp10(mult * -3)) * 1e12) / 1e12,
      prefix
    }
  };

  /**
   * Utility module to work with time.
   *
   * @module time
   */

  /**
   * Return current unix time.
   *
   * @return {number}
   */
  const getUnixTime = Date.now;

  /**
   * Transform time (in ms) to a human readable format. E.g. 1100 => 1.1s. 60s => 1min. .001 => 10μs.
   *
   * @param {number} d duration in milliseconds
   * @return {string} humanized approximation of time
   */
  const humanizeDuration = d => {
    if (d < 60000) {
      const p = prefix(d, -1);
      return round(p.n * 100) / 100 + p.prefix + 's'
    }
    d = floor(d / 1000);
    const seconds = d % 60;
    const minutes = floor(d / 60) % 60;
    const hours = floor(d / 3600) % 24;
    const days = floor(d / 86400);
    if (days > 0) {
      return days + 'd' + ((hours > 0 || minutes > 30) ? ' ' + (minutes > 30 ? hours + 1 : hours) + 'h' : '')
    }
    if (hours > 0) {
      /* istanbul ignore next */
      return hours + 'h' + ((minutes > 0 || seconds > 30) ? ' ' + (seconds > 30 ? minutes + 1 : minutes) + 'min' : '')
    }
    return minutes + 'min' + (seconds > 0 ? ' ' + seconds + 's' : '')
  };

  /**
   * Utility module to work with Arrays.
   *
   * @module array
   */

  /**
   * Return the last element of an array. The element must exist
   *
   * @template L
   * @param {Array<L>} arr
   * @return {L}
   */
  const last = arr => arr[arr.length - 1];

  /**
   * Append elements from src to dest
   *
   * @template M
   * @param {Array<M>} dest
   * @param {Array<M>} src
   */
  const appendTo = (dest, src) => {
    for (let i = 0; i < src.length; i++) {
      dest.push(src[i]);
    }
  };

  /**
   * Transforms something array-like to an actual Array.
   *
   * @function
   * @template T
   * @param {ArrayLike<T>|Iterable<T>} arraylike
   * @return {T}
   */
  const from = Array.from;

  const isArray = Array.isArray;

  /**
   * Utility functions for working with EcmaScript objects.
   *
   * @module object
   */

  /**
   * @param {Object<string,any>} obj
   */
  const keys = Object.keys;

  /**
   * @param {Object<string,any>} obj
   * @param {function(any,string):any} f
   */
  const forEach = (obj, f) => {
    for (const key in obj) {
      f(obj[key], key);
    }
  };

  /**
   * @template R
   * @param {Object<string,any>} obj
   * @param {function(any,string):R} f
   * @return {Array<R>}
   */
  const map = (obj, f) => {
    const results = [];
    for (const key in obj) {
      results.push(f(obj[key], key));
    }
    return results
  };

  /**
   * @param {Object<string,any>} obj
   * @return {number}
   */
  const length$1 = obj => keys(obj).length;

  /**
   * @param {Object<string,any>} obj
   * @param {function(any,string):boolean} f
   * @return {boolean}
   */
  const every = (obj, f) => {
    for (const key in obj) {
      if (!f(obj[key], key)) {
        return false
      }
    }
    return true
  };

  /**
   * Calls `Object.prototype.hasOwnProperty`.
   *
   * @param {any} obj
   * @param {string|symbol} key
   * @return {boolean}
   */
  const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  /**
   * @param {Object<string,any>} a
   * @param {Object<string,any>} b
   * @return {boolean}
   */
  const equalFlat = (a, b) => a === b || (length$1(a) === length$1(b) && every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && b[key] === val));

  /**
   * Common functions and function call helpers.
   *
   * @module function
   */

  /**
   * Calls all functions in `fs` with args. Only throws after all functions were called.
   *
   * @param {Array<function>} fs
   * @param {Array<any>} args
   */
  const callAll = (fs, args, i = 0) => {
    try {
      for (; i < fs.length; i++) {
        fs[i](...args);
      }
    } finally {
      if (i < fs.length) {
        callAll(fs, args, i + 1);
      }
    }
  };

  /**
   * @template T
   *
   * @param {T} a
   * @param {T} b
   * @return {boolean}
   */
  const equalityStrict = (a, b) => a === b;

  /**
   * @param {any} a
   * @param {any} b
   * @return {boolean}
   */
  const equalityDeep = (a, b) => {
    if (a == null || b == null) {
      return equalityStrict(a, b)
    }
    if (a.constructor !== b.constructor) {
      return false
    }
    if (a === b) {
      return true
    }
    switch (a.constructor) {
      case ArrayBuffer:
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      // eslint-disable-next-line no-fallthrough
      case Uint8Array: {
        if (a.byteLength !== b.byteLength) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
            return false
          }
        }
        break
      }
      case Set: {
        if (a.size !== b.size) {
          return false
        }
        for (const value of a) {
          if (!b.has(value)) {
            return false
          }
        }
        break
      }
      case Map: {
        if (a.size !== b.size) {
          return false
        }
        for (const key of a.keys()) {
          if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
            return false
          }
        }
        break
      }
      case Object:
        if (length$1(a) !== length$1(b)) {
          return false
        }
        for (const key in a) {
          if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
            return false
          }
        }
        break
      case Array:
        if (a.length !== b.length) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (!equalityDeep(a[i], b[i])) {
            return false
          }
        }
        break
      default:
        return false
    }
    return true
  };

  /**
   * Isomorphic logging module with support for colors!
   *
   * @module logging
   */

  const BOLD = create$5();
  const UNBOLD = create$5();
  const BLUE = create$5();
  const GREY = create$5();
  const GREEN = create$5();
  const RED = create$5();
  const PURPLE = create$5();
  const ORANGE = create$5();
  const UNCOLOR = create$5();

  /**
   * @type {Object<Symbol,pair.Pair<string,string>>}
   */
  const _browserStyleMap = {
    [BOLD]: create$4('font-weight', 'bold'),
    [UNBOLD]: create$4('font-weight', 'normal'),
    [BLUE]: create$4('color', 'blue'),
    [GREEN]: create$4('color', 'green'),
    [GREY]: create$4('color', 'grey'),
    [RED]: create$4('color', 'red'),
    [PURPLE]: create$4('color', 'purple'),
    [ORANGE]: create$4('color', 'orange'), // not well supported in chrome when debugging node with inspector - TODO: deprecate
    [UNCOLOR]: create$4('color', 'black')
  };

  const _nodeStyleMap = {
    [BOLD]: '\u001b[1m',
    [UNBOLD]: '\u001b[2m',
    [BLUE]: '\x1b[34m',
    [GREEN]: '\x1b[32m',
    [GREY]: '\u001b[37m',
    [RED]: '\x1b[31m',
    [PURPLE]: '\x1b[35m',
    [ORANGE]: '\x1b[38;5;208m',
    [UNCOLOR]: '\x1b[0m'
  };

  /* istanbul ignore next */
  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  const computeBrowserLoggingArgs = args => {
    const strBuilder = [];
    const styles = [];
    const currentStyle = create$6();
    /**
     * @type {Array<string|Object|number>}
     */
    let logArgs = [];
    // try with formatting until we find something unsupported
    let i = 0;

    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _browserStyleMap[arg];
      if (style !== undefined) {
        currentStyle.set(style.left, style.right);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          const style = mapToStyleString(currentStyle);
          if (i > 0 || style.length > 0) {
            strBuilder.push('%c' + arg);
            styles.push(style);
          } else {
            strBuilder.push(arg);
          }
        } else {
          break
        }
      }
    }

    if (i > 0) {
      // create logArgs with what we have so far
      logArgs = styles;
      logArgs.unshift(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      if (!(arg instanceof Symbol)) {
        logArgs.push(arg);
      }
    }
    return logArgs
  };

  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  const computeNodeLoggingArgs = args => {
    const strBuilder = [];
    const logArgs = [];

    // try with formatting until we find something unsupported
    let i = 0;

    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _nodeStyleMap[arg];
      if (style !== undefined) {
        strBuilder.push(style);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          strBuilder.push(arg);
        } else {
          break
        }
      }
    }
    if (i > 0) {
      // create logArgs with what we have so far
      strBuilder.push('\x1b[0m');
      logArgs.push(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      /* istanbul ignore else */
      if (!(arg instanceof Symbol)) {
        logArgs.push(arg);
      }
    }
    return logArgs
  };

  /* istanbul ignore next */
  const computeLoggingArgs = isNode ? computeNodeLoggingArgs : computeBrowserLoggingArgs;

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const print = (...args) => {
    console.log(...computeLoggingArgs(args));
    /* istanbul ignore next */
    vconsoles.forEach(vc => vc.print(args));
  };

  /* istanbul ignore next */
  /**
   * @param {Error} err
   */
  const printError = err => {
    console.error(err);
    vconsoles.forEach(vc => vc.printError(err));
  };

  /* istanbul ignore next */
  /**
   * @param {string} url image location
   * @param {number} height height of the image in pixel
   */
  const printImg = (url, height) => {
    if (isBrowser) {
      console.log('%c                      ', `font-size: ${height}px; background-size: contain; background-repeat: no-repeat; background-image: url(${url})`);
      // console.log('%c                ', `font-size: ${height}x; background: url(${url}) no-repeat;`)
    }
    vconsoles.forEach(vc => vc.printImg(url, height));
  };

  /* istanbul ignore next */
  /**
   * @param {string} base64
   * @param {number} height
   */
  const printImgBase64 = (base64, height) => printImg(`data:image/gif;base64,${base64}`, height);

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const group = (...args) => {
    console.group(...computeLoggingArgs(args));
    /* istanbul ignore next */
    vconsoles.forEach(vc => vc.group(args));
  };

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const groupCollapsed = (...args) => {
    console.groupCollapsed(...computeLoggingArgs(args));
    /* istanbul ignore next */
    vconsoles.forEach(vc => vc.groupCollapsed(args));
  };

  const groupEnd = () => {
    console.groupEnd();
    /* istanbul ignore next */
    vconsoles.forEach(vc => vc.groupEnd());
  };

  const vconsoles = new Set();

  /* istanbul ignore next */
  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<Element>}
   */
  const _computeLineSpans = args => {
    const spans = [];
    const currentStyle = new Map();
    // try with formatting until we find something unsupported
    let i = 0;
    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _browserStyleMap[arg];
      if (style !== undefined) {
        currentStyle.set(style.left, style.right);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          // @ts-ignore
          const span = element('span', [create$4('style', mapToStyleString(currentStyle))], [text(arg)]);
          if (span.innerHTML === '') {
            span.innerHTML = '&nbsp;';
          }
          spans.push(span);
        } else {
          break
        }
      }
    }
    // append the rest
    for (; i < args.length; i++) {
      let content = args[i];
      if (!(content instanceof Symbol)) {
        if (content.constructor !== String && content.constructor !== Number) {
          content = ' ' + stringify(content) + ' ';
        }
        spans.push(element('span', [], [text(/** @type {string} */ (content))]));
      }
    }
    return spans
  };

  const lineStyle = 'font-family:monospace;border-bottom:1px solid #e2e2e2;padding:2px;';

  /* istanbul ignore next */
  class VConsole {
    /**
     * @param {Element} dom
     */
    constructor (dom) {
      this.dom = dom;
      /**
       * @type {Element}
       */
      this.ccontainer = this.dom;
      this.depth = 0;
      vconsoles.add(this);
    }

    /**
     * @param {Array<string|Symbol|Object|number>} args
     * @param {boolean} collapsed
     */
    group (args, collapsed = false) {
      enqueue(() => {
        const triangleDown = element('span', [create$4('hidden', collapsed), create$4('style', 'color:grey;font-size:120%;')], [text('▼')]);
        const triangleRight = element('span', [create$4('hidden', !collapsed), create$4('style', 'color:grey;font-size:125%;')], [text('▶')]);
        const content = element('div', [create$4('style', `${lineStyle};padding-left:${this.depth * 10}px`)], [triangleDown, triangleRight, text(' ')].concat(_computeLineSpans(args)));
        const nextContainer = element('div', [create$4('hidden', collapsed)]);
        const nextLine = element('div', [], [content, nextContainer]);
        append(this.ccontainer, [nextLine]);
        this.ccontainer = nextContainer;
        this.depth++;
        // when header is clicked, collapse/uncollapse container
        addEventListener(content, 'click', event => {
          nextContainer.toggleAttribute('hidden');
          triangleDown.toggleAttribute('hidden');
          triangleRight.toggleAttribute('hidden');
        });
      });
    }

    /**
     * @param {Array<string|Symbol|Object|number>} args
     */
    groupCollapsed (args) {
      this.group(args, true);
    }

    groupEnd () {
      enqueue(() => {
        if (this.depth > 0) {
          this.depth--;
          // @ts-ignore
          this.ccontainer = this.ccontainer.parentElement.parentElement;
        }
      });
    }

    /**
     * @param {Array<string|Symbol|Object|number>} args
     */
    print (args) {
      enqueue(() => {
        append(this.ccontainer, [element('div', [create$4('style', `${lineStyle};padding-left:${this.depth * 10}px`)], _computeLineSpans(args))]);
      });
    }

    /**
     * @param {Error} err
     */
    printError (err) {
      this.print([RED, BOLD, err.toString()]);
    }

    /**
     * @param {string} url
     * @param {number} height
     */
    printImg (url, height) {
      enqueue(() => {
        append(this.ccontainer, [element('img', [create$4('src', url), create$4('height', `${round(height * 1.5)}px`)])]);
      });
    }

    /**
     * @param {Node} node
     */
    printDom (node) {
      enqueue(() => {
        append(this.ccontainer, [node]);
      });
    }

    destroy () {
      enqueue(() => {
        vconsoles.delete(this);
      });
    }
  }

  /* istanbul ignore next */
  /**
   * @param {Element} dom
   */
  const createVConsole = dom => new VConsole(dom);

  /* eslint-env browser */

  /**
   * Binary data constants.
   *
   * @module binary
   */

  /**
   * n-th bit activated.
   *
   * @type {number}
   */
  const BIT1 = 1;
  const BIT2 = 2;
  const BIT3 = 4;
  const BIT4 = 8;
  const BIT6 = 32;
  const BIT7 = 64;
  const BIT8 = 128;
  const BITS5 = 31;
  const BITS6 = 63;
  const BITS7 = 127;
  /**
   * @type {number}
   */
  const BITS31 = 0x7FFFFFFF;
  /**
   * @type {number}
   */
  const BITS32 = 0xFFFFFFFF;

  /* eslint-env browser */
  const performance = typeof window === 'undefined' ? null : (typeof window.performance !== 'undefined' && window.performance) || null;

  const isoCrypto = typeof crypto === 'undefined' ? null : crypto;

  /**
   * @type {function(number):ArrayBuffer}
   */
  const cryptoRandomBuffer = isoCrypto !== null
    ? len => {
      // browser
      const buf = new ArrayBuffer(len);
      const arr = new Uint8Array(buf);
      isoCrypto.getRandomValues(arr);
      return buf
    }
    : len => {
      // polyfill
      const buf = new ArrayBuffer(len);
      const arr = new Uint8Array(buf);
      for (let i = 0; i < len; i++) {
        arr[i] = Math.ceil((Math.random() * 0xFFFFFFFF) >>> 0);
      }
      return buf
    };

  const uint32 = () => new Uint32Array(cryptoRandomBuffer(4))[0];

  // @ts-ignore
  const uuidv4Template = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
  const uuidv4 = () => uuidv4Template.replace(/[018]/g, /** @param {number} c */ c =>
    (c ^ uint32() & 15 >> c / 4).toString(16)
  );

  /**
   * @module prng
   */

  /**
   * Xorshift32 is a very simple but elegang PRNG with a period of `2^32-1`.
   */
  class Xorshift32 {
    /**
     * @param {number} seed Unsigned 32 bit number
     */
    constructor (seed) {
      this.seed = seed;
      /**
       * @type {number}
       */
      this._state = seed;
    }

    /**
     * Generate a random signed integer.
     *
     * @return {Number} A 32 bit signed integer.
     */
    next () {
      let x = this._state;
      x ^= x << 13;
      x ^= x >> 17;
      x ^= x << 5;
      this._state = x;
      return (x >>> 0) / (BITS32 + 1)
    }
  }

  /**
   * @module prng
   */

  /**
   * This is a variant of xoroshiro128plus - the fastest full-period generator passing BigCrush without systematic failures.
   *
   * This implementation follows the idea of the original xoroshiro128plus implementation,
   * but is optimized for the JavaScript runtime. I.e.
   * * The operations are performed on 32bit integers (the original implementation works with 64bit values).
   * * The initial 128bit state is computed based on a 32bit seed and Xorshift32.
   * * This implementation returns two 32bit values based on the 64bit value that is computed by xoroshiro128plus.
   *   Caution: The last addition step works slightly different than in the original implementation - the add carry of the
   *   first 32bit addition is not carried over to the last 32bit.
   *
   * [Reference implementation](http://vigna.di.unimi.it/xorshift/xoroshiro128plus.c)
   */
  class Xoroshiro128plus {
    /**
     * @param {number} seed Unsigned 32 bit number
     */
    constructor (seed) {
      this.seed = seed;
      // This is a variant of Xoroshiro128plus to fill the initial state
      const xorshift32 = new Xorshift32(seed);
      this.state = new Uint32Array(4);
      for (let i = 0; i < 4; i++) {
        this.state[i] = xorshift32.next() * BITS32;
      }
      this._fresh = true;
    }

    /**
     * @return {number} Float/Double in [0,1)
     */
    next () {
      const state = this.state;
      if (this._fresh) {
        this._fresh = false;
        return ((state[0] + state[2]) >>> 0) / (BITS32 + 1)
      } else {
        this._fresh = true;
        const s0 = state[0];
        const s1 = state[1];
        const s2 = state[2] ^ s0;
        const s3 = state[3] ^ s1;
        // function js_rotl (x, k) {
        //   k = k - 32
        //   const x1 = x[0]
        //   const x2 = x[1]
        //   x[0] = x2 << k | x1 >>> (32 - k)
        //   x[1] = x1 << k | x2 >>> (32 - k)
        // }
        // rotl(s0, 55) // k = 23 = 55 - 32; j = 9 =  32 - 23
        state[0] = (s1 << 23 | s0 >>> 9) ^ s2 ^ (s2 << 14 | s3 >>> 18);
        state[1] = (s0 << 23 | s1 >>> 9) ^ s3 ^ (s3 << 14);
        // rol(s1, 36) // k = 4 = 36 - 32; j = 23 = 32 - 9
        state[2] = s3 << 4 | s2 >>> 28;
        state[3] = s2 << 4 | s3 >>> 28;
        return (((state[1] + state[3]) >>> 0) / (BITS32 + 1))
      }
    }
  }

  /*
  // Reference implementation
  // Source: http://vigna.di.unimi.it/xorshift/xoroshiro128plus.c
  // By David Blackman and Sebastiano Vigna
  // Who published the reference implementation under Public Domain (CC0)

  #include <stdint.h>
  #include <stdio.h>

  uint64_t s[2];

  static inline uint64_t rotl(const uint64_t x, int k) {
      return (x << k) | (x >> (64 - k));
  }

  uint64_t next(void) {
      const uint64_t s0 = s[0];
      uint64_t s1 = s[1];
      s1 ^= s0;
      s[0] = rotl(s0, 55) ^ s1 ^ (s1 << 14); // a, b
      s[1] = rotl(s1, 36); // c
      return (s[0] + s[1]) & 0xFFFFFFFF;
  }

  int main(void)
  {
      int i;
      s[0] = 1111 | (1337ul << 32);
      s[1] = 1234 | (9999ul << 32);

      printf("1000 outputs of genrand_int31()\n");
      for (i=0; i<100; i++) {
          printf("%10lu ", i);
          printf("%10lu ", next());
          printf("- %10lu ", s[0] >> 32);
          printf("%10lu ", (s[0] << 32) >> 32);
          printf("%10lu ", s[1] >> 32);
          printf("%10lu ", (s[1] << 32) >> 32);
          printf("\n");
          // if (i%5==4) printf("\n");
      }
      return 0;
  }
  */

  /**
   * Utility helpers for working with numbers.
   *
   * @module number
   */

  /**
   * @module number
   */

  /* istanbul ignore next */
  const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && floor(num) === num);

  /**
   * Efficient schema-less binary encoding with support for variable length encoding.
   *
   * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
   *
   * Encodes numbers in little-endian order (least to most significant byte order)
   * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   *
   * ```js
   * // encoding step
   * const encoder = new encoding.createEncoder()
   * encoding.writeVarUint(encoder, 256)
   * encoding.writeVarString(encoder, 'Hello world!')
   * const buf = encoding.toUint8Array(encoder)
   * ```
   *
   * ```js
   * // decoding step
   * const decoder = new decoding.createDecoder(buf)
   * decoding.readVarUint(decoder) // => 256
   * decoding.readVarString(decoder) // => 'Hello world!'
   * decoding.hasContent(decoder) // => false - all data is read
   * ```
   *
   * @module encoding
   */

  /**
   * A BinaryEncoder handles the encoding to an Uint8Array.
   */
  class Encoder {
    constructor () {
      this.cpos = 0;
      this.cbuf = new Uint8Array(100);
      /**
       * @type {Array<Uint8Array>}
       */
      this.bufs = [];
    }
  }

  /**
   * @function
   * @return {Encoder}
   */
  const createEncoder = () => new Encoder();

  /**
   * The current length of the encoded data.
   *
   * @function
   * @param {Encoder} encoder
   * @return {number}
   */
  const length = encoder => {
    let len = encoder.cpos;
    for (let i = 0; i < encoder.bufs.length; i++) {
      len += encoder.bufs[i].length;
    }
    return len
  };

  /**
   * Transform to Uint8Array.
   *
   * @function
   * @param {Encoder} encoder
   * @return {Uint8Array} The created ArrayBuffer.
   */
  const toUint8Array = encoder => {
    const uint8arr = new Uint8Array(length(encoder));
    let curPos = 0;
    for (let i = 0; i < encoder.bufs.length; i++) {
      const d = encoder.bufs[i];
      uint8arr.set(d, curPos);
      curPos += d.length;
    }
    uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
    return uint8arr
  };

  /**
   * Verify that it is possible to write `len` bytes wtihout checking. If
   * necessary, a new Buffer with the required length is attached.
   *
   * @param {Encoder} encoder
   * @param {number} len
   */
  const verifyLen = (encoder, len) => {
    const bufferLen = encoder.cbuf.length;
    if (bufferLen - encoder.cpos < len) {
      encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos));
      encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
      encoder.cpos = 0;
    }
  };

  /**
   * Write one byte to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The byte that is to be encoded.
   */
  const write = (encoder, num) => {
    const bufferLen = encoder.cbuf.length;
    if (encoder.cpos === bufferLen) {
      encoder.bufs.push(encoder.cbuf);
      encoder.cbuf = new Uint8Array(bufferLen * 2);
      encoder.cpos = 0;
    }
    encoder.cbuf[encoder.cpos++] = num;
  };

  /**
   * Write one byte as an unsigned integer.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint8 = write;

  /**
   * Write a variable length unsigned integer.
   *
   * Encodes integers in the range from [0, 4294967295] / [0, 0xffffffff]. (max 32 bit unsigned integer)
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarUint = (encoder, num) => {
    while (num > BITS7) {
      write(encoder, BIT8 | (BITS7 & num));
      num >>>= 7;
    }
    write(encoder, BITS7 & num);
  };

  /**
   * Write a variable length integer.
   *
   * Encodes integers in the range from [-2147483648, -2147483647].
   *
   * We don't use zig-zag encoding because we want to keep the option open
   * to use the same function for BigInt and 53bit integers (doubles).
   *
   * We use the 7th bit instead for signaling that this is a negative number.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarInt = (encoder, num) => {
    const isNegative = isNegativeZero(num);
    if (isNegative) {
      num = -num;
    }
    //             |- whether to continue reading         |- whether is negative     |- number
    write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | (BITS6 & num));
    num >>>= 6;
    // We don't need to consider the case of num === 0 so we can use a different
    // pattern here than above.
    while (num > 0) {
      write(encoder, (num > BITS7 ? BIT8 : 0) | (BITS7 & num));
      num >>>= 7;
    }
  };

  /**
   * Write a variable length string.
   *
   * @function
   * @param {Encoder} encoder
   * @param {String} str The string that is to be encoded.
   */
  const writeVarString = (encoder, str) => {
    const encodedString = unescape(encodeURIComponent(str));
    const len = encodedString.length;
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      write(encoder, /** @type {number} */ (encodedString.codePointAt(i)));
    }
  };

  /**
   * Write the content of another Encoder.
   *
   * @TODO: can be improved!
   *        - Note: Should consider that when appending a lot of small Encoders, we should rather clone than referencing the old structure.
   *                Encoders start with a rather big initial buffer.
   *
   * @function
   * @param {Encoder} encoder The enUint8Arr
   * @param {Encoder} append The BinaryEncoder to be written.
   */
  const writeBinaryEncoder = (encoder, append) => writeUint8Array(encoder, toUint8Array(append));

  /**
   * Append fixed-length Uint8Array to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeUint8Array = (encoder, uint8Array) => {
    const bufferLen = encoder.cbuf.length;
    const cpos = encoder.cpos;
    const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
    const rightCopyLen = uint8Array.length - leftCopyLen;
    encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
    encoder.cpos += leftCopyLen;
    if (rightCopyLen > 0) {
      // Still something to write, write right half..
      // Append new buffer
      encoder.bufs.push(encoder.cbuf);
      // must have at least size of remaining buffer
      encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
      // copy array
      encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
      encoder.cpos = rightCopyLen;
    }
  };

  /**
   * Append an Uint8Array to Encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeVarUint8Array = (encoder, uint8Array) => {
    writeVarUint(encoder, uint8Array.byteLength);
    writeUint8Array(encoder, uint8Array);
  };

  /**
   * Create an DataView of the next `len` bytes. Use it to write data after
   * calling this function.
   *
   * ```js
   * // write float32 using DataView
   * const dv = writeOnDataView(encoder, 4)
   * dv.setFloat32(0, 1.1)
   * // read float32 using DataView
   * const dv = readFromDataView(encoder, 4)
   * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
   * ```
   *
   * @param {Encoder} encoder
   * @param {number} len
   * @return {DataView}
   */
  const writeOnDataView = (encoder, len) => {
    verifyLen(encoder, len);
    const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
    encoder.cpos += len;
    return dview
  };

  /**
   * @param {Encoder} encoder
   * @param {number} num
   */
  const writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);

  /**
   * @param {Encoder} encoder
   * @param {number} num
   */
  const writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);

  /**
   * @param {Encoder} encoder
   * @param {bigint} num
   */
  const writeBigInt64 = (encoder, num) => /** @type {any} */ (writeOnDataView(encoder, 8)).setBigInt64(0, num, false);

  const floatTestBed = new DataView(new ArrayBuffer(4));
  /**
   * Check if a number can be encoded as a 32 bit float.
   *
   * @param {number} num
   * @return {boolean}
   */
  const isFloat32 = num => {
    floatTestBed.setFloat32(0, num);
    return floatTestBed.getFloat32(0) === num
  };

  /**
   * Encode data with efficient binary format.
   *
   * Differences to JSON:
   * • Transforms data to a binary format (not to a string)
   * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
   * • Numbers are efficiently encoded either as a variable length integer, as a
   *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
   *
   * Encoding table:
   *
   * | Data Type           | Prefix   | Encoding Method    | Comment |
   * | ------------------- | -------- | ------------------ | ------- |
   * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
   * | null                | 126      |                    | |
   * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
   * | float32             | 124      | writeFloat32       | |
   * | float64             | 123      | writeFloat64       | |
   * | bigint              | 122      | writeBigInt64      | |
   * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
   * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
   * | string              | 119      | writeVarString     | |
   * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
   * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
   * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
   *
   * Reasons for the decreasing prefix:
   * We need the first bit for extendability (later we may want to encode the
   * prefix with writeVarUint). The remaining 7 bits are divided as follows:
   * [0-30]   the beginning of the data range is used for custom purposes
   *          (defined by the function that uses this library)
   * [31-127] the end of the data range is used for data encoding by
   *          lib0/encoding.js
   *
   * @param {Encoder} encoder
   * @param {undefined|null|number|bigint|boolean|string|Object<string,any>|Array<any>|Uint8Array} data
   */
  const writeAny = (encoder, data) => {
    switch (typeof data) {
      case 'string':
        // TYPE 119: STRING
        write(encoder, 119);
        writeVarString(encoder, data);
        break
      case 'number':
        if (isInteger(data) && abs(data) <= BITS31) {
          // TYPE 125: INTEGER
          write(encoder, 125);
          writeVarInt(encoder, data);
        } else if (isFloat32(data)) {
          // TYPE 124: FLOAT32
          write(encoder, 124);
          writeFloat32(encoder, data);
        } else {
          // TYPE 123: FLOAT64
          write(encoder, 123);
          writeFloat64(encoder, data);
        }
        break
      case 'bigint':
        // TYPE 122: BigInt
        write(encoder, 122);
        writeBigInt64(encoder, data);
        break
      case 'object':
        if (data === null) {
          // TYPE 126: null
          write(encoder, 126);
        } else if (data instanceof Array) {
          // TYPE 117: Array
          write(encoder, 117);
          writeVarUint(encoder, data.length);
          for (let i = 0; i < data.length; i++) {
            writeAny(encoder, data[i]);
          }
        } else if (data instanceof Uint8Array) {
          // TYPE 116: ArrayBuffer
          write(encoder, 116);
          writeVarUint8Array(encoder, data);
        } else {
          // TYPE 118: Object
          write(encoder, 118);
          const keys = Object.keys(data);
          writeVarUint(encoder, keys.length);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            writeVarString(encoder, key);
            writeAny(encoder, data[key]);
          }
        }
        break
      case 'boolean':
        // TYPE 120/121: boolean (true/false)
        write(encoder, data ? 120 : 121);
        break
      default:
        // TYPE 127: undefined
        write(encoder, 127);
    }
  };

  /**
   * Now come a few stateful encoder that have their own classes.
   */

  /**
   * Basic Run Length Encoder - a basic compression implementation.
   *
   * Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
   *
   * It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
   *
   * @note T must not be null!
   *
   * @template T
   */
  class RleEncoder extends Encoder {
    /**
     * @param {function(Encoder, T):void} writer
     */
    constructor (writer) {
      super();
      /**
       * The writer
       */
      this.w = writer;
      /**
       * Current state
       * @type {T|null}
       */
      this.s = null;
      this.count = 0;
    }

    /**
     * @param {T} v
     */
    write (v) {
      if (this.s === v) {
        this.count++;
      } else {
        if (this.count > 0) {
          // flush counter, unless this is the first value (count = 0)
          writeVarUint(this, this.count - 1); // since count is always > 0, we can decrement by one. non-standard encoding ftw
        }
        this.count = 1;
        // write first value
        this.w(this, v);
        this.s = v;
      }
    }
  }

  /**
   * @param {UintOptRleEncoder} encoder
   */
  const flushUintOptRleEncoder = encoder => {
    /* istanbul ignore else */
    if (encoder.count > 0) {
      // flush counter, unless this is the first value (count = 0)
      // case 1: just a single value. set sign to positive
      // case 2: write several values. set sign to negative to indicate that there is a length coming
      writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
      if (encoder.count > 1) {
        writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
      }
    }
  };

  /**
   * Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
   *
   * Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
   * write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
   *
   * Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
   */
  class UintOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.s === v) {
        this.count++;
      } else {
        flushUintOptRleEncoder(this);
        this.count = 1;
        this.s = v;
      }
    }

    toUint8Array () {
      flushUintOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * @param {IntDiffOptRleEncoder} encoder
   */
  const flushIntDiffOptRleEncoder = encoder => {
    if (encoder.count > 0) {
      //          31 bit making up the diff | wether to write the counter
      const encodedDiff = encoder.diff << 1 | (encoder.count === 1 ? 0 : 1);
      // flush counter, unless this is the first value (count = 0)
      // case 1: just a single value. set first bit to positive
      // case 2: write several values. set first bit to negative to indicate that there is a length coming
      writeVarInt(encoder.encoder, encodedDiff);
      if (encoder.count > 1) {
        writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
      }
    }
  };

  /**
   * A combination of the IntDiffEncoder and the UintOptRleEncoder.
   *
   * The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
   * in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
   *
   * Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
   *
   * Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
   * * 1 bit that denotes whether the next value is a count (LSB)
   * * 1 bit that denotes whether this value is negative (MSB - 1)
   * * 1 bit that denotes whether to continue reading the variable length integer (MSB)
   *
   * Therefore, only five bits remain to encode diff ranges.
   *
   * Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
   */
  class IntDiffOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
      this.diff = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.diff === v - this.s) {
        this.s = v;
        this.count++;
      } else {
        flushIntDiffOptRleEncoder(this);
        this.count = 1;
        this.diff = v - this.s;
        this.s = v;
      }
    }

    toUint8Array () {
      flushIntDiffOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * Optimized String Encoder.
   *
   * Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
   * In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
   *
   * This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
   *
   * The lengths are encoded using a UintOptRleEncoder.
   */
  class StringEncoder {
    constructor () {
      /**
       * @type {Array<string>}
       */
      this.sarr = [];
      this.s = '';
      this.lensE = new UintOptRleEncoder();
    }

    /**
     * @param {string} string
     */
    write (string) {
      this.s += string;
      if (this.s.length > 19) {
        this.sarr.push(this.s);
        this.s = '';
      }
      this.lensE.write(string.length);
    }

    toUint8Array () {
      const encoder = new Encoder();
      this.sarr.push(this.s);
      this.s = '';
      writeVarString(encoder, this.sarr.join(''));
      writeUint8Array(encoder, this.lensE.toUint8Array());
      return toUint8Array(encoder)
    }
  }

  /**
   * Efficient schema-less binary decoding with support for variable length encoding.
   *
   * Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
   *
   * Encodes numbers in little-endian order (least to most significant byte order)
   * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   *
   * ```js
   * // encoding step
   * const encoder = new encoding.createEncoder()
   * encoding.writeVarUint(encoder, 256)
   * encoding.writeVarString(encoder, 'Hello world!')
   * const buf = encoding.toUint8Array(encoder)
   * ```
   *
   * ```js
   * // decoding step
   * const decoder = new decoding.createDecoder(buf)
   * decoding.readVarUint(decoder) // => 256
   * decoding.readVarString(decoder) // => 'Hello world!'
   * decoding.hasContent(decoder) // => false - all data is read
   * ```
   *
   * @module decoding
   */

  /**
   * A Decoder handles the decoding of an Uint8Array.
   */
  class Decoder {
    /**
     * @param {Uint8Array} uint8Array Binary data to decode
     */
    constructor (uint8Array) {
      /**
       * Decoding target.
       *
       * @type {Uint8Array}
       */
      this.arr = uint8Array;
      /**
       * Current decoding position.
       *
       * @type {number}
       */
      this.pos = 0;
    }
  }

  /**
   * @function
   * @param {Uint8Array} uint8Array
   * @return {Decoder}
   */
  const createDecoder = uint8Array => new Decoder(uint8Array);

  /**
   * @function
   * @param {Decoder} decoder
   * @return {boolean}
   */
  const hasContent = decoder => decoder.pos !== decoder.arr.length;

  /**
   * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder The decoder instance
   * @param {number} len The length of bytes to read
   * @return {Uint8Array}
   */
  const readUint8Array = (decoder, len) => {
    const view = createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
    decoder.pos += len;
    return view
  };

  /**
   * Read variable length Uint8Array.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder
   * @return {Uint8Array}
   */
  const readVarUint8Array = decoder => readUint8Array(decoder, readVarUint(decoder));

  /**
   * Read one byte as unsigned integer.
   * @function
   * @param {Decoder} decoder The decoder instance
   * @return {number} Unsigned 8-bit integer
   */
  const readUint8 = decoder => decoder.arr[decoder.pos++];

  /**
   * Read unsigned integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarUint = decoder => {
    let num = 0;
    let len = 0;
    while (true) {
      const r = decoder.arr[decoder.pos++];
      num = num | ((r & BITS7) << len);
      len += 7;
      if (r < BIT8) {
        return num >>> 0 // return unsigned number!
      }
      /* istanbul ignore if */
      if (len > 53) {
        throw new Error('Integer out of range!')
      }
    }
  };

  /**
   * Read signed integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarInt = decoder => {
    let r = decoder.arr[decoder.pos++];
    let num = r & BITS6;
    let len = 6;
    const sign = (r & BIT7) > 0 ? -1 : 1;
    if ((r & BIT8) === 0) {
      // don't continue reading
      return sign * num
    }
    while (true) {
      r = decoder.arr[decoder.pos++];
      num = num | ((r & BITS7) << len);
      len += 7;
      if (r < BIT8) {
        return sign * (num >>> 0)
      }
      /* istanbul ignore if */
      if (len > 53) {
        throw new Error('Integer out of range!')
      }
    }
  };

  /**
   * Read string of variable length
   * * varUint is used to store the length of the string
   *
   * Transforming utf8 to a string is pretty expensive. The code performs 10x better
   * when String.fromCodePoint is fed with all characters as arguments.
   * But most environments have a maximum number of arguments per functions.
   * For effiency reasons we apply a maximum of 10000 characters at once.
   *
   * @function
   * @param {Decoder} decoder
   * @return {String} The read String.
   */
  const readVarString = decoder => {
    let remainingLen = readVarUint(decoder);
    if (remainingLen === 0) {
      return ''
    } else {
      let encodedString = String.fromCodePoint(readUint8(decoder)); // remember to decrease remainingLen
      if (--remainingLen < 100) { // do not create a Uint8Array for small strings
        while (remainingLen--) {
          encodedString += String.fromCodePoint(readUint8(decoder));
        }
      } else {
        while (remainingLen > 0) {
          const nextLen = remainingLen < 10000 ? remainingLen : 10000;
          // this is dangerous, we create a fresh array view from the existing buffer
          const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
          decoder.pos += nextLen;
          // Starting with ES5.1 we can supply a generic array-like object as arguments
          encodedString += String.fromCodePoint.apply(null, /** @type {any} */ (bytes));
          remainingLen -= nextLen;
        }
      }
      return decodeURIComponent(escape(encodedString))
    }
  };

  /**
   * @param {Decoder} decoder
   * @param {number} len
   * @return {DataView}
   */
  const readFromDataView = (decoder, len) => {
    const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
    decoder.pos += len;
    return dv
  };

  /**
   * @param {Decoder} decoder
   */
  const readFloat32 = decoder => readFromDataView(decoder, 4).getFloat32(0, false);

  /**
   * @param {Decoder} decoder
   */
  const readFloat64 = decoder => readFromDataView(decoder, 8).getFloat64(0, false);

  /**
   * @param {Decoder} decoder
   */
  const readBigInt64 = decoder => /** @type {any} */ (readFromDataView(decoder, 8)).getBigInt64(0, false);

  /**
   * @type {Array<function(Decoder):any>}
   */
  const readAnyLookupTable = [
    decoder => undefined, // CASE 127: undefined
    decoder => null, // CASE 126: null
    readVarInt, // CASE 125: integer
    readFloat32, // CASE 124: float32
    readFloat64, // CASE 123: float64
    readBigInt64, // CASE 122: bigint
    decoder => false, // CASE 121: boolean (false)
    decoder => true, // CASE 120: boolean (true)
    readVarString, // CASE 119: string
    decoder => { // CASE 118: object<string,any>
      const len = readVarUint(decoder);
      /**
       * @type {Object<string,any>}
       */
      const obj = {};
      for (let i = 0; i < len; i++) {
        const key = readVarString(decoder);
        obj[key] = readAny(decoder);
      }
      return obj
    },
    decoder => { // CASE 117: array<any>
      const len = readVarUint(decoder);
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(readAny(decoder));
      }
      return arr
    },
    readVarUint8Array // CASE 116: Uint8Array
  ];

  /**
   * @param {Decoder} decoder
   */
  const readAny = decoder => readAnyLookupTable[127 - readUint8(decoder)](decoder);

  /**
   * T must not be null.
   *
   * @template T
   */
  class RleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     * @param {function(Decoder):T} reader
     */
    constructor (uint8Array, reader) {
      super(uint8Array);
      /**
       * The reader
       */
      this.reader = reader;
      /**
       * Current state
       * @type {T|null}
       */
      this.s = null;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = this.reader(this);
        if (hasContent(this)) {
          this.count = readVarUint(this) + 1; // see encoder implementation for the reason why this is incremented
        } else {
          this.count = -1; // read the current value forever
        }
      }
      this.count--;
      return /** @type {T} */ (this.s)
    }
  }

  class UintOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = readVarInt(this);
        // if the sign is negative, we read the count too, otherwise count is 1
        const isNegative = isNegativeZero(this.s);
        this.count = 1;
        if (isNegative) {
          this.s = -this.s;
          this.count = readVarUint(this) + 2;
        }
      }
      this.count--;
      return /** @type {number} */ (this.s)
    }
  }

  class IntDiffOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
      this.diff = 0;
    }

    /**
     * @return {number}
     */
    read () {
      if (this.count === 0) {
        const diff = readVarInt(this);
        // if the first bit is set, we read more data
        const hasCount = diff & 1;
        this.diff = diff >> 1;
        this.count = 1;
        if (hasCount) {
          this.count = readVarUint(this) + 2;
        }
      }
      this.s += this.diff;
      this.count--;
      return this.s
    }
  }

  class StringDecoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      this.decoder = new UintOptRleDecoder(uint8Array);
      this.str = readVarString(this.decoder);
      /**
       * @type {number}
       */
      this.spos = 0;
    }

    /**
     * @return {string}
     */
    read () {
      const end = this.spos + this.decoder.read();
      const res = this.str.slice(this.spos, end);
      this.spos = end;
      return res
    }
  }

  /**
   * Utility functions to work with buffers (Uint8Array).
   *
   * @module buffer
   */

  /**
   * @param {number} len
   */
  const createUint8ArrayFromLen = len => new Uint8Array(len);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   * @param {number} byteOffset
   * @param {number} length
   */
  const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);

  /**
   * Copy the content of an Uint8Array view to a new ArrayBuffer.
   *
   * @param {Uint8Array} uint8Array
   * @return {Uint8Array}
   */
  const copyUint8Array = uint8Array => {
    const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
    newBuf.set(uint8Array);
    return newBuf
  };

  /**
   * Fast Pseudo Random Number Generators.
   *
   * Given a seed a PRNG generates a sequence of numbers that cannot be reasonably predicted.
   * Two PRNGs must generate the same random sequence of numbers if  given the same seed.
   *
   * @module prng
   */

  /**
   * Description of the function
   *  @callback generatorNext
   *  @return {number} A random float in the cange of [0,1)
   */

  /**
   * A random type generator.
   *
   * @typedef {Object} PRNG
   * @property {generatorNext} next Generate new number
   */

  const DefaultPRNG = Xoroshiro128plus;

  /**
   * Create a Xoroshiro128plus Pseudo-Random-Number-Generator.
   * This is the fastest full-period generator passing BigCrush without systematic failures.
   * But there are more PRNGs available in ./PRNG/.
   *
   * @param {number} seed A positive 32bit integer. Do not use negative numbers.
   * @return {PRNG}
   */
  const create$3 = seed => new DefaultPRNG(seed);

  /**
   * Generates a single random bool.
   *
   * @param {PRNG} gen A random number generator.
   * @return {Boolean} A random boolean
   */
  const bool = gen => (gen.next() >= 0.5);

  /**
   * Generates a random integer with 32 bit resolution.
   *
   * @param {PRNG} gen A random number generator.
   * @param {Number} min The lower bound of the allowed return values (inclusive).
   * @param {Number} max The upper bound of the allowed return values (inclusive).
   * @return {Number} A random integer on [min, max]
   */
  const int32 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);

  /**
   * @deprecated
   * Optimized version of prng.int32. It has the same precision as prng.int32, but should be preferred when
   * openaring on smaller ranges.
   *
   * @param {PRNG} gen A random number generator.
   * @param {Number} min The lower bound of the allowed return values (inclusive).
   * @param {Number} max The upper bound of the allowed return values (inclusive). The max inclusive number is `binary.BITS31-1`
   * @return {Number} A random integer on [min, max]
   */
  const int31 = (gen, min, max) => int32(gen, min, max);

  /**
   * @param {PRNG} gen
   * @return {string} A single letter (a-z)
   */
  const letter = gen => fromCharCode(int31(gen, 97, 122));

  /**
   * @param {PRNG} gen
   * @param {number} [minLen=0]
   * @param {number} [maxLen=20]
   * @return {string} A random word (0-20 characters) without spaces consisting of letters (a-z)
   */
  const word = (gen, minLen = 0, maxLen = 20) => {
    const len = int31(gen, minLen, maxLen);
    let str = '';
    for (let i = 0; i < len; i++) {
      str += letter(gen);
    }
    return str
  };

  /**
   * Returns one element of a given array.
   *
   * @param {PRNG} gen A random number generator.
   * @param {Array<T>} array Non empty Array of possible values.
   * @return {T} One of the values of the supplied Array.
   * @template T
   */
  const oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];

  /**
   * Utility helpers for generating statistics.
   *
   * @module statistics
   */

  /**
   * @param {Array<number>} arr Array of values
   * @return {number} Returns null if the array is empty
   */
  const median = arr => arr.length === 0 ? NaN : (arr.length % 2 === 1 ? arr[(arr.length - 1) / 2] : (arr[floor((arr.length - 1) / 2)] + arr[ceil((arr.length - 1) / 2)]) / 2);

  /**
   * @param {Array<number>} arr
   * @return {number}
   */
  const average = arr => arr.reduce(add, 0) / arr.length;

  /**
   * Utility helpers to work with promises.
   *
   * @module promise
   */

  /**
   * @template T
   * @callback PromiseResolve
   * @param {T|PromiseLike<T>} [result]
   */

  /**
   * @template T
   * @param {function(PromiseResolve<T>,function(Error):void):any} f
   * @return {Promise<T>}
   */
  const create$2 = f => /** @type {Promise<T>} */ (new Promise(f));

  /**
   * Checks if an object is a promise using ducktyping.
   *
   * Promises are often polyfilled, so it makes sense to add some additional guarantees if the user of this
   * library has some insane environment where global Promise objects are overwritten.
   *
   * @param {any} p
   * @return {boolean}
   */
  const isPromise = p => p instanceof Promise || (p && p.then && p.catch && p.finally);

  /**
   * Testing framework with support for generating tests.
   *
   * ```js
   * // test.js template for creating a test executable
   * import { runTests } from 'lib0/testing.js'
   * import * as log from 'lib0/logging.js'
   * import * as mod1 from './mod1.test.js'
   * import * as mod2 from './mod2.test.js'

   * import { isBrowser, isNode } from 'lib0/environment.js'
   *
   * if (isBrowser) {
   *   // optional: if this is ran in the browser, attach a virtual console to the dom
   *   log.createVConsole(document.body)
   * }
   *
   * runTests({
   *  mod1,
   *  mod2,
   * }).then(success => {
   *   if (isNode) {
   *     process.exit(success ? 0 : 1)
   *   }
   * })
   * ```
   *
   * ```js
   * // mod1.test.js
   * /**
   *  * runTests automatically tests all exported functions that start with "test".
   *  * The name of the function should be in camelCase and is used for the logging output.
   *  *
   *  * @param {t.TestCase} tc
   *  *\/
   * export const testMyFirstTest = tc => {
   *   t.compare({ a: 4 }, { a: 4 }, 'objects are equal')
   * }
   * ```
   *
   * Now you can simply run `node test.js` to run your test or run test.js in the browser.
   *
   * @module testing
   */

  hasConf('extensive');

  /* istanbul ignore next */
  const envSeed = hasParam('--seed') ? Number.parseInt(getParam('--seed', '0')) : null;

  class TestCase {
    /**
     * @param {string} moduleName
     * @param {string} testName
     */
    constructor (moduleName, testName) {
      /**
       * @type {string}
       */
      this.moduleName = moduleName;
      /**
       * @type {string}
       */
      this.testName = testName;
      this._seed = null;
      this._prng = null;
    }

    resetSeed () {
      this._seed = null;
      this._prng = null;
    }

    /**
     * @type {number}
     */
    /* istanbul ignore next */
    get seed () {
      /* istanbul ignore else */
      if (this._seed === null) {
        /* istanbul ignore next */
        this._seed = envSeed === null ? uint32() : envSeed;
      }
      return this._seed
    }

    /**
     * A PRNG for this test case. Use only this PRNG for randomness to make the test case reproducible.
     *
     * @type {prng.PRNG}
     */
    get prng () {
      /* istanbul ignore else */
      if (this._prng === null) {
        this._prng = create$3(this.seed);
      }
      return this._prng
    }
  }

  const repetitionTime = Number(getParam('--repetition-time', '50'));
  /* istanbul ignore next */
  const testFilter = hasParam('--filter') ? getParam('--filter', '') : null;

  /* istanbul ignore next */
  const testFilterRegExp = testFilter !== null ? new RegExp(testFilter) : new RegExp('.*');

  const repeatTestRegex = /^(repeat|repeating)\s/;

  /**
   * @param {string} moduleName
   * @param {string} name
   * @param {function(TestCase):void|Promise<any>} f
   * @param {number} i
   * @param {number} numberOfTests
   */
  const run = async (moduleName, name, f, i, numberOfTests) => {
    const uncamelized = fromCamelCase(name.slice(4), ' ');
    const filtered = !testFilterRegExp.test(`[${i + 1}/${numberOfTests}] ${moduleName}: ${uncamelized}`);
    /* istanbul ignore if */
    if (filtered) {
      return true
    }
    const tc = new TestCase(moduleName, name);
    const repeat = repeatTestRegex.test(uncamelized);
    const groupArgs = [GREY, `[${i + 1}/${numberOfTests}] `, PURPLE, `${moduleName}: `, BLUE, uncamelized];
    /* istanbul ignore next */
    if (testFilter === null) {
      groupCollapsed(...groupArgs);
    } else {
      group(...groupArgs);
    }
    const times = [];
    const start = performance.now();
    let lastTime = start;
    /**
     * @type {any}
     */
    let err = null;
    performance.mark(`${name}-start`);
    do {
      try {
        const p = f(tc);
        if (isPromise(p)) {
          await p;
        }
      } catch (_err) {
        err = _err;
      }
      const currTime = performance.now();
      times.push(currTime - lastTime);
      lastTime = currTime;
      if (repeat && err === null && (lastTime - start) < repetitionTime) {
        tc.resetSeed();
      } else {
        break
      }
    } while (err === null && (lastTime - start) < repetitionTime)
    performance.mark(`${name}-end`);
    /* istanbul ignore if */
    if (err !== null && err.constructor !== SkipError) {
      printError(err);
    }
    performance.measure(name, `${name}-start`, `${name}-end`);
    groupEnd();
    const duration = lastTime - start;
    let success = true;
    times.sort((a, b) => a - b);
    /* istanbul ignore next */
    const againMessage = isBrowser
      ? `     - ${window.location.href}?filter=\\[${i + 1}/${tc._seed === null ? '' : `&seed=${tc._seed}`}`
      : `\nrepeat: npm run test -- --filter "\\[${i + 1}/" ${tc._seed === null ? '' : `--seed ${tc._seed}`}`;
    const timeInfo = (repeat && err === null)
      ? ` - ${times.length} repetitions in ${humanizeDuration(duration)} (best: ${humanizeDuration(times[0])}, worst: ${humanizeDuration(last(times))}, median: ${humanizeDuration(median(times))}, average: ${humanizeDuration(average(times))})`
      : ` in ${humanizeDuration(duration)}`;
    if (err !== null) {
      /* istanbul ignore else */
      if (err.constructor === SkipError) {
        print(GREY, BOLD, 'Skipped: ', UNBOLD, uncamelized);
      } else {
        success = false;
        print(RED, BOLD, 'Failure: ', UNBOLD, UNCOLOR, uncamelized, GREY, timeInfo, againMessage);
      }
    } else {
      print(GREEN, BOLD, 'Success: ', UNBOLD, UNCOLOR, uncamelized, GREY, timeInfo, againMessage);
    }
    return success
  };

  /**
   * @param {any} constructor
   * @param {any} a
   * @param {any} b
   * @param {string} path
   * @throws {TestError}
   */
  const compareValues = (constructor, a, b, path) => {
    if (a !== b) {
      fail(`Values ${stringify(a)} and ${stringify(b)} don't match (${path})`);
    }
    return true
  };

  /**
   * @param {string?} message
   * @param {string} reason
   * @param {string} path
   * @throws {TestError}
   */
  const _failMessage = (message, reason, path) => fail(
    message === null
      ? `${reason} ${path}`
      : `${message} (${reason}) ${path}`
  );

  /**
   * @param {any} a
   * @param {any} b
   * @param {string} path
   * @param {string?} message
   * @param {function(any,any,any,string,any):boolean} customCompare
   */
  const _compare = (a, b, path, message, customCompare) => {
    // we don't use assert here because we want to test all branches (istanbul errors if one branch is not tested)
    if (a == null || b == null) {
      return compareValues(null, a, b, path)
    }
    if (a.constructor !== b.constructor) {
      _failMessage(message, 'Constructors don\'t match', path);
    }
    let success = true;
    switch (a.constructor) {
      case ArrayBuffer:
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      // eslint-disable-next-line no-fallthrough
      case Uint8Array: {
        if (a.byteLength !== b.byteLength) {
          _failMessage(message, 'ArrayBuffer lengths match', path);
        }
        for (let i = 0; success && i < a.length; i++) {
          success = success && a[i] === b[i];
        }
        break
      }
      case Set: {
        if (a.size !== b.size) {
          _failMessage(message, 'Sets have different number of attributes', path);
        }
        // @ts-ignore
        a.forEach(value => {
          if (!b.has(value)) {
            _failMessage(message, `b.${path} does have ${value}`, path);
          }
        });
        break
      }
      case Map: {
        if (a.size !== b.size) {
          _failMessage(message, 'Maps have different number of attributes', path);
        }
        // @ts-ignore
        a.forEach((value, key) => {
          if (!b.has(key)) {
            _failMessage(message, `Property ${path}["${key}"] does not exist on second argument`, path);
          }
          _compare(value, b.get(key), `${path}["${key}"]`, message, customCompare);
        });
        break
      }
      case Object:
        if (length$1(a) !== length$1(b)) {
          _failMessage(message, 'Objects have a different number of attributes', path);
        }
        forEach(a, (value, key) => {
          if (!hasProperty(b, key)) {
            _failMessage(message, `Property ${path} does not exist on second argument`, path);
          }
          _compare(value, b[key], `${path}["${key}"]`, message, customCompare);
        });
        break
      case Array:
        if (a.length !== b.length) {
          _failMessage(message, 'Arrays have a different number of attributes', path);
        }
        // @ts-ignore
        a.forEach((value, i) => _compare(value, b[i], `${path}[${i}]`, message, customCompare));
        break
      /* istanbul ignore next */
      default:
        if (!customCompare(a.constructor, a, b, path, compareValues)) {
          _failMessage(message, `Values ${stringify(a)} and ${stringify(b)} don't match`, path);
        }
    }
    assert(success, message);
    return true
  };

  /**
   * @template T
   * @param {T} a
   * @param {T} b
   * @param {string?} [message]
   * @param {function(any,T,T,string,any):boolean} [customCompare]
   */
  const compare$1 = (a, b, message = null, customCompare = compareValues) => _compare(a, b, 'obj', message, customCompare);

  /* istanbul ignore next */
  /**
   * @param {boolean} condition
   * @param {string?} [message]
   * @throws {TestError}
   */
  const assert = (condition, message = null) => condition || fail(`Assertion failed${message !== null ? `: ${message}` : ''}`);

  /**
   * @param {Object<string, Object<string, function(TestCase):void|Promise<any>>>} tests
   */
  const runTests = async tests => {
    const numberOfTests = map(tests, mod => map(mod, f => /* istanbul ignore next */ f ? 1 : 0).reduce(add, 0)).reduce(add, 0);
    let successfulTests = 0;
    let testnumber = 0;
    const start = performance.now();
    for (const modName in tests) {
      const mod = tests[modName];
      for (const fname in mod) {
        const f = mod[fname];
        /* istanbul ignore else */
        if (f) {
          const repeatEachTest = 1;
          let success = true;
          for (let i = 0; success && i < repeatEachTest; i++) {
            success = await run(modName, fname, f, testnumber, numberOfTests);
          }
          testnumber++;
          /* istanbul ignore else */
          if (success) {
            successfulTests++;
          }
        }
      }
    }
    const end = performance.now();
    print('');
    const success = successfulTests === numberOfTests;
    /* istanbul ignore next */
    if (success) {
      /* istanbul ignore next */
      print(GREEN, BOLD, 'All tests successful!', GREY, UNBOLD, ` in ${humanizeDuration(end - start)}`);
      /* istanbul ignore next */
      printImgBase64(nyanCatImage, 50);
    } else {
      const failedTests = numberOfTests - successfulTests;
      print(RED, BOLD, `> ${failedTests} test${failedTests > 1 ? 's' : ''} failed`);
    }
    return success
  };

  class TestError extends Error {}

  /**
   * @param {string} reason
   * @throws {TestError}
   */
  const fail = reason => {
    print(RED, BOLD, 'X ', UNBOLD, reason);
    throw new TestError('Test Failed')
  };

  class SkipError extends Error {}

  // eslint-disable-next-line
  const nyanCatImage = 'R0lGODlhjABMAPcAAMiSE0xMTEzMzUKJzjQ0NFsoKPc7//FM/9mH/z9x0HIiIoKCgmBHN+frGSkZLdDQ0LCwsDk71g0KCUzDdrQQEOFz/8yYdelmBdTiHFxcXDU2erR/mLrTHCgoKK5szBQUFNgSCTk6ymfpCB9VZS2Bl+cGBt2N8kWm0uDcGXhZRUvGq94NCFPhDiwsLGVlZTgqIPMDA1g3aEzS5D6xAURERDtG9JmBjJsZGWs2AD1W6Hp6eswyDeJ4CFNTU1LcEoJRmTMzSd14CTg5ser2GmDzBd17/xkZGUzMvoSMDiEhIfKruCwNAJaWlvRzA8kNDXDrCfi0pe1U/+GS6SZrAB4eHpZwVhoabsx9oiYmJt/TGHFxcYyMjOid0+Zl/0rF6j09PeRr/0zU9DxO6j+z0lXtBtp8qJhMAEssLGhoaPL/GVn/AAsWJ/9/AE3Z/zs9/3cAAOlf/+aa2RIyADo85uhh/0i84WtrazQ0UyMlmDMzPwUFBe16BTMmHau0E03X+g8pMEAoS1MBAf++kkzO8pBaqSZoe9uB/zE0BUQ3Sv///4WFheuiyzo880gzNDIyNissBNqF/8RiAOF2qG5ubj0vL1z6Avl5ASsgGkgUSy8vL/8n/z4zJy8lOv96uEssV1csAN5ZCDQ0Wz1a3tbEGHLeDdYKCg4PATE7PiMVFSoqU83eHEi43gUPAOZ8reGogeKU5dBBC8faHEez2lHYF4bQFMukFtl4CzY3kkzBVJfMGZkAAMfSFf27mP0t//g4/9R6Dfsy/1DRIUnSAPRD/0fMAFQ0Q+l7rnbaD0vEntCDD6rSGtO8GNpUCU/MK07LPNEfC7RaABUWWkgtOst+71v9AfD7GfDw8P19ATtA/NJpAONgB9yL+fm6jzIxMdnNGJxht1/2A9x//9jHGOSX3+5tBP27l35+fk5OTvZ9AhYgTjo0PUhGSDs9+LZjCFf2Aw0IDwcVAA8PD5lwg9+Q7YaChC0kJP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM2MUEyMzE0QTRFMTExOUQzRkE3QTBCRDNBMjdBQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERjQ0NEY0QkI2MTcxMUUxOUJEQkUzNUNGQTkwRTU2MiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERjQ0NEY0QUI2MTcxMUUxOUJEQkUzNUNGQTkwRTU2MiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1OEE3RTIwRjcyQTlFMTExOTQ1QkY2QTU5QzVCQjJBOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM2MUEyMzE0QTRFMTExOUQzRkE3QTBCRDNBMjdBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkKABEAIf4jUmVzaXplZCBvbiBodHRwczovL2V6Z2lmLmNvbS9yZXNpemUALAAAAACMAEwAAAj/ACMIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXLkxEcuXMAm6jElTZaKZNXOOvOnyps6fInECHdpRKNGjSJMqXZrSKNOnC51CnUq1qtWrWLNC9GmQq9avYMOKHUs2aFmmUs8SlcC2rdu3cNWeTEG3rt27eBnIHflBj6C/gAMLHpxCz16QElJw+7tom+PHkCOP+8utiuHDHRP/5WICgefPkIYV8RAjxudtkwVZjqCnNeaMmheZqADm8+coHn5kyPBt2udFvKrc+7A7gITXFzV77hLF9ucYGRaYo+FhWhHPUKokobFgQYbjyCsq/3fuHHr3BV88HMBeZd357+HFpxBEvnz0961b3+8OP37DtgON5xxznpl3ng5aJKiFDud5B55/Ct3TQwY93COQgLZV0AUC39ihRYMggjhJDw9CeNA9kyygxT2G6TGfcxUY8pkeH3YHgTkMNrgFBJOYs8Akl5l4Yoor3mPki6BpUsGMNS6QiA772WjNPR8CSRAjWBI0B5ZYikGQGFwyMseVYWoZppcDhSkmmVyaySWaAqk5pkBbljnQlnNYEZ05fGaAJGieVQAMjd2ZY+R+X2Rgh5FVBhmBG5BGKumklFZq6aWYZqrpppTOIQQNNPjoJ31RbGibIRXQuIExrSSY4wI66P9gToJlGHOFo374MQg2vGLjRa65etErNoMA68ew2Bi7a6+/Aitsr8UCi6yywzYb7LDR5jotsMvyau0qJJCwGw0vdrEkeTRe0UknC7hQYwYMQrmAMZ2U4WgY+Lahbxt+4Ovvvm34i68fAAscBsD9+kvwvgYDHLDACAu8sL4NFwzxvgkP3EYhhYzw52dFhOPZD5Ns0Iok6PUwyaIuTJLBBwuUIckG8RCkhhrUHKHzEUTcfLM7Ox/hjs9qBH0E0ZUE3bPPQO9cCdFGIx300EwH/bTPUfuc9M5U30zEzhN87NkwcDyXgY/oxaP22vFQIR2JBT3xBDhEUyO33FffXMndT1D/QzTfdPts9915qwEO3377DHjdfBd++N2J47y44Ij7PMN85UgBxzCeQQKJbd9wFyKI6jgqUBqoD6G66qinvvoQ1bSexutDyF4N7bLTHnvruLd+++u5v76766vb3jvxM0wxnyBQxHEued8Y8cX01Fc/fQcHZaG97A1or30DsqPgfRbDpzF+FtyPD37r4ns/fDXnp+/9+qif//74KMj/fRp9TEIDAxb4ixIWQcACFrAMFkigAhPIAAmwyHQDYYMEJ0jBClrwghjMoAY3yMEOYhAdQaCBFtBAAD244oQoTKEKV5iCbizEHjCkoCVgCENLULAJNLTHNSZ4jRzaQ4Y5tOEE+X24Qwn2MIdApKEQJUhEHvowiTBkhh7QVqT8GOmKWHwgFiWghR5AkCA+DKMYx0jGMprxjGhMYw5XMEXvGAZF5piEhQyih1CZ4wt6kIARfORFhjwDBoCEQQkIUoJAwmAFBDEkDAhSCkMOciCFDCQiB6JIgoDAkYQ0JAgSaUhLYnIgFLjH9AggkHsQYHo1oyMVptcCgUjvCx34opAWkp/L1BIhtxxILmfJy17KxJcrSQswhykWYRLzI8Y8pjKXycxfNvOZMEkmNC0izWlSpJrWlAg2s8kQnkRgJt7kpja92ZNwivOcNdkmOqOyzoyos50IeSc850nPegIzIAAh+QQJCgARACwAAAAAjABMAAAI/wAjCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJcmKikihTZkx0UqXLlw5ZwpxJ02DLmjhz6twJkqVMnz55Ch1KtGhCmUaTYkSqtKnJm05rMl0aVefUqlhtFryatavXr2DDHoRKkKzYs2jTqpW61exani3jun0rlCvdrhLy6t3Lt+9dlykCCx5MuDCDvyU/6BHEuLHjx5BT6EEsUkIKbowXbdvMubPncYy5VZlM+aNlxlxMIFjNGtKwIggqDGO9DbSg0aVNpxC0yEQFMKxZRwmHoEiU4AgW8cKdu+Pp1V2OI6c9bdq2cLARQGEeIV7zjM+nT//3oEfPNDiztTOXoMf7d4vhxbP+ts6cORrfIK3efq+8FnN2kPbeRPEFF918NCywgBZafLNfFffEM4k5C0wi4IARFchaBV0gqGCFDX6zQQqZZPChhRgSuBtyFRiC3DcJfqgFDTTSYOKJF6boUIGQaFLBizF+KOSQKA7EyJEEzXHkkWIQJMaSjMxBEJSMJAllk0ZCKWWWS1q5JJYCUbllBEpC6SWTEehxzz0rBqdfbL1AEsONQ9b5oQ73DOTGnnz26eefgAYq6KCEFmoooCHccosdk5yzYhQdBmfIj3N++AAEdCqoiDU62LGAOXkK5Icfg2BjKjZejDqqF6diM4iqfrT/ig2spZ6aqqqsnvqqqrLS2uqtq7a666i9qlqrqbeeQEIGN2awYhc/ilepghAssM6JaCwAQQ8ufBpqBGGE28a4bfgR7rnktnFuuH6ku24Y6Zp7brvkvpuuuuvGuy6949rrbr7kmltHIS6Yw6AWjgoyXRHErTYnPRtskMEXdLrQgzlffKHDBjZ8q4Ya1Bwh8hFEfPyxOyMf4Y7JaqR8BMuVpFyyySiPXAnLLsOc8so0p3yzyTmbHPPIK8sxyYJr9tdmcMPAwdqcG3TSyQZ2fniF1N8+8QQ4LFOjtdY/f1zJ109QwzLZXJvs9ddhqwEO2WabjHbXZLf99tdxgzy32k8Y/70gK+5UMsNu5UiB3mqQvIkA1FJLfO0CFH8ajxZXd/JtGpgPobnmmGe++RDVdJ7G50OIXg3popMeeueod37656l/vrrnm5uOOgZIfJECBpr3sZsgUMQRLXLTEJJBxPRkkETGRmSS8T1a2CCPZANlYb3oDVhvfQOio6B9FrOn8X0W2H/Pfefeaz97NeOXr/35mI+//vcouJ9MO7V03gcDFjCmxCIADGAAr1CFG2mBWQhEoA600IMLseGBEIygBCdIwQpa8IIYzKAGMcgDaGTMFSAMoQhDaAE9HOyEKOyBewZijxZG0BItbKElItiEGNrjGhC8hg3t8UIbzhCCO8ThA+Z1aMMexvCHDwxiDndoRBk+8A03Slp/1CTFKpaHiv3JS9IMssMuevGLYAyjGMdIxjJ6EYoK0oNivmCfL+RIINAD0GT0YCI8rdAgz4CBHmFQAoKUYI8wWAFBAAkDgpQCkH0cyB/3KMiBEJIgIECkHwEJgkECEpKSVKQe39CCjH0gTUbIWAsQcg8CZMw78TDlF76lowxdUSBXfONArrhC9pSnlbjMpS7rssuZzKWXPQHKL4HZEWESMyXDPKZHkqnMZjrzLnZ5pjSnSc1qWmQuzLSmQrCpzW5685vfjCY4x0nOcprznB4JCAAh+QQJCgBIACwAAAAAjABMAAAI/wCRCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJcmGiRCVTqsyIcqXLlzBjypxJs6bNmzgPtjR4MqfPn0CDCh1KtKjNnkaTPtyptKlToEyfShUYderTqlaNnkSJNGvTrl6dYg1bdCzZs2jTqvUpoa3bt3DjrnWZoq7du3jzMphb8oMeQYADCx5MOIUeviIlpOAGeNG2x5AjSx4HmFuVw4g/KgbMxQSCz6AhDSuCoMIw0NsoC7qcWXMKQYtMVAADGnSUcAiKRKmNYBEv1q07bv7cZTfvz9OSfw5HGgEU1vHiBdc4/Djvb3refY5y2jlrPeCnY/+sbv1zjAzmzFGZBgnS5+f3PqTvIUG8RfK1i5vPsGDBpB8egPbcF5P0l0F99jV0z4ILCoQfaBV0sV9/C7jwwzcYblAFGhQemGBDX9BAAwH3HKbHa7xVYEht51FYoYgictghgh8iZMQ95vSnBYP3oBiaJhWwyJ+LRLrooUGlwKCkkgSVsCQMKxD0JAwEgfBkCU0+GeVAUxK0wpVZLrmlQF0O9OWSTpRY4ALp0dCjILy5Vxow72hR5J0U2oGZQPb06eefgAYq6KCEFmrooYj6CQMIICgAIw0unINiFBLWZkgFetjZnzU62EEkEw/QoIN/eyLh5zWoXmPJn5akek0TrLr/Cqirq/rZaqqw2ppqrX02QWusuAKr6p++7trnDtAka8o5NKDYRZDHZUohBBkMWaEWTEBwj52TlMrGt+CGK+645JZr7rnopquuuejU9YmPtRWBGwKZ2rCBDV98IeMCPaChRb7ybCBPqVkUnMbBaTRQcMENIJwGCgtnUY3DEWfhsMILN4wwxAtPfHA1EaNwccQaH8xxwR6nAfLCIiOMMcMI9wEvaMPA8VmmV3TSCZ4UGtNJGaV+PMTQQztMNNFGH+1wNUcPkbTSCDe9tNRRH51yGlQLDfXBR8ssSDlSwNFdezdrkfPOX7jAZjzcUrGAz0ATBA44lahhtxrUzD133XdX/6I3ONTcrcbf4Aiet96B9/134nb/zbfdh8/NuBp+I3535HQbvrjdM0zxmiBQxAFtbR74u8EGC3yRSb73qPMFAR8sYIM8KdCIBORH5H4EGYITofsR7gj++xGCV/I773f7rnvwdw9f/O9E9P7742o4f7c70AtOxhEzuEADAxYApsQi5JdPvgUb9udCteyzX2EAtiMRxvxt1N+GH/PP74f9beRPP//+CwP/8Je//dkvgPzrn/8G6D8D1g+BAFyg/QiYv1XQQAtoIIAeXMHBDnqQg1VQhxZGSMISjlCDBvGDHwaBjRZiwwsqVKEXXIiNQcTQDzWg4Q1Z6EIYxnCGLrRhDP9z6MId0tCHMqShEFVIxBYasYc3PIEecrSAHZUIPDzK4hV5pAcJ6IFBCHGDGMdIxjKa8YxoTKMa18jGNqJxDlNcQAYOc49JmGMS9ziIHr6Qni+Axwg56kGpDMKIQhIkAoUs5BwIIoZEMiICBHGkGAgyB0cuciCNTGRBJElJSzLSkZtM5CQHUslECuEe+SKAQO5BgHxJxyB6oEK+WiAQI+SrA4Os0UPAEx4k8DKXAvklQXQwR2DqMiVgOeZLkqnMlTCzmdCcy1aQwJVpRjMk06zmM6/pEbNwEyTb/OZHwinOjpCznNREJzaj4k11TiSZ7XSnPHESz3lW5JnntKc+94kTFnjyUyP1/OdSBErQghr0oB0JCAAh+QQFCgAjACwAAAAAjABMAAAI/wBHCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJkmCikihTWjw5giVLlTBjHkz0UmBNmThz6tzJs6fPkTRn3vxJtKjRo0iTbgxqUqlTiC5tPt05dOXUnkyval2YdatXg12/ih07lmZQs2bJql27NSzbqW7fOo0rN2nViBLy6t3Lt29dmfGqCB5MuLBhBvH+pmSQQpAgKJAjS54M2XEVBopLSmjseBGCz6BDi37lWFAVPZlHbnb8SvRnSL0qIKjQK/Q2y6hTh1z9ahuYKK4rGEJgSHboV1BO697d+HOFLq4/e/j2zTmYz8lR37u3vOPq6KGnEf/68mXaNjrAEWT/QL5b943fwX+OkWGBOT3TQie/92HBggwSvCeRHgQSKFB8osExzHz12UdDddhVQYM5/gEoYET3ZDBJBveghmBoRRhHn38LaKHFDyimYIcWJFp44UP39KCFDhno0WFzocERTmgjkrhhBkCy2GKALzq03Tk6LEADFffg+NowshU3jR1okGjllf658EWRMN7zhX80NCkIeLTpISSWaC4wSW4ElQLDm28SVAKcMKxAEJ0wEAQCnSXISaedA+FJ0Ap8+gknoAIJOhChcPYpUCAdUphBc8PAEZ2ZJCZC45UQWIPpmgTZI+qopJZq6qmopqrqqqy2eioMTtz/QwMNmTRXQRGXnqnIFw0u0EOVC9zDIqgDjXrNsddYQqolyF7TxLLNltqssqMyi+yz1SJLrahNTAvttd8mS2q32pJ6ATTQfCKma10YZ+YGV1wRJIkuzAgkvPKwOQIb/Pbr778AByzwwAQXbPDBBZvxSWNSbBMOrghEAR0CZl7RSSclJlkiheawaEwnZeibxchplJxGAyOP3IDJaaCQchbVsPxyFiyjnPLKJruccswlV/MyCjW/jHPJOo/Mcxo+pwy0yTarbHIfnL2ioGvvaGExxrzaJ+wCdvT3ccgE9TzE2GOzTDbZZp/NcjVnD5G22ia3vbbccZ99dBp0iw13yWdD/10aF5BERx899CzwhQTxxHMP4hL0R08GlxQEDjiVqGG5GtRMPnnll1eiOTjUXK7G5+CInrnmoXf+eeqWf8655adPzroanqN+eeyUm7665TNMsQlnUCgh/PDCu1JFD/6ZqPzyvhJgEOxHRH8EGaITIf0R7oh+/RGiV3I99ZdbL332l2/f/fVEVH/962qYf7k76ItOxhEzuABkBhbkr//++aeQyf0ADKDzDBKGArbhgG3wQwEL6AcEtmGBBnQgBMPgQAUusIEInKADHwjBCkIQgwfUoAQ7iEALMtAPa5iEfbTQIT0YgTxGKJAMvfSFDhDoHgT4AgE6hBA/+GEQ2AgiNvy84EMfekGI2BhEEf1QAyQuEYhCJGIRjyhEJRaxiUJ8IhKlaEQkWtGHWAyiFqO4RC/UIIUl2s4H9PAlw+lrBPHQQ4UCtDU7vJEgbsijHvfIxz768Y+ADKQgB0lIQGJjDdvZjkBstJ3EHCSRRLLRHQnCiEoSJAKVrOQcCCKGTDIiApTMpBgIMgdPbnIgncxkQTw5yoGUMpOnFEgqLRnKSrZSIK/U5Ag+kLjEDaSXCQGmQHzJpWIasyV3OaYyl8nMZi7nLsl0ZkagKc1qWvOa2JxLNLPJzW6+ZZvevAhdwrkStJCTI2gZ5zknos51shOc7oynPOdJz3ra857hDAgAOw==';

  /**
   * Utility module to work with sets.
   *
   * @module set
   */

  const create$1 = () => new Set();

  /**
   * Observable class prototype.
   *
   * @module observable
   */

  /**
   * Handles named events.
   *
   * @template N
   */
  class Observable {
    constructor () {
      /**
       * Some desc.
       * @type {Map<N, any>}
       */
      this._observers = create$6();
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    on (name, f) {
      setIfUndefined(this._observers, name, create$1).add(f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    once (name, f) {
      /**
       * @param  {...any} args
       */
      const _f = (...args) => {
        this.off(name, _f);
        f(...args);
      };
      this.on(name, _f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    off (name, f) {
      const observers = this._observers.get(name);
      if (observers !== undefined) {
        observers.delete(f);
        if (observers.size === 0) {
          this._observers.delete(name);
        }
      }
    }

    /**
     * Emit a named event. All registered event listeners that listen to the
     * specified name will receive the event.
     *
     * @todo This should catch exceptions
     *
     * @param {N} name The event name.
     * @param {Array<any>} args The arguments that are applied to the event listener.
     */
    emit (name, args) {
      // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
      return from((this._observers.get(name) || create$6()).values()).forEach(f => f(...args))
    }

    destroy () {
      this._observers = create$6();
    }
  }

  /**
   * This is an abstract interface that all Connectors should implement to keep them interchangeable.
   *
   * @note This interface is experimental and it is not advised to actually inherit this class.
   *       It just serves as typing information.
   *
   * @extends {Observable<any>}
   */
  class AbstractConnector extends Observable {
    /**
     * @param {Doc} ydoc
     * @param {any} awareness
     */
    constructor (ydoc, awareness) {
      super();
      this.doc = ydoc;
      this.awareness = awareness;
    }
  }

  class DeleteItem {
    /**
     * @param {number} clock
     * @param {number} len
     */
    constructor (clock, len) {
      /**
       * @type {number}
       */
      this.clock = clock;
      /**
       * @type {number}
       */
      this.len = len;
    }
  }

  /**
   * We no longer maintain a DeleteStore. DeleteSet is a temporary object that is created when needed.
   * - When created in a transaction, it must only be accessed after sorting, and merging
   *   - This DeleteSet is send to other clients
   * - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
   * - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
   */
  class DeleteSet {
    constructor () {
      /**
       * @type {Map<number,Array<DeleteItem>>}
       */
      this.clients = new Map();
    }
  }

  /**
   * Iterate over all structs that the DeleteSet gc's.
   *
   * @param {Transaction} transaction
   * @param {DeleteSet} ds
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateDeletedStructs = (transaction, ds, f) =>
    ds.clients.forEach((deletes, clientid) => {
      const structs = /** @type {Array<GC|Item>} */ (transaction.doc.store.clients.get(clientid));
      for (let i = 0; i < deletes.length; i++) {
        const del = deletes[i];
        iterateStructs(transaction, structs, del.clock, del.len, f);
      }
    });

  /**
   * @param {Array<DeleteItem>} dis
   * @param {number} clock
   * @return {number|null}
   *
   * @private
   * @function
   */
  const findIndexDS = (dis, clock) => {
    let left = 0;
    let right = dis.length - 1;
    while (left <= right) {
      const midindex = floor((left + right) / 2);
      const mid = dis[midindex];
      const midclock = mid.clock;
      if (midclock <= clock) {
        if (clock < midclock + mid.len) {
          return midindex
        }
        left = midindex + 1;
      } else {
        right = midindex - 1;
      }
    }
    return null
  };

  /**
   * @param {DeleteSet} ds
   * @param {ID} id
   * @return {boolean}
   *
   * @private
   * @function
   */
  const isDeleted = (ds, id) => {
    const dis = ds.clients.get(id.client);
    return dis !== undefined && findIndexDS(dis, id.clock) !== null
  };

  /**
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const sortAndMergeDeleteSet = ds => {
    ds.clients.forEach(dels => {
      dels.sort((a, b) => a.clock - b.clock);
      // merge items without filtering or splicing the array
      // i is the current pointer
      // j refers to the current insert position for the pointed item
      // try to merge dels[i] into dels[j-1] or set dels[j]=dels[i]
      let i, j;
      for (i = 1, j = 1; i < dels.length; i++) {
        const left = dels[j - 1];
        const right = dels[i];
        if (left.clock + left.len >= right.clock) {
          left.len = max(left.len, right.clock + right.len - left.clock);
        } else {
          if (j < i) {
            dels[j] = right;
          }
          j++;
        }
      }
      dels.length = j;
    });
  };

  /**
   * @param {Array<DeleteSet>} dss
   * @return {DeleteSet} A fresh DeleteSet
   */
  const mergeDeleteSets = dss => {
    const merged = new DeleteSet();
    for (let dssI = 0; dssI < dss.length; dssI++) {
      dss[dssI].clients.forEach((delsLeft, client) => {
        if (!merged.clients.has(client)) {
          // Write all missing keys from current ds and all following.
          // If merged already contains `client` current ds has already been added.
          /**
           * @type {Array<DeleteItem>}
           */
          const dels = delsLeft.slice();
          for (let i = dssI + 1; i < dss.length; i++) {
            appendTo(dels, dss[i].clients.get(client) || []);
          }
          merged.clients.set(client, dels);
        }
      });
    }
    sortAndMergeDeleteSet(merged);
    return merged
  };

  /**
   * @param {DeleteSet} ds
   * @param {number} client
   * @param {number} clock
   * @param {number} length
   *
   * @private
   * @function
   */
  const addToDeleteSet = (ds, client, clock, length) => {
    setIfUndefined(ds.clients, client, () => []).push(new DeleteItem(clock, length));
  };

  const createDeleteSet = () => new DeleteSet();

  /**
   * @param {StructStore} ss
   * @return {DeleteSet} Merged and sorted DeleteSet
   *
   * @private
   * @function
   */
  const createDeleteSetFromStructStore = ss => {
    const ds = createDeleteSet();
    ss.clients.forEach((structs, client) => {
      /**
       * @type {Array<DeleteItem>}
       */
      const dsitems = [];
      for (let i = 0; i < structs.length; i++) {
        const struct = structs[i];
        if (struct.deleted) {
          const clock = struct.id.clock;
          let len = struct.length;
          if (i + 1 < structs.length) {
            for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
              len += next.length;
            }
          }
          dsitems.push(new DeleteItem(clock, len));
        }
      }
      if (dsitems.length > 0) {
        ds.clients.set(client, dsitems);
      }
    });
    return ds
  };

  /**
   * @param {DSEncoderV1 | DSEncoderV2} encoder
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const writeDeleteSet = (encoder, ds) => {
    writeVarUint(encoder.restEncoder, ds.clients.size);
    ds.clients.forEach((dsitems, client) => {
      encoder.resetDsCurVal();
      writeVarUint(encoder.restEncoder, client);
      const len = dsitems.length;
      writeVarUint(encoder.restEncoder, len);
      for (let i = 0; i < len; i++) {
        const item = dsitems[i];
        encoder.writeDsClock(item.clock);
        encoder.writeDsLen(item.len);
      }
    });
  };

  /**
   * @param {DSDecoderV1 | DSDecoderV2} decoder
   * @return {DeleteSet}
   *
   * @private
   * @function
   */
  const readDeleteSet = decoder => {
    const ds = new DeleteSet();
    const numClients = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numClients; i++) {
      decoder.resetDsCurVal();
      const client = readVarUint(decoder.restDecoder);
      const numberOfDeletes = readVarUint(decoder.restDecoder);
      if (numberOfDeletes > 0) {
        const dsField = setIfUndefined(ds.clients, client, () => []);
        for (let i = 0; i < numberOfDeletes; i++) {
          dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
        }
      }
    }
    return ds
  };

  /**
   * @todo YDecoder also contains references to String and other Decoders. Would make sense to exchange YDecoder.toUint8Array for YDecoder.DsToUint8Array()..
   */

  /**
   * @param {DSDecoderV1 | DSDecoderV2} decoder
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {Uint8Array|null} Returns a v2 update containing all deletes that couldn't be applied yet; or null if all deletes were applied successfully.
   *
   * @private
   * @function
   */
  const readAndApplyDeleteSet = (decoder, transaction, store) => {
    const unappliedDS = new DeleteSet();
    const numClients = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numClients; i++) {
      decoder.resetDsCurVal();
      const client = readVarUint(decoder.restDecoder);
      const numberOfDeletes = readVarUint(decoder.restDecoder);
      const structs = store.clients.get(client) || [];
      const state = getState(store, client);
      for (let i = 0; i < numberOfDeletes; i++) {
        const clock = decoder.readDsClock();
        const clockEnd = clock + decoder.readDsLen();
        if (clock < state) {
          if (state < clockEnd) {
            addToDeleteSet(unappliedDS, client, state, clockEnd - state);
          }
          let index = findIndexSS(structs, clock);
          /**
           * We can ignore the case of GC and Delete structs, because we are going to skip them
           * @type {Item}
           */
          // @ts-ignore
          let struct = structs[index];
          // split the first item if necessary
          if (!struct.deleted && struct.id.clock < clock) {
            structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
            index++; // increase we now want to use the next struct
          }
          while (index < structs.length) {
            // @ts-ignore
            struct = structs[index++];
            if (struct.id.clock < clockEnd) {
              if (!struct.deleted) {
                if (clockEnd < struct.id.clock + struct.length) {
                  structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
                }
                struct.delete(transaction);
              }
            } else {
              break
            }
          }
        } else {
          addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
        }
      }
    }
    if (unappliedDS.clients.size > 0) {
      const ds = new UpdateEncoderV2();
      writeVarUint(ds.restEncoder, 0); // encode 0 structs
      writeDeleteSet(ds, unappliedDS);
      return ds.toUint8Array()
    }
    return null
  };

  /**
   * @module Y
   */

  const generateNewClientId = uint32;

  /**
   * @typedef {Object} DocOpts
   * @property {boolean} [DocOpts.gc=true] Disable garbage collection (default: gc=true)
   * @property {function(Item):boolean} [DocOpts.gcFilter] Will be called before an Item is garbage collected. Return false to keep the Item.
   * @property {string} [DocOpts.guid] Define a globally unique identifier for this document
   * @property {string | null} [DocOpts.collectionid] Associate this document with a collection. This only plays a role if your provider has a concept of collection.
   * @property {any} [DocOpts.meta] Any kind of meta information you want to associate with this document. If this is a subdocument, remote peers will store the meta information as well.
   * @property {boolean} [DocOpts.autoLoad] If a subdocument, automatically load document. If this is a subdocument, remote peers will load the document as well automatically.
   * @property {boolean} [DocOpts.shouldLoad] Whether the document should be synced by the provider now. This is toggled to true when you call ydoc.load()
   */

  /**
   * A Yjs instance handles the state of shared data.
   * @extends Observable<string>
   */
  class Doc extends Observable {
    /**
     * @param {DocOpts} [opts] configuration
     */
    constructor ({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
      super();
      this.gc = gc;
      this.gcFilter = gcFilter;
      this.clientID = generateNewClientId();
      this.guid = guid;
      this.collectionid = collectionid;
      /**
       * @type {Map<string, AbstractType<YEvent<any>>>}
       */
      this.share = new Map();
      this.store = new StructStore();
      /**
       * @type {Transaction | null}
       */
      this._transaction = null;
      /**
       * @type {Array<Transaction>}
       */
      this._transactionCleanups = [];
      /**
       * @type {Set<Doc>}
       */
      this.subdocs = new Set();
      /**
       * If this document is a subdocument - a document integrated into another document - then _item is defined.
       * @type {Item?}
       */
      this._item = null;
      this.shouldLoad = shouldLoad;
      this.autoLoad = autoLoad;
      this.meta = meta;
      this.isLoaded = false;
      this.whenLoaded = create$2(resolve => {
        this.on('load', () => {
          this.isLoaded = true;
          resolve(this);
        });
      });
    }

    /**
     * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
     *
     * `load()` might be used in the future to request any provider to load the most current data.
     *
     * It is safe to call `load()` multiple times.
     */
    load () {
      const item = this._item;
      if (item !== null && !this.shouldLoad) {
        transact(/** @type {any} */ (item.parent).doc, transaction => {
          transaction.subdocsLoaded.add(this);
        }, null, true);
      }
      this.shouldLoad = true;
    }

    getSubdocs () {
      return this.subdocs
    }

    getSubdocGuids () {
      return new Set(Array.from(this.subdocs).map(doc => doc.guid))
    }

    /**
     * Changes that happen inside of a transaction are bundled. This means that
     * the observer fires _after_ the transaction is finished and that all changes
     * that happened inside of the transaction are sent as one message to the
     * other peers.
     *
     * @param {function(Transaction):void} f The function that should be executed as a transaction
     * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
     *
     * @public
     */
    transact (f, origin = null) {
      transact(this, f, origin);
    }

    /**
     * Define a shared data type.
     *
     * Multiple calls of `y.get(name, TypeConstructor)` yield the same result
     * and do not overwrite each other. I.e.
     * `y.define(name, Y.Array) === y.define(name, Y.Array)`
     *
     * After this method is called, the type is also available on `y.share.get(name)`.
     *
     * *Best Practices:*
     * Define all types right after the Yjs instance is created and store them in a separate object.
     * Also use the typed methods `getText(name)`, `getArray(name)`, ..
     *
     * @example
     *   const y = new Y(..)
     *   const appState = {
     *     document: y.getText('document')
     *     comments: y.getArray('comments')
     *   }
     *
     * @param {string} name
     * @param {Function} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
     * @return {AbstractType<any>} The created type. Constructed with TypeConstructor
     *
     * @public
     */
    get (name, TypeConstructor = AbstractType) {
      const type = setIfUndefined(this.share, name, () => {
        // @ts-ignore
        const t = new TypeConstructor();
        t._integrate(this, null);
        return t
      });
      const Constr = type.constructor;
      if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
        if (Constr === AbstractType) {
          // @ts-ignore
          const t = new TypeConstructor();
          t._map = type._map;
          type._map.forEach(/** @param {Item?} n */ n => {
            for (; n !== null; n = n.left) {
              // @ts-ignore
              n.parent = t;
            }
          });
          t._start = type._start;
          for (let n = t._start; n !== null; n = n.right) {
            n.parent = t;
          }
          t._length = type._length;
          this.share.set(name, t);
          t._integrate(this, null);
          return t
        } else {
          throw new Error(`Type with the name ${name} has already been defined with a different constructor`)
        }
      }
      return type
    }

    /**
     * @template T
     * @param {string} [name]
     * @return {YArray<T>}
     *
     * @public
     */
    getArray (name = '') {
      // @ts-ignore
      return this.get(name, YArray)
    }

    /**
     * @param {string} [name]
     * @return {YText}
     *
     * @public
     */
    getText (name = '') {
      // @ts-ignore
      return this.get(name, YText)
    }

    /**
     * @template T
     * @param {string} [name]
     * @return {YMap<T>}
     *
     * @public
     */
    getMap (name = '') {
      // @ts-ignore
      return this.get(name, YMap)
    }

    /**
     * @param {string} [name]
     * @return {YXmlFragment}
     *
     * @public
     */
    getXmlFragment (name = '') {
      // @ts-ignore
      return this.get(name, YXmlFragment)
    }

    /**
     * Converts the entire document into a js object, recursively traversing each yjs type
     * Doesn't log types that have not been defined (using ydoc.getType(..)).
     *
     * @deprecated Do not use this method and rather call toJSON directly on the shared types.
     *
     * @return {Object<string, any>}
     */
    toJSON () {
      /**
       * @type {Object<string, any>}
       */
      const doc = {};

      this.share.forEach((value, key) => {
        doc[key] = value.toJSON();
      });

      return doc
    }

    /**
     * Emit `destroy` event and unregister all event handlers.
     */
    destroy () {
      from(this.subdocs).forEach(subdoc => subdoc.destroy());
      const item = this._item;
      if (item !== null) {
        this._item = null;
        const content = /** @type {ContentDoc} */ (item.content);
        content.doc = new Doc({ guid: this.guid, ...content.opts, shouldLoad: false });
        content.doc._item = item;
        transact(/** @type {any} */ (item).parent.doc, transaction => {
          const doc = content.doc;
          if (!item.deleted) {
            transaction.subdocsAdded.add(doc);
          }
          transaction.subdocsRemoved.add(this);
        }, null, true);
      }
      this.emit('destroyed', [true]);
      this.emit('destroy', [this]);
      super.destroy();
    }

    /**
     * @param {string} eventName
     * @param {function(...any):any} f
     */
    on (eventName, f) {
      super.on(eventName, f);
    }

    /**
     * @param {string} eventName
     * @param {function} f
     */
    off (eventName, f) {
      super.off(eventName, f);
    }
  }

  class DSDecoderV1 {
    /**
     * @param {decoding.Decoder} decoder
     */
    constructor (decoder) {
      this.restDecoder = decoder;
    }

    resetDsCurVal () {
      // nop
    }

    /**
     * @return {number}
     */
    readDsClock () {
      return readVarUint(this.restDecoder)
    }

    /**
     * @return {number}
     */
    readDsLen () {
      return readVarUint(this.restDecoder)
    }
  }

  class UpdateDecoderV1 extends DSDecoderV1 {
    /**
     * @return {ID}
     */
    readLeftID () {
      return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder))
    }

    /**
     * @return {ID}
     */
    readRightID () {
      return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder))
    }

    /**
     * Read the next client id.
     * Use this in favor of readID whenever possible to reduce the number of objects created.
     */
    readClient () {
      return readVarUint(this.restDecoder)
    }

    /**
     * @return {number} info An unsigned 8-bit integer
     */
    readInfo () {
      return readUint8(this.restDecoder)
    }

    /**
     * @return {string}
     */
    readString () {
      return readVarString(this.restDecoder)
    }

    /**
     * @return {boolean} isKey
     */
    readParentInfo () {
      return readVarUint(this.restDecoder) === 1
    }

    /**
     * @return {number} info An unsigned 8-bit integer
     */
    readTypeRef () {
      return readVarUint(this.restDecoder)
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @return {number} len
     */
    readLen () {
      return readVarUint(this.restDecoder)
    }

    /**
     * @return {any}
     */
    readAny () {
      return readAny(this.restDecoder)
    }

    /**
     * @return {Uint8Array}
     */
    readBuf () {
      return copyUint8Array(readVarUint8Array(this.restDecoder))
    }

    /**
     * Legacy implementation uses JSON parse. We use any-decoding in v2.
     *
     * @return {any}
     */
    readJSON () {
      return JSON.parse(readVarString(this.restDecoder))
    }

    /**
     * @return {string}
     */
    readKey () {
      return readVarString(this.restDecoder)
    }
  }

  class DSDecoderV2 {
    /**
     * @param {decoding.Decoder} decoder
     */
    constructor (decoder) {
      /**
       * @private
       */
      this.dsCurrVal = 0;
      this.restDecoder = decoder;
    }

    resetDsCurVal () {
      this.dsCurrVal = 0;
    }

    /**
     * @return {number}
     */
    readDsClock () {
      this.dsCurrVal += readVarUint(this.restDecoder);
      return this.dsCurrVal
    }

    /**
     * @return {number}
     */
    readDsLen () {
      const diff = readVarUint(this.restDecoder) + 1;
      this.dsCurrVal += diff;
      return diff
    }
  }

  class UpdateDecoderV2 extends DSDecoderV2 {
    /**
     * @param {decoding.Decoder} decoder
     */
    constructor (decoder) {
      super(decoder);
      /**
       * List of cached keys. If the keys[id] does not exist, we read a new key
       * from stringEncoder and push it to keys.
       *
       * @type {Array<string>}
       */
      this.keys = [];
      readVarUint(decoder); // read feature flag - currently unused
      this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
      this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
      this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
      this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
      this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
      this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
      this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
      this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
      this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    }

    /**
     * @return {ID}
     */
    readLeftID () {
      return new ID(this.clientDecoder.read(), this.leftClockDecoder.read())
    }

    /**
     * @return {ID}
     */
    readRightID () {
      return new ID(this.clientDecoder.read(), this.rightClockDecoder.read())
    }

    /**
     * Read the next client id.
     * Use this in favor of readID whenever possible to reduce the number of objects created.
     */
    readClient () {
      return this.clientDecoder.read()
    }

    /**
     * @return {number} info An unsigned 8-bit integer
     */
    readInfo () {
      return /** @type {number} */ (this.infoDecoder.read())
    }

    /**
     * @return {string}
     */
    readString () {
      return this.stringDecoder.read()
    }

    /**
     * @return {boolean}
     */
    readParentInfo () {
      return this.parentInfoDecoder.read() === 1
    }

    /**
     * @return {number} An unsigned 8-bit integer
     */
    readTypeRef () {
      return this.typeRefDecoder.read()
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @return {number}
     */
    readLen () {
      return this.lenDecoder.read()
    }

    /**
     * @return {any}
     */
    readAny () {
      return readAny(this.restDecoder)
    }

    /**
     * @return {Uint8Array}
     */
    readBuf () {
      return readVarUint8Array(this.restDecoder)
    }

    /**
     * This is mainly here for legacy purposes.
     *
     * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
     *
     * @return {any}
     */
    readJSON () {
      return readAny(this.restDecoder)
    }

    /**
     * @return {string}
     */
    readKey () {
      const keyClock = this.keyClockDecoder.read();
      if (keyClock < this.keys.length) {
        return this.keys[keyClock]
      } else {
        const key = this.stringDecoder.read();
        this.keys.push(key);
        return key
      }
    }
  }

  /**
   * Error helpers.
   *
   * @module error
   */

  /* istanbul ignore next */
  /**
   * @param {string} s
   * @return {Error}
   */
  const create = s => new Error(s);

  /* istanbul ignore next */
  /**
   * @throws {Error}
   * @return {never}
   */
  const methodUnimplemented = () => {
    throw create('Method unimplemented')
  };

  /* istanbul ignore next */
  /**
   * @throws {Error}
   * @return {never}
   */
  const unexpectedCase = () => {
    throw create('Unexpected case')
  };

  class DSEncoderV1 {
    constructor () {
      this.restEncoder = createEncoder();
    }

    toUint8Array () {
      return toUint8Array(this.restEncoder)
    }

    resetDsCurVal () {
      // nop
    }

    /**
     * @param {number} clock
     */
    writeDsClock (clock) {
      writeVarUint(this.restEncoder, clock);
    }

    /**
     * @param {number} len
     */
    writeDsLen (len) {
      writeVarUint(this.restEncoder, len);
    }
  }

  class UpdateEncoderV1 extends DSEncoderV1 {
    /**
     * @param {ID} id
     */
    writeLeftID (id) {
      writeVarUint(this.restEncoder, id.client);
      writeVarUint(this.restEncoder, id.clock);
    }

    /**
     * @param {ID} id
     */
    writeRightID (id) {
      writeVarUint(this.restEncoder, id.client);
      writeVarUint(this.restEncoder, id.clock);
    }

    /**
     * Use writeClient and writeClock instead of writeID if possible.
     * @param {number} client
     */
    writeClient (client) {
      writeVarUint(this.restEncoder, client);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeInfo (info) {
      writeUint8(this.restEncoder, info);
    }

    /**
     * @param {string} s
     */
    writeString (s) {
      writeVarString(this.restEncoder, s);
    }

    /**
     * @param {boolean} isYKey
     */
    writeParentInfo (isYKey) {
      writeVarUint(this.restEncoder, isYKey ? 1 : 0);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeTypeRef (info) {
      writeVarUint(this.restEncoder, info);
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @param {number} len
     */
    writeLen (len) {
      writeVarUint(this.restEncoder, len);
    }

    /**
     * @param {any} any
     */
    writeAny (any) {
      writeAny(this.restEncoder, any);
    }

    /**
     * @param {Uint8Array} buf
     */
    writeBuf (buf) {
      writeVarUint8Array(this.restEncoder, buf);
    }

    /**
     * @param {any} embed
     */
    writeJSON (embed) {
      writeVarString(this.restEncoder, JSON.stringify(embed));
    }

    /**
     * @param {string} key
     */
    writeKey (key) {
      writeVarString(this.restEncoder, key);
    }
  }

  class DSEncoderV2 {
    constructor () {
      this.restEncoder = createEncoder(); // encodes all the rest / non-optimized
      this.dsCurrVal = 0;
    }

    toUint8Array () {
      return toUint8Array(this.restEncoder)
    }

    resetDsCurVal () {
      this.dsCurrVal = 0;
    }

    /**
     * @param {number} clock
     */
    writeDsClock (clock) {
      const diff = clock - this.dsCurrVal;
      this.dsCurrVal = clock;
      writeVarUint(this.restEncoder, diff);
    }

    /**
     * @param {number} len
     */
    writeDsLen (len) {
      if (len === 0) {
        unexpectedCase();
      }
      writeVarUint(this.restEncoder, len - 1);
      this.dsCurrVal += len;
    }
  }

  class UpdateEncoderV2 extends DSEncoderV2 {
    constructor () {
      super();
      /**
       * @type {Map<string,number>}
       */
      this.keyMap = new Map();
      /**
       * Refers to the next uniqe key-identifier to me used.
       * See writeKey method for more information.
       *
       * @type {number}
       */
      this.keyClock = 0;
      this.keyClockEncoder = new IntDiffOptRleEncoder();
      this.clientEncoder = new UintOptRleEncoder();
      this.leftClockEncoder = new IntDiffOptRleEncoder();
      this.rightClockEncoder = new IntDiffOptRleEncoder();
      this.infoEncoder = new RleEncoder(writeUint8);
      this.stringEncoder = new StringEncoder();
      this.parentInfoEncoder = new RleEncoder(writeUint8);
      this.typeRefEncoder = new UintOptRleEncoder();
      this.lenEncoder = new UintOptRleEncoder();
    }

    toUint8Array () {
      const encoder = createEncoder();
      writeVarUint(encoder, 0); // this is a feature flag that we might use in the future
      writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
      writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
      writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
      writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
      writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
      // @note The rest encoder is appended! (note the missing var)
      writeUint8Array(encoder, toUint8Array(this.restEncoder));
      return toUint8Array(encoder)
    }

    /**
     * @param {ID} id
     */
    writeLeftID (id) {
      this.clientEncoder.write(id.client);
      this.leftClockEncoder.write(id.clock);
    }

    /**
     * @param {ID} id
     */
    writeRightID (id) {
      this.clientEncoder.write(id.client);
      this.rightClockEncoder.write(id.clock);
    }

    /**
     * @param {number} client
     */
    writeClient (client) {
      this.clientEncoder.write(client);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeInfo (info) {
      this.infoEncoder.write(info);
    }

    /**
     * @param {string} s
     */
    writeString (s) {
      this.stringEncoder.write(s);
    }

    /**
     * @param {boolean} isYKey
     */
    writeParentInfo (isYKey) {
      this.parentInfoEncoder.write(isYKey ? 1 : 0);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeTypeRef (info) {
      this.typeRefEncoder.write(info);
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @param {number} len
     */
    writeLen (len) {
      this.lenEncoder.write(len);
    }

    /**
     * @param {any} any
     */
    writeAny (any) {
      writeAny(this.restEncoder, any);
    }

    /**
     * @param {Uint8Array} buf
     */
    writeBuf (buf) {
      writeVarUint8Array(this.restEncoder, buf);
    }

    /**
     * This is mainly here for legacy purposes.
     *
     * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
     *
     * @param {any} embed
     */
    writeJSON (embed) {
      writeAny(this.restEncoder, embed);
    }

    /**
     * Property keys are often reused. For example, in y-prosemirror the key `bold` might
     * occur very often. For a 3d application, the key `position` might occur very often.
     *
     * We cache these keys in a Map and refer to them via a unique number.
     *
     * @param {string} key
     */
    writeKey (key) {
      const clock = this.keyMap.get(key);
      if (clock === undefined) {
        /**
         * @todo uncomment to introduce this feature finally
         *
         * Background. The ContentFormat object was always encoded using writeKey, but the decoder used to use readString.
         * Furthermore, I forgot to set the keyclock. So everything was working fine.
         *
         * However, this feature here is basically useless as it is not being used (it actually only consumes extra memory).
         *
         * I don't know yet how to reintroduce this feature..
         *
         * Older clients won't be able to read updates when we reintroduce this feature. So this should probably be done using a flag.
         *
         */
        // this.keyMap.set(key, this.keyClock)
        this.keyClockEncoder.write(this.keyClock++);
        this.stringEncoder.write(key);
      } else {
        this.keyClockEncoder.write(clock);
      }
    }
  }

  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Array<GC|Item>} structs All structs by `client`
   * @param {number} client
   * @param {number} clock write structs starting with `ID(client,clock)`
   *
   * @function
   */
  const writeStructs = (encoder, structs, client, clock) => {
    // write first id
    clock = max(clock, structs[0].id.clock); // make sure the first id exists
    const startNewStructs = findIndexSS(structs, clock);
    // write # encoded structs
    writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
    encoder.writeClient(client);
    writeVarUint(encoder.restEncoder, clock);
    const firstStruct = structs[startNewStructs];
    // write first struct with an offset
    firstStruct.write(encoder, clock - firstStruct.id.clock);
    for (let i = startNewStructs + 1; i < structs.length; i++) {
      structs[i].write(encoder, 0);
    }
  };

  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {StructStore} store
   * @param {Map<number,number>} _sm
   *
   * @private
   * @function
   */
  const writeClientsStructs = (encoder, store, _sm) => {
    // we filter all valid _sm entries into sm
    const sm = new Map();
    _sm.forEach((clock, client) => {
      // only write if new structs are available
      if (getState(store, client) > clock) {
        sm.set(client, clock);
      }
    });
    getStateVector(store).forEach((clock, client) => {
      if (!_sm.has(client)) {
        sm.set(client, 0);
      }
    });
    // write # states that were updated
    writeVarUint(encoder.restEncoder, sm.size);
    // Write items with higher client ids first
    // This heavily improves the conflict algorithm.
    Array.from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
      // @ts-ignore
      writeStructs(encoder, store.clients.get(client), client, clock);
    });
  };

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder The decoder object to read data from.
   * @param {Doc} doc
   * @return {Map<number, { i: number, refs: Array<Item | GC> }>}
   *
   * @private
   * @function
   */
  const readClientsStructRefs = (decoder, doc) => {
    /**
     * @type {Map<number, { i: number, refs: Array<Item | GC> }>}
     */
    const clientRefs = create$6();
    const numOfStateUpdates = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numOfStateUpdates; i++) {
      const numberOfStructs = readVarUint(decoder.restDecoder);
      /**
       * @type {Array<GC|Item>}
       */
      const refs = new Array(numberOfStructs);
      const client = decoder.readClient();
      let clock = readVarUint(decoder.restDecoder);
      // const start = performance.now()
      clientRefs.set(client, { i: 0, refs });
      for (let i = 0; i < numberOfStructs; i++) {
        const info = decoder.readInfo();
        switch (BITS5 & info) {
          case 0: { // GC
            const len = decoder.readLen();
            refs[i] = new GC(createID(client, clock), len);
            clock += len;
            break
          }
          case 10: { // Skip Struct (nothing to apply)
            // @todo we could reduce the amount of checks by adding Skip struct to clientRefs so we know that something is missing.
            const len = readVarUint(decoder.restDecoder);
            refs[i] = new Skip(createID(client, clock), len);
            clock += len;
            break
          }
          default: { // Item with content
            /**
             * The optimized implementation doesn't use any variables because inlining variables is faster.
             * Below a non-optimized version is shown that implements the basic algorithm with
             * a few comments
             */
            const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
            // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
            // and we read the next string as parentYKey.
            // It indicates how we store/retrieve parent from `y.share`
            // @type {string|null}
            const struct = new Item(
              createID(client, clock),
              null, // leftd
              (info & BIT8) === BIT8 ? decoder.readLeftID() : null, // origin
              null, // right
              (info & BIT7) === BIT7 ? decoder.readRightID() : null, // right origin
              cantCopyParentInfo ? (decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID()) : null, // parent
              cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, // parentSub
              readItemContent(decoder, info) // item content
            );
            /* A non-optimized implementation of the above algorithm:

            // The item that was originally to the left of this item.
            const origin = (info & binary.BIT8) === binary.BIT8 ? decoder.readLeftID() : null
            // The item that was originally to the right of this item.
            const rightOrigin = (info & binary.BIT7) === binary.BIT7 ? decoder.readRightID() : null
            const cantCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0
            const hasParentYKey = cantCopyParentInfo ? decoder.readParentInfo() : false
            // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
            // and we read the next string as parentYKey.
            // It indicates how we store/retrieve parent from `y.share`
            // @type {string|null}
            const parentYKey = cantCopyParentInfo && hasParentYKey ? decoder.readString() : null

            const struct = new Item(
              createID(client, clock),
              null, // leftd
              origin, // origin
              null, // right
              rightOrigin, // right origin
              cantCopyParentInfo && !hasParentYKey ? decoder.readLeftID() : (parentYKey !== null ? doc.get(parentYKey) : null), // parent
              cantCopyParentInfo && (info & binary.BIT6) === binary.BIT6 ? decoder.readString() : null, // parentSub
              readItemContent(decoder, info) // item content
            )
            */
            refs[i] = struct;
            clock += struct.length;
          }
        }
      }
      // console.log('time to read: ', performance.now() - start) // @todo remove
    }
    return clientRefs
  };

  /**
   * Resume computing structs generated by struct readers.
   *
   * While there is something to do, we integrate structs in this order
   * 1. top element on stack, if stack is not empty
   * 2. next element from current struct reader (if empty, use next struct reader)
   *
   * If struct causally depends on another struct (ref.missing), we put next reader of
   * `ref.id.client` on top of stack.
   *
   * At some point we find a struct that has no causal dependencies,
   * then we start emptying the stack.
   *
   * It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
   * depends on struct3 (from client1). Therefore the max stack size is eqaul to `structReaders.length`.
   *
   * This method is implemented in a way so that we can resume computation if this update
   * causally depends on another update.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {Map<number, { i: number, refs: (GC | Item)[] }>} clientsStructRefs
   * @return { null | { update: Uint8Array, missing: Map<number,number> } }
   *
   * @private
   * @function
   */
  const integrateStructs = (transaction, store, clientsStructRefs) => {
    /**
     * @type {Array<Item | GC>}
     */
    const stack = [];
    // sort them so that we take the higher id first, in case of conflicts the lower id will probably not conflict with the id from the higher user.
    let clientsStructRefsIds = Array.from(clientsStructRefs.keys()).sort((a, b) => a - b);
    if (clientsStructRefsIds.length === 0) {
      return null
    }
    const getNextStructTarget = () => {
      if (clientsStructRefsIds.length === 0) {
        return null
      }
      let nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */ (clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]));
      while (nextStructsTarget.refs.length === nextStructsTarget.i) {
        clientsStructRefsIds.pop();
        if (clientsStructRefsIds.length > 0) {
          nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */ (clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]));
        } else {
          return null
        }
      }
      return nextStructsTarget
    };
    let curStructsTarget = getNextStructTarget();
    if (curStructsTarget === null && stack.length === 0) {
      return null
    }

    /**
     * @type {StructStore}
     */
    const restStructs = new StructStore();
    const missingSV = new Map();
    /**
     * @param {number} client
     * @param {number} clock
     */
    const updateMissingSv = (client, clock) => {
      const mclock = missingSV.get(client);
      if (mclock == null || mclock > clock) {
        missingSV.set(client, clock);
      }
    };
    /**
     * @type {GC|Item}
     */
    let stackHead = /** @type {any} */ (curStructsTarget).refs[/** @type {any} */ (curStructsTarget).i++];
    // caching the state because it is used very often
    const state = new Map();

    const addStackToRestSS = () => {
      for (const item of stack) {
        const client = item.id.client;
        const unapplicableItems = clientsStructRefs.get(client);
        if (unapplicableItems) {
          // decrement because we weren't able to apply previous operation
          unapplicableItems.i--;
          restStructs.clients.set(client, unapplicableItems.refs.slice(unapplicableItems.i));
          clientsStructRefs.delete(client);
          unapplicableItems.i = 0;
          unapplicableItems.refs = [];
        } else {
          // item was the last item on clientsStructRefs and the field was already cleared. Add item to restStructs and continue
          restStructs.clients.set(client, [item]);
        }
        // remove client from clientsStructRefsIds to prevent users from applying the same update again
        clientsStructRefsIds = clientsStructRefsIds.filter(c => c !== client);
      }
      stack.length = 0;
    };

    // iterate over all struct readers until we are done
    while (true) {
      if (stackHead.constructor !== Skip) {
        const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
        const offset = localClock - stackHead.id.clock;
        if (offset < 0) {
          // update from the same client is missing
          stack.push(stackHead);
          updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
          // hid a dead wall, add all items from stack to restSS
          addStackToRestSS();
        } else {
          const missing = stackHead.getMissing(transaction, store);
          if (missing !== null) {
            stack.push(stackHead);
            // get the struct reader that has the missing struct
            /**
             * @type {{ refs: Array<GC|Item>, i: number }}
             */
            const structRefs = clientsStructRefs.get(/** @type {number} */ (missing)) || { refs: [], i: 0 };
            if (structRefs.refs.length === structRefs.i) {
              // This update message causally depends on another update message that doesn't exist yet
              updateMissingSv(/** @type {number} */ (missing), getState(store, missing));
              addStackToRestSS();
            } else {
              stackHead = structRefs.refs[structRefs.i++];
              continue
            }
          } else if (offset === 0 || offset < stackHead.length) {
            // all fine, apply the stackhead
            stackHead.integrate(transaction, offset);
            state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
          }
        }
      }
      // iterate to next stackHead
      if (stack.length > 0) {
        stackHead = /** @type {GC|Item} */ (stack.pop());
      } else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
        stackHead = /** @type {GC|Item} */ (curStructsTarget.refs[curStructsTarget.i++]);
      } else {
        curStructsTarget = getNextStructTarget();
        if (curStructsTarget === null) {
          // we are done!
          break
        } else {
          stackHead = /** @type {GC|Item} */ (curStructsTarget.refs[curStructsTarget.i++]);
        }
      }
    }
    if (restStructs.clients.size > 0) {
      const encoder = new UpdateEncoderV2();
      writeClientsStructs(encoder, restStructs, new Map());
      // write empty deleteset
      // writeDeleteSet(encoder, new DeleteSet())
      writeVarUint(encoder.restEncoder, 0); // => no need for an extra function call, just write 0 deletes
      return { missing: missingSV, update: encoder.toUint8Array() }
    }
    return null
  };

  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Transaction} transaction
   *
   * @private
   * @function
   */
  const writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);

  /**
   * Read and apply a document update.
   *
   * This function has the same effect as `applyUpdate` but accepts an decoder.
   *
   * @param {decoding.Decoder} decoder
   * @param {Doc} ydoc
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   * @param {UpdateDecoderV1 | UpdateDecoderV2} [structDecoder]
   *
   * @function
   */
  const readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) =>
    transact(ydoc, transaction => {
      // force that transaction.local is set to non-local
      transaction.local = false;
      let retry = false;
      const doc = transaction.doc;
      const store = doc.store;
      // let start = performance.now()
      const ss = readClientsStructRefs(structDecoder, doc);
      // console.log('time to read structs: ', performance.now() - start) // @todo remove
      // start = performance.now()
      // console.log('time to merge: ', performance.now() - start) // @todo remove
      // start = performance.now()
      const restStructs = integrateStructs(transaction, store, ss);
      const pending = store.pendingStructs;
      if (pending) {
        // check if we can apply something
        for (const [client, clock] of pending.missing) {
          if (clock < getState(store, client)) {
            retry = true;
            break
          }
        }
        if (restStructs) {
          // merge restStructs into store.pending
          for (const [client, clock] of restStructs.missing) {
            const mclock = pending.missing.get(client);
            if (mclock == null || mclock > clock) {
              pending.missing.set(client, clock);
            }
          }
          pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
        }
      } else {
        store.pendingStructs = restStructs;
      }
      // console.log('time to integrate: ', performance.now() - start) // @todo remove
      // start = performance.now()
      const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
      if (store.pendingDs) {
        // @todo we could make a lower-bound state-vector check as we do above
        const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
        readVarUint(pendingDSUpdate.restDecoder); // read 0 structs, because we only encode deletes in pendingdsupdate
        const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
        if (dsRest && dsRest2) {
          // case 1: ds1 != null && ds2 != null
          store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
        } else {
          // case 2: ds1 != null
          // case 3: ds2 != null
          // case 4: ds1 == null && ds2 == null
          store.pendingDs = dsRest || dsRest2;
        }
      } else {
        // Either dsRest == null && pendingDs == null OR dsRest != null
        store.pendingDs = dsRest;
      }
      // console.log('time to cleanup: ', performance.now() - start) // @todo remove
      // start = performance.now()

      // console.log('time to resume delete readers: ', performance.now() - start) // @todo remove
      // start = performance.now()
      if (retry) {
        const update = /** @type {{update: Uint8Array}} */ (store.pendingStructs).update;
        store.pendingStructs = null;
        applyUpdateV2(transaction.doc, update);
      }
    }, transactionOrigin, false);

  /**
   * Read and apply a document update.
   *
   * This function has the same effect as `applyUpdate` but accepts an decoder.
   *
   * @param {decoding.Decoder} decoder
   * @param {Doc} ydoc
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const readUpdate$1 = (decoder, ydoc, transactionOrigin) => readUpdateV2(decoder, ydoc, transactionOrigin, new UpdateDecoderV1(decoder));

  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   *
   * @function
   */
  const applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
    const decoder = createDecoder(update);
    readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
  };

  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);

  /**
   * Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
   * only write the operations that are missing.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Doc} doc
   * @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   *
   * @function
   */
  const writeStateAsUpdate = (encoder, doc, targetStateVector = new Map()) => {
    writeClientsStructs(encoder, doc.store, targetStateVector);
    writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
  };

  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @param {UpdateEncoderV1 | UpdateEncoderV2} [encoder]
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdateV2 = (doc, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
    const targetStateVector = decodeStateVector(encodedTargetStateVector);
    writeStateAsUpdate(encoder, doc, targetStateVector);
    const updates = [encoder.toUint8Array()];
    // also add the pending updates (if there are any)
    if (doc.store.pendingDs) {
      updates.push(doc.store.pendingDs);
    }
    if (doc.store.pendingStructs) {
      updates.push(diffUpdateV2(doc.store.pendingStructs.update, encodedTargetStateVector));
    }
    if (updates.length > 1) {
      if (encoder.constructor === UpdateEncoderV1) {
        return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)))
      } else if (encoder.constructor === UpdateEncoderV2) {
        return mergeUpdatesV2(updates)
      }
    }
    return updates[0]
  };

  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdate = (doc, encodedTargetStateVector) => encodeStateAsUpdateV2(doc, encodedTargetStateVector, new UpdateEncoderV1());

  /**
   * Read state vector from Decoder and return as Map
   *
   * @param {DSDecoderV1 | DSDecoderV2} decoder
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const readStateVector = decoder => {
    const ss = new Map();
    const ssLength = readVarUint(decoder.restDecoder);
    for (let i = 0; i < ssLength; i++) {
      const client = readVarUint(decoder.restDecoder);
      const clock = readVarUint(decoder.restDecoder);
      ss.set(client, clock);
    }
    return ss
  };

  /**
   * Read decodedState and return State as Map.
   *
   * @param {Uint8Array} decodedState
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  // export const decodeStateVectorV2 = decodedState => readStateVector(new DSDecoderV2(decoding.createDecoder(decodedState)))

  /**
   * Read decodedState and return State as Map.
   *
   * @param {Uint8Array} decodedState
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const decodeStateVector = decodedState => readStateVector(new DSDecoderV1(createDecoder(decodedState)));

  /**
   * @param {DSEncoderV1 | DSEncoderV2} encoder
   * @param {Map<number,number>} sv
   * @function
   */
  const writeStateVector = (encoder, sv) => {
    writeVarUint(encoder.restEncoder, sv.size);
    Array.from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
      writeVarUint(encoder.restEncoder, client); // @todo use a special client decoder that is based on mapping
      writeVarUint(encoder.restEncoder, clock);
    });
    return encoder
  };

  /**
   * @param {DSEncoderV1 | DSEncoderV2} encoder
   * @param {Doc} doc
   *
   * @function
   */
  const writeDocumentStateVector = (encoder, doc) => writeStateVector(encoder, getStateVector(doc.store));

  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc|Map<number,number>} doc
   * @param {DSEncoderV1 | DSEncoderV2} [encoder]
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVectorV2 = (doc, encoder = new DSEncoderV2()) => {
    if (doc instanceof Map) {
      writeStateVector(encoder, doc);
    } else {
      writeDocumentStateVector(encoder, doc);
    }
    return encoder.toUint8Array()
  };

  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc|Map<number,number>} doc
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVector = doc => encodeStateVectorV2(doc, new DSEncoderV1());

  /**
   * General event handler implementation.
   *
   * @template ARG0, ARG1
   *
   * @private
   */
  class EventHandler {
    constructor () {
      /**
       * @type {Array<function(ARG0, ARG1):void>}
       */
      this.l = [];
    }
  }

  /**
   * @template ARG0,ARG1
   * @returns {EventHandler<ARG0,ARG1>}
   *
   * @private
   * @function
   */
  const createEventHandler = () => new EventHandler();

  /**
   * Adds an event listener that is called when
   * {@link EventHandler#callEventListeners} is called.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler.
   *
   * @private
   * @function
   */
  const addEventHandlerListener = (eventHandler, f) =>
    eventHandler.l.push(f);

  /**
   * Removes an event listener.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler that was added with
   *                     {@link EventHandler#addEventListener}
   *
   * @private
   * @function
   */
  const removeEventHandlerListener = (eventHandler, f) => {
    const l = eventHandler.l;
    const len = l.length;
    eventHandler.l = l.filter(g => f !== g);
    if (len === eventHandler.l.length) {
      console.error('[yjs] Tried to remove event handler that doesn\'t exist.');
    }
  };

  /**
   * Call all event listeners that were added via
   * {@link EventHandler#addEventListener}.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {ARG0} arg0
   * @param {ARG1} arg1
   *
   * @private
   * @function
   */
  const callEventHandlerListeners = (eventHandler, arg0, arg1) =>
    callAll(eventHandler.l, [arg0, arg1]);

  class ID {
    /**
     * @param {number} client client id
     * @param {number} clock unique per client id, continuous number
     */
    constructor (client, clock) {
      /**
       * Client id
       * @type {number}
       */
      this.client = client;
      /**
       * unique per client id, continuous number
       * @type {number}
       */
      this.clock = clock;
    }
  }

  /**
   * @param {ID | null} a
   * @param {ID | null} b
   * @return {boolean}
   *
   * @function
   */
  const compareIDs = (a, b) => a === b || (a !== null && b !== null && a.client === b.client && a.clock === b.clock);

  /**
   * @param {number} client
   * @param {number} clock
   *
   * @private
   * @function
   */
  const createID = (client, clock) => new ID(client, clock);

  /**
   * @param {encoding.Encoder} encoder
   * @param {ID} id
   *
   * @private
   * @function
   */
  const writeID = (encoder, id) => {
    writeVarUint(encoder, id.client);
    writeVarUint(encoder, id.clock);
  };

  /**
   * Read ID.
   * * If first varUint read is 0xFFFFFF a RootID is returned.
   * * Otherwise an ID is returned
   *
   * @param {decoding.Decoder} decoder
   * @return {ID}
   *
   * @private
   * @function
   */
  const readID = decoder =>
    createID(readVarUint(decoder), readVarUint(decoder));

  /**
   * The top types are mapped from y.share.get(keyname) => type.
   * `type` does not store any information about the `keyname`.
   * This function finds the correct `keyname` for `type` and throws otherwise.
   *
   * @param {AbstractType<any>} type
   * @return {string}
   *
   * @private
   * @function
   */
  const findRootTypeKey = type => {
    // @ts-ignore _y must be defined, otherwise unexpected case
    for (const [key, value] of type.doc.share.entries()) {
      if (value === type) {
        return key
      }
    }
    throw unexpectedCase()
  };

  /**
   * Check if `parent` is a parent of `child`.
   *
   * @param {AbstractType<any>} parent
   * @param {Item|null} child
   * @return {Boolean} Whether `parent` is a parent of `child`.
   *
   * @private
   * @function
   */
  const isParentOf = (parent, child) => {
    while (child !== null) {
      if (child.parent === parent) {
        return true
      }
      child = /** @type {AbstractType<any>} */ (child.parent)._item;
    }
    return false
  };

  /**
   * Convenient helper to log type information.
   *
   * Do not use in productive systems as the output can be immense!
   *
   * @param {AbstractType<any>} type
   */
  const logType = type => {
    const res = [];
    let n = type._start;
    while (n) {
      res.push(n);
      n = n.right;
    }
    console.log('Children: ', res);
    console.log('Children content: ', res.filter(m => !m.deleted).map(m => m.content));
  };

  class PermanentUserData {
    /**
     * @param {Doc} doc
     * @param {YMap<any>} [storeType]
     */
    constructor (doc, storeType = doc.getMap('users')) {
      /**
       * @type {Map<string,DeleteSet>}
       */
      const dss = new Map();
      this.yusers = storeType;
      this.doc = doc;
      /**
       * Maps from clientid to userDescription
       *
       * @type {Map<number,string>}
       */
      this.clients = new Map();
      this.dss = dss;
      /**
       * @param {YMap<any>} user
       * @param {string} userDescription
       */
      const initUser = (user, userDescription) => {
        /**
         * @type {YArray<Uint8Array>}
         */
        const ds = user.get('ds');
        const ids = user.get('ids');
        const addClientId = /** @param {number} clientid */ clientid => this.clients.set(clientid, userDescription);
        ds.observe(/** @param {YArrayEvent<any>} event */ event => {
          event.changes.added.forEach(item => {
            item.content.getContent().forEach(encodedDs => {
              if (encodedDs instanceof Uint8Array) {
                this.dss.set(userDescription, mergeDeleteSets([this.dss.get(userDescription) || createDeleteSet(), readDeleteSet(new DSDecoderV1(createDecoder(encodedDs)))]));
              }
            });
          });
        });
        this.dss.set(userDescription, mergeDeleteSets(ds.map(encodedDs => readDeleteSet(new DSDecoderV1(createDecoder(encodedDs))))));
        ids.observe(/** @param {YArrayEvent<any>} event */ event =>
          event.changes.added.forEach(item => item.content.getContent().forEach(addClientId))
        );
        ids.forEach(addClientId);
      };
      // observe users
      storeType.observe(event => {
        event.keysChanged.forEach(userDescription =>
          initUser(storeType.get(userDescription), userDescription)
        );
      });
      // add intial data
      storeType.forEach(initUser);
    }

    /**
     * @param {Doc} doc
     * @param {number} clientid
     * @param {string} userDescription
     * @param {Object} [conf]
     * @param {function(Transaction, DeleteSet):boolean} [conf.filter]
     */
    setUserMapping (doc, clientid, userDescription, { filter = () => true } = {}) {
      const users = this.yusers;
      let user = users.get(userDescription);
      if (!user) {
        user = new YMap();
        user.set('ids', new YArray());
        user.set('ds', new YArray());
        users.set(userDescription, user);
      }
      user.get('ids').push([clientid]);
      users.observe(event => {
        setTimeout(() => {
          const userOverwrite = users.get(userDescription);
          if (userOverwrite !== user) {
            // user was overwritten, port all data over to the next user object
            // @todo Experiment with Y.Sets here
            user = userOverwrite;
            // @todo iterate over old type
            this.clients.forEach((_userDescription, clientid) => {
              if (userDescription === _userDescription) {
                user.get('ids').push([clientid]);
              }
            });
            const encoder = new DSEncoderV1();
            const ds = this.dss.get(userDescription);
            if (ds) {
              writeDeleteSet(encoder, ds);
              user.get('ds').push([encoder.toUint8Array()]);
            }
          }
        }, 0);
      });
      doc.on('afterTransaction', /** @param {Transaction} transaction */ transaction => {
        setTimeout(() => {
          const yds = user.get('ds');
          const ds = transaction.deleteSet;
          if (transaction.local && ds.clients.size > 0 && filter(transaction, ds)) {
            const encoder = new DSEncoderV1();
            writeDeleteSet(encoder, ds);
            yds.push([encoder.toUint8Array()]);
          }
        });
      });
    }

    /**
     * @param {number} clientid
     * @return {any}
     */
    getUserByClientId (clientid) {
      return this.clients.get(clientid) || null
    }

    /**
     * @param {ID} id
     * @return {string | null}
     */
    getUserByDeletedId (id) {
      for (const [userDescription, ds] of this.dss.entries()) {
        if (isDeleted(ds, id)) {
          return userDescription
        }
      }
      return null
    }
  }

  /**
   * A relative position is based on the Yjs model and is not affected by document changes.
   * E.g. If you place a relative position before a certain character, it will always point to this character.
   * If you place a relative position at the end of a type, it will always point to the end of the type.
   *
   * A numeric position is often unsuited for user selections, because it does not change when content is inserted
   * before or after.
   *
   * ```Insert(0, 'x')('a|bc') = 'xa|bc'``` Where | is the relative position.
   *
   * One of the properties must be defined.
   *
   * @example
   *   // Current cursor position is at position 10
   *   const relativePosition = createRelativePositionFromIndex(yText, 10)
   *   // modify yText
   *   yText.insert(0, 'abc')
   *   yText.delete(3, 10)
   *   // Compute the cursor position
   *   const absolutePosition = createAbsolutePositionFromRelativePosition(y, relativePosition)
   *   absolutePosition.type === yText // => true
   *   console.log('cursor location is ' + absolutePosition.index) // => cursor location is 3
   *
   */
  class RelativePosition {
    /**
     * @param {ID|null} type
     * @param {string|null} tname
     * @param {ID|null} item
     * @param {number} assoc
     */
    constructor (type, tname, item, assoc = 0) {
      /**
       * @type {ID|null}
       */
      this.type = type;
      /**
       * @type {string|null}
       */
      this.tname = tname;
      /**
       * @type {ID | null}
       */
      this.item = item;
      /**
       * A relative position is associated to a specific character. By default
       * assoc >= 0, the relative position is associated to the character
       * after the meant position.
       * I.e. position 1 in 'ab' is associated to character 'b'.
       *
       * If assoc < 0, then the relative position is associated to the caharacter
       * before the meant position.
       *
       * @type {number}
       */
      this.assoc = assoc;
    }
  }

  /**
   * @param {RelativePosition} rpos
   * @return {any}
   */
  const relativePositionToJSON = rpos => {
    const json = {};
    if (rpos.type) {
      json.type = rpos.type;
    }
    if (rpos.tname) {
      json.tname = rpos.tname;
    }
    if (rpos.item) {
      json.item = rpos.item;
    }
    if (rpos.assoc != null) {
      json.assoc = rpos.assoc;
    }
    return json
  };

  /**
   * @param {any} json
   * @return {RelativePosition}
   *
   * @function
   */
  const createRelativePositionFromJSON = json => new RelativePosition(json.type == null ? null : createID(json.type.client, json.type.clock), json.tname || null, json.item == null ? null : createID(json.item.client, json.item.clock), json.assoc == null ? 0 : json.assoc);

  class AbsolutePosition {
    /**
     * @param {AbstractType<any>} type
     * @param {number} index
     * @param {number} [assoc]
     */
    constructor (type, index, assoc = 0) {
      /**
       * @type {AbstractType<any>}
       */
      this.type = type;
      /**
       * @type {number}
       */
      this.index = index;
      this.assoc = assoc;
    }
  }

  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @param {number} [assoc]
   *
   * @function
   */
  const createAbsolutePosition = (type, index, assoc = 0) => new AbsolutePosition(type, index, assoc);

  /**
   * @param {AbstractType<any>} type
   * @param {ID|null} item
   * @param {number} [assoc]
   *
   * @function
   */
  const createRelativePosition = (type, item, assoc) => {
    let typeid = null;
    let tname = null;
    if (type._item === null) {
      tname = findRootTypeKey(type);
    } else {
      typeid = createID(type._item.id.client, type._item.id.clock);
    }
    return new RelativePosition(typeid, tname, item, assoc)
  };

  /**
   * Create a relativePosition based on a absolute position.
   *
   * @param {AbstractType<any>} type The base type (e.g. YText or YArray).
   * @param {number} index The absolute position.
   * @param {number} [assoc]
   * @return {RelativePosition}
   *
   * @function
   */
  const createRelativePositionFromTypeIndex = (type, index, assoc = 0) => {
    let t = type._start;
    if (assoc < 0) {
      // associated to the left character or the beginning of a type, increment index if possible.
      if (index === 0) {
        return createRelativePosition(type, null, assoc)
      }
      index--;
    }
    while (t !== null) {
      if (!t.deleted && t.countable) {
        if (t.length > index) {
          // case 1: found position somewhere in the linked list
          return createRelativePosition(type, createID(t.id.client, t.id.clock + index), assoc)
        }
        index -= t.length;
      }
      if (t.right === null && assoc < 0) {
        // left-associated position, return last available id
        return createRelativePosition(type, t.lastId, assoc)
      }
      t = t.right;
    }
    return createRelativePosition(type, null, assoc)
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {RelativePosition} rpos
   *
   * @function
   */
  const writeRelativePosition = (encoder, rpos) => {
    const { type, tname, item, assoc } = rpos;
    if (item !== null) {
      writeVarUint(encoder, 0);
      writeID(encoder, item);
    } else if (tname !== null) {
      // case 2: found position at the end of the list and type is stored in y.share
      writeUint8(encoder, 1);
      writeVarString(encoder, tname);
    } else if (type !== null) {
      // case 3: found position at the end of the list and type is attached to an item
      writeUint8(encoder, 2);
      writeID(encoder, type);
    } else {
      throw unexpectedCase()
    }
    writeVarInt(encoder, assoc);
    return encoder
  };

  /**
   * @param {RelativePosition} rpos
   * @return {Uint8Array}
   */
  const encodeRelativePosition = rpos => {
    const encoder = createEncoder();
    writeRelativePosition(encoder, rpos);
    return toUint8Array(encoder)
  };

  /**
   * @param {decoding.Decoder} decoder
   * @return {RelativePosition}
   *
   * @function
   */
  const readRelativePosition = decoder => {
    let type = null;
    let tname = null;
    let itemID = null;
    switch (readVarUint(decoder)) {
      case 0:
        // case 1: found position somewhere in the linked list
        itemID = readID(decoder);
        break
      case 1:
        // case 2: found position at the end of the list and type is stored in y.share
        tname = readVarString(decoder);
        break
      case 2: {
        // case 3: found position at the end of the list and type is attached to an item
        type = readID(decoder);
      }
    }
    const assoc = hasContent(decoder) ? readVarInt(decoder) : 0;
    return new RelativePosition(type, tname, itemID, assoc)
  };

  /**
   * @param {Uint8Array} uint8Array
   * @return {RelativePosition}
   */
  const decodeRelativePosition = uint8Array => readRelativePosition(createDecoder(uint8Array));

  /**
   * @param {RelativePosition} rpos
   * @param {Doc} doc
   * @return {AbsolutePosition|null}
   *
   * @function
   */
  const createAbsolutePositionFromRelativePosition = (rpos, doc) => {
    const store = doc.store;
    const rightID = rpos.item;
    const typeID = rpos.type;
    const tname = rpos.tname;
    const assoc = rpos.assoc;
    let type = null;
    let index = 0;
    if (rightID !== null) {
      if (getState(store, rightID.client) <= rightID.clock) {
        return null
      }
      const res = followRedone(store, rightID);
      const right = res.item;
      if (!(right instanceof Item)) {
        return null
      }
      type = /** @type {AbstractType<any>} */ (right.parent);
      if (type._item === null || !type._item.deleted) {
        index = (right.deleted || !right.countable) ? 0 : (res.diff + (assoc >= 0 ? 0 : 1)); // adjust position based on left association if necessary
        let n = right.left;
        while (n !== null) {
          if (!n.deleted && n.countable) {
            index += n.length;
          }
          n = n.left;
        }
      }
    } else {
      if (tname !== null) {
        type = doc.get(tname);
      } else if (typeID !== null) {
        if (getState(store, typeID.client) <= typeID.clock) {
          // type does not exist yet
          return null
        }
        const { item } = followRedone(store, typeID);
        if (item instanceof Item && item.content instanceof ContentType) {
          type = item.content.type;
        } else {
          // struct is garbage collected
          return null
        }
      } else {
        throw unexpectedCase()
      }
      if (assoc >= 0) {
        index = type._length;
      } else {
        index = 0;
      }
    }
    return createAbsolutePosition(type, index, rpos.assoc)
  };

  /**
   * @param {RelativePosition|null} a
   * @param {RelativePosition|null} b
   * @return {boolean}
   *
   * @function
   */
  const compareRelativePositions = (a, b) => a === b || (
    a !== null && b !== null && a.tname === b.tname && compareIDs(a.item, b.item) && compareIDs(a.type, b.type) && a.assoc === b.assoc
  );

  class Snapshot {
    /**
     * @param {DeleteSet} ds
     * @param {Map<number,number>} sv state map
     */
    constructor (ds, sv) {
      /**
       * @type {DeleteSet}
       */
      this.ds = ds;
      /**
       * State Map
       * @type {Map<number,number>}
       */
      this.sv = sv;
    }
  }

  /**
   * @param {Snapshot} snap1
   * @param {Snapshot} snap2
   * @return {boolean}
   */
  const equalSnapshots = (snap1, snap2) => {
    const ds1 = snap1.ds.clients;
    const ds2 = snap2.ds.clients;
    const sv1 = snap1.sv;
    const sv2 = snap2.sv;
    if (sv1.size !== sv2.size || ds1.size !== ds2.size) {
      return false
    }
    for (const [key, value] of sv1.entries()) {
      if (sv2.get(key) !== value) {
        return false
      }
    }
    for (const [client, dsitems1] of ds1.entries()) {
      const dsitems2 = ds2.get(client) || [];
      if (dsitems1.length !== dsitems2.length) {
        return false
      }
      for (let i = 0; i < dsitems1.length; i++) {
        const dsitem1 = dsitems1[i];
        const dsitem2 = dsitems2[i];
        if (dsitem1.clock !== dsitem2.clock || dsitem1.len !== dsitem2.len) {
          return false
        }
      }
    }
    return true
  };

  /**
   * @param {Snapshot} snapshot
   * @param {DSEncoderV1 | DSEncoderV2} [encoder]
   * @return {Uint8Array}
   */
  const encodeSnapshotV2 = (snapshot, encoder = new DSEncoderV2()) => {
    writeDeleteSet(encoder, snapshot.ds);
    writeStateVector(encoder, snapshot.sv);
    return encoder.toUint8Array()
  };

  /**
   * @param {Snapshot} snapshot
   * @return {Uint8Array}
   */
  const encodeSnapshot = snapshot => encodeSnapshotV2(snapshot, new DSEncoderV1());

  /**
   * @param {Uint8Array} buf
   * @param {DSDecoderV1 | DSDecoderV2} [decoder]
   * @return {Snapshot}
   */
  const decodeSnapshotV2 = (buf, decoder = new DSDecoderV2(createDecoder(buf))) => {
    return new Snapshot(readDeleteSet(decoder), readStateVector(decoder))
  };

  /**
   * @param {Uint8Array} buf
   * @return {Snapshot}
   */
  const decodeSnapshot = buf => decodeSnapshotV2(buf, new DSDecoderV1(createDecoder(buf)));

  /**
   * @param {DeleteSet} ds
   * @param {Map<number,number>} sm
   * @return {Snapshot}
   */
  const createSnapshot = (ds, sm) => new Snapshot(ds, sm);

  const emptySnapshot = createSnapshot(createDeleteSet(), new Map());

  /**
   * @param {Doc} doc
   * @return {Snapshot}
   */
  const snapshot = doc => createSnapshot(createDeleteSetFromStructStore(doc.store), getStateVector(doc.store));

  /**
   * @param {Item} item
   * @param {Snapshot|undefined} snapshot
   *
   * @protected
   * @function
   */
  const isVisible = (item, snapshot) => snapshot === undefined
    ? !item.deleted
    : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id);

  /**
   * @param {Transaction} transaction
   * @param {Snapshot} snapshot
   */
  const splitSnapshotAffectedStructs = (transaction, snapshot) => {
    const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create$1);
    const store = transaction.doc.store;
    // check if we already split for this snapshot
    if (!meta.has(snapshot)) {
      snapshot.sv.forEach((clock, client) => {
        if (clock < getState(store, client)) {
          getItemCleanStart(transaction, createID(client, clock));
        }
      });
      iterateDeletedStructs(transaction, snapshot.ds, item => {});
      meta.add(snapshot);
    }
  };

  /**
   * @param {Doc} originDoc
   * @param {Snapshot} snapshot
   * @param {Doc} [newDoc] Optionally, you may define the Yjs document that receives the data from originDoc
   * @return {Doc}
   */
  const createDocFromSnapshot = (originDoc, snapshot, newDoc = new Doc()) => {
    if (originDoc.gc) {
      // we should not try to restore a GC-ed document, because some of the restored items might have their content deleted
      throw new Error('originDoc must not be garbage collected')
    }
    const { sv, ds } = snapshot;

    const encoder = new UpdateEncoderV2();
    originDoc.transact(transaction => {
      let size = 0;
      sv.forEach(clock => {
        if (clock > 0) {
          size++;
        }
      });
      writeVarUint(encoder.restEncoder, size);
      // splitting the structs before writing them to the encoder
      for (const [client, clock] of sv) {
        if (clock === 0) {
          continue
        }
        if (clock < getState(originDoc.store, client)) {
          getItemCleanStart(transaction, createID(client, clock));
        }
        const structs = originDoc.store.clients.get(client) || [];
        const lastStructIndex = findIndexSS(structs, clock - 1);
        // write # encoded structs
        writeVarUint(encoder.restEncoder, lastStructIndex + 1);
        encoder.writeClient(client);
        // first clock written is 0
        writeVarUint(encoder.restEncoder, 0);
        for (let i = 0; i <= lastStructIndex; i++) {
          structs[i].write(encoder, 0);
        }
      }
      writeDeleteSet(encoder, ds);
    });

    applyUpdateV2(newDoc, encoder.toUint8Array(), 'snapshot');
    return newDoc
  };

  class StructStore {
    constructor () {
      /**
       * @type {Map<number,Array<GC|Item>>}
       */
      this.clients = new Map();
      /**
       * @type {null | { missing: Map<number, number>, update: Uint8Array }}
       */
      this.pendingStructs = null;
      /**
       * @type {null | Uint8Array}
       */
      this.pendingDs = null;
    }
  }

  /**
   * Return the states as a Map<client,clock>.
   * Note that clock refers to the next expected clock id.
   *
   * @param {StructStore} store
   * @return {Map<number,number>}
   *
   * @public
   * @function
   */
  const getStateVector = store => {
    const sm = new Map();
    store.clients.forEach((structs, client) => {
      const struct = structs[structs.length - 1];
      sm.set(client, struct.id.clock + struct.length);
    });
    return sm
  };

  /**
   * @param {StructStore} store
   * @param {number} client
   * @return {number}
   *
   * @public
   * @function
   */
  const getState = (store, client) => {
    const structs = store.clients.get(client);
    if (structs === undefined) {
      return 0
    }
    const lastStruct = structs[structs.length - 1];
    return lastStruct.id.clock + lastStruct.length
  };

  /**
   * @param {StructStore} store
   * @param {GC|Item} struct
   *
   * @private
   * @function
   */
  const addStruct = (store, struct) => {
    let structs = store.clients.get(struct.id.client);
    if (structs === undefined) {
      structs = [];
      store.clients.set(struct.id.client, structs);
    } else {
      const lastStruct = structs[structs.length - 1];
      if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
        throw unexpectedCase()
      }
    }
    structs.push(struct);
  };

  /**
   * Perform a binary search on a sorted array
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   * @return {number}
   *
   * @private
   * @function
   */
  const findIndexSS = (structs, clock) => {
    let left = 0;
    let right = structs.length - 1;
    let mid = structs[right];
    let midclock = mid.id.clock;
    if (midclock === clock) {
      return right
    }
    // @todo does it even make sense to pivot the search?
    // If a good split misses, it might actually increase the time to find the correct item.
    // Currently, the only advantage is that search with pivoting might find the item on the first try.
    let midindex = floor((clock / (midclock + mid.length - 1)) * right); // pivoting the search
    while (left <= right) {
      mid = structs[midindex];
      midclock = mid.id.clock;
      if (midclock <= clock) {
        if (clock < midclock + mid.length) {
          return midindex
        }
        left = midindex + 1;
      } else {
        right = midindex - 1;
      }
      midindex = floor((left + right) / 2);
    }
    // Always check state before looking for a struct in StructStore
    // Therefore the case of not finding a struct is unexpected
    throw unexpectedCase()
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {StructStore} store
   * @param {ID} id
   * @return {GC|Item}
   *
   * @private
   * @function
   */
  const find = (store, id) => {
    /**
     * @type {Array<GC|Item>}
     */
    // @ts-ignore
    const structs = store.clients.get(id.client);
    return structs[findIndexSS(structs, id.clock)]
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   * @private
   * @function
   */
  const getItem = /** @type {function(StructStore,ID):Item} */ (find);

  /**
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   */
  const findIndexCleanStart = (transaction, structs, clock) => {
    const index = findIndexSS(structs, clock);
    const struct = structs[index];
    if (struct.id.clock < clock && struct instanceof Item) {
      structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
      return index + 1
    }
    return index
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanStart = (transaction, id) => {
    const structs = /** @type {Array<Item>} */ (transaction.doc.store.clients.get(id.client));
    return structs[findIndexCleanStart(transaction, structs, id.clock)]
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanEnd = (transaction, store, id) => {
    /**
     * @type {Array<Item>}
     */
    // @ts-ignore
    const structs = store.clients.get(id.client);
    const index = findIndexSS(structs, id.clock);
    const struct = structs[index];
    if (id.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
      structs.splice(index + 1, 0, splitItem(transaction, struct, id.clock - struct.id.clock + 1));
    }
    return struct
  };

  /**
   * Replace `item` with `newitem` in store
   * @param {StructStore} store
   * @param {GC|Item} struct
   * @param {GC|Item} newStruct
   *
   * @private
   * @function
   */
  const replaceStruct = (store, struct, newStruct) => {
    const structs = /** @type {Array<GC|Item>} */ (store.clients.get(struct.id.client));
    structs[findIndexSS(structs, struct.id.clock)] = newStruct;
  };

  /**
   * Iterate over a range of structs
   *
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clockStart Inclusive start
   * @param {number} len
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateStructs = (transaction, structs, clockStart, len, f) => {
    if (len === 0) {
      return
    }
    const clockEnd = clockStart + len;
    let index = findIndexCleanStart(transaction, structs, clockStart);
    let struct;
    do {
      struct = structs[index++];
      if (clockEnd < struct.id.clock + struct.length) {
        findIndexCleanStart(transaction, structs, clockEnd);
      }
      f(struct);
    } while (index < structs.length && structs[index].id.clock < clockEnd)
  };

  /**
   * A transaction is created for every change on the Yjs model. It is possible
   * to bundle changes on the Yjs model in a single transaction to
   * minimize the number on messages sent and the number of observer calls.
   * If possible the user of this library should bundle as many changes as
   * possible. Here is an example to illustrate the advantages of bundling:
   *
   * @example
   * const map = y.define('map', YMap)
   * // Log content when change is triggered
   * map.observe(() => {
   *   console.log('change triggered')
   * })
   * // Each change on the map type triggers a log message:
   * map.set('a', 0) // => "change triggered"
   * map.set('b', 0) // => "change triggered"
   * // When put in a transaction, it will trigger the log after the transaction:
   * y.transact(() => {
   *   map.set('a', 1)
   *   map.set('b', 1)
   * }) // => "change triggered"
   *
   * @public
   */
  class Transaction {
    /**
     * @param {Doc} doc
     * @param {any} origin
     * @param {boolean} local
     */
    constructor (doc, origin, local) {
      /**
       * The Yjs instance.
       * @type {Doc}
       */
      this.doc = doc;
      /**
       * Describes the set of deleted items by ids
       * @type {DeleteSet}
       */
      this.deleteSet = new DeleteSet();
      /**
       * Holds the state before the transaction started.
       * @type {Map<Number,Number>}
       */
      this.beforeState = getStateVector(doc.store);
      /**
       * Holds the state after the transaction.
       * @type {Map<Number,Number>}
       */
      this.afterState = new Map();
      /**
       * All types that were directly modified (property added or child
       * inserted/deleted). New types are not included in this Set.
       * Maps from type to parentSubs (`item.parentSub = null` for YArray)
       * @type {Map<AbstractType<YEvent<any>>,Set<String|null>>}
       */
      this.changed = new Map();
      /**
       * Stores the events for the types that observe also child elements.
       * It is mainly used by `observeDeep`.
       * @type {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>}
       */
      this.changedParentTypes = new Map();
      /**
       * @type {Array<AbstractStruct>}
       */
      this._mergeStructs = [];
      /**
       * @type {any}
       */
      this.origin = origin;
      /**
       * Stores meta information on the transaction
       * @type {Map<any,any>}
       */
      this.meta = new Map();
      /**
       * Whether this change originates from this doc.
       * @type {boolean}
       */
      this.local = local;
      /**
       * @type {Set<Doc>}
       */
      this.subdocsAdded = new Set();
      /**
       * @type {Set<Doc>}
       */
      this.subdocsRemoved = new Set();
      /**
       * @type {Set<Doc>}
       */
      this.subdocsLoaded = new Set();
    }
  }

  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Transaction} transaction
   * @return {boolean} Whether data was written.
   */
  const writeUpdateMessageFromTransaction = (encoder, transaction) => {
    if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
      return false
    }
    sortAndMergeDeleteSet(transaction.deleteSet);
    writeStructsFromTransaction(encoder, transaction);
    writeDeleteSet(encoder, transaction.deleteSet);
    return true
  };

  /**
   * If `type.parent` was added in current transaction, `type` technically
   * did not change, it was just added and we should not fire events for `type`.
   *
   * @param {Transaction} transaction
   * @param {AbstractType<YEvent<any>>} type
   * @param {string|null} parentSub
   */
  const addChangedTypeToTransaction = (transaction, type, parentSub) => {
    const item = type._item;
    if (item === null || (item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted)) {
      setIfUndefined(transaction.changed, type, create$1).add(parentSub);
    }
  };

  /**
   * @param {Array<AbstractStruct>} structs
   * @param {number} pos
   */
  const tryToMergeWithLeft = (structs, pos) => {
    const left = structs[pos - 1];
    const right = structs[pos];
    if (left.deleted === right.deleted && left.constructor === right.constructor) {
      if (left.mergeWith(right)) {
        structs.splice(pos, 1);
        if (right instanceof Item && right.parentSub !== null && /** @type {AbstractType<any>} */ (right.parent)._map.get(right.parentSub) === right) {
          /** @type {AbstractType<any>} */ (right.parent)._map.set(right.parentSub, /** @type {Item} */ (left));
        }
      }
    }
  };

  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   * @param {function(Item):boolean} gcFilter
   */
  const tryGcDeleteSet = (ds, store, gcFilter) => {
    for (const [client, deleteItems] of ds.clients.entries()) {
      const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
      for (let di = deleteItems.length - 1; di >= 0; di--) {
        const deleteItem = deleteItems[di];
        const endDeleteItemClock = deleteItem.clock + deleteItem.len;
        for (
          let si = findIndexSS(structs, deleteItem.clock), struct = structs[si];
          si < structs.length && struct.id.clock < endDeleteItemClock;
          struct = structs[++si]
        ) {
          const struct = structs[si];
          if (deleteItem.clock + deleteItem.len <= struct.id.clock) {
            break
          }
          if (struct instanceof Item && struct.deleted && !struct.keep && gcFilter(struct)) {
            struct.gc(store, false);
          }
        }
      }
    }
  };

  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   */
  const tryMergeDeleteSet = (ds, store) => {
    // try to merge deleted / gc'd items
    // merge from right to left for better efficiecy and so we don't miss any merge targets
    ds.clients.forEach((deleteItems, client) => {
      const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
      for (let di = deleteItems.length - 1; di >= 0; di--) {
        const deleteItem = deleteItems[di];
        // start with merging the item next to the last deleted item
        const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
        for (
          let si = mostRightIndexToCheck, struct = structs[si];
          si > 0 && struct.id.clock >= deleteItem.clock;
          struct = structs[--si]
        ) {
          tryToMergeWithLeft(structs, si);
        }
      }
    });
  };

  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   * @param {function(Item):boolean} gcFilter
   */
  const tryGc = (ds, store, gcFilter) => {
    tryGcDeleteSet(ds, store, gcFilter);
    tryMergeDeleteSet(ds, store);
  };

  /**
   * @param {Array<Transaction>} transactionCleanups
   * @param {number} i
   */
  const cleanupTransactions = (transactionCleanups, i) => {
    if (i < transactionCleanups.length) {
      const transaction = transactionCleanups[i];
      const doc = transaction.doc;
      const store = doc.store;
      const ds = transaction.deleteSet;
      const mergeStructs = transaction._mergeStructs;
      try {
        sortAndMergeDeleteSet(ds);
        transaction.afterState = getStateVector(transaction.doc.store);
        doc._transaction = null;
        doc.emit('beforeObserverCalls', [transaction, doc]);
        /**
         * An array of event callbacks.
         *
         * Each callback is called even if the other ones throw errors.
         *
         * @type {Array<function():void>}
         */
        const fs = [];
        // observe events on changed types
        transaction.changed.forEach((subs, itemtype) =>
          fs.push(() => {
            if (itemtype._item === null || !itemtype._item.deleted) {
              itemtype._callObserver(transaction, subs);
            }
          })
        );
        fs.push(() => {
          // deep observe events
          transaction.changedParentTypes.forEach((events, type) =>
            fs.push(() => {
              // We need to think about the possibility that the user transforms the
              // Y.Doc in the event.
              if (type._item === null || !type._item.deleted) {
                events = events
                  .filter(event =>
                    event.target._item === null || !event.target._item.deleted
                  );
                events
                  .forEach(event => {
                    event.currentTarget = type;
                  });
                // sort events by path length so that top-level events are fired first.
                events
                  .sort((event1, event2) => event1.path.length - event2.path.length);
                // We don't need to check for events.length
                // because we know it has at least one element
                callEventHandlerListeners(type._dEH, events, transaction);
              }
            })
          );
          fs.push(() => doc.emit('afterTransaction', [transaction, doc]));
        });
        callAll(fs, []);
      } finally {
        // Replace deleted items with ItemDeleted / GC.
        // This is where content is actually remove from the Yjs Doc.
        if (doc.gc) {
          tryGcDeleteSet(ds, store, doc.gcFilter);
        }
        tryMergeDeleteSet(ds, store);

        // on all affected store.clients props, try to merge
        transaction.afterState.forEach((clock, client) => {
          const beforeClock = transaction.beforeState.get(client) || 0;
          if (beforeClock !== clock) {
            const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
            // we iterate from right to left so we can safely remove entries
            const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
            for (let i = structs.length - 1; i >= firstChangePos; i--) {
              tryToMergeWithLeft(structs, i);
            }
          }
        });
        // try to merge mergeStructs
        // @todo: it makes more sense to transform mergeStructs to a DS, sort it, and merge from right to left
        //        but at the moment DS does not handle duplicates
        for (let i = 0; i < mergeStructs.length; i++) {
          const { client, clock } = mergeStructs[i].id;
          const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
          const replacedStructPos = findIndexSS(structs, clock);
          if (replacedStructPos + 1 < structs.length) {
            tryToMergeWithLeft(structs, replacedStructPos + 1);
          }
          if (replacedStructPos > 0) {
            tryToMergeWithLeft(structs, replacedStructPos);
          }
        }
        if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
          print(ORANGE, BOLD, '[yjs] ', UNBOLD, RED, 'Changed the client-id because another client seems to be using it.');
          doc.clientID = generateNewClientId();
        }
        // @todo Merge all the transactions into one and provide send the data as a single update message
        doc.emit('afterTransactionCleanup', [transaction, doc]);
        if (doc._observers.has('update')) {
          const encoder = new UpdateEncoderV1();
          const hasContent = writeUpdateMessageFromTransaction(encoder, transaction);
          if (hasContent) {
            doc.emit('update', [encoder.toUint8Array(), transaction.origin, doc, transaction]);
          }
        }
        if (doc._observers.has('updateV2')) {
          const encoder = new UpdateEncoderV2();
          const hasContent = writeUpdateMessageFromTransaction(encoder, transaction);
          if (hasContent) {
            doc.emit('updateV2', [encoder.toUint8Array(), transaction.origin, doc, transaction]);
          }
        }
        const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
        if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
          subdocsAdded.forEach(subdoc => {
            subdoc.clientID = doc.clientID;
            if (subdoc.collectionid == null) {
              subdoc.collectionid = doc.collectionid;
            }
            doc.subdocs.add(subdoc);
          });
          subdocsRemoved.forEach(subdoc => doc.subdocs.delete(subdoc));
          doc.emit('subdocs', [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc, transaction]);
          subdocsRemoved.forEach(subdoc => subdoc.destroy());
        }

        if (transactionCleanups.length <= i + 1) {
          doc._transactionCleanups = [];
          doc.emit('afterAllTransactions', [doc, transactionCleanups]);
        } else {
          cleanupTransactions(transactionCleanups, i + 1);
        }
      }
    }
  };

  /**
   * Implements the functionality of `y.transact(()=>{..})`
   *
   * @param {Doc} doc
   * @param {function(Transaction):void} f
   * @param {any} [origin=true]
   *
   * @function
   */
  const transact = (doc, f, origin = null, local = true) => {
    const transactionCleanups = doc._transactionCleanups;
    let initialCall = false;
    if (doc._transaction === null) {
      initialCall = true;
      doc._transaction = new Transaction(doc, origin, local);
      transactionCleanups.push(doc._transaction);
      if (transactionCleanups.length === 1) {
        doc.emit('beforeAllTransactions', [doc]);
      }
      doc.emit('beforeTransaction', [doc._transaction, doc]);
    }
    try {
      f(doc._transaction);
    } finally {
      if (initialCall && transactionCleanups[0] === doc._transaction) {
        // The first transaction ended, now process observer calls.
        // Observer call may create new transactions for which we need to call the observers and do cleanup.
        // We don't want to nest these calls, so we execute these calls one after
        // another.
        // Also we need to ensure that all cleanups are called, even if the
        // observes throw errors.
        // This file is full of hacky try {} finally {} blocks to ensure that an
        // event can throw errors and also that the cleanup is called.
        cleanupTransactions(transactionCleanups, 0);
      }
    }
  };

  class StackItem {
    /**
     * @param {DeleteSet} deletions
     * @param {DeleteSet} insertions
     */
    constructor (deletions, insertions) {
      this.insertions = insertions;
      this.deletions = deletions;
      /**
       * Use this to save and restore metadata like selection range
       */
      this.meta = new Map();
    }
  }
  /**
   * @param {Transaction} tr
   * @param {UndoManager} um
   * @param {StackItem} stackItem
   */
  const clearUndoManagerStackItem = (tr, um, stackItem) => {
    iterateDeletedStructs(tr, stackItem.deletions, item => {
      if (item instanceof Item && um.scope.some(type => isParentOf(type, item))) {
        keepItem(item, false);
      }
    });
  };

  /**
   * @param {UndoManager} undoManager
   * @param {Array<StackItem>} stack
   * @param {string} eventType
   * @return {StackItem?}
   */
  const popStackItem = (undoManager, stack, eventType) => {
    /**
     * Whether a change happened
     * @type {StackItem?}
     */
    let result = null;
    /**
     * Keep a reference to the transaction so we can fire the event with the changedParentTypes
     * @type {any}
     */
    let _tr = null;
    const doc = undoManager.doc;
    const scope = undoManager.scope;
    transact(doc, transaction => {
      while (stack.length > 0 && result === null) {
        const store = doc.store;
        const stackItem = /** @type {StackItem} */ (stack.pop());
        /**
         * @type {Set<Item>}
         */
        const itemsToRedo = new Set();
        /**
         * @type {Array<Item>}
         */
        const itemsToDelete = [];
        let performedChange = false;
        iterateDeletedStructs(transaction, stackItem.insertions, struct => {
          if (struct instanceof Item) {
            if (struct.redone !== null) {
              let { item, diff } = followRedone(store, struct.id);
              if (diff > 0) {
                item = getItemCleanStart(transaction, createID(item.id.client, item.id.clock + diff));
              }
              struct = item;
            }
            if (!struct.deleted && scope.some(type => isParentOf(type, /** @type {Item} */ (struct)))) {
              itemsToDelete.push(struct);
            }
          }
        });
        iterateDeletedStructs(transaction, stackItem.deletions, struct => {
          if (
            struct instanceof Item &&
            scope.some(type => isParentOf(type, struct)) &&
            // Never redo structs in stackItem.insertions because they were created and deleted in the same capture interval.
            !isDeleted(stackItem.insertions, struct.id)
          ) {
            itemsToRedo.add(struct);
          }
        });
        itemsToRedo.forEach(struct => {
          performedChange = redoItem(transaction, struct, itemsToRedo, stackItem.insertions, undoManager.ignoreRemoteMapChanges) !== null || performedChange;
        });
        // We want to delete in reverse order so that children are deleted before
        // parents, so we have more information available when items are filtered.
        for (let i = itemsToDelete.length - 1; i >= 0; i--) {
          const item = itemsToDelete[i];
          if (undoManager.deleteFilter(item)) {
            item.delete(transaction);
            performedChange = true;
          }
        }
        result = performedChange ? stackItem : null;
      }
      transaction.changed.forEach((subProps, type) => {
        // destroy search marker if necessary
        if (subProps.has(null) && type._searchMarker) {
          type._searchMarker.length = 0;
        }
      });
      _tr = transaction;
    }, undoManager);
    if (result != null) {
      const changedParentTypes = _tr.changedParentTypes;
      undoManager.emit('stack-item-popped', [{ stackItem: result, type: eventType, changedParentTypes }, undoManager]);
    }
    return result
  };

  /**
   * @typedef {Object} UndoManagerOptions
   * @property {number} [UndoManagerOptions.captureTimeout=500]
   * @property {function(Item):boolean} [UndoManagerOptions.deleteFilter=()=>true] Sometimes
   * it is necessary to filter whan an Undo/Redo operation can delete. If this
   * filter returns false, the type/item won't be deleted even it is in the
   * undo/redo scope.
   * @property {Set<any>} [UndoManagerOptions.trackedOrigins=new Set([null])]
   * @property {boolean} [ignoreRemoteMapChanges] Experimental. By default, the UndoManager will never overwrite remote changes. Enable this property to enable overwriting remote changes on key-value changes (Y.Map, properties on Y.Xml, etc..).
   */

  /**
   * Fires 'stack-item-added' event when a stack item was added to either the undo- or
   * the redo-stack. You may store additional stack information via the
   * metadata property on `event.stackItem.meta` (it is a `Map` of metadata properties).
   * Fires 'stack-item-popped' event when a stack item was popped from either the
   * undo- or the redo-stack. You may restore the saved stack information from `event.stackItem.meta`.
   *
   * @extends {Observable<'stack-item-added'|'stack-item-popped'|'stack-cleared'|'stack-item-updated'>}
   */
  class UndoManager extends Observable {
    /**
     * @param {AbstractType<any>|Array<AbstractType<any>>} typeScope Accepts either a single type, or an array of types
     * @param {UndoManagerOptions} options
     */
    constructor (typeScope, { captureTimeout = 500, deleteFilter = () => true, trackedOrigins = new Set([null]), ignoreRemoteMapChanges = false } = {}) {
      super();
      /**
       * @type {Array<AbstractType<any>>}
       */
      this.scope = [];
      this.addToScope(typeScope);
      this.deleteFilter = deleteFilter;
      trackedOrigins.add(this);
      this.trackedOrigins = trackedOrigins;
      /**
       * @type {Array<StackItem>}
       */
      this.undoStack = [];
      /**
       * @type {Array<StackItem>}
       */
      this.redoStack = [];
      /**
       * Whether the client is currently undoing (calling UndoManager.undo)
       *
       * @type {boolean}
       */
      this.undoing = false;
      this.redoing = false;
      this.doc = /** @type {Doc} */ (this.scope[0].doc);
      this.lastChange = 0;
      this.ignoreRemoteMapChanges = ignoreRemoteMapChanges;
      /**
       * @param {Transaction} transaction
       */
      this.afterTransactionHandler = transaction => {
        // Only track certain transactions
        if (!this.scope.some(type => transaction.changedParentTypes.has(type)) || (!this.trackedOrigins.has(transaction.origin) && (!transaction.origin || !this.trackedOrigins.has(transaction.origin.constructor)))) {
          return
        }
        const undoing = this.undoing;
        const redoing = this.redoing;
        const stack = undoing ? this.redoStack : this.undoStack;
        if (undoing) {
          this.stopCapturing(); // next undo should not be appended to last stack item
        } else if (!redoing) {
          // neither undoing nor redoing: delete redoStack
          this.clear(false, true);
        }
        const insertions = new DeleteSet();
        transaction.afterState.forEach((endClock, client) => {
          const startClock = transaction.beforeState.get(client) || 0;
          const len = endClock - startClock;
          if (len > 0) {
            addToDeleteSet(insertions, client, startClock, len);
          }
        });
        const now = getUnixTime();
        let didAdd = false;
        if (now - this.lastChange < captureTimeout && stack.length > 0 && !undoing && !redoing) {
          // append change to last stack op
          const lastOp = stack[stack.length - 1];
          lastOp.deletions = mergeDeleteSets([lastOp.deletions, transaction.deleteSet]);
          lastOp.insertions = mergeDeleteSets([lastOp.insertions, insertions]);
        } else {
          // create a new stack op
          stack.push(new StackItem(transaction.deleteSet, insertions));
          didAdd = true;
        }
        if (!undoing && !redoing) {
          this.lastChange = now;
        }
        // make sure that deleted structs are not gc'd
        iterateDeletedStructs(transaction, transaction.deleteSet, /** @param {Item|GC} item */ item => {
          if (item instanceof Item && this.scope.some(type => isParentOf(type, item))) {
            keepItem(item, true);
          }
        });
        const changeEvent = [{ stackItem: stack[stack.length - 1], origin: transaction.origin, type: undoing ? 'redo' : 'undo', changedParentTypes: transaction.changedParentTypes }, this];
        if (didAdd) {
          this.emit('stack-item-added', changeEvent);
        } else {
          this.emit('stack-item-updated', changeEvent);
        }
      };
      this.doc.on('afterTransaction', this.afterTransactionHandler);
      this.doc.on('destroy', () => {
        this.destroy();
      });
    }

    /**
     * @param {Array<AbstractType<any>> | AbstractType<any>} ytypes
     */
    addToScope (ytypes) {
      ytypes = isArray(ytypes) ? ytypes : [ytypes];
      ytypes.forEach(ytype => {
        if (this.scope.every(yt => yt !== ytype)) {
          this.scope.push(ytype);
        }
      });
    }

    /**
     * @param {any} origin
     */
    addTrackedOrigin (origin) {
      this.trackedOrigins.add(origin);
    }

    /**
     * @param {any} origin
     */
    removeTrackedOrigin (origin) {
      this.trackedOrigins.delete(origin);
    }

    clear (clearUndoStack = true, clearRedoStack = true) {
      if ((clearUndoStack && this.canUndo()) || (clearRedoStack && this.canRedo())) {
        this.doc.transact(tr => {
          if (clearUndoStack) {
            this.undoStack.forEach(item => clearUndoManagerStackItem(tr, this, item));
            this.undoStack = [];
          }
          if (clearRedoStack) {
            this.redoStack.forEach(item => clearUndoManagerStackItem(tr, this, item));
            this.redoStack = [];
          }
          this.emit('stack-cleared', [{ undoStackCleared: clearUndoStack, redoStackCleared: clearRedoStack }]);
        });
      }
    }

    /**
     * UndoManager merges Undo-StackItem if they are created within time-gap
     * smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
     * StackItem won't be merged.
     *
     *
     * @example
     *     // without stopCapturing
     *     ytext.insert(0, 'a')
     *     ytext.insert(1, 'b')
     *     um.undo()
     *     ytext.toString() // => '' (note that 'ab' was removed)
     *     // with stopCapturing
     *     ytext.insert(0, 'a')
     *     um.stopCapturing()
     *     ytext.insert(0, 'b')
     *     um.undo()
     *     ytext.toString() // => 'a' (note that only 'b' was removed)
     *
     */
    stopCapturing () {
      this.lastChange = 0;
    }

    /**
     * Undo last changes on type.
     *
     * @return {StackItem?} Returns StackItem if a change was applied
     */
    undo () {
      this.undoing = true;
      let res;
      try {
        res = popStackItem(this, this.undoStack, 'undo');
      } finally {
        this.undoing = false;
      }
      return res
    }

    /**
     * Redo last undo operation.
     *
     * @return {StackItem?} Returns StackItem if a change was applied
     */
    redo () {
      this.redoing = true;
      let res;
      try {
        res = popStackItem(this, this.redoStack, 'redo');
      } finally {
        this.redoing = false;
      }
      return res
    }

    /**
     * Are undo steps available?
     *
     * @return {boolean} `true` if undo is possible
     */
    canUndo () {
      return this.undoStack.length > 0
    }

    /**
     * Are redo steps available?
     *
     * @return {boolean} `true` if redo is possible
     */
    canRedo () {
      return this.redoStack.length > 0
    }

    destroy () {
      this.trackedOrigins.delete(this);
      this.doc.off('afterTransaction', this.afterTransactionHandler);
      super.destroy();
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   */
  function * lazyStructReaderGenerator (decoder) {
    const numOfStateUpdates = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numOfStateUpdates; i++) {
      const numberOfStructs = readVarUint(decoder.restDecoder);
      const client = decoder.readClient();
      let clock = readVarUint(decoder.restDecoder);
      for (let i = 0; i < numberOfStructs; i++) {
        const info = decoder.readInfo();
        // @todo use switch instead of ifs
        if (info === 10) {
          const len = readVarUint(decoder.restDecoder);
          yield new Skip(createID(client, clock), len);
          clock += len;
        } else if ((BITS5 & info) !== 0) {
          const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
          // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
          // and we read the next string as parentYKey.
          // It indicates how we store/retrieve parent from `y.share`
          // @type {string|null}
          const struct = new Item(
            createID(client, clock),
            null, // left
            (info & BIT8) === BIT8 ? decoder.readLeftID() : null, // origin
            null, // right
            (info & BIT7) === BIT7 ? decoder.readRightID() : null, // right origin
            // @ts-ignore Force writing a string here.
            cantCopyParentInfo ? (decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID()) : null, // parent
            cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, // parentSub
            readItemContent(decoder, info) // item content
          );
          yield struct;
          clock += struct.length;
        } else {
          const len = decoder.readLen();
          yield new GC(createID(client, clock), len);
          clock += len;
        }
      }
    }
  }

  class LazyStructReader {
    /**
     * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
     * @param {boolean} filterSkips
     */
    constructor (decoder, filterSkips) {
      this.gen = lazyStructReaderGenerator(decoder);
      /**
       * @type {null | Item | Skip | GC}
       */
      this.curr = null;
      this.done = false;
      this.filterSkips = filterSkips;
      this.next();
    }

    /**
     * @return {Item | GC | Skip |null}
     */
    next () {
      // ignore "Skip" structs
      do {
        this.curr = this.gen.next().value || null;
      } while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip)
      return this.curr
    }
  }

  /**
   * @param {Uint8Array} update
   *
   */
  const logUpdate = update => logUpdateV2(update, UpdateDecoderV1);

  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
   *
   */
  const logUpdateV2 = (update, YDecoder = UpdateDecoderV2) => {
    const structs = [];
    const updateDecoder = new YDecoder(createDecoder(update));
    const lazyDecoder = new LazyStructReader(updateDecoder, false);
    for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
      structs.push(curr);
    }
    print('Structs: ', structs);
    const ds = readDeleteSet(updateDecoder);
    print('DeleteSet: ', ds);
  };

  /**
   * @param {Uint8Array} update
   *
   */
  const decodeUpdate = (update) => decodeUpdateV2(update, UpdateDecoderV1);

  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
   *
   */
  const decodeUpdateV2 = (update, YDecoder = UpdateDecoderV2) => {
    const structs = [];
    const updateDecoder = new YDecoder(createDecoder(update));
    const lazyDecoder = new LazyStructReader(updateDecoder, false);
    for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
      structs.push(curr);
    }
    return {
      structs,
      ds: readDeleteSet(updateDecoder)
    }
  };

  class LazyStructWriter {
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     */
    constructor (encoder) {
      this.currClient = 0;
      this.startClock = 0;
      this.written = 0;
      this.encoder = encoder;
      /**
       * We want to write operations lazily, but also we need to know beforehand how many operations we want to write for each client.
       *
       * This kind of meta-information (#clients, #structs-per-client-written) is written to the restEncoder.
       *
       * We fragment the restEncoder and store a slice of it per-client until we know how many clients there are.
       * When we flush (toUint8Array) we write the restEncoder using the fragments and the meta-information.
       *
       * @type {Array<{ written: number, restEncoder: Uint8Array }>}
       */
      this.clientStructs = [];
    }
  }

  /**
   * @param {Array<Uint8Array>} updates
   * @return {Uint8Array}
   */
  const mergeUpdates = updates => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);

  /**
   * @param {Uint8Array} update
   * @param {typeof DSEncoderV1 | typeof DSEncoderV2} YEncoder
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
   * @return {Uint8Array}
   */
  const encodeStateVectorFromUpdateV2 = (update, YEncoder = DSEncoderV2, YDecoder = UpdateDecoderV2) => {
    const encoder = new YEncoder();
    const updateDecoder = new LazyStructReader(new YDecoder(createDecoder(update)), false);
    let curr = updateDecoder.curr;
    if (curr !== null) {
      let size = 0;
      let currClient = curr.id.client;
      let stopCounting = curr.id.clock !== 0; // must start at 0
      let currClock = stopCounting ? 0 : curr.id.clock + curr.length;
      for (; curr !== null; curr = updateDecoder.next()) {
        if (currClient !== curr.id.client) {
          if (currClock !== 0) {
            size++;
            // We found a new client
            // write what we have to the encoder
            writeVarUint(encoder.restEncoder, currClient);
            writeVarUint(encoder.restEncoder, currClock);
          }
          currClient = curr.id.client;
          currClock = 0;
          stopCounting = curr.id.clock !== 0;
        }
        // we ignore skips
        if (curr.constructor === Skip) {
          stopCounting = true;
        }
        if (!stopCounting) {
          currClock = curr.id.clock + curr.length;
        }
      }
      // write what we have
      if (currClock !== 0) {
        size++;
        writeVarUint(encoder.restEncoder, currClient);
        writeVarUint(encoder.restEncoder, currClock);
      }
      // prepend the size of the state vector
      const enc = createEncoder();
      writeVarUint(enc, size);
      writeBinaryEncoder(enc, encoder.restEncoder);
      encoder.restEncoder = enc;
      return encoder.toUint8Array()
    } else {
      writeVarUint(encoder.restEncoder, 0);
      return encoder.toUint8Array()
    }
  };

  /**
   * @param {Uint8Array} update
   * @return {Uint8Array}
   */
  const encodeStateVectorFromUpdate = update => encodeStateVectorFromUpdateV2(update, DSEncoderV1, UpdateDecoderV1);

  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
   * @return {{ from: Map<number,number>, to: Map<number,number> }}
   */
  const parseUpdateMetaV2 = (update, YDecoder = UpdateDecoderV2) => {
    /**
     * @type {Map<number, number>}
     */
    const from = new Map();
    /**
     * @type {Map<number, number>}
     */
    const to = new Map();
    const updateDecoder = new LazyStructReader(new YDecoder(createDecoder(update)), false);
    let curr = updateDecoder.curr;
    if (curr !== null) {
      let currClient = curr.id.client;
      let currClock = curr.id.clock;
      // write the beginning to `from`
      from.set(currClient, currClock);
      for (; curr !== null; curr = updateDecoder.next()) {
        if (currClient !== curr.id.client) {
          // We found a new client
          // write the end to `to`
          to.set(currClient, currClock);
          // write the beginning to `from`
          from.set(curr.id.client, curr.id.clock);
          // update currClient
          currClient = curr.id.client;
        }
        currClock = curr.id.clock + curr.length;
      }
      // write the end to `to`
      to.set(currClient, currClock);
    }
    return { from, to }
  };

  /**
   * @param {Uint8Array} update
   * @return {{ from: Map<number,number>, to: Map<number,number> }}
   */
  const parseUpdateMeta = update => parseUpdateMetaV2(update, UpdateDecoderV1);

  /**
   * This method is intended to slice any kind of struct and retrieve the right part.
   * It does not handle side-effects, so it should only be used by the lazy-encoder.
   *
   * @param {Item | GC | Skip} left
   * @param {number} diff
   * @return {Item | GC}
   */
  const sliceStruct = (left, diff) => {
    if (left.constructor === GC) {
      const { client, clock } = left.id;
      return new GC(createID(client, clock + diff), left.length - diff)
    } else if (left.constructor === Skip) {
      const { client, clock } = left.id;
      return new Skip(createID(client, clock + diff), left.length - diff)
    } else {
      const leftItem = /** @type {Item} */ (left);
      const { client, clock } = leftItem.id;
      return new Item(
        createID(client, clock + diff),
        null,
        createID(client, clock + diff - 1),
        null,
        leftItem.rightOrigin,
        leftItem.parent,
        leftItem.parentSub,
        leftItem.content.splice(diff)
      )
    }
  };

  /**
   *
   * This function works similarly to `readUpdateV2`.
   *
   * @param {Array<Uint8Array>} updates
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   * @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
   * @return {Uint8Array}
   */
  const mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
    if (updates.length === 1) {
      return updates[0]
    }
    const updateDecoders = updates.map(update => new YDecoder(createDecoder(update)));
    let lazyStructDecoders = updateDecoders.map(decoder => new LazyStructReader(decoder, true));

    /**
     * @todo we don't need offset because we always slice before
     * @type {null | { struct: Item | GC | Skip, offset: number }}
     */
    let currWrite = null;

    const updateEncoder = new YEncoder();
    // write structs lazily
    const lazyStructEncoder = new LazyStructWriter(updateEncoder);

    // Note: We need to ensure that all lazyStructDecoders are fully consumed
    // Note: Should merge document updates whenever possible - even from different updates
    // Note: Should handle that some operations cannot be applied yet ()

    while (true) {
      // Write higher clients first ⇒ sort by clientID & clock and remove decoders without content
      lazyStructDecoders = lazyStructDecoders.filter(dec => dec.curr !== null);
      lazyStructDecoders.sort(
        /** @type {function(any,any):number} */ (dec1, dec2) => {
          if (dec1.curr.id.client === dec2.curr.id.client) {
            const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
            if (clockDiff === 0) {
              // @todo remove references to skip since the structDecoders must filter Skips.
              return dec1.curr.constructor === dec2.curr.constructor
                ? 0
                : dec1.curr.constructor === Skip ? 1 : -1 // we are filtering skips anyway.
            } else {
              return clockDiff
            }
          } else {
            return dec2.curr.id.client - dec1.curr.id.client
          }
        }
      );
      if (lazyStructDecoders.length === 0) {
        break
      }
      const currDecoder = lazyStructDecoders[0];
      // write from currDecoder until the next operation is from another client or if filler-struct
      // then we need to reorder the decoders and find the next operation to write
      const firstClient = /** @type {Item | GC} */ (currDecoder.curr).id.client;

      if (currWrite !== null) {
        let curr = /** @type {Item | GC | null} */ (currDecoder.curr);
        let iterated = false;

        // iterate until we find something that we haven't written already
        // remember: first the high client-ids are written
        while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
          curr = currDecoder.next();
          iterated = true;
        }
        if (
          curr === null || // current decoder is empty
          curr.id.client !== firstClient || // check whether there is another decoder that has has updates from `firstClient`
          (iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) // the above while loop was used and we are potentially missing updates
        ) {
          continue
        }

        if (firstClient !== currWrite.struct.id.client) {
          writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
          currWrite = { struct: curr, offset: 0 };
          currDecoder.next();
        } else {
          if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
            // @todo write currStruct & set currStruct = Skip(clock = currStruct.id.clock + currStruct.length, length = curr.id.clock - self.clock)
            if (currWrite.struct.constructor === Skip) {
              // extend existing skip
              currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
            } else {
              writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
              const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
              /**
               * @type {Skip}
               */
              const struct = new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
              currWrite = { struct, offset: 0 };
            }
          } else { // if (currWrite.struct.id.clock + currWrite.struct.length >= curr.id.clock) {
            const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
            if (diff > 0) {
              if (currWrite.struct.constructor === Skip) {
                // prefer to slice Skip because the other struct might contain more information
                currWrite.struct.length -= diff;
              } else {
                curr = sliceStruct(curr, diff);
              }
            }
            if (!currWrite.struct.mergeWith(/** @type {any} */ (curr))) {
              writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
              currWrite = { struct: curr, offset: 0 };
              currDecoder.next();
            }
          }
        }
      } else {
        currWrite = { struct: /** @type {Item | GC} */ (currDecoder.curr), offset: 0 };
        currDecoder.next();
      }
      for (
        let next = currDecoder.curr;
        next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip;
        next = currDecoder.next()
      ) {
        writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
        currWrite = { struct: next, offset: 0 };
      }
    }
    if (currWrite !== null) {
      writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
      currWrite = null;
    }
    finishLazyStructWriting(lazyStructEncoder);

    const dss = updateDecoders.map(decoder => readDeleteSet(decoder));
    const ds = mergeDeleteSets(dss);
    writeDeleteSet(updateEncoder, ds);
    return updateEncoder.toUint8Array()
  };

  /**
   * @param {Uint8Array} update
   * @param {Uint8Array} sv
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   * @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
   */
  const diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
    const state = decodeStateVector(sv);
    const encoder = new YEncoder();
    const lazyStructWriter = new LazyStructWriter(encoder);
    const decoder = new YDecoder(createDecoder(update));
    const reader = new LazyStructReader(decoder, false);
    while (reader.curr) {
      const curr = reader.curr;
      const currClient = curr.id.client;
      const svClock = state.get(currClient) || 0;
      if (reader.curr.constructor === Skip) {
        // the first written struct shouldn't be a skip
        reader.next();
        continue
      }
      if (curr.id.clock + curr.length > svClock) {
        writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
        reader.next();
        while (reader.curr && reader.curr.id.client === currClient) {
          writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
          reader.next();
        }
      } else {
        // read until something new comes up
        while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
          reader.next();
        }
      }
    }
    finishLazyStructWriting(lazyStructWriter);
    // write ds
    const ds = readDeleteSet(decoder);
    writeDeleteSet(encoder, ds);
    return encoder.toUint8Array()
  };

  /**
   * @param {Uint8Array} update
   * @param {Uint8Array} sv
   */
  const diffUpdate = (update, sv) => diffUpdateV2(update, sv, UpdateDecoderV1, UpdateEncoderV1);

  /**
   * @param {LazyStructWriter} lazyWriter
   */
  const flushLazyStructWriter = lazyWriter => {
    if (lazyWriter.written > 0) {
      lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: toUint8Array(lazyWriter.encoder.restEncoder) });
      lazyWriter.encoder.restEncoder = createEncoder();
      lazyWriter.written = 0;
    }
  };

  /**
   * @param {LazyStructWriter} lazyWriter
   * @param {Item | GC} struct
   * @param {number} offset
   */
  const writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
    // flush curr if we start another client
    if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
      flushLazyStructWriter(lazyWriter);
    }
    if (lazyWriter.written === 0) {
      lazyWriter.currClient = struct.id.client;
      // write next client
      lazyWriter.encoder.writeClient(struct.id.client);
      // write startClock
      writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
    }
    struct.write(lazyWriter.encoder, offset);
    lazyWriter.written++;
  };
  /**
   * Call this function when we collected all parts and want to
   * put all the parts together. After calling this method,
   * you can continue using the UpdateEncoder.
   *
   * @param {LazyStructWriter} lazyWriter
   */
  const finishLazyStructWriting = (lazyWriter) => {
    flushLazyStructWriter(lazyWriter);

    // this is a fresh encoder because we called flushCurr
    const restEncoder = lazyWriter.encoder.restEncoder;

    /**
     * Now we put all the fragments together.
     * This works similarly to `writeClientsStructs`
     */

    // write # states that were updated - i.e. the clients
    writeVarUint(restEncoder, lazyWriter.clientStructs.length);

    for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
      const partStructs = lazyWriter.clientStructs[i];
      /**
       * Works similarly to `writeStructs`
       */
      // write # encoded structs
      writeVarUint(restEncoder, partStructs.written);
      // write the rest of the fragment
      writeUint8Array(restEncoder, partStructs.restEncoder);
    }
  };

  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} YDecoder
   * @param {typeof UpdateEncoderV2 | typeof UpdateEncoderV1 } YEncoder
   */
  const convertUpdateFormat = (update, YDecoder, YEncoder) => {
    const updateDecoder = new YDecoder(createDecoder(update));
    const lazyDecoder = new LazyStructReader(updateDecoder, false);
    const updateEncoder = new YEncoder();
    const lazyWriter = new LazyStructWriter(updateEncoder);

    for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
      writeStructToLazyStructWriter(lazyWriter, curr, 0);
    }
    finishLazyStructWriting(lazyWriter);
    const ds = readDeleteSet(updateDecoder);
    writeDeleteSet(updateEncoder, ds);
    return updateEncoder.toUint8Array()
  };

  /**
   * @param {Uint8Array} update
   */
  const convertUpdateFormatV1ToV2 = update => convertUpdateFormat(update, UpdateDecoderV1, UpdateEncoderV2);

  /**
   * @param {Uint8Array} update
   */
  const convertUpdateFormatV2ToV1 = update => convertUpdateFormat(update, UpdateDecoderV2, UpdateEncoderV1);

  /**
   * @template {AbstractType<any>} T
   * YEvent describes the changes on a YType.
   */
  class YEvent {
    /**
     * @param {T} target The changed type.
     * @param {Transaction} transaction
     */
    constructor (target, transaction) {
      /**
       * The type on which this event was created on.
       * @type {T}
       */
      this.target = target;
      /**
       * The current target on which the observe callback is called.
       * @type {AbstractType<any>}
       */
      this.currentTarget = target;
      /**
       * The transaction that triggered this event.
       * @type {Transaction}
       */
      this.transaction = transaction;
      /**
       * @type {Object|null}
       */
      this._changes = null;
      /**
       * @type {null | Map<string, { action: 'add' | 'update' | 'delete', oldValue: any, newValue: any }>}
       */
      this._keys = null;
      /**
       * @type {null | Array<{ insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any> }>}
       */
      this._delta = null;
    }

    /**
     * Computes the path from `y` to the changed type.
     *
     * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
     *
     * The following property holds:
     * @example
     *   let type = y
     *   event.path.forEach(dir => {
     *     type = type.get(dir)
     *   })
     *   type === event.target // => true
     */
    get path () {
      // @ts-ignore _item is defined because target is integrated
      return getPathTo(this.currentTarget, this.target)
    }

    /**
     * Check if a struct is deleted by this event.
     *
     * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
     *
     * @param {AbstractStruct} struct
     * @return {boolean}
     */
    deletes (struct) {
      return isDeleted(this.transaction.deleteSet, struct.id)
    }

    /**
     * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any, newValue: any }>}
     */
    get keys () {
      if (this._keys === null) {
        const keys = new Map();
        const target = this.target;
        const changed = /** @type Set<string|null> */ (this.transaction.changed.get(target));
        changed.forEach(key => {
          if (key !== null) {
            const item = /** @type {Item} */ (target._map.get(key));
            /**
             * @type {'delete' | 'add' | 'update'}
             */
            let action;
            let oldValue;
            if (this.adds(item)) {
              let prev = item.left;
              while (prev !== null && this.adds(prev)) {
                prev = prev.left;
              }
              if (this.deletes(item)) {
                if (prev !== null && this.deletes(prev)) {
                  action = 'delete';
                  oldValue = last(prev.content.getContent());
                } else {
                  return
                }
              } else {
                if (prev !== null && this.deletes(prev)) {
                  action = 'update';
                  oldValue = last(prev.content.getContent());
                } else {
                  action = 'add';
                  oldValue = undefined;
                }
              }
            } else {
              if (this.deletes(item)) {
                action = 'delete';
                oldValue = last(/** @type {Item} */ item.content.getContent());
              } else {
                return // nop
              }
            }
            keys.set(key, { action, oldValue });
          }
        });
        this._keys = keys;
      }
      return this._keys
    }

    /**
     * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
     */
    get delta () {
      return this.changes.delta
    }

    /**
     * Check if a struct is added by this event.
     *
     * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
     *
     * @param {AbstractStruct} struct
     * @return {boolean}
     */
    adds (struct) {
      return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0)
    }

    /**
     * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
     */
    get changes () {
      let changes = this._changes;
      if (changes === null) {
        const target = this.target;
        const added = create$1();
        const deleted = create$1();
        /**
         * @type {Array<{insert:Array<any>}|{delete:number}|{retain:number}>}
         */
        const delta = [];
        changes = {
          added,
          deleted,
          delta,
          keys: this.keys
        };
        const changed = /** @type Set<string|null> */ (this.transaction.changed.get(target));
        if (changed.has(null)) {
          /**
           * @type {any}
           */
          let lastOp = null;
          const packOp = () => {
            if (lastOp) {
              delta.push(lastOp);
            }
          };
          for (let item = target._start; item !== null; item = item.right) {
            if (item.deleted) {
              if (this.deletes(item) && !this.adds(item)) {
                if (lastOp === null || lastOp.delete === undefined) {
                  packOp();
                  lastOp = { delete: 0 };
                }
                lastOp.delete += item.length;
                deleted.add(item);
              } // else nop
            } else {
              if (this.adds(item)) {
                if (lastOp === null || lastOp.insert === undefined) {
                  packOp();
                  lastOp = { insert: [] };
                }
                lastOp.insert = lastOp.insert.concat(item.content.getContent());
                added.add(item);
              } else {
                if (lastOp === null || lastOp.retain === undefined) {
                  packOp();
                  lastOp = { retain: 0 };
                }
                lastOp.retain += item.length;
              }
            }
          }
          if (lastOp !== null && lastOp.retain === undefined) {
            packOp();
          }
        }
        this._changes = changes;
      }
      return /** @type {any} */ (changes)
    }
  }

  /**
   * Compute the path from this type to the specified target.
   *
   * @example
   *   // `child` should be accessible via `type.get(path[0]).get(path[1])..`
   *   const path = type.getPathTo(child)
   *   // assuming `type instanceof YArray`
   *   console.log(path) // might look like => [2, 'key1']
   *   child === type.get(path[0]).get(path[1])
   *
   * @param {AbstractType<any>} parent
   * @param {AbstractType<any>} child target
   * @return {Array<string|number>} Path to the target
   *
   * @private
   * @function
   */
  const getPathTo = (parent, child) => {
    const path = [];
    while (child._item !== null && child !== parent) {
      if (child._item.parentSub !== null) {
        // parent is map-ish
        path.unshift(child._item.parentSub);
      } else {
        // parent is array-ish
        let i = 0;
        let c = /** @type {AbstractType<any>} */ (child._item.parent)._start;
        while (c !== child._item && c !== null) {
          if (!c.deleted) {
            i++;
          }
          c = c.right;
        }
        path.unshift(i);
      }
      child = /** @type {AbstractType<any>} */ (child._item.parent);
    }
    return path
  };

  /**
   * Utility module to create and manipulate Iterators.
   *
   * @module iterator
   */

  /**
   * @template T
   * @param {function():IteratorResult<T>} next
   * @return {IterableIterator<T>}
   */
  const createIterator = next => ({
    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return this
    },
    // @ts-ignore
    next
  });

  /**
   * @template T
   * @param {Iterator<T>} iterator
   * @param {function(T):boolean} filter
   */
  const iteratorFilter = (iterator, filter) => createIterator(() => {
    let res;
    do {
      res = iterator.next();
    } while (!res.done && !filter(res.value))
    return res
  });

  /**
   * @template T,M
   * @param {Iterator<T>} iterator
   * @param {function(T):M} fmap
   */
  const iteratorMap = (iterator, fmap) => createIterator(() => {
    const { done, value } = iterator.next();
    return { done, value: done ? undefined : fmap(value) }
  });

  const maxSearchMarker = 80;

  /**
   * A unique timestamp that identifies each marker.
   *
   * Time is relative,.. this is more like an ever-increasing clock.
   *
   * @type {number}
   */
  let globalSearchMarkerTimestamp = 0;

  class ArraySearchMarker {
    /**
     * @param {Item} p
     * @param {number} index
     */
    constructor (p, index) {
      p.marker = true;
      this.p = p;
      this.index = index;
      this.timestamp = globalSearchMarkerTimestamp++;
    }
  }

  /**
   * @param {ArraySearchMarker} marker
   */
  const refreshMarkerTimestamp = marker => { marker.timestamp = globalSearchMarkerTimestamp++; };

  /**
   * This is rather complex so this function is the only thing that should overwrite a marker
   *
   * @param {ArraySearchMarker} marker
   * @param {Item} p
   * @param {number} index
   */
  const overwriteMarker = (marker, p, index) => {
    marker.p.marker = false;
    marker.p = p;
    p.marker = true;
    marker.index = index;
    marker.timestamp = globalSearchMarkerTimestamp++;
  };

  /**
   * @param {Array<ArraySearchMarker>} searchMarker
   * @param {Item} p
   * @param {number} index
   */
  const markPosition = (searchMarker, p, index) => {
    if (searchMarker.length >= maxSearchMarker) {
      // override oldest marker (we don't want to create more objects)
      const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
      overwriteMarker(marker, p, index);
      return marker
    } else {
      // create new marker
      const pm = new ArraySearchMarker(p, index);
      searchMarker.push(pm);
      return pm
    }
  };

  /**
   * Search marker help us to find positions in the associative array faster.
   *
   * They speed up the process of finding a position without much bookkeeping.
   *
   * A maximum of `maxSearchMarker` objects are created.
   *
   * This function always returns a refreshed marker (updated timestamp)
   *
   * @param {AbstractType<any>} yarray
   * @param {number} index
   */
  const findMarker = (yarray, index) => {
    if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
      return null
    }
    const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
    let p = yarray._start;
    let pindex = 0;
    if (marker !== null) {
      p = marker.p;
      pindex = marker.index;
      refreshMarkerTimestamp(marker); // we used it, we might need to use it again
    }
    // iterate to right if possible
    while (p.right !== null && pindex < index) {
      if (!p.deleted && p.countable) {
        if (index < pindex + p.length) {
          break
        }
        pindex += p.length;
      }
      p = p.right;
    }
    // iterate to left if necessary (might be that pindex > index)
    while (p.left !== null && pindex > index) {
      p = p.left;
      if (!p.deleted && p.countable) {
        pindex -= p.length;
      }
    }
    // we want to make sure that p can't be merged with left, because that would screw up everything
    // in that cas just return what we have (it is most likely the best marker anyway)
    // iterate to left until p can't be merged with left
    while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
      p = p.left;
      if (!p.deleted && p.countable) {
        pindex -= p.length;
      }
    }

    // @todo remove!
    // assure position
    // {
    //   let start = yarray._start
    //   let pos = 0
    //   while (start !== p) {
    //     if (!start.deleted && start.countable) {
    //       pos += start.length
    //     }
    //     start = /** @type {Item} */ (start.right)
    //   }
    //   if (pos !== pindex) {
    //     debugger
    //     throw new Error('Gotcha position fail!')
    //   }
    // }
    // if (marker) {
    //   if (window.lengthes == null) {
    //     window.lengthes = []
    //     window.getLengthes = () => window.lengthes.sort((a, b) => a - b)
    //   }
    //   window.lengthes.push(marker.index - pindex)
    //   console.log('distance', marker.index - pindex, 'len', p && p.parent.length)
    // }
    if (marker !== null && abs(marker.index - pindex) < /** @type {YText|YArray<any>} */ (p.parent).length / maxSearchMarker) {
      // adjust existing marker
      overwriteMarker(marker, p, pindex);
      return marker
    } else {
      // create new marker
      return markPosition(yarray._searchMarker, p, pindex)
    }
  };

  /**
   * Update markers when a change happened.
   *
   * This should be called before doing a deletion!
   *
   * @param {Array<ArraySearchMarker>} searchMarker
   * @param {number} index
   * @param {number} len If insertion, len is positive. If deletion, len is negative.
   */
  const updateMarkerChanges = (searchMarker, index, len) => {
    for (let i = searchMarker.length - 1; i >= 0; i--) {
      const m = searchMarker[i];
      if (len > 0) {
        /**
         * @type {Item|null}
         */
        let p = m.p;
        p.marker = false;
        // Ideally we just want to do a simple position comparison, but this will only work if
        // search markers don't point to deleted items for formats.
        // Iterate marker to prev undeleted countable position so we know what to do when updating a position
        while (p && (p.deleted || !p.countable)) {
          p = p.left;
          if (p && !p.deleted && p.countable) {
            // adjust position. the loop should break now
            m.index -= p.length;
          }
        }
        if (p === null || p.marker === true) {
          // remove search marker if updated position is null or if position is already marked
          searchMarker.splice(i, 1);
          continue
        }
        m.p = p;
        p.marker = true;
      }
      if (index < m.index || (len > 0 && index === m.index)) { // a simple index <= m.index check would actually suffice
        m.index = max(index, m.index + len);
      }
    }
  };

  /**
   * Accumulate all (list) children of a type and return them as an Array.
   *
   * @param {AbstractType<any>} t
   * @return {Array<Item>}
   */
  const getTypeChildren = t => {
    let s = t._start;
    const arr = [];
    while (s) {
      arr.push(s);
      s = s.right;
    }
    return arr
  };

  /**
   * Call event listeners with an event. This will also add an event to all
   * parents (for `.observeDeep` handlers).
   *
   * @template EventType
   * @param {AbstractType<EventType>} type
   * @param {Transaction} transaction
   * @param {EventType} event
   */
  const callTypeObservers = (type, transaction, event) => {
    const changedType = type;
    const changedParentTypes = transaction.changedParentTypes;
    while (true) {
      // @ts-ignore
      setIfUndefined(changedParentTypes, type, () => []).push(event);
      if (type._item === null) {
        break
      }
      type = /** @type {AbstractType<any>} */ (type._item.parent);
    }
    callEventHandlerListeners(changedType._eH, event, transaction);
  };

  /**
   * @template EventType
   * Abstract Yjs Type class
   */
  class AbstractType {
    constructor () {
      /**
       * @type {Item|null}
       */
      this._item = null;
      /**
       * @type {Map<string,Item>}
       */
      this._map = new Map();
      /**
       * @type {Item|null}
       */
      this._start = null;
      /**
       * @type {Doc|null}
       */
      this.doc = null;
      this._length = 0;
      /**
       * Event handlers
       * @type {EventHandler<EventType,Transaction>}
       */
      this._eH = createEventHandler();
      /**
       * Deep event handlers
       * @type {EventHandler<Array<YEvent<any>>,Transaction>}
       */
      this._dEH = createEventHandler();
      /**
       * @type {null | Array<ArraySearchMarker>}
       */
      this._searchMarker = null;
    }

    /**
     * @return {AbstractType<any>|null}
     */
    get parent () {
      return this._item ? /** @type {AbstractType<any>} */ (this._item.parent) : null
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item|null} item
     */
    _integrate (y, item) {
      this.doc = y;
      this._item = item;
    }

    /**
     * @return {AbstractType<EventType>}
     */
    _copy () {
      throw methodUnimplemented()
    }

    /**
     * @return {AbstractType<EventType>}
     */
    clone () {
      throw methodUnimplemented()
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     */
    _write (encoder) { }

    /**
     * The first non-deleted item
     */
    get _first () {
      let n = this._start;
      while (n !== null && n.deleted) {
        n = n.right;
      }
      return n
    }

    /**
     * Creates YEvent and calls all type observers.
     * Must be implemented by each type.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      if (!transaction.local && this._searchMarker) {
        this._searchMarker.length = 0;
      }
    }

    /**
     * Observe all events that are created on this type.
     *
     * @param {function(EventType, Transaction):void} f Observer function
     */
    observe (f) {
      addEventHandlerListener(this._eH, f);
    }

    /**
     * Observe all events that are created by this type and its children.
     *
     * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
     */
    observeDeep (f) {
      addEventHandlerListener(this._dEH, f);
    }

    /**
     * Unregister an observer function.
     *
     * @param {function(EventType,Transaction):void} f Observer function
     */
    unobserve (f) {
      removeEventHandlerListener(this._eH, f);
    }

    /**
     * Unregister an observer function.
     *
     * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
     */
    unobserveDeep (f) {
      removeEventHandlerListener(this._dEH, f);
    }

    /**
     * @abstract
     * @return {any}
     */
    toJSON () {}
  }

  /**
   * @param {AbstractType<any>} type
   * @param {number} start
   * @param {number} end
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListSlice = (type, start, end) => {
    if (start < 0) {
      start = type._length + start;
    }
    if (end < 0) {
      end = type._length + end;
    }
    let len = end - start;
    const cs = [];
    let n = type._start;
    while (n !== null && len > 0) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        if (c.length <= start) {
          start -= c.length;
        } else {
          for (let i = start; i < c.length && len > 0; i++) {
            cs.push(c[i]);
            len--;
          }
          start = 0;
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * @param {AbstractType<any>} type
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListToArray = type => {
    const cs = [];
    let n = type._start;
    while (n !== null) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          cs.push(c[i]);
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * @param {AbstractType<any>} type
   * @param {Snapshot} snapshot
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListToArraySnapshot = (type, snapshot) => {
    const cs = [];
    let n = type._start;
    while (n !== null) {
      if (n.countable && isVisible(n, snapshot)) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          cs.push(c[i]);
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * Executes a provided function on once on overy element of this YArray.
   *
   * @param {AbstractType<any>} type
   * @param {function(any,number,any):void} f A function to execute on every element of this YArray.
   *
   * @private
   * @function
   */
  const typeListForEach = (type, f) => {
    let index = 0;
    let n = type._start;
    while (n !== null) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          f(c[i], index++, type);
        }
      }
      n = n.right;
    }
  };

  /**
   * @template C,R
   * @param {AbstractType<any>} type
   * @param {function(C,number,AbstractType<any>):R} f
   * @return {Array<R>}
   *
   * @private
   * @function
   */
  const typeListMap = (type, f) => {
    /**
     * @type {Array<any>}
     */
    const result = [];
    typeListForEach(type, (c, i) => {
      result.push(f(c, i, type));
    });
    return result
  };

  /**
   * @param {AbstractType<any>} type
   * @return {IterableIterator<any>}
   *
   * @private
   * @function
   */
  const typeListCreateIterator = type => {
    let n = type._start;
    /**
     * @type {Array<any>|null}
     */
    let currentContent = null;
    let currentContentIndex = 0;
    return {
      [Symbol.iterator] () {
        return this
      },
      next: () => {
        // find some content
        if (currentContent === null) {
          while (n !== null && n.deleted) {
            n = n.right;
          }
          // check if we reached the end, no need to check currentContent, because it does not exist
          if (n === null) {
            return {
              done: true,
              value: undefined
            }
          }
          // we found n, so we can set currentContent
          currentContent = n.content.getContent();
          currentContentIndex = 0;
          n = n.right; // we used the content of n, now iterate to next
        }
        const value = currentContent[currentContentIndex++];
        // check if we need to empty currentContent
        if (currentContent.length <= currentContentIndex) {
          currentContent = null;
        }
        return {
          done: false,
          value
        }
      }
    }
  };

  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @return {any}
   *
   * @private
   * @function
   */
  const typeListGet = (type, index) => {
    const marker = findMarker(type, index);
    let n = type._start;
    if (marker !== null) {
      n = marker.p;
      index -= marker.index;
    }
    for (; n !== null; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index < n.length) {
          return n.content.getContent()[index]
        }
        index -= n.length;
      }
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item?} referenceItem
   * @param {Array<Object<string,any>|Array<any>|boolean|number|null|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
    let left = referenceItem;
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    const store = doc.store;
    const right = referenceItem === null ? parent._start : referenceItem.right;
    /**
     * @type {Array<Object|Array<any>|number|null>}
     */
    let jsonContent = [];
    const packJsonContent = () => {
      if (jsonContent.length > 0) {
        left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
        left.integrate(transaction, 0);
        jsonContent = [];
      }
    };
    content.forEach(c => {
      if (c === null) {
        jsonContent.push(c);
      } else {
        switch (c.constructor) {
          case Number:
          case Object:
          case Boolean:
          case Array:
          case String:
            jsonContent.push(c);
            break
          default:
            packJsonContent();
            switch (c.constructor) {
              case Uint8Array:
              case ArrayBuffer:
                left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(/** @type {Uint8Array} */ (c))));
                left.integrate(transaction, 0);
                break
              case Doc:
                left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(/** @type {Doc} */ (c)));
                left.integrate(transaction, 0);
                break
              default:
                if (c instanceof AbstractType) {
                  left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
                  left.integrate(transaction, 0);
                } else {
                  throw new Error('Unexpected content type in insert operation')
                }
            }
        }
      }
    });
    packJsonContent();
  };

  const lengthExceeded = create('Length exceeded!');

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListInsertGenerics = (transaction, parent, index, content) => {
    if (index > parent._length) {
      throw lengthExceeded
    }
    if (index === 0) {
      if (parent._searchMarker) {
        updateMarkerChanges(parent._searchMarker, index, content.length);
      }
      return typeListInsertGenericsAfter(transaction, parent, null, content)
    }
    const startIndex = index;
    const marker = findMarker(parent, index);
    let n = parent._start;
    if (marker !== null) {
      n = marker.p;
      index -= marker.index;
      // we need to iterate one to the left so that the algorithm works
      if (index === 0) {
        // @todo refactor this as it actually doesn't consider formats
        n = n.prev; // important! get the left undeleted item so that we can actually decrease index
        index += (n && n.countable && !n.deleted) ? n.length : 0;
      }
    }
    for (; n !== null; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index <= n.length) {
          if (index < n.length) {
            // insert in-between
            getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
          }
          break
        }
        index -= n.length;
      }
    }
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, startIndex, content.length);
    }
    return typeListInsertGenericsAfter(transaction, parent, n, content)
  };

  /**
   * Pushing content is special as we generally want to push after the last item. So we don't have to update
   * the serach marker.
   *
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListPushGenerics = (transaction, parent, content) => {
    // Use the marker with the highest index and iterate to the right.
    const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
    let n = marker.p;
    if (n) {
      while (n.right) {
        n = n.right;
      }
    }
    return typeListInsertGenericsAfter(transaction, parent, n, content)
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @param {number} length
   *
   * @private
   * @function
   */
  const typeListDelete = (transaction, parent, index, length) => {
    if (length === 0) { return }
    const startIndex = index;
    const startLength = length;
    const marker = findMarker(parent, index);
    let n = parent._start;
    if (marker !== null) {
      n = marker.p;
      index -= marker.index;
    }
    // compute the first item to be deleted
    for (; n !== null && index > 0; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
        }
        index -= n.length;
      }
    }
    // delete all items until done
    while (length > 0 && n !== null) {
      if (!n.deleted) {
        if (length < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length));
        }
        n.delete(transaction);
        length -= n.length;
      }
      n = n.right;
    }
    if (length > 0) {
      throw lengthExceeded
    }
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, startIndex, -startLength + length /* in case we remove the above exception */);
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {string} key
   *
   * @private
   * @function
   */
  const typeMapDelete = (transaction, parent, key) => {
    const c = parent._map.get(key);
    if (c !== undefined) {
      c.delete(transaction);
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @param {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} value
   *
   * @private
   * @function
   */
  const typeMapSet = (transaction, parent, key, value) => {
    const left = parent._map.get(key) || null;
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    let content;
    if (value == null) {
      content = new ContentAny([value]);
    } else {
      switch (value.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          content = new ContentAny([value]);
          break
        case Uint8Array:
          content = new ContentBinary(/** @type {Uint8Array} */ (value));
          break
        case Doc:
          content = new ContentDoc(/** @type {Doc} */ (value));
          break
        default:
          if (value instanceof AbstractType) {
            content = new ContentType(value);
          } else {
            throw new Error('Unexpected content type')
          }
      }
    }
    new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
   *
   * @private
   * @function
   */
  const typeMapGet = (parent, key) => {
    const val = parent._map.get(key);
    return val !== undefined && !val.deleted ? val.content.getContent()[val.length - 1] : undefined
  };

  /**
   * @param {AbstractType<any>} parent
   * @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
   *
   * @private
   * @function
   */
  const typeMapGetAll = (parent) => {
    /**
     * @type {Object<string,any>}
     */
    const res = {};
    parent._map.forEach((value, key) => {
      if (!value.deleted) {
        res[key] = value.content.getContent()[value.length - 1];
      }
    });
    return res
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @return {boolean}
   *
   * @private
   * @function
   */
  const typeMapHas = (parent, key) => {
    const val = parent._map.get(key);
    return val !== undefined && !val.deleted
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @param {Snapshot} snapshot
   * @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
   *
   * @private
   * @function
   */
  const typeMapGetSnapshot = (parent, key, snapshot) => {
    let v = parent._map.get(key) || null;
    while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) {
      v = v.left;
    }
    return v !== null && isVisible(v, snapshot) ? v.content.getContent()[v.length - 1] : undefined
  };

  /**
   * @param {Map<string,Item>} map
   * @return {IterableIterator<Array<any>>}
   *
   * @private
   * @function
   */
  const createMapIterator = map => iteratorFilter(map.entries(), /** @param {any} entry */ entry => !entry[1].deleted);

  /**
   * @module YArray
   */

  /**
   * Event that describes the changes on a YArray
   * @template T
   * @extends YEvent<YArray<T>>
   */
  class YArrayEvent extends YEvent {
    /**
     * @param {YArray<T>} yarray The changed type
     * @param {Transaction} transaction The transaction object
     */
    constructor (yarray, transaction) {
      super(yarray, transaction);
      this._transaction = transaction;
    }
  }

  /**
   * A shared Array implementation.
   * @template T
   * @extends AbstractType<YArrayEvent<T>>
   * @implements {Iterable<T>}
   */
  class YArray extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Array<any>?}
       * @private
       */
      this._prelimContent = [];
      /**
       * @type {Array<ArraySearchMarker>}
       */
      this._searchMarker = [];
    }

    /**
     * Construct a new YArray containing the specified items.
     * @template T
     * @param {Array<T>} items
     * @return {YArray<T>}
     */
    static from (items) {
      const a = new YArray();
      a.push(items);
      return a
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item);
      this.insert(0, /** @type {Array<any>} */ (this._prelimContent));
      this._prelimContent = null;
    }

    _copy () {
      return new YArray()
    }

    /**
     * @return {YArray<T>}
     */
    clone () {
      const arr = new YArray();
      arr.insert(0, this.toArray().map(el =>
        el instanceof AbstractType ? el.clone() : el
      ));
      return arr
    }

    get length () {
      return this._prelimContent === null ? this._length : this._prelimContent.length
    }

    /**
     * Creates YArrayEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      super._callObserver(transaction, parentSubs);
      callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
    }

    /**
     * Inserts new content at an index.
     *
     * Important: This function expects an array of content. Not just a content
     * object. The reason for this "weirdness" is that inserting several elements
     * is very efficient when it is done as a single operation.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  yarray.insert(0, ['a'])
     *  // Insert numbers 1, 2 at position 1
     *  yarray.insert(1, [1, 2])
     *
     * @param {number} index The index to insert content at.
     * @param {Array<T>} content The array of content
     */
    insert (index, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListInsertGenerics(transaction, this, index, content);
        });
      } else {
        /** @type {Array<any>} */ (this._prelimContent).splice(index, 0, ...content);
      }
    }

    /**
     * Appends content to this YArray.
     *
     * @param {Array<T>} content Array of content to append.
     *
     * @todo Use the following implementation in all types.
     */
    push (content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListPushGenerics(transaction, this, content);
        });
      } else {
        /** @type {Array<any>} */ (this._prelimContent).push(...content);
      }
    }

    /**
     * Preppends content to this YArray.
     *
     * @param {Array<T>} content Array of content to preppend.
     */
    unshift (content) {
      this.insert(0, content);
    }

    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} length The number of elements to remove. Defaults to 1.
     */
    delete (index, length = 1) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListDelete(transaction, this, index, length);
        });
      } else {
        /** @type {Array<any>} */ (this._prelimContent).splice(index, length);
      }
    }

    /**
     * Returns the i-th element from a YArray.
     *
     * @param {number} index The index of the element to return from the YArray
     * @return {T}
     */
    get (index) {
      return typeListGet(this, index)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<T>}
     */
    toArray () {
      return typeListToArray(this)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @param {number} [start]
     * @param {number} [end]
     * @return {Array<T>}
     */
    slice (start = 0, end = this.length) {
      return typeListSlice(this, start, end)
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Array<any>}
     */
    toJSON () {
      return this.map(c => c instanceof AbstractType ? c.toJSON() : c)
    }

    /**
     * Returns an Array with the result of calling a provided function on every
     * element of this YArray.
     *
     * @template M
     * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
     * @return {Array<M>} A new array with each element being the result of the
     *                 callback function
     */
    map (f) {
      return typeListMap(this, /** @type {any} */ (f))
    }

    /**
     * Executes a provided function on once on overy element of this YArray.
     *
     * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      typeListForEach(this, f);
    }

    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return typeListCreateIterator(this)
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YArrayRefID);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   *
   * @private
   * @function
   */
  const readYArray = decoder => new YArray();

  /**
   * @template T
   * @extends YEvent<YMap<T>>
   * Event that describes the changes on a YMap.
   */
  class YMapEvent extends YEvent {
    /**
     * @param {YMap<T>} ymap The YArray that changed.
     * @param {Transaction} transaction
     * @param {Set<any>} subs The keys that changed.
     */
    constructor (ymap, transaction, subs) {
      super(ymap, transaction);
      this.keysChanged = subs;
    }
  }

  /**
   * @template MapType
   * A shared Map implementation.
   *
   * @extends AbstractType<YMapEvent<MapType>>
   * @implements {Iterable<MapType>}
   */
  class YMap extends AbstractType {
    /**
     *
     * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
     */
    constructor (entries) {
      super();
      /**
       * @type {Map<string,any>?}
       * @private
       */
      this._prelimContent = null;

      if (entries === undefined) {
        this._prelimContent = new Map();
      } else {
        this._prelimContent = new Map(entries);
      }
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item)
      ;/** @type {Map<string, any>} */ (this._prelimContent).forEach((value, key) => {
        this.set(key, value);
      });
      this._prelimContent = null;
    }

    _copy () {
      return new YMap()
    }

    /**
     * @return {YMap<MapType>}
     */
    clone () {
      const map = new YMap();
      this.forEach((value, key) => {
        map.set(key, value instanceof AbstractType ? value.clone() : value);
      });
      return map
    }

    /**
     * Creates YMapEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Object<string,any>}
     */
    toJSON () {
      /**
       * @type {Object<string,MapType>}
       */
      const map = {};
      this._map.forEach((item, key) => {
        if (!item.deleted) {
          const v = item.content.getContent()[item.length - 1];
          map[key] = v instanceof AbstractType ? v.toJSON() : v;
        }
      });
      return map
    }

    /**
     * Returns the size of the YMap (count of key/value pairs)
     *
     * @return {number}
     */
    get size () {
      return [...createMapIterator(this._map)].length
    }

    /**
     * Returns the keys for each element in the YMap Type.
     *
     * @return {IterableIterator<string>}
     */
    keys () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => v[0])
    }

    /**
     * Returns the values for each element in the YMap Type.
     *
     * @return {IterableIterator<any>}
     */
    values () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => v[1].content.getContent()[v[1].length - 1])
    }

    /**
     * Returns an Iterator of [key, value] pairs
     *
     * @return {IterableIterator<any>}
     */
    entries () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => [v[0], v[1].content.getContent()[v[1].length - 1]])
    }

    /**
     * Executes a provided function on once on every key-value pair.
     *
     * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      /**
       * @type {Object<string,MapType>}
       */
      const map = {};
      this._map.forEach((item, key) => {
        if (!item.deleted) {
          f(item.content.getContent()[item.length - 1], key, this);
        }
      });
      return map
    }

    /**
     * Returns an Iterator of [key, value] pairs
     *
     * @return {IterableIterator<any>}
     */
    [Symbol.iterator] () {
      return this.entries()
    }

    /**
     * Remove a specified element from this YMap.
     *
     * @param {string} key The key of the element to remove.
     */
    delete (key) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, key);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).delete(key);
      }
    }

    /**
     * Adds or updates an element with a specified key and value.
     *
     * @param {string} key The key of the element to add to this YMap
     * @param {MapType} value The value of the element to add
     */
    set (key, value) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, key, value);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).set(key, value);
      }
      return value
    }

    /**
     * Returns a specified element from this YMap.
     *
     * @param {string} key
     * @return {MapType|undefined}
     */
    get (key) {
      return /** @type {any} */ (typeMapGet(this, key))
    }

    /**
     * Returns a boolean indicating whether the specified key exists or not.
     *
     * @param {string} key The key to test.
     * @return {boolean}
     */
    has (key) {
      return typeMapHas(this, key)
    }

    /**
     * Removes all elements from this YMap.
     */
    clear () {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          this.forEach(function (value, key, map) {
            typeMapDelete(transaction, map, key);
          });
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).clear();
      }
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YMapRefID);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   *
   * @private
   * @function
   */
  const readYMap = decoder => new YMap();

  /**
   * @param {any} a
   * @param {any} b
   * @return {boolean}
   */
  const equalAttrs = (a, b) => a === b || (typeof a === 'object' && typeof b === 'object' && a && b && equalFlat(a, b));

  class ItemTextListPosition {
    /**
     * @param {Item|null} left
     * @param {Item|null} right
     * @param {number} index
     * @param {Map<string,any>} currentAttributes
     */
    constructor (left, right, index, currentAttributes) {
      this.left = left;
      this.right = right;
      this.index = index;
      this.currentAttributes = currentAttributes;
    }

    /**
     * Only call this if you know that this.right is defined
     */
    forward () {
      if (this.right === null) {
        unexpectedCase();
      }
      switch (this.right.content.constructor) {
        case ContentFormat:
          if (!this.right.deleted) {
            updateCurrentAttributes(this.currentAttributes, /** @type {ContentFormat} */ (this.right.content));
          }
          break
        default:
          if (!this.right.deleted) {
            this.index += this.right.length;
          }
          break
      }
      this.left = this.right;
      this.right = this.right.right;
    }
  }

  /**
   * @param {Transaction} transaction
   * @param {ItemTextListPosition} pos
   * @param {number} count steps to move forward
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findNextPosition = (transaction, pos, count) => {
    while (pos.right !== null && count > 0) {
      switch (pos.right.content.constructor) {
        case ContentFormat:
          if (!pos.right.deleted) {
            updateCurrentAttributes(pos.currentAttributes, /** @type {ContentFormat} */ (pos.right.content));
          }
          break
        default:
          if (!pos.right.deleted) {
            if (count < pos.right.length) {
              // split right
              getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
            }
            pos.index += pos.right.length;
            count -= pos.right.length;
          }
          break
      }
      pos.left = pos.right;
      pos.right = pos.right.right;
      // pos.forward() - we don't forward because that would halve the performance because we already do the checks above
    }
    return pos
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findPosition = (transaction, parent, index) => {
    const currentAttributes = new Map();
    const marker = findMarker(parent, index);
    if (marker) {
      const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
      return findNextPosition(transaction, pos, index - marker.index)
    } else {
      const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
      return findNextPosition(transaction, pos, index)
    }
  };

  /**
   * Negate applied formats
   *
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {Map<string,any>} negatedAttributes
   *
   * @private
   * @function
   */
  const insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
    // check if we really need to remove attributes
    while (
      currPos.right !== null && (
        currPos.right.deleted === true || (
          currPos.right.content.constructor === ContentFormat &&
          equalAttrs(negatedAttributes.get(/** @type {ContentFormat} */ (currPos.right.content).key), /** @type {ContentFormat} */ (currPos.right.content).value)
        )
      )
    ) {
      if (!currPos.right.deleted) {
        negatedAttributes.delete(/** @type {ContentFormat} */ (currPos.right.content).key);
      }
      currPos.forward();
    }
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    negatedAttributes.forEach((val, key) => {
      const left = currPos.left;
      const right = currPos.right;
      const nextFormat = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
      nextFormat.integrate(transaction, 0);
      currPos.right = nextFormat;
      currPos.forward();
    });
  };

  /**
   * @param {Map<string,any>} currentAttributes
   * @param {ContentFormat} format
   *
   * @private
   * @function
   */
  const updateCurrentAttributes = (currentAttributes, format) => {
    const { key, value } = format;
    if (value === null) {
      currentAttributes.delete(key);
    } else {
      currentAttributes.set(key, value);
    }
  };

  /**
   * @param {ItemTextListPosition} currPos
   * @param {Object<string,any>} attributes
   *
   * @private
   * @function
   */
  const minimizeAttributeChanges = (currPos, attributes) => {
    // go right while attributes[right.key] === right.value (or right is deleted)
    while (true) {
      if (currPos.right === null) {
        break
      } else if (currPos.right.deleted || (currPos.right.content.constructor === ContentFormat && equalAttrs(attributes[(/** @type {ContentFormat} */ (currPos.right.content)).key] || null, /** @type {ContentFormat} */ (currPos.right.content).value))) ; else {
        break
      }
      currPos.forward();
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {Object<string,any>} attributes
   * @return {Map<string,any>}
   *
   * @private
   * @function
   **/
  const insertAttributes = (transaction, parent, currPos, attributes) => {
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    const negatedAttributes = new Map();
    // insert format-start items
    for (const key in attributes) {
      const val = attributes[key];
      const currentVal = currPos.currentAttributes.get(key) || null;
      if (!equalAttrs(currentVal, val)) {
        // save negated attribute (set null if currentVal undefined)
        negatedAttributes.set(key, currentVal);
        const { left, right } = currPos;
        currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
        currPos.right.integrate(transaction, 0);
        currPos.forward();
      }
    }
    return negatedAttributes
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {string|object|AbstractType<any>} text
   * @param {Object<string,any>} attributes
   *
   * @private
   * @function
   **/
  const insertText = (transaction, parent, currPos, text, attributes) => {
    currPos.currentAttributes.forEach((val, key) => {
      if (attributes[key] === undefined) {
        attributes[key] = null;
      }
    });
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    minimizeAttributeChanges(currPos, attributes);
    const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
    // insert content
    const content = text.constructor === String ? new ContentString(/** @type {string} */ (text)) : (text instanceof AbstractType ? new ContentType(text) : new ContentEmbed(text));
    let { left, right, index } = currPos;
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
    }
    right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
    right.integrate(transaction, 0);
    currPos.right = right;
    currPos.index = index;
    currPos.forward();
    insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {number} length
   * @param {Object<string,any>} attributes
   *
   * @private
   * @function
   */
  const formatText = (transaction, parent, currPos, length, attributes) => {
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    minimizeAttributeChanges(currPos, attributes);
    const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
    // iterate until first non-format or null is found
    // delete all formats with attributes[format.key] != null
    // also check the attributes after the first non-format as we do not want to insert redundant negated attributes there
    while (currPos.right !== null && (length > 0 || currPos.right.content.constructor === ContentFormat)) {
      if (!currPos.right.deleted) {
        switch (currPos.right.content.constructor) {
          case ContentFormat: {
            const { key, value } = /** @type {ContentFormat} */ (currPos.right.content);
            const attr = attributes[key];
            if (attr !== undefined) {
              if (equalAttrs(attr, value)) {
                negatedAttributes.delete(key);
              } else {
                negatedAttributes.set(key, value);
              }
              currPos.right.delete(transaction);
            }
            break
          }
          default:
            if (length < currPos.right.length) {
              getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
            }
            length -= currPos.right.length;
            break
        }
      }
      currPos.forward();
    }
    // Quill just assumes that the editor starts with a newline and that it always
    // ends with a newline. We only insert that newline when a new newline is
    // inserted - i.e when length is bigger than type.length
    if (length > 0) {
      let newlines = '';
      for (; length > 0; length--) {
        newlines += '\n';
      }
      currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
      currPos.right.integrate(transaction, 0);
      currPos.forward();
    }
    insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
  };

  /**
   * Call this function after string content has been deleted in order to
   * clean up formatting Items.
   *
   * @param {Transaction} transaction
   * @param {Item} start
   * @param {Item|null} curr exclusive end, automatically iterates to the next Content Item
   * @param {Map<string,any>} startAttributes
   * @param {Map<string,any>} currAttributes
   * @return {number} The amount of formatting Items deleted.
   *
   * @function
   */
  const cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
    let end = curr;
    const endAttributes = copy(currAttributes);
    while (end && (!end.countable || end.deleted)) {
      if (!end.deleted && end.content.constructor === ContentFormat) {
        updateCurrentAttributes(endAttributes, /** @type {ContentFormat} */ (end.content));
      }
      end = end.right;
    }
    let cleanups = 0;
    let reachedEndOfCurr = false;
    while (start !== end) {
      if (curr === start) {
        reachedEndOfCurr = true;
      }
      if (!start.deleted) {
        const content = start.content;
        switch (content.constructor) {
          case ContentFormat: {
            const { key, value } = /** @type {ContentFormat} */ (content);
            if ((endAttributes.get(key) || null) !== value || (startAttributes.get(key) || null) === value) {
              // Either this format is overwritten or it is not necessary because the attribute already existed.
              start.delete(transaction);
              cleanups++;
              if (!reachedEndOfCurr && (currAttributes.get(key) || null) === value && (startAttributes.get(key) || null) !== value) {
                currAttributes.delete(key);
              }
            }
            break
          }
        }
      }
      start = /** @type {Item} */ (start.right);
    }
    return cleanups
  };

  /**
   * @param {Transaction} transaction
   * @param {Item | null} item
   */
  const cleanupContextlessFormattingGap = (transaction, item) => {
    // iterate until item.right is null or content
    while (item && item.right && (item.right.deleted || !item.right.countable)) {
      item = item.right;
    }
    const attrs = new Set();
    // iterate back until a content item is found
    while (item && (item.deleted || !item.countable)) {
      if (!item.deleted && item.content.constructor === ContentFormat) {
        const key = /** @type {ContentFormat} */ (item.content).key;
        if (attrs.has(key)) {
          item.delete(transaction);
        } else {
          attrs.add(key);
        }
      }
      item = item.left;
    }
  };

  /**
   * This function is experimental and subject to change / be removed.
   *
   * Ideally, we don't need this function at all. Formatting attributes should be cleaned up
   * automatically after each change. This function iterates twice over the complete YText type
   * and removes unnecessary formatting attributes. This is also helpful for testing.
   *
   * This function won't be exported anymore as soon as there is confidence that the YText type works as intended.
   *
   * @param {YText} type
   * @return {number} How many formatting attributes have been cleaned up.
   */
  const cleanupYTextFormatting = type => {
    let res = 0;
    transact(/** @type {Doc} */ (type.doc), transaction => {
      let start = /** @type {Item} */ (type._start);
      let end = type._start;
      let startAttributes = create$6();
      const currentAttributes = copy(startAttributes);
      while (end) {
        if (end.deleted === false) {
          switch (end.content.constructor) {
            case ContentFormat:
              updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (end.content));
              break
            default:
              res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
              startAttributes = copy(currentAttributes);
              start = end;
              break
          }
        }
        end = end.right;
      }
    });
    return res
  };

  /**
   * @param {Transaction} transaction
   * @param {ItemTextListPosition} currPos
   * @param {number} length
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const deleteText = (transaction, currPos, length) => {
    const startLength = length;
    const startAttrs = copy(currPos.currentAttributes);
    const start = currPos.right;
    while (length > 0 && currPos.right !== null) {
      if (currPos.right.deleted === false) {
        switch (currPos.right.content.constructor) {
          case ContentType:
          case ContentEmbed:
          case ContentString:
            if (length < currPos.right.length) {
              getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
            }
            length -= currPos.right.length;
            currPos.right.delete(transaction);
            break
        }
      }
      currPos.forward();
    }
    if (start) {
      cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
    }
    const parent = /** @type {AbstractType<any>} */ (/** @type {Item} */ (currPos.left || currPos.right).parent);
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length);
    }
    return currPos
  };

  /**
   * The Quill Delta format represents changes on a text document with
   * formatting information. For mor information visit {@link https://quilljs.com/docs/delta/|Quill Delta}
   *
   * @example
   *   {
   *     ops: [
   *       { insert: 'Gandalf', attributes: { bold: true } },
   *       { insert: ' the ' },
   *       { insert: 'Grey', attributes: { color: '#cccccc' } }
   *     ]
   *   }
   *
   */

  /**
    * Attributes that can be assigned to a selection of text.
    *
    * @example
    *   {
    *     bold: true,
    *     font-size: '40px'
    *   }
    *
    * @typedef {Object} TextAttributes
    */

  /**
   * @extends YEvent<YText>
   * Event that describes the changes on a YText type.
   */
  class YTextEvent extends YEvent {
    /**
     * @param {YText} ytext
     * @param {Transaction} transaction
     * @param {Set<any>} subs The keys that changed
     */
    constructor (ytext, transaction, subs) {
      super(ytext, transaction);
      /**
       * Whether the children changed.
       * @type {Boolean}
       * @private
       */
      this.childListChanged = false;
      /**
       * Set of all changed attributes.
       * @type {Set<string>}
       */
      this.keysChanged = new Set();
      subs.forEach((sub) => {
        if (sub === null) {
          this.childListChanged = true;
        } else {
          this.keysChanged.add(sub);
        }
      });
    }

    /**
     * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
     */
    get changes () {
      if (this._changes === null) {
        /**
         * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string|AbstractType<any>|object, delete?:number, retain?:number}>}}
         */
        const changes = {
          keys: this.keys,
          delta: this.delta,
          added: new Set(),
          deleted: new Set()
        };
        this._changes = changes;
      }
      return /** @type {any} */ (this._changes)
    }

    /**
     * Compute the changes in the delta format.
     * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
     *
     * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
     *
     * @public
     */
    get delta () {
      if (this._delta === null) {
        const y = /** @type {Doc} */ (this.target.doc);
        /**
         * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
         */
        const delta = [];
        transact(y, transaction => {
          const currentAttributes = new Map(); // saves all current attributes for insert
          const oldAttributes = new Map();
          let item = this.target._start;
          /**
           * @type {string?}
           */
          let action = null;
          /**
           * @type {Object<string,any>}
           */
          const attributes = {}; // counts added or removed new attributes for retain
          /**
           * @type {string|object}
           */
          let insert = '';
          let retain = 0;
          let deleteLen = 0;
          const addOp = () => {
            if (action !== null) {
              /**
               * @type {any}
               */
              let op;
              switch (action) {
                case 'delete':
                  op = { delete: deleteLen };
                  deleteLen = 0;
                  break
                case 'insert':
                  op = { insert };
                  if (currentAttributes.size > 0) {
                    op.attributes = {};
                    currentAttributes.forEach((value, key) => {
                      if (value !== null) {
                        op.attributes[key] = value;
                      }
                    });
                  }
                  insert = '';
                  break
                case 'retain':
                  op = { retain };
                  if (Object.keys(attributes).length > 0) {
                    op.attributes = {};
                    for (const key in attributes) {
                      op.attributes[key] = attributes[key];
                    }
                  }
                  retain = 0;
                  break
              }
              delta.push(op);
              action = null;
            }
          };
          while (item !== null) {
            switch (item.content.constructor) {
              case ContentType:
              case ContentEmbed:
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    addOp();
                    action = 'insert';
                    insert = item.content.getContent()[0];
                    addOp();
                  }
                } else if (this.deletes(item)) {
                  if (action !== 'delete') {
                    addOp();
                    action = 'delete';
                  }
                  deleteLen += 1;
                } else if (!item.deleted) {
                  if (action !== 'retain') {
                    addOp();
                    action = 'retain';
                  }
                  retain += 1;
                }
                break
              case ContentString:
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    if (action !== 'insert') {
                      addOp();
                      action = 'insert';
                    }
                    insert += /** @type {ContentString} */ (item.content).str;
                  }
                } else if (this.deletes(item)) {
                  if (action !== 'delete') {
                    addOp();
                    action = 'delete';
                  }
                  deleteLen += item.length;
                } else if (!item.deleted) {
                  if (action !== 'retain') {
                    addOp();
                    action = 'retain';
                  }
                  retain += item.length;
                }
                break
              case ContentFormat: {
                const { key, value } = /** @type {ContentFormat} */ (item.content);
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    const curVal = currentAttributes.get(key) || null;
                    if (!equalAttrs(curVal, value)) {
                      if (action === 'retain') {
                        addOp();
                      }
                      if (equalAttrs(value, (oldAttributes.get(key) || null))) {
                        delete attributes[key];
                      } else {
                        attributes[key] = value;
                      }
                    } else if (value !== null) {
                      item.delete(transaction);
                    }
                  }
                } else if (this.deletes(item)) {
                  oldAttributes.set(key, value);
                  const curVal = currentAttributes.get(key) || null;
                  if (!equalAttrs(curVal, value)) {
                    if (action === 'retain') {
                      addOp();
                    }
                    attributes[key] = curVal;
                  }
                } else if (!item.deleted) {
                  oldAttributes.set(key, value);
                  const attr = attributes[key];
                  if (attr !== undefined) {
                    if (!equalAttrs(attr, value)) {
                      if (action === 'retain') {
                        addOp();
                      }
                      if (value === null) {
                        delete attributes[key];
                      } else {
                        attributes[key] = value;
                      }
                    } else if (attr !== null) { // this will be cleaned up automatically by the contextless cleanup function
                      item.delete(transaction);
                    }
                  }
                }
                if (!item.deleted) {
                  if (action === 'insert') {
                    addOp();
                  }
                  updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (item.content));
                }
                break
              }
            }
            item = item.right;
          }
          addOp();
          while (delta.length > 0) {
            const lastOp = delta[delta.length - 1];
            if (lastOp.retain !== undefined && lastOp.attributes === undefined) {
              // retain delta's if they don't assign attributes
              delta.pop();
            } else {
              break
            }
          }
        });
        this._delta = delta;
      }
      return /** @type {any} */ (this._delta)
    }
  }

  /**
   * Type that represents text with formatting information.
   *
   * This type replaces y-richtext as this implementation is able to handle
   * block formats (format information on a paragraph), embeds (complex elements
   * like pictures and videos), and text formats (**bold**, *italic*).
   *
   * @extends AbstractType<YTextEvent>
   */
  class YText extends AbstractType {
    /**
     * @param {String} [string] The initial value of the YText.
     */
    constructor (string) {
      super();
      /**
       * Array of pending operations on this type
       * @type {Array<function():void>?}
       */
      this._pending = string !== undefined ? [() => this.insert(0, string)] : [];
      /**
       * @type {Array<ArraySearchMarker>}
       */
      this._searchMarker = [];
    }

    /**
     * Number of characters of this text type.
     *
     * @type {number}
     */
    get length () {
      return this._length
    }

    /**
     * @param {Doc} y
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item);
      try {
        /** @type {Array<function>} */ (this._pending).forEach(f => f());
      } catch (e) {
        console.error(e);
      }
      this._pending = null;
    }

    _copy () {
      return new YText()
    }

    /**
     * @return {YText}
     */
    clone () {
      const text = new YText();
      text.applyDelta(this.toDelta());
      return text
    }

    /**
     * Creates YTextEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      super._callObserver(transaction, parentSubs);
      const event = new YTextEvent(this, transaction, parentSubs);
      const doc = transaction.doc;
      callTypeObservers(this, transaction, event);
      // If a remote change happened, we try to cleanup potential formatting duplicates.
      if (!transaction.local) {
        // check if another formatting item was inserted
        let foundFormattingItem = false;
        for (const [client, afterClock] of transaction.afterState.entries()) {
          const clock = transaction.beforeState.get(client) || 0;
          if (afterClock === clock) {
            continue
          }
          iterateStructs(transaction, /** @type {Array<Item|GC>} */ (doc.store.clients.get(client)), clock, afterClock, item => {
            if (!item.deleted && /** @type {Item} */ (item).content.constructor === ContentFormat) {
              foundFormattingItem = true;
            }
          });
          if (foundFormattingItem) {
            break
          }
        }
        if (!foundFormattingItem) {
          iterateDeletedStructs(transaction, transaction.deleteSet, item => {
            if (item instanceof GC || foundFormattingItem) {
              return
            }
            if (item.parent === this && item.content.constructor === ContentFormat) {
              foundFormattingItem = true;
            }
          });
        }
        transact(doc, (t) => {
          if (foundFormattingItem) {
            // If a formatting item was inserted, we simply clean the whole type.
            // We need to compute currentAttributes for the current position anyway.
            cleanupYTextFormatting(this);
          } else {
            // If no formatting attribute was inserted, we can make due with contextless
            // formatting cleanups.
            // Contextless: it is not necessary to compute currentAttributes for the affected position.
            iterateDeletedStructs(t, t.deleteSet, item => {
              if (item instanceof GC) {
                return
              }
              if (item.parent === this) {
                cleanupContextlessFormattingGap(t, item);
              }
            });
          }
        });
      }
    }

    /**
     * Returns the unformatted string representation of this YText type.
     *
     * @public
     */
    toString () {
      let str = '';
      /**
       * @type {Item|null}
       */
      let n = this._start;
      while (n !== null) {
        if (!n.deleted && n.countable && n.content.constructor === ContentString) {
          str += /** @type {ContentString} */ (n.content).str;
        }
        n = n.right;
      }
      return str
    }

    /**
     * Returns the unformatted string representation of this YText type.
     *
     * @return {string}
     * @public
     */
    toJSON () {
      return this.toString()
    }

    /**
     * Apply a {@link Delta} on this shared YText type.
     *
     * @param {any} delta The changes to apply on this element.
     * @param {object}  [opts]
     * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
     *
     *
     * @public
     */
    applyDelta (delta, { sanitize = true } = {}) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          const currPos = new ItemTextListPosition(null, this._start, 0, new Map());
          for (let i = 0; i < delta.length; i++) {
            const op = delta[i];
            if (op.insert !== undefined) {
              // Quill assumes that the content starts with an empty paragraph.
              // Yjs/Y.Text assumes that it starts empty. We always hide that
              // there is a newline at the end of the content.
              // If we omit this step, clients will see a different number of
              // paragraphs, but nothing bad will happen.
              const ins = (!sanitize && typeof op.insert === 'string' && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === '\n') ? op.insert.slice(0, -1) : op.insert;
              if (typeof ins !== 'string' || ins.length > 0) {
                insertText(transaction, this, currPos, ins, op.attributes || {});
              }
            } else if (op.retain !== undefined) {
              formatText(transaction, this, currPos, op.retain, op.attributes || {});
            } else if (op.delete !== undefined) {
              deleteText(transaction, currPos, op.delete);
            }
          }
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.applyDelta(delta));
      }
    }

    /**
     * Returns the Delta representation of this YText type.
     *
     * @param {Snapshot} [snapshot]
     * @param {Snapshot} [prevSnapshot]
     * @param {function('removed' | 'added', ID):any} [computeYChange]
     * @return {any} The Delta representation of this type.
     *
     * @public
     */
    toDelta (snapshot, prevSnapshot, computeYChange) {
      /**
       * @type{Array<any>}
       */
      const ops = [];
      const currentAttributes = new Map();
      const doc = /** @type {Doc} */ (this.doc);
      let str = '';
      let n = this._start;
      function packStr () {
        if (str.length > 0) {
          // pack str with attributes to ops
          /**
           * @type {Object<string,any>}
           */
          const attributes = {};
          let addAttributes = false;
          currentAttributes.forEach((value, key) => {
            addAttributes = true;
            attributes[key] = value;
          });
          /**
           * @type {Object<string,any>}
           */
          const op = { insert: str };
          if (addAttributes) {
            op.attributes = attributes;
          }
          ops.push(op);
          str = '';
        }
      }
      // snapshots are merged again after the transaction, so we need to keep the
      // transalive until we are done
      transact(doc, transaction => {
        if (snapshot) {
          splitSnapshotAffectedStructs(transaction, snapshot);
        }
        if (prevSnapshot) {
          splitSnapshotAffectedStructs(transaction, prevSnapshot);
        }
        while (n !== null) {
          if (isVisible(n, snapshot) || (prevSnapshot !== undefined && isVisible(n, prevSnapshot))) {
            switch (n.content.constructor) {
              case ContentString: {
                const cur = currentAttributes.get('ychange');
                if (snapshot !== undefined && !isVisible(n, snapshot)) {
                  if (cur === undefined || cur.user !== n.id.client || cur.state !== 'removed') {
                    packStr();
                    currentAttributes.set('ychange', computeYChange ? computeYChange('removed', n.id) : { type: 'removed' });
                  }
                } else if (prevSnapshot !== undefined && !isVisible(n, prevSnapshot)) {
                  if (cur === undefined || cur.user !== n.id.client || cur.state !== 'added') {
                    packStr();
                    currentAttributes.set('ychange', computeYChange ? computeYChange('added', n.id) : { type: 'added' });
                  }
                } else if (cur !== undefined) {
                  packStr();
                  currentAttributes.delete('ychange');
                }
                str += /** @type {ContentString} */ (n.content).str;
                break
              }
              case ContentType:
              case ContentEmbed: {
                packStr();
                /**
                 * @type {Object<string,any>}
                 */
                const op = {
                  insert: n.content.getContent()[0]
                };
                if (currentAttributes.size > 0) {
                  const attrs = /** @type {Object<string,any>} */ ({});
                  op.attributes = attrs;
                  currentAttributes.forEach((value, key) => {
                    attrs[key] = value;
                  });
                }
                ops.push(op);
                break
              }
              case ContentFormat:
                if (isVisible(n, snapshot)) {
                  packStr();
                  updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (n.content));
                }
                break
            }
          }
          n = n.right;
        }
        packStr();
      }, splitSnapshotAffectedStructs);
      return ops
    }

    /**
     * Insert text at a given index.
     *
     * @param {number} index The index at which to start inserting.
     * @param {String} text The text to insert at the specified position.
     * @param {TextAttributes} [attributes] Optionally define some formatting
     *                                    information to apply on the inserted
     *                                    Text.
     * @public
     */
    insert (index, text, attributes) {
      if (text.length <= 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const pos = findPosition(transaction, this, index);
          if (!attributes) {
            attributes = {};
            // @ts-ignore
            pos.currentAttributes.forEach((v, k) => { attributes[k] = v; });
          }
          insertText(transaction, this, pos, text, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.insert(index, text, attributes));
      }
    }

    /**
     * Inserts an embed at a index.
     *
     * @param {number} index The index to insert the embed at.
     * @param {Object | AbstractType<any>} embed The Object that represents the embed.
     * @param {TextAttributes} attributes Attribute information to apply on the
     *                                    embed
     *
     * @public
     */
    insertEmbed (index, embed, attributes = {}) {
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const pos = findPosition(transaction, this, index);
          insertText(transaction, this, pos, embed, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.insertEmbed(index, embed, attributes));
      }
    }

    /**
     * Deletes text starting from an index.
     *
     * @param {number} index Index at which to start deleting.
     * @param {number} length The number of characters to remove. Defaults to 1.
     *
     * @public
     */
    delete (index, length) {
      if (length === 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          deleteText(transaction, findPosition(transaction, this, index), length);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.delete(index, length));
      }
    }

    /**
     * Assigns properties to a range of text.
     *
     * @param {number} index The position where to start formatting.
     * @param {number} length The amount of characters to assign properties to.
     * @param {TextAttributes} attributes Attribute information to apply on the
     *                                    text.
     *
     * @public
     */
    format (index, length, attributes) {
      if (length === 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const pos = findPosition(transaction, this, index);
          if (pos.right === null) {
            return
          }
          formatText(transaction, this, pos, length, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.format(index, length, attributes));
      }
    }

    /**
     * Removes an attribute.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {String} attributeName The attribute name that is to be removed.
     *
     * @public
     */
    removeAttribute (attributeName) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, attributeName);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.removeAttribute(attributeName));
      }
    }

    /**
     * Sets or updates an attribute.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {String} attributeName The attribute name that is to be set.
     * @param {any} attributeValue The attribute value that is to be set.
     *
     * @public
     */
    setAttribute (attributeName, attributeValue) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, attributeName, attributeValue);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.setAttribute(attributeName, attributeValue));
      }
    }

    /**
     * Returns an attribute value that belongs to the attribute name.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {String} attributeName The attribute name that identifies the
     *                               queried value.
     * @return {any} The queried attribute value.
     *
     * @public
     */
    getAttribute (attributeName) {
      return /** @type {any} */ (typeMapGet(this, attributeName))
    }

    /**
     * Returns all attribute name/value pairs in a JSON Object.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {Snapshot} [snapshot]
     * @return {Object<string, any>} A JSON Object that describes the attributes.
     *
     * @public
     */
    getAttributes (snapshot) {
      return typeMapGetAll(this)
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YTextRefID);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YText}
   *
   * @private
   * @function
   */
  const readYText = decoder => new YText();

  /**
   * @module YXml
   */

  /**
   * Define the elements to which a set of CSS queries apply.
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors|CSS_Selectors}
   *
   * @example
   *   query = '.classSelector'
   *   query = 'nodeSelector'
   *   query = '#idSelector'
   *
   * @typedef {string} CSS_Selector
   */

  /**
   * Dom filter function.
   *
   * @callback domFilter
   * @param {string} nodeName The nodeName of the element
   * @param {Map} attributes The map of attributes.
   * @return {boolean} Whether to include the Dom node in the YXmlElement.
   */

  /**
   * Represents a subset of the nodes of a YXmlElement / YXmlFragment and a
   * position within them.
   *
   * Can be created with {@link YXmlFragment#createTreeWalker}
   *
   * @public
   * @implements {Iterable<YXmlElement|YXmlText|YXmlElement|YXmlHook>}
   */
  class YXmlTreeWalker {
    /**
     * @param {YXmlFragment | YXmlElement} root
     * @param {function(AbstractType<any>):boolean} [f]
     */
    constructor (root, f = () => true) {
      this._filter = f;
      this._root = root;
      /**
       * @type {Item}
       */
      this._currentNode = /** @type {Item} */ (root._start);
      this._firstCall = true;
    }

    [Symbol.iterator] () {
      return this
    }

    /**
     * Get the next node.
     *
     * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
     *
     * @public
     */
    next () {
      /**
       * @type {Item|null}
       */
      let n = this._currentNode;
      let type = n && n.content && /** @type {any} */ (n.content).type;
      if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) { // if first call, we check if we can use the first item
        do {
          type = /** @type {any} */ (n.content).type;
          if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
            // walk down in the tree
            n = type._start;
          } else {
            // walk right or up in the tree
            while (n !== null) {
              if (n.right !== null) {
                n = n.right;
                break
              } else if (n.parent === this._root) {
                n = null;
              } else {
                n = /** @type {AbstractType<any>} */ (n.parent)._item;
              }
            }
          }
        } while (n !== null && (n.deleted || !this._filter(/** @type {ContentType} */ (n.content).type)))
      }
      this._firstCall = false;
      if (n === null) {
        // @ts-ignore
        return { value: undefined, done: true }
      }
      this._currentNode = n;
      return { value: /** @type {any} */ (n.content).type, done: false }
    }
  }

  /**
   * Represents a list of {@link YXmlElement}.and {@link YXmlText} types.
   * A YxmlFragment is similar to a {@link YXmlElement}, but it does not have a
   * nodeName and it does not have attributes. Though it can be bound to a DOM
   * element - in this case the attributes and the nodeName are not shared.
   *
   * @public
   * @extends AbstractType<YXmlEvent>
   */
  class YXmlFragment extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Array<any>|null}
       */
      this._prelimContent = [];
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get firstChild () {
      const first = this._first;
      return first ? first.content.getContent()[0] : null
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item);
      this.insert(0, /** @type {Array<any>} */ (this._prelimContent));
      this._prelimContent = null;
    }

    _copy () {
      return new YXmlFragment()
    }

    /**
     * @return {YXmlFragment}
     */
    clone () {
      const el = new YXmlFragment();
      // @ts-ignore
      el.insert(0, this.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
      return el
    }

    get length () {
      return this._prelimContent === null ? this._length : this._prelimContent.length
    }

    /**
     * Create a subtree of childNodes.
     *
     * @example
     * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
     * for (let node in walker) {
     *   // `node` is a div node
     *   nop(node)
     * }
     *
     * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
     *                          returns a Boolean indicating whether the child
     *                          is to be included in the subtree.
     * @return {YXmlTreeWalker} A subtree and a position within it.
     *
     * @public
     */
    createTreeWalker (filter) {
      return new YXmlTreeWalker(this, filter)
    }

    /**
     * Returns the first YXmlElement that matches the query.
     * Similar to DOM's {@link querySelector}.
     *
     * Query support:
     *   - tagname
     * TODO:
     *   - id
     *   - attribute
     *
     * @param {CSS_Selector} query The query on the children.
     * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
     *
     * @public
     */
    querySelector (query) {
      query = query.toUpperCase();
      // @ts-ignore
      const iterator = new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query);
      const next = iterator.next();
      if (next.done) {
        return null
      } else {
        return next.value
      }
    }

    /**
     * Returns all YXmlElements that match the query.
     * Similar to Dom's {@link querySelectorAll}.
     *
     * @todo Does not yet support all queries. Currently only query by tagName.
     *
     * @param {CSS_Selector} query The query on the children
     * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
     *
     * @public
     */
    querySelectorAll (query) {
      query = query.toUpperCase();
      // @ts-ignore
      return Array.from(new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query))
    }

    /**
     * Creates YXmlEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
    }

    /**
     * Get the string representation of all the children of this YXmlFragment.
     *
     * @return {string} The string representation of all children.
     */
    toString () {
      return typeListMap(this, xml => xml.toString()).join('')
    }

    /**
     * @return {string}
     */
    toJSON () {
      return this.toString()
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const fragment = _document.createDocumentFragment();
      if (binding !== undefined) {
        binding._createAssociation(fragment, this);
      }
      typeListForEach(this, xmlType => {
        fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
      });
      return fragment
    }

    /**
     * Inserts new content at an index.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  xml.insert(0, [new Y.XmlText('text')])
     *
     * @param {number} index The index to insert content at
     * @param {Array<YXmlElement|YXmlText>} content The array of content
     */
    insert (index, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListInsertGenerics(transaction, this, index, content);
        });
      } else {
        // @ts-ignore _prelimContent is defined because this is not yet integrated
        this._prelimContent.splice(index, 0, ...content);
      }
    }

    /**
     * Inserts new content at an index.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  xml.insert(0, [new Y.XmlText('text')])
     *
     * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
     * @param {Array<YXmlElement|YXmlText>} content The array of content
     */
    insertAfter (ref, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          const refItem = (ref && ref instanceof AbstractType) ? ref._item : ref;
          typeListInsertGenericsAfter(transaction, this, refItem, content);
        });
      } else {
        const pc = /** @type {Array<any>} */ (this._prelimContent);
        const index = ref === null ? 0 : pc.findIndex(el => el === ref) + 1;
        if (index === 0 && ref !== null) {
          throw create('Reference item not found')
        }
        pc.splice(index, 0, ...content);
      }
    }

    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} [length=1] The number of elements to remove. Defaults to 1.
     */
    delete (index, length = 1) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListDelete(transaction, this, index, length);
        });
      } else {
        // @ts-ignore _prelimContent is defined because this is not yet integrated
        this._prelimContent.splice(index, length);
      }
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<YXmlElement|YXmlText|YXmlHook>}
     */
    toArray () {
      return typeListToArray(this)
    }

    /**
     * Appends content to this YArray.
     *
     * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
     */
    push (content) {
      this.insert(this.length, content);
    }

    /**
     * Preppends content to this YArray.
     *
     * @param {Array<YXmlElement|YXmlText>} content Array of content to preppend.
     */
    unshift (content) {
      this.insert(0, content);
    }

    /**
     * Returns the i-th element from a YArray.
     *
     * @param {number} index The index of the element to return from the YArray
     * @return {YXmlElement|YXmlText}
     */
    get (index) {
      return typeListGet(this, index)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @param {number} [start]
     * @param {number} [end]
     * @return {Array<YXmlElement|YXmlText>}
     */
    slice (start = 0, end = this.length) {
      return typeListSlice(this, start, end)
    }

    /**
     * Executes a provided function on once on overy child element.
     *
     * @param {function(YXmlElement|YXmlText,number, typeof this):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      typeListForEach(this, f);
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlFragmentRefID);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlFragment}
   *
   * @private
   * @function
   */
  const readYXmlFragment = decoder => new YXmlFragment();

  /**
   * An YXmlElement imitates the behavior of a
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}.
   *
   * * An YXmlElement has attributes (key value pairs)
   * * An YXmlElement has childElements that must inherit from YXmlElement
   */
  class YXmlElement extends YXmlFragment {
    constructor (nodeName = 'UNDEFINED') {
      super();
      this.nodeName = nodeName;
      /**
       * @type {Map<string, any>|null}
       */
      this._prelimAttrs = new Map();
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get nextSibling () {
      const n = this._item ? this._item.next : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get prevSibling () {
      const n = this._item ? this._item.prev : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item)
      ;(/** @type {Map<string, any>} */ (this._prelimAttrs)).forEach((value, key) => {
        this.setAttribute(key, value);
      });
      this._prelimAttrs = null;
    }

    /**
     * Creates an Item with the same effect as this Item (without position effect)
     *
     * @return {YXmlElement}
     */
    _copy () {
      return new YXmlElement(this.nodeName)
    }

    /**
     * @return {YXmlElement}
     */
    clone () {
      const el = new YXmlElement(this.nodeName);
      const attrs = this.getAttributes();
      for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
      // @ts-ignore
      el.insert(0, this.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
      return el
    }

    /**
     * Returns the XML serialization of this YXmlElement.
     * The attributes are ordered by attribute-name, so you can easily use this
     * method to compare YXmlElements
     *
     * @return {string} The string representation of this type.
     *
     * @public
     */
    toString () {
      const attrs = this.getAttributes();
      const stringBuilder = [];
      const keys = [];
      for (const key in attrs) {
        keys.push(key);
      }
      keys.sort();
      const keysLen = keys.length;
      for (let i = 0; i < keysLen; i++) {
        const key = keys[i];
        stringBuilder.push(key + '="' + attrs[key] + '"');
      }
      const nodeName = this.nodeName.toLocaleLowerCase();
      const attrsString = stringBuilder.length > 0 ? ' ' + stringBuilder.join(' ') : '';
      return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`
    }

    /**
     * Removes an attribute from this YXmlElement.
     *
     * @param {String} attributeName The attribute name that is to be removed.
     *
     * @public
     */
    removeAttribute (attributeName) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, attributeName);
        });
      } else {
        /** @type {Map<string,any>} */ (this._prelimAttrs).delete(attributeName);
      }
    }

    /**
     * Sets or updates an attribute.
     *
     * @param {String} attributeName The attribute name that is to be set.
     * @param {String} attributeValue The attribute value that is to be set.
     *
     * @public
     */
    setAttribute (attributeName, attributeValue) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, attributeName, attributeValue);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimAttrs).set(attributeName, attributeValue);
      }
    }

    /**
     * Returns an attribute value that belongs to the attribute name.
     *
     * @param {String} attributeName The attribute name that identifies the
     *                               queried value.
     * @return {String} The queried attribute value.
     *
     * @public
     */
    getAttribute (attributeName) {
      return /** @type {any} */ (typeMapGet(this, attributeName))
    }

    /**
     * Returns whether an attribute exists
     *
     * @param {String} attributeName The attribute name to check for existence.
     * @return {boolean} whether the attribute exists.
     *
     * @public
     */
    hasAttribute (attributeName) {
      return /** @type {any} */ (typeMapHas(this, attributeName))
    }

    /**
     * Returns all attribute name/value pairs in a JSON Object.
     *
     * @param {Snapshot} [snapshot]
     * @return {Object<string, any>} A JSON Object that describes the attributes.
     *
     * @public
     */
    getAttributes (snapshot) {
      return typeMapGetAll(this)
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const dom = _document.createElement(this.nodeName);
      const attrs = this.getAttributes();
      for (const key in attrs) {
        dom.setAttribute(key, attrs[key]);
      }
      typeListForEach(this, yxml => {
        dom.appendChild(yxml.toDOM(_document, hooks, binding));
      });
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlElementRefID);
      encoder.writeKey(this.nodeName);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlElement}
   *
   * @function
   */
  const readYXmlElement = decoder => new YXmlElement(decoder.readKey());

  /**
   * @extends YEvent<YXmlElement|YXmlText|YXmlFragment>
   * An Event that describes changes on a YXml Element or Yxml Fragment
   */
  class YXmlEvent extends YEvent {
    /**
     * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
     * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
     *                   child list changed.
     * @param {Transaction} transaction The transaction instance with wich the
     *                                  change was created.
     */
    constructor (target, subs, transaction) {
      super(target, transaction);
      /**
       * Whether the children changed.
       * @type {Boolean}
       * @private
       */
      this.childListChanged = false;
      /**
       * Set of all changed attributes.
       * @type {Set<string>}
       */
      this.attributesChanged = new Set();
      subs.forEach((sub) => {
        if (sub === null) {
          this.childListChanged = true;
        } else {
          this.attributesChanged.add(sub);
        }
      });
    }
  }

  /**
   * You can manage binding to a custom type with YXmlHook.
   *
   * @extends {YMap<any>}
   */
  class YXmlHook extends YMap {
    /**
     * @param {string} hookName nodeName of the Dom Node.
     */
    constructor (hookName) {
      super();
      /**
       * @type {string}
       */
      this.hookName = hookName;
    }

    /**
     * Creates an Item with the same effect as this Item (without position effect)
     */
    _copy () {
      return new YXmlHook(this.hookName)
    }

    /**
     * @return {YXmlHook}
     */
    clone () {
      const el = new YXmlHook(this.hookName);
      this.forEach((value, key) => {
        el.set(key, value);
      });
      return el
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type
     * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const hook = hooks[this.hookName];
      let dom;
      if (hook !== undefined) {
        dom = hook.createDom(this);
      } else {
        dom = document.createElement(this.hookName);
      }
      dom.setAttribute('data-yjs-hook', this.hookName);
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlHookRefID);
      encoder.writeKey(this.hookName);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlHook}
   *
   * @private
   * @function
   */
  const readYXmlHook = decoder =>
    new YXmlHook(decoder.readKey());

  /**
   * Represents text in a Dom Element. In the future this type will also handle
   * simple formatting information like bold and italic.
   */
  class YXmlText extends YText {
    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get nextSibling () {
      const n = this._item ? this._item.next : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get prevSibling () {
      const n = this._item ? this._item.prev : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    _copy () {
      return new YXmlText()
    }

    /**
     * @return {YXmlText}
     */
    clone () {
      const text = new YXmlText();
      text.applyDelta(this.toDelta());
      return text
    }

    /**
     * Creates a Dom Element that mirrors this YXmlText.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks, binding) {
      const dom = _document.createTextNode(this.toString());
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    toString () {
      // @ts-ignore
      return this.toDelta().map(delta => {
        const nestedNodes = [];
        for (const nodeName in delta.attributes) {
          const attrs = [];
          for (const key in delta.attributes[nodeName]) {
            attrs.push({ key, value: delta.attributes[nodeName][key] });
          }
          // sort attributes to get a unique order
          attrs.sort((a, b) => a.key < b.key ? -1 : 1);
          nestedNodes.push({ nodeName, attrs });
        }
        // sort node order to get a unique order
        nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
        // now convert to dom string
        let str = '';
        for (let i = 0; i < nestedNodes.length; i++) {
          const node = nestedNodes[i];
          str += `<${node.nodeName}`;
          for (let j = 0; j < node.attrs.length; j++) {
            const attr = node.attrs[j];
            str += ` ${attr.key}="${attr.value}"`;
          }
          str += '>';
        }
        str += delta.insert;
        for (let i = nestedNodes.length - 1; i >= 0; i--) {
          str += `</${nestedNodes[i].nodeName}>`;
        }
        return str
      }).join('')
    }

    /**
     * @return {string}
     */
    toJSON () {
      return this.toString()
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlTextRefID);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlText}
   *
   * @private
   * @function
   */
  const readYXmlText = decoder => new YXmlText();

  class AbstractStruct {
    /**
     * @param {ID} id
     * @param {number} length
     */
    constructor (id, length) {
      this.id = id;
      this.length = length;
    }

    /**
     * @type {boolean}
     */
    get deleted () {
      throw methodUnimplemented()
    }

    /**
     * Merge this struct with the item to the right.
     * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
     * Also this method does *not* remove right from StructStore!
     * @param {AbstractStruct} right
     * @return {boolean} wether this merged with right
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
     * @param {number} offset
     * @param {number} encodingRef
     */
    write (encoder, offset, encodingRef) {
      throw methodUnimplemented()
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      throw methodUnimplemented()
    }
  }

  const structGCRefNumber = 0;

  /**
   * @private
   */
  class GC extends AbstractStruct {
    get deleted () {
      return true
    }

    delete () {}

    /**
     * @param {GC} right
     * @return {boolean}
     */
    mergeWith (right) {
      if (this.constructor !== right.constructor) {
        return false
      }
      this.length += right.length;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      if (offset > 0) {
        this.id.clock += offset;
        this.length -= offset;
      }
      addStruct(transaction.doc.store, this);
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeInfo(structGCRefNumber);
      encoder.writeLen(this.length - offset);
    }

    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @return {null | number}
     */
    getMissing (transaction, store) {
      return null
    }
  }

  class ContentBinary {
    /**
     * @param {Uint8Array} content
     */
    constructor (content) {
      this.content = content;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.content]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentBinary}
     */
    copy () {
      return new ContentBinary(this.content)
    }

    /**
     * @param {number} offset
     * @return {ContentBinary}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentBinary} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeBuf(this.content);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 3
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
   * @return {ContentBinary}
   */
  const readContentBinary = decoder => new ContentBinary(decoder.readBuf());

  class ContentDeleted {
    /**
     * @param {number} len
     */
    constructor (len) {
      this.len = len;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.len
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return []
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return false
    }

    /**
     * @return {ContentDeleted}
     */
    copy () {
      return new ContentDeleted(this.len)
    }

    /**
     * @param {number} offset
     * @return {ContentDeleted}
     */
    splice (offset) {
      const right = new ContentDeleted(this.len - offset);
      this.len = offset;
      return right
    }

    /**
     * @param {ContentDeleted} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.len += right.len;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
      item.markDeleted();
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeLen(this.len - offset);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 1
    }
  }

  /**
   * @private
   *
   * @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
   * @return {ContentDeleted}
   */
  const readContentDeleted = decoder => new ContentDeleted(decoder.readLen());

  /**
   * @param {string} guid
   * @param {Object<string, any>} opts
   */
  const createDocFromOpts = (guid, opts) => new Doc({ guid, ...opts, shouldLoad: opts.shouldLoad || opts.autoLoad || false });

  /**
   * @private
   */
  class ContentDoc {
    /**
     * @param {Doc} doc
     */
    constructor (doc) {
      if (doc._item) {
        console.error('This document was already integrated as a sub-document. You should create a second instance instead with the same guid.');
      }
      /**
       * @type {Doc}
       */
      this.doc = doc;
      /**
       * @type {any}
       */
      const opts = {};
      this.opts = opts;
      if (!doc.gc) {
        opts.gc = false;
      }
      if (doc.autoLoad) {
        opts.autoLoad = true;
      }
      if (doc.meta !== null) {
        opts.meta = doc.meta;
      }
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.doc]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentDoc}
     */
    copy () {
      return new ContentDoc(createDocFromOpts(this.doc.guid, this.opts))
    }

    /**
     * @param {number} offset
     * @return {ContentDoc}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentDoc} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      // this needs to be reflected in doc.destroy as well
      this.doc._item = item;
      transaction.subdocsAdded.add(this.doc);
      if (this.doc.shouldLoad) {
        transaction.subdocsLoaded.add(this.doc);
      }
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {
      if (transaction.subdocsAdded.has(this.doc)) {
        transaction.subdocsAdded.delete(this.doc);
      } else {
        transaction.subdocsRemoved.add(this.doc);
      }
    }

    /**
     * @param {StructStore} store
     */
    gc (store) { }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeString(this.doc.guid);
      encoder.writeAny(this.opts);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 9
    }
  }

  /**
   * @private
   *
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentDoc}
   */
  const readContentDoc = decoder => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));

  /**
   * @private
   */
  class ContentEmbed {
    /**
     * @param {Object} embed
     */
    constructor (embed) {
      this.embed = embed;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.embed]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentEmbed}
     */
    copy () {
      return new ContentEmbed(this.embed)
    }

    /**
     * @param {number} offset
     * @return {ContentEmbed}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentEmbed} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeJSON(this.embed);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 5
    }
  }

  /**
   * @private
   *
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentEmbed}
   */
  const readContentEmbed = decoder => new ContentEmbed(decoder.readJSON());

  /**
   * @private
   */
  class ContentFormat {
    /**
     * @param {string} key
     * @param {Object} value
     */
    constructor (key, value) {
      this.key = key;
      this.value = value;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return []
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return false
    }

    /**
     * @return {ContentFormat}
     */
    copy () {
      return new ContentFormat(this.key, this.value)
    }

    /**
     * @param {number} offset
     * @return {ContentFormat}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentFormat} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      // @todo searchmarker are currently unsupported for rich text documents
      /** @type {AbstractType<any>} */ (item.parent)._searchMarker = null;
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeKey(this.key);
      encoder.writeJSON(this.value);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 6
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentFormat}
   */
  const readContentFormat = decoder => new ContentFormat(decoder.readKey(), decoder.readJSON());

  /**
   * @private
   */
  class ContentJSON {
    /**
     * @param {Array<any>} arr
     */
    constructor (arr) {
      /**
       * @type {Array<any>}
       */
      this.arr = arr;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.arr.length
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.arr
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentJSON}
     */
    copy () {
      return new ContentJSON(this.arr)
    }

    /**
     * @param {number} offset
     * @return {ContentJSON}
     */
    splice (offset) {
      const right = new ContentJSON(this.arr.slice(offset));
      this.arr = this.arr.slice(0, offset);
      return right
    }

    /**
     * @param {ContentJSON} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.arr = this.arr.concat(right.arr);
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      const len = this.arr.length;
      encoder.writeLen(len - offset);
      for (let i = offset; i < len; i++) {
        const c = this.arr[i];
        encoder.writeString(c === undefined ? 'undefined' : JSON.stringify(c));
      }
    }

    /**
     * @return {number}
     */
    getRef () {
      return 2
    }
  }

  /**
   * @private
   *
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentJSON}
   */
  const readContentJSON = decoder => {
    const len = decoder.readLen();
    const cs = [];
    for (let i = 0; i < len; i++) {
      const c = decoder.readString();
      if (c === 'undefined') {
        cs.push(undefined);
      } else {
        cs.push(JSON.parse(c));
      }
    }
    return new ContentJSON(cs)
  };

  class ContentAny {
    /**
     * @param {Array<any>} arr
     */
    constructor (arr) {
      /**
       * @type {Array<any>}
       */
      this.arr = arr;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.arr.length
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.arr
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentAny}
     */
    copy () {
      return new ContentAny(this.arr)
    }

    /**
     * @param {number} offset
     * @return {ContentAny}
     */
    splice (offset) {
      const right = new ContentAny(this.arr.slice(offset));
      this.arr = this.arr.slice(0, offset);
      return right
    }

    /**
     * @param {ContentAny} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.arr = this.arr.concat(right.arr);
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      const len = this.arr.length;
      encoder.writeLen(len - offset);
      for (let i = offset; i < len; i++) {
        const c = this.arr[i];
        encoder.writeAny(c);
      }
    }

    /**
     * @return {number}
     */
    getRef () {
      return 8
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentAny}
   */
  const readContentAny = decoder => {
    const len = decoder.readLen();
    const cs = [];
    for (let i = 0; i < len; i++) {
      cs.push(decoder.readAny());
    }
    return new ContentAny(cs)
  };

  /**
   * @private
   */
  class ContentString {
    /**
     * @param {string} str
     */
    constructor (str) {
      /**
       * @type {string}
       */
      this.str = str;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.str.length
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.str.split('')
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentString}
     */
    copy () {
      return new ContentString(this.str)
    }

    /**
     * @param {number} offset
     * @return {ContentString}
     */
    splice (offset) {
      const right = new ContentString(this.str.slice(offset));
      this.str = this.str.slice(0, offset);

      // Prevent encoding invalid documents because of splitting of surrogate pairs: https://github.com/yjs/yjs/issues/248
      const firstCharCode = this.str.charCodeAt(offset - 1);
      if (firstCharCode >= 0xD800 && firstCharCode <= 0xDBFF) {
        // Last character of the left split is the start of a surrogate utf16/ucs2 pair.
        // We don't support splitting of surrogate pairs because this may lead to invalid documents.
        // Replace the invalid character with a unicode replacement character (� / U+FFFD)
        this.str = this.str.slice(0, offset - 1) + '�';
        // replace right as well
        right.str = '�' + right.str.slice(1);
      }
      return right
    }

    /**
     * @param {ContentString} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.str += right.str;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
    }

    /**
     * @return {number}
     */
    getRef () {
      return 4
    }
  }

  /**
   * @private
   *
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentString}
   */
  const readContentString = decoder => new ContentString(decoder.readString());

  /**
   * @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractType<any>>}
   * @private
   */
  const typeRefs = [
    readYArray,
    readYMap,
    readYText,
    readYXmlElement,
    readYXmlFragment,
    readYXmlHook,
    readYXmlText
  ];

  const YArrayRefID = 0;
  const YMapRefID = 1;
  const YTextRefID = 2;
  const YXmlElementRefID = 3;
  const YXmlFragmentRefID = 4;
  const YXmlHookRefID = 5;
  const YXmlTextRefID = 6;

  /**
   * @private
   */
  class ContentType {
    /**
     * @param {AbstractType<any>} type
     */
    constructor (type) {
      /**
       * @type {AbstractType<any>}
       */
      this.type = type;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.type]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentType}
     */
    copy () {
      return new ContentType(this.type._copy())
    }

    /**
     * @param {number} offset
     * @return {ContentType}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentType} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      this.type._integrate(transaction.doc, item);
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {
      let item = this.type._start;
      while (item !== null) {
        if (!item.deleted) {
          item.delete(transaction);
        } else {
          // This will be gc'd later and we want to merge it if possible
          // We try to merge all deleted items after each transaction,
          // but we have no knowledge about that this needs to be merged
          // since it is not in transaction.ds. Hence we add it to transaction._mergeStructs
          transaction._mergeStructs.push(item);
        }
        item = item.right;
      }
      this.type._map.forEach(item => {
        if (!item.deleted) {
          item.delete(transaction);
        } else {
          // same as above
          transaction._mergeStructs.push(item);
        }
      });
      transaction.changed.delete(this.type);
    }

    /**
     * @param {StructStore} store
     */
    gc (store) {
      let item = this.type._start;
      while (item !== null) {
        item.gc(store, true);
        item = item.right;
      }
      this.type._start = null;
      this.type._map.forEach(/** @param {Item | null} item */ (item) => {
        while (item !== null) {
          item.gc(store, true);
          item = item.left;
        }
      });
      this.type._map = new Map();
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      this.type._write(encoder);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 7
    }
  }

  /**
   * @private
   *
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {ContentType}
   */
  const readContentType = decoder => new ContentType(typeRefs[decoder.readTypeRef()](decoder));

  /**
   * @todo This should return several items
   *
   * @param {StructStore} store
   * @param {ID} id
   * @return {{item:Item, diff:number}}
   */
  const followRedone = (store, id) => {
    /**
     * @type {ID|null}
     */
    let nextID = id;
    let diff = 0;
    let item;
    do {
      if (diff > 0) {
        nextID = createID(nextID.client, nextID.clock + diff);
      }
      item = getItem(store, nextID);
      diff = nextID.clock - item.id.clock;
      nextID = item.redone;
    } while (nextID !== null && item instanceof Item)
    return {
      item, diff
    }
  };

  /**
   * Make sure that neither item nor any of its parents is ever deleted.
   *
   * This property does not persist when storing it into a database or when
   * sending it to other peers
   *
   * @param {Item|null} item
   * @param {boolean} keep
   */
  const keepItem = (item, keep) => {
    while (item !== null && item.keep !== keep) {
      item.keep = keep;
      item = /** @type {AbstractType<any>} */ (item.parent)._item;
    }
  };

  /**
   * Split leftItem into two items
   * @param {Transaction} transaction
   * @param {Item} leftItem
   * @param {number} diff
   * @return {Item}
   *
   * @function
   * @private
   */
  const splitItem = (transaction, leftItem, diff) => {
    // create rightItem
    const { client, clock } = leftItem.id;
    const rightItem = new Item(
      createID(client, clock + diff),
      leftItem,
      createID(client, clock + diff - 1),
      leftItem.right,
      leftItem.rightOrigin,
      leftItem.parent,
      leftItem.parentSub,
      leftItem.content.splice(diff)
    );
    if (leftItem.deleted) {
      rightItem.markDeleted();
    }
    if (leftItem.keep) {
      rightItem.keep = true;
    }
    if (leftItem.redone !== null) {
      rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
    }
    // update left (do not set leftItem.rightOrigin as it will lead to problems when syncing)
    leftItem.right = rightItem;
    // update right
    if (rightItem.right !== null) {
      rightItem.right.left = rightItem;
    }
    // right is more specific.
    transaction._mergeStructs.push(rightItem);
    // update parent._map
    if (rightItem.parentSub !== null && rightItem.right === null) {
      /** @type {AbstractType<any>} */ (rightItem.parent)._map.set(rightItem.parentSub, rightItem);
    }
    leftItem.length = diff;
    return rightItem
  };

  /**
   * Redoes the effect of this operation.
   *
   * @param {Transaction} transaction The Yjs instance.
   * @param {Item} item
   * @param {Set<Item>} redoitems
   * @param {DeleteSet} itemsToDelete
   * @param {boolean} ignoreRemoteMapChanges
   *
   * @return {Item|null}
   *
   * @private
   */
  const redoItem = (transaction, item, redoitems, itemsToDelete, ignoreRemoteMapChanges) => {
    const doc = transaction.doc;
    const store = doc.store;
    const ownClientID = doc.clientID;
    const redone = item.redone;
    if (redone !== null) {
      return getItemCleanStart(transaction, redone)
    }
    let parentItem = /** @type {AbstractType<any>} */ (item.parent)._item;
    /**
     * @type {Item|null}
     */
    let left = null;
    /**
     * @type {Item|null}
     */
    let right;
    // make sure that parent is redone
    if (parentItem !== null && parentItem.deleted === true) {
      // try to undo parent if it will be undone anyway
      if (parentItem.redone === null && (!redoitems.has(parentItem) || redoItem(transaction, parentItem, redoitems, itemsToDelete, ignoreRemoteMapChanges) === null)) {
        return null
      }
      while (parentItem.redone !== null) {
        parentItem = getItemCleanStart(transaction, parentItem.redone);
      }
    }
    const parentType = parentItem === null ? /** @type {AbstractType<any>} */ (item.parent) : /** @type {ContentType} */ (parentItem.content).type;

    if (item.parentSub === null) {
      // Is an array item. Insert at the old position
      left = item.left;
      right = item;
      // find next cloned_redo items
      while (left !== null) {
        /**
         * @type {Item|null}
         */
        let leftTrace = left;
        // trace redone until parent matches
        while (leftTrace !== null && /** @type {AbstractType<any>} */ (leftTrace.parent)._item !== parentItem) {
          leftTrace = leftTrace.redone === null ? null : getItemCleanStart(transaction, leftTrace.redone);
        }
        if (leftTrace !== null && /** @type {AbstractType<any>} */ (leftTrace.parent)._item === parentItem) {
          left = leftTrace;
          break
        }
        left = left.left;
      }
      while (right !== null) {
        /**
         * @type {Item|null}
         */
        let rightTrace = right;
        // trace redone until parent matches
        while (rightTrace !== null && /** @type {AbstractType<any>} */ (rightTrace.parent)._item !== parentItem) {
          rightTrace = rightTrace.redone === null ? null : getItemCleanStart(transaction, rightTrace.redone);
        }
        if (rightTrace !== null && /** @type {AbstractType<any>} */ (rightTrace.parent)._item === parentItem) {
          right = rightTrace;
          break
        }
        right = right.right;
      }
    } else {
      right = null;
      if (item.right && !ignoreRemoteMapChanges) {
        left = item;
        // Iterate right while right is in itemsToDelete
        // If it is intended to delete right while item is redone, we can expect that item should replace right.
        while (left !== null && left.right !== null && isDeleted(itemsToDelete, left.right.id)) {
          left = left.right;
        }
        // follow redone
        // trace redone until parent matches
        while (left !== null && left.redone !== null) {
          left = getItemCleanStart(transaction, left.redone);
        }
        // check wether we were allowed to follow right (indicating that originally this op was replaced by another item)
        if (left === null || /** @type {AbstractType<any>} */ (left.parent)._item !== parentItem) {
          // invalid parent; should never happen
          return null
        }
        if (left && left.right !== null) {
          // It is not possible to redo this item because it conflicts with a
          // change from another client
          return null
        }
      } else {
        left = parentType._map.get(item.parentSub) || null;
      }
    }
    const nextClock = getState(store, ownClientID);
    const nextId = createID(ownClientID, nextClock);
    const redoneItem = new Item(
      nextId,
      left, left && left.lastId,
      right, right && right.id,
      parentType,
      item.parentSub,
      item.content.copy()
    );
    item.redone = nextId;
    keepItem(redoneItem, true);
    redoneItem.integrate(transaction, 0);
    return redoneItem
  };

  /**
   * Abstract class that represents any content.
   */
  class Item extends AbstractStruct {
    /**
     * @param {ID} id
     * @param {Item | null} left
     * @param {ID | null} origin
     * @param {Item | null} right
     * @param {ID | null} rightOrigin
     * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
     * @param {string | null} parentSub
     * @param {AbstractContent} content
     */
    constructor (id, left, origin, right, rightOrigin, parent, parentSub, content) {
      super(id, content.getLength());
      /**
       * The item that was originally to the left of this item.
       * @type {ID | null}
       */
      this.origin = origin;
      /**
       * The item that is currently to the left of this item.
       * @type {Item | null}
       */
      this.left = left;
      /**
       * The item that is currently to the right of this item.
       * @type {Item | null}
       */
      this.right = right;
      /**
       * The item that was originally to the right of this item.
       * @type {ID | null}
       */
      this.rightOrigin = rightOrigin;
      /**
       * @type {AbstractType<any>|ID|null}
       */
      this.parent = parent;
      /**
       * If the parent refers to this item with some kind of key (e.g. YMap, the
       * key is specified here. The key is then used to refer to the list in which
       * to insert this item. If `parentSub = null` type._start is the list in
       * which to insert to. Otherwise it is `parent._map`.
       * @type {String | null}
       */
      this.parentSub = parentSub;
      /**
       * If this type's effect is redone this type refers to the type that undid
       * this operation.
       * @type {ID | null}
       */
      this.redone = null;
      /**
       * @type {AbstractContent}
       */
      this.content = content;
      /**
       * bit1: keep
       * bit2: countable
       * bit3: deleted
       * bit4: mark - mark node as fast-search-marker
       * @type {number} byte
       */
      this.info = this.content.isCountable() ? BIT2 : 0;
    }

    /**
     * This is used to mark the item as an indexed fast-search marker
     *
     * @type {boolean}
     */
    set marker (isMarked) {
      if (((this.info & BIT4) > 0) !== isMarked) {
        this.info ^= BIT4;
      }
    }

    get marker () {
      return (this.info & BIT4) > 0
    }

    /**
     * If true, do not garbage collect this Item.
     */
    get keep () {
      return (this.info & BIT1) > 0
    }

    set keep (doKeep) {
      if (this.keep !== doKeep) {
        this.info ^= BIT1;
      }
    }

    get countable () {
      return (this.info & BIT2) > 0
    }

    /**
     * Whether this item was deleted or not.
     * @type {Boolean}
     */
    get deleted () {
      return (this.info & BIT3) > 0
    }

    set deleted (doDelete) {
      if (this.deleted !== doDelete) {
        this.info ^= BIT3;
      }
    }

    markDeleted () {
      this.info |= BIT3;
    }

    /**
     * Return the creator clientID of the missing op or define missing items and return null.
     *
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @return {null | number}
     */
    getMissing (transaction, store) {
      if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
        return this.origin.client
      }
      if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
        return this.rightOrigin.client
      }
      if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
        return this.parent.client
      }

      // We have all missing ids, now find the items

      if (this.origin) {
        this.left = getItemCleanEnd(transaction, store, this.origin);
        this.origin = this.left.lastId;
      }
      if (this.rightOrigin) {
        this.right = getItemCleanStart(transaction, this.rightOrigin);
        this.rightOrigin = this.right.id;
      }
      if ((this.left && this.left.constructor === GC) || (this.right && this.right.constructor === GC)) {
        this.parent = null;
      }
      // only set parent if this shouldn't be garbage collected
      if (!this.parent) {
        if (this.left && this.left.constructor === Item) {
          this.parent = this.left.parent;
          this.parentSub = this.left.parentSub;
        }
        if (this.right && this.right.constructor === Item) {
          this.parent = this.right.parent;
          this.parentSub = this.right.parentSub;
        }
      } else if (this.parent.constructor === ID) {
        const parentItem = getItem(store, this.parent);
        if (parentItem.constructor === GC) {
          this.parent = null;
        } else {
          this.parent = /** @type {ContentType} */ (parentItem.content).type;
        }
      }
      return null
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      if (offset > 0) {
        this.id.clock += offset;
        this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
        this.origin = this.left.lastId;
        this.content = this.content.splice(offset);
        this.length -= offset;
      }

      if (this.parent) {
        if ((!this.left && (!this.right || this.right.left !== null)) || (this.left && this.left.right !== this.right)) {
          /**
           * @type {Item|null}
           */
          let left = this.left;

          /**
           * @type {Item|null}
           */
          let o;
          // set o to the first conflicting item
          if (left !== null) {
            o = left.right;
          } else if (this.parentSub !== null) {
            o = /** @type {AbstractType<any>} */ (this.parent)._map.get(this.parentSub) || null;
            while (o !== null && o.left !== null) {
              o = o.left;
            }
          } else {
            o = /** @type {AbstractType<any>} */ (this.parent)._start;
          }
          // TODO: use something like DeleteSet here (a tree implementation would be best)
          // @todo use global set definitions
          /**
           * @type {Set<Item>}
           */
          const conflictingItems = new Set();
          /**
           * @type {Set<Item>}
           */
          const itemsBeforeOrigin = new Set();
          // Let c in conflictingItems, b in itemsBeforeOrigin
          // ***{origin}bbbb{this}{c,b}{c,b}{o}***
          // Note that conflictingItems is a subset of itemsBeforeOrigin
          while (o !== null && o !== this.right) {
            itemsBeforeOrigin.add(o);
            conflictingItems.add(o);
            if (compareIDs(this.origin, o.origin)) {
              // case 1
              if (o.id.client < this.id.client) {
                left = o;
                conflictingItems.clear();
              } else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
                // this and o are conflicting and point to the same integration points. The id decides which item comes first.
                // Since this is to the left of o, we can break here
                break
              } // else, o might be integrated before an item that this conflicts with. If so, we will find it in the next iterations
            } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) { // use getItem instead of getItemCleanEnd because we don't want / need to split items.
              // case 2
              if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
                left = o;
                conflictingItems.clear();
              }
            } else {
              break
            }
            o = o.right;
          }
          this.left = left;
        }
        // reconnect left/right + update parent map/start if necessary
        if (this.left !== null) {
          const right = this.left.right;
          this.right = right;
          this.left.right = this;
        } else {
          let r;
          if (this.parentSub !== null) {
            r = /** @type {AbstractType<any>} */ (this.parent)._map.get(this.parentSub) || null;
            while (r !== null && r.left !== null) {
              r = r.left;
            }
          } else {
            r = /** @type {AbstractType<any>} */ (this.parent)._start
            ;/** @type {AbstractType<any>} */ (this.parent)._start = this;
          }
          this.right = r;
        }
        if (this.right !== null) {
          this.right.left = this;
        } else if (this.parentSub !== null) {
          // set as current parent value if right === null and this is parentSub
          /** @type {AbstractType<any>} */ (this.parent)._map.set(this.parentSub, this);
          if (this.left !== null) {
            // this is the current attribute value of parent. delete right
            this.left.delete(transaction);
          }
        }
        // adjust length of parent
        if (this.parentSub === null && this.countable && !this.deleted) {
          /** @type {AbstractType<any>} */ (this.parent)._length += this.length;
        }
        addStruct(transaction.doc.store, this);
        this.content.integrate(transaction, this);
        // add parent to transaction.changed
        addChangedTypeToTransaction(transaction, /** @type {AbstractType<any>} */ (this.parent), this.parentSub);
        if ((/** @type {AbstractType<any>} */ (this.parent)._item !== null && /** @type {AbstractType<any>} */ (this.parent)._item.deleted) || (this.parentSub !== null && this.right !== null)) {
          // delete if parent is deleted or if this is not the current attribute value of parent
          this.delete(transaction);
        }
      } else {
        // parent is not defined. Integrate GC struct instead
        new GC(this.id, this.length).integrate(transaction, 0);
      }
    }

    /**
     * Returns the next non-deleted item
     */
    get next () {
      let n = this.right;
      while (n !== null && n.deleted) {
        n = n.right;
      }
      return n
    }

    /**
     * Returns the previous non-deleted item
     */
    get prev () {
      let n = this.left;
      while (n !== null && n.deleted) {
        n = n.left;
      }
      return n
    }

    /**
     * Computes the last content address of this Item.
     */
    get lastId () {
      // allocating ids is pretty costly because of the amount of ids created, so we try to reuse whenever possible
      return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1)
    }

    /**
     * Try to merge two items
     *
     * @param {Item} right
     * @return {boolean}
     */
    mergeWith (right) {
      if (
        this.constructor === right.constructor &&
        compareIDs(right.origin, this.lastId) &&
        this.right === right &&
        compareIDs(this.rightOrigin, right.rightOrigin) &&
        this.id.client === right.id.client &&
        this.id.clock + this.length === right.id.clock &&
        this.deleted === right.deleted &&
        this.redone === null &&
        right.redone === null &&
        this.content.constructor === right.content.constructor &&
        this.content.mergeWith(right.content)
      ) {
        const searchMarker = /** @type {AbstractType<any>} */ (this.parent)._searchMarker;
        if (searchMarker) {
          searchMarker.forEach(marker => {
            if (marker.p === right) {
              // right is going to be "forgotten" so we need to update the marker
              marker.p = this;
              // adjust marker index
              if (!this.deleted && this.countable) {
                marker.index -= this.length;
              }
            }
          });
        }
        if (right.keep) {
          this.keep = true;
        }
        this.right = right.right;
        if (this.right !== null) {
          this.right.left = this;
        }
        this.length += right.length;
        return true
      }
      return false
    }

    /**
     * Mark this Item as deleted.
     *
     * @param {Transaction} transaction
     */
    delete (transaction) {
      if (!this.deleted) {
        const parent = /** @type {AbstractType<any>} */ (this.parent);
        // adjust the length of parent
        if (this.countable && this.parentSub === null) {
          parent._length -= this.length;
        }
        this.markDeleted();
        addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
        addChangedTypeToTransaction(transaction, parent, this.parentSub);
        this.content.delete(transaction);
      }
    }

    /**
     * @param {StructStore} store
     * @param {boolean} parentGCd
     */
    gc (store, parentGCd) {
      if (!this.deleted) {
        throw unexpectedCase()
      }
      this.content.gc(store);
      if (parentGCd) {
        replaceStruct(store, this, new GC(this.id, this.length));
      } else {
        this.content = new ContentDeleted(this.length);
      }
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
     * @param {number} offset
     */
    write (encoder, offset) {
      const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
      const rightOrigin = this.rightOrigin;
      const parentSub = this.parentSub;
      const info = (this.content.getRef() & BITS5) |
        (origin === null ? 0 : BIT8) | // origin is defined
        (rightOrigin === null ? 0 : BIT7) | // right origin is defined
        (parentSub === null ? 0 : BIT6); // parentSub is non-null
      encoder.writeInfo(info);
      if (origin !== null) {
        encoder.writeLeftID(origin);
      }
      if (rightOrigin !== null) {
        encoder.writeRightID(rightOrigin);
      }
      if (origin === null && rightOrigin === null) {
        const parent = /** @type {AbstractType<any>} */ (this.parent);
        if (parent._item !== undefined) {
          const parentItem = parent._item;
          if (parentItem === null) {
            // parent type on y._map
            // find the correct key
            const ykey = findRootTypeKey(parent);
            encoder.writeParentInfo(true); // write parentYKey
            encoder.writeString(ykey);
          } else {
            encoder.writeParentInfo(false); // write parent id
            encoder.writeLeftID(parentItem.id);
          }
        } else if (parent.constructor === String) { // this edge case was added by differential updates
          encoder.writeParentInfo(true); // write parentYKey
          encoder.writeString(parent);
        } else if (parent.constructor === ID) {
          encoder.writeParentInfo(false); // write parent id
          encoder.writeLeftID(parent);
        } else {
          unexpectedCase();
        }
        if (parentSub !== null) {
          encoder.writeString(parentSub);
        }
      }
      this.content.write(encoder, offset);
    }
  }

  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {number} info
   */
  const readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);

  /**
   * A lookup map for reading Item content.
   *
   * @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractContent>}
   */
  const contentRefs = [
    () => { unexpectedCase(); }, // GC is not ItemContent
    readContentDeleted, // 1
    readContentJSON, // 2
    readContentBinary, // 3
    readContentString, // 4
    readContentEmbed, // 5
    readContentFormat, // 6
    readContentType, // 7
    readContentAny, // 8
    readContentDoc, // 9
    () => { unexpectedCase(); } // 10 - Skip is not ItemContent
  ];

  const structSkipRefNumber = 10;

  /**
   * @private
   */
  class Skip extends AbstractStruct {
    get deleted () {
      return true
    }

    delete () {}

    /**
     * @param {Skip} right
     * @return {boolean}
     */
    mergeWith (right) {
      if (this.constructor !== right.constructor) {
        return false
      }
      this.length += right.length;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      // skip structs cannot be integrated
      unexpectedCase();
    }

    /**
     * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeInfo(structSkipRefNumber);
      // write as VarUint because Skips can't make use of predictable length-encoding
      writeVarUint(encoder.restEncoder, this.length - offset);
    }

    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @return {null | number}
     */
    getMissing (transaction, store) {
      return null
    }
  }

  /** eslint-env browser */

  const glo = /** @type {any} */ (typeof window !== 'undefined'
    ? window
    // @ts-ignore
    : typeof global !== 'undefined' ? global : {});

  const importIdentifier = '__ $YJS$ __';

  if (glo[importIdentifier] === true) {
    /**
     * Dear reader of this warning message. Please take this seriously.
     *
     * If you see this message, please make sure that you only import one version of Yjs. In many cases,
     * your package manager installs two versions of Yjs that are used by different packages within your project.
     * Another reason for this message is that some parts of your project use the commonjs version of Yjs
     * and others use the EcmaScript version of Yjs.
     *
     * This often leads to issues that are hard to debug. We often need to perform constructor checks,
     * e.g. `struct instanceof GC`. If you imported different versions of Yjs, it is impossible for us to
     * do the constructor checks anymore - which might break the CRDT algorithm.
     */
    console.warn('Yjs was already imported. Importing different versions of Yjs often leads to issues.');
  }
  glo[importIdentifier] = true;

  var Y = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Doc: Doc,
    Transaction: Transaction,
    Array: YArray,
    Map: YMap,
    Text: YText,
    XmlText: YXmlText,
    XmlHook: YXmlHook,
    XmlElement: YXmlElement,
    XmlFragment: YXmlFragment,
    YXmlEvent: YXmlEvent,
    YMapEvent: YMapEvent,
    YArrayEvent: YArrayEvent,
    YTextEvent: YTextEvent,
    YEvent: YEvent,
    Item: Item,
    AbstractStruct: AbstractStruct,
    GC: GC,
    ContentBinary: ContentBinary,
    ContentDeleted: ContentDeleted,
    ContentEmbed: ContentEmbed,
    ContentFormat: ContentFormat,
    ContentJSON: ContentJSON,
    ContentAny: ContentAny,
    ContentString: ContentString,
    ContentType: ContentType,
    AbstractType: AbstractType,
    getTypeChildren: getTypeChildren,
    createRelativePositionFromTypeIndex: createRelativePositionFromTypeIndex,
    createRelativePositionFromJSON: createRelativePositionFromJSON,
    createAbsolutePositionFromRelativePosition: createAbsolutePositionFromRelativePosition,
    compareRelativePositions: compareRelativePositions,
    AbsolutePosition: AbsolutePosition,
    RelativePosition: RelativePosition,
    ID: ID,
    createID: createID,
    compareIDs: compareIDs,
    getState: getState,
    Snapshot: Snapshot,
    createSnapshot: createSnapshot,
    createDeleteSet: createDeleteSet,
    createDeleteSetFromStructStore: createDeleteSetFromStructStore,
    cleanupYTextFormatting: cleanupYTextFormatting,
    snapshot: snapshot,
    emptySnapshot: emptySnapshot,
    findRootTypeKey: findRootTypeKey,
    findIndexSS: findIndexSS,
    getItem: getItem,
    typeListToArraySnapshot: typeListToArraySnapshot,
    typeMapGetSnapshot: typeMapGetSnapshot,
    createDocFromSnapshot: createDocFromSnapshot,
    iterateDeletedStructs: iterateDeletedStructs,
    applyUpdate: applyUpdate,
    applyUpdateV2: applyUpdateV2,
    readUpdate: readUpdate$1,
    readUpdateV2: readUpdateV2,
    encodeStateAsUpdate: encodeStateAsUpdate,
    encodeStateAsUpdateV2: encodeStateAsUpdateV2,
    encodeStateVector: encodeStateVector,
    UndoManager: UndoManager,
    decodeSnapshot: decodeSnapshot,
    encodeSnapshot: encodeSnapshot,
    decodeSnapshotV2: decodeSnapshotV2,
    encodeSnapshotV2: encodeSnapshotV2,
    decodeStateVector: decodeStateVector,
    logUpdate: logUpdate,
    logUpdateV2: logUpdateV2,
    decodeUpdate: decodeUpdate,
    decodeUpdateV2: decodeUpdateV2,
    relativePositionToJSON: relativePositionToJSON,
    isDeleted: isDeleted,
    isParentOf: isParentOf,
    equalSnapshots: equalSnapshots,
    PermanentUserData: PermanentUserData,
    tryGc: tryGc,
    transact: transact,
    AbstractConnector: AbstractConnector,
    logType: logType,
    mergeUpdates: mergeUpdates,
    mergeUpdatesV2: mergeUpdatesV2,
    parseUpdateMeta: parseUpdateMeta,
    parseUpdateMetaV2: parseUpdateMetaV2,
    encodeStateVectorFromUpdate: encodeStateVectorFromUpdate,
    encodeStateVectorFromUpdateV2: encodeStateVectorFromUpdateV2,
    encodeRelativePosition: encodeRelativePosition,
    decodeRelativePosition: decodeRelativePosition,
    diffUpdate: diffUpdate,
    diffUpdateV2: diffUpdateV2,
    convertUpdateFormatV1ToV2: convertUpdateFormatV1ToV2,
    convertUpdateFormatV2ToV1: convertUpdateFormatV2ToV1
  });

  /**
   * @module sync-protocol
   */

  /**
   * @typedef {Map<number, number>} StateMap
   */

  /**
   * Core Yjs defines two message types:
   * • YjsSyncStep1: Includes the State Set of the sending client. When received, the client should reply with YjsSyncStep2.
   * • YjsSyncStep2: Includes all missing structs and the complete delete set. When received, the client is assured that it
   *   received all information from the remote client.
   *
   * In a peer-to-peer network, you may want to introduce a SyncDone message type. Both parties should initiate the connection
   * with SyncStep1. When a client received SyncStep2, it should reply with SyncDone. When the local client received both
   * SyncStep2 and SyncDone, it is assured that it is synced to the remote client.
   *
   * In a client-server model, you want to handle this differently: The client should initiate the connection with SyncStep1.
   * When the server receives SyncStep1, it should reply with SyncStep2 immediately followed by SyncStep1. The client replies
   * with SyncStep2 when it receives SyncStep1. Optionally the server may send a SyncDone after it received SyncStep2, so the
   * client knows that the sync is finished.  There are two reasons for this more elaborated sync model: 1. This protocol can
   * easily be implemented on top of http and websockets. 2. The server shoul only reply to requests, and not initiate them.
   * Therefore it is necesarry that the client initiates the sync.
   *
   * Construction of a message:
   * [messageType : varUint, message definition..]
   *
   * Note: A message does not include information about the room name. This must to be handled by the upper layer protocol!
   *
   * stringify[messageType] stringifies a message definition (messageType is already read from the bufffer)
   */

  const messageYjsSyncStep1 = 0;
  const messageYjsSyncStep2 = 1;
  const messageYjsUpdate = 2;

  /**
   * Create a sync step 1 message based on the state of the current shared document.
   *
   * @param {encoding.Encoder} encoder
   * @param {Y.Doc} doc
   */
  const writeSyncStep1 = (encoder, doc) => {
    writeVarUint(encoder, messageYjsSyncStep1);
    const sv = encodeStateVector(doc);
    writeVarUint8Array(encoder, sv);
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Y.Doc} doc
   * @param {Uint8Array} [encodedStateVector]
   */
  const writeSyncStep2 = (encoder, doc, encodedStateVector) => {
    writeVarUint(encoder, messageYjsSyncStep2);
    writeVarUint8Array(encoder, encodeStateAsUpdate(doc, encodedStateVector));
  };

  /**
   * Read SyncStep1 message and reply with SyncStep2.
   *
   * @param {decoding.Decoder} decoder The reply to the received message
   * @param {encoding.Encoder} encoder The received message
   * @param {Y.Doc} doc
   */
  const readSyncStep1 = (decoder, encoder, doc) =>
    writeSyncStep2(encoder, doc, readVarUint8Array(decoder));

  /**
   * Read and apply Structs and then DeleteStore to a y instance.
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readSyncStep2 = (decoder, doc, transactionOrigin) => {
    try {
      applyUpdate(doc, readVarUint8Array(decoder), transactionOrigin);
    } catch (error) {
      // This catches errors that are thrown by event handlers
      console.error('Caught error while handling a Yjs update', error);
    }
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Uint8Array} update
   */
  const writeUpdate = (encoder, update) => {
    writeVarUint(encoder, messageYjsUpdate);
    writeVarUint8Array(encoder, update);
  };

  /**
   * Read and apply Structs and then DeleteStore to a y instance.
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readUpdate = readSyncStep2;

  /**
   * @param {decoding.Decoder} decoder A message received from another client
   * @param {encoding.Encoder} encoder The reply message. Will not be sent if empty.
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readSyncMessage = (decoder, encoder, doc, transactionOrigin) => {
    const messageType = readVarUint(decoder);
    switch (messageType) {
      case messageYjsSyncStep1:
        readSyncStep1(decoder, encoder, doc);
        break
      case messageYjsSyncStep2:
        readSyncStep2(decoder, doc, transactionOrigin);
        break
      case messageYjsUpdate:
        readUpdate(decoder, doc, transactionOrigin);
        break
      default:
        throw new Error('Unknown message type')
    }
    return messageType
  };

  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Y = Y; // eslint-disable-line
  }

  /**
   * @param {TestYInstance} y // publish message created by `y` to all other online clients
   * @param {Uint8Array} m
   */
  const broadcastMessage = (y, m) => {
    if (y.tc.onlineConns.has(y)) {
      y.tc.onlineConns.forEach(remoteYInstance => {
        if (remoteYInstance !== y) {
          remoteYInstance._receive(m, y);
        }
      });
    }
  };

  const encV1 = {
    encodeStateAsUpdate: encodeStateAsUpdate,
    mergeUpdates: mergeUpdates,
    applyUpdate: applyUpdate,
    logUpdate: logUpdate,
    updateEventName: 'update',
    diffUpdate: diffUpdate
  };

  let enc = encV1;

  const useV1Encoding = () => {
    enc = encV1;
  };

  const useV2Encoding = () => {
    console.error('sync protocol doesnt support v2 protocol yet, fallback to v1 encoding'); // @Todo
    enc = encV1;
  };

  class TestYInstance extends Doc {
    /**
     * @param {TestConnector} testConnector
     * @param {number} clientID
     */
    constructor (testConnector, clientID) {
      super();
      this.userID = clientID; // overwriting clientID
      /**
       * @type {TestConnector}
       */
      this.tc = testConnector;
      /**
       * @type {Map<TestYInstance, Array<Uint8Array>>}
       */
      this.receiving = new Map();
      testConnector.allConns.add(this);
      /**
       * The list of received updates.
       * We are going to merge them later using Y.mergeUpdates and check if the resulting document is correct.
       * @type {Array<Uint8Array>}
       */
      this.updates = [];
      // set up observe on local model
      this.on(enc.updateEventName, /** @param {Uint8Array} update @param {any} origin */ (update, origin) => {
        if (origin !== testConnector) {
          const encoder = createEncoder();
          writeUpdate(encoder, update);
          broadcastMessage(this, toUint8Array(encoder));
        }
        this.updates.push(update);
      });
      this.connect();
    }

    /**
     * Disconnect from TestConnector.
     */
    disconnect () {
      this.receiving = new Map();
      this.tc.onlineConns.delete(this);
    }

    /**
     * Append yourself to the list of known Y instances in testconnector.
     * Also initiate sync with all clients.
     */
    connect () {
      if (!this.tc.onlineConns.has(this)) {
        this.tc.onlineConns.add(this);
        const encoder = createEncoder();
        writeSyncStep1(encoder, this);
        // publish SyncStep1
        broadcastMessage(this, toUint8Array(encoder));
        this.tc.onlineConns.forEach(remoteYInstance => {
          if (remoteYInstance !== this) {
            // remote instance sends instance to this instance
            const encoder = createEncoder();
            writeSyncStep1(encoder, remoteYInstance);
            this._receive(toUint8Array(encoder), remoteYInstance);
          }
        });
      }
    }

    /**
     * Receive a message from another client. This message is only appended to the list of receiving messages.
     * TestConnector decides when this client actually reads this message.
     *
     * @param {Uint8Array} message
     * @param {TestYInstance} remoteClient
     */
    _receive (message, remoteClient) {
      setIfUndefined(this.receiving, remoteClient, () => []).push(message);
    }
  }

  /**
   * Keeps track of TestYInstances.
   *
   * The TestYInstances add/remove themselves from the list of connections maiained in this object.
   * I think it makes sense. Deal with it.
   */
  class TestConnector {
    /**
     * @param {prng.PRNG} gen
     */
    constructor (gen) {
      /**
       * @type {Set<TestYInstance>}
       */
      this.allConns = new Set();
      /**
       * @type {Set<TestYInstance>}
       */
      this.onlineConns = new Set();
      /**
       * @type {prng.PRNG}
       */
      this.prng = gen;
    }

    /**
     * Create a new Y instance and add it to the list of connections
     * @param {number} clientID
     */
    createY (clientID) {
      return new TestYInstance(this, clientID)
    }

    /**
     * Choose random connection and flush a random message from a random sender.
     *
     * If this function was unable to flush a message, because there are no more messages to flush, it returns false. true otherwise.
     * @return {boolean}
     */
    flushRandomMessage () {
      const gen = this.prng;
      const conns = Array.from(this.onlineConns).filter(conn => conn.receiving.size > 0);
      if (conns.length > 0) {
        const receiver = oneOf(gen, conns);
        const [sender, messages] = oneOf(gen, Array.from(receiver.receiving));
        const m = messages.shift();
        if (messages.length === 0) {
          receiver.receiving.delete(sender);
        }
        if (m === undefined) {
          return this.flushRandomMessage()
        }
        const encoder = createEncoder();
        // console.log('receive (' + sender.userID + '->' + receiver.userID + '):\n', syncProtocol.stringifySyncMessage(decoding.createDecoder(m), receiver))
        // do not publish data created when this function is executed (could be ss2 or update message)
        readSyncMessage(createDecoder(m), encoder, receiver, receiver.tc);
        if (length(encoder) > 0) {
          // send reply message
          sender._receive(toUint8Array(encoder), receiver);
        }
        return true
      }
      return false
    }

    /**
     * @return {boolean} True iff this function actually flushed something
     */
    flushAllMessages () {
      let didSomething = false;
      while (this.flushRandomMessage()) {
        didSomething = true;
      }
      return didSomething
    }

    reconnectAll () {
      this.allConns.forEach(conn => conn.connect());
    }

    disconnectAll () {
      this.allConns.forEach(conn => conn.disconnect());
    }

    syncAll () {
      this.reconnectAll();
      this.flushAllMessages();
    }

    /**
     * @return {boolean} Whether it was possible to disconnect a randon connection.
     */
    disconnectRandom () {
      if (this.onlineConns.size === 0) {
        return false
      }
      oneOf(this.prng, Array.from(this.onlineConns)).disconnect();
      return true
    }

    /**
     * @return {boolean} Whether it was possible to reconnect a random connection.
     */
    reconnectRandom () {
      /**
       * @type {Array<TestYInstance>}
       */
      const reconnectable = [];
      this.allConns.forEach(conn => {
        if (!this.onlineConns.has(conn)) {
          reconnectable.push(conn);
        }
      });
      if (reconnectable.length === 0) {
        return false
      }
      oneOf(this.prng, reconnectable).connect();
      return true
    }
  }

  /**
   * @template T
   * @param {t.TestCase} tc
   * @param {{users?:number}} conf
   * @param {InitTestObjectCallback<T>} [initTestObject]
   * @return {{testObjects:Array<any>,testConnector:TestConnector,users:Array<TestYInstance>,array0:Y.Array<any>,array1:Y.Array<any>,array2:Y.Array<any>,map0:Y.Map<any>,map1:Y.Map<any>,map2:Y.Map<any>,map3:Y.Map<any>,text0:Y.Text,text1:Y.Text,text2:Y.Text,xml0:Y.XmlElement,xml1:Y.XmlElement,xml2:Y.XmlElement}}
   */
  const init = (tc, { users = 5 } = {}, initTestObject) => {
    /**
     * @type {Object<string,any>}
     */
    const result = {
      users: []
    };
    const gen = tc.prng;
    // choose an encoding approach at random
    if (bool(gen)) {
      useV2Encoding();
    } else {
      useV1Encoding();
    }

    const testConnector = new TestConnector(gen);
    result.testConnector = testConnector;
    for (let i = 0; i < users; i++) {
      const y = testConnector.createY(i);
      y.clientID = i;
      result.users.push(y);
      result['array' + i] = y.getArray('array');
      result['map' + i] = y.getMap('map');
      result['xml' + i] = y.get('xml', YXmlElement);
      result['text' + i] = y.getText('text');
    }
    testConnector.syncAll();
    result.testObjects = result.users.map(initTestObject || (() => null));
    useV1Encoding();
    return /** @type {any} */ (result)
  };

  /**
   * 1. reconnect and flush all
   * 2. user 0 gc
   * 3. get type content
   * 4. disconnect & reconnect all (so gc is propagated)
   * 5. compare os, ds, ss
   *
   * @param {Array<TestYInstance>} users
   */
  const compare = users => {
    users.forEach(u => u.connect());
    while (users[0].tc.flushAllMessages()) {} // eslint-disable-line
    // For each document, merge all received document updates with Y.mergeUpdates and create a new document which will be added to the list of "users"
    // This ensures that mergeUpdates works correctly
    const mergedDocs = users.map(user => {
      const ydoc = new Doc();
      enc.applyUpdate(ydoc, enc.mergeUpdates(user.updates));
      return ydoc
    });
    users.push(.../** @type {any} */(mergedDocs));
    const userArrayValues = users.map(u => u.getArray('array').toJSON());
    const userMapValues = users.map(u => u.getMap('map').toJSON());
    const userXmlValues = users.map(u => u.get('xml', YXmlElement).toString());
    const userTextValues = users.map(u => u.getText('text').toDelta());
    for (const u of users) {
      assert(u.store.pendingDs === null);
      assert(u.store.pendingStructs === null);
    }
    // Test Array iterator
    compare$1(users[0].getArray('array').toArray(), Array.from(users[0].getArray('array')));
    // Test Map iterator
    const ymapkeys = Array.from(users[0].getMap('map').keys());
    assert(ymapkeys.length === Object.keys(userMapValues[0]).length);
    ymapkeys.forEach(key => assert(hasProperty(userMapValues[0], key)));
    /**
     * @type {Object<string,any>}
     */
    const mapRes = {};
    for (const [k, v] of users[0].getMap('map')) {
      mapRes[k] = v instanceof AbstractType ? v.toJSON() : v;
    }
    compare$1(userMapValues[0], mapRes);
    // Compare all users
    for (let i = 0; i < users.length - 1; i++) {
      compare$1(userArrayValues[i].length, users[i].getArray('array').length);
      compare$1(userArrayValues[i], userArrayValues[i + 1]);
      compare$1(userMapValues[i], userMapValues[i + 1]);
      compare$1(userXmlValues[i], userXmlValues[i + 1]);
      compare$1(userTextValues[i].map(/** @param {any} a */ a => typeof a.insert === 'string' ? a.insert : ' ').join('').length, users[i].getText('text').length);
      compare$1(userTextValues[i], userTextValues[i + 1], '', (constructor, a, b) => {
        if (a instanceof AbstractType) {
          compare$1(a.toJSON(), b.toJSON());
        } else if (a !== b) {
          fail('Deltas dont match');
        }
        return true
      });
      compare$1(encodeStateVector(users[i]), encodeStateVector(users[i + 1]));
      compareDS(createDeleteSetFromStructStore(users[i].store), createDeleteSetFromStructStore(users[i + 1].store));
      compareStructStores(users[i].store, users[i + 1].store);
    }
    users.map(u => u.destroy());
  };

  /**
   * @param {Y.Item?} a
   * @param {Y.Item?} b
   * @return {boolean}
   */
  const compareItemIDs = (a, b) => a === b || (a !== null && b != null && compareIDs(a.id, b.id));

  /**
   * @param {import('../src/internals').StructStore} ss1
   * @param {import('../src/internals').StructStore} ss2
   */
  const compareStructStores = (ss1, ss2) => {
    assert(ss1.clients.size === ss2.clients.size);
    for (const [client, structs1] of ss1.clients) {
      const structs2 = /** @type {Array<Y.AbstractStruct>} */ (ss2.clients.get(client));
      assert(structs2 !== undefined && structs1.length === structs2.length);
      for (let i = 0; i < structs1.length; i++) {
        const s1 = structs1[i];
        const s2 = structs2[i];
        // checks for abstract struct
        if (
          s1.constructor !== s2.constructor ||
          !compareIDs(s1.id, s2.id) ||
          s1.deleted !== s2.deleted ||
          // @ts-ignore
          s1.length !== s2.length
        ) {
          fail('Structs dont match');
        }
        if (s1 instanceof Item) {
          if (
            !(s2 instanceof Item) ||
            !((s1.left === null && s2.left === null) || (s1.left !== null && s2.left !== null && compareIDs(s1.left.lastId, s2.left.lastId))) ||
            !compareItemIDs(s1.right, s2.right) ||
            !compareIDs(s1.origin, s2.origin) ||
            !compareIDs(s1.rightOrigin, s2.rightOrigin) ||
            s1.parentSub !== s2.parentSub
          ) {
            return fail('Items dont match')
          }
          // make sure that items are connected correctly
          assert(s1.left === null || s1.left.right === s1);
          assert(s1.right === null || s1.right.left === s1);
          assert(s2.left === null || s2.left.right === s2);
          assert(s2.right === null || s2.right.left === s2);
        }
      }
    }
  };

  /**
   * @param {import('../src/internals').DeleteSet} ds1
   * @param {import('../src/internals').DeleteSet} ds2
   */
  const compareDS = (ds1, ds2) => {
    assert(ds1.clients.size === ds2.clients.size);
    ds1.clients.forEach((deleteItems1, client) => {
      const deleteItems2 = /** @type {Array<import('../src/internals').DeleteItem>} */ (ds2.clients.get(client));
      assert(deleteItems2 !== undefined && deleteItems1.length === deleteItems2.length);
      for (let i = 0; i < deleteItems1.length; i++) {
        const di1 = deleteItems1[i];
        const di2 = deleteItems2[i];
        if (di1.clock !== di2.clock || di1.len !== di2.len) {
          fail('DeleteSets dont match');
        }
      }
    });
  };

  /**
   * @template T
   * @callback InitTestObjectCallback
   * @param {TestYInstance} y
   * @return {T}
   */

  /**
   * @template T
   * @param {t.TestCase} tc
   * @param {Array<function(Y.Doc,prng.PRNG,T):void>} mods
   * @param {number} iterations
   * @param {InitTestObjectCallback<T>} [initTestObject]
   */
  const applyRandomTests = (tc, mods, iterations, initTestObject) => {
    const gen = tc.prng;
    const result = init(tc, { users: 5 }, initTestObject);
    const { testConnector, users } = result;
    for (let i = 0; i < iterations; i++) {
      if (int32(gen, 0, 100) <= 2) {
        // 2% chance to disconnect/reconnect a random user
        if (bool(gen)) {
          testConnector.disconnectRandom();
        } else {
          testConnector.reconnectRandom();
        }
      } else if (int32(gen, 0, 100) <= 1) {
        // 1% chance to flush all
        testConnector.flushAllMessages();
      } else if (int32(gen, 0, 100) <= 50) {
        // 50% chance to flush a random message
        testConnector.flushRandomMessage();
      }
      const user = int32(gen, 0, users.length - 1);
      const test = oneOf(gen, mods);
      test(users[user], gen, result.testObjects[user]);
    }
    compare(users);
    return result
  };

  /**
   * @module awareness-protocol
   */

  const outdatedTimeout = 30000;

  /**
   * @typedef {Object} MetaClientState
   * @property {number} MetaClientState.clock
   * @property {number} MetaClientState.lastUpdated unix timestamp
   */

  /**
   * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
   * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
   * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
   *
   * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
   * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
   * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
   * a remote client is offline, it may propagate a message with
   * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
   * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
   *
   * Before a client disconnects, it should propagate a `null` state with an updated clock.
   *
   * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
   *
   * @extends {Observable<string>}
   */
  class Awareness extends Observable {
    /**
     * @param {Y.Doc} doc
     */
    constructor (doc) {
      super();
      this.doc = doc;
      /**
       * @type {number}
       */
      this.clientID = doc.clientID;
      /**
       * Maps from client id to client state
       * @type {Map<number, Object<string, any>>}
       */
      this.states = new Map();
      /**
       * @type {Map<number, MetaClientState>}
       */
      this.meta = new Map();
      this._checkInterval = /** @type {any} */ (setInterval(() => {
        const now = getUnixTime();
        if (this.getLocalState() !== null && (outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */ (this.meta.get(this.clientID)).lastUpdated)) {
          // renew local clock
          this.setLocalState(this.getLocalState());
        }
        /**
         * @type {Array<number>}
         */
        const remove = [];
        this.meta.forEach((meta, clientid) => {
          if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
            remove.push(clientid);
          }
        });
        if (remove.length > 0) {
          removeAwarenessStates(this, remove, 'timeout');
        }
      }, floor(outdatedTimeout / 10)));
      doc.on('destroy', () => {
        this.destroy();
      });
      this.setLocalState({});
    }

    destroy () {
      this.emit('destroy', [this]);
      this.setLocalState(null);
      super.destroy();
      clearInterval(this._checkInterval);
    }

    /**
     * @return {Object<string,any>|null}
     */
    getLocalState () {
      return this.states.get(this.clientID) || null
    }

    /**
     * @param {Object<string,any>|null} state
     */
    setLocalState (state) {
      const clientID = this.clientID;
      const currLocalMeta = this.meta.get(clientID);
      const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
      const prevState = this.states.get(clientID);
      if (state === null) {
        this.states.delete(clientID);
      } else {
        this.states.set(clientID, state);
      }
      this.meta.set(clientID, {
        clock,
        lastUpdated: getUnixTime()
      });
      const added = [];
      const updated = [];
      const filteredUpdated = [];
      const removed = [];
      if (state === null) {
        removed.push(clientID);
      } else if (prevState == null) {
        if (state != null) {
          added.push(clientID);
        }
      } else {
        updated.push(clientID);
        if (!equalityDeep(prevState, state)) {
          filteredUpdated.push(clientID);
        }
      }
      if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
        this.emit('change', [{ added, updated: filteredUpdated, removed }, 'local']);
      }
      this.emit('update', [{ added, updated, removed }, 'local']);
    }

    /**
     * @param {string} field
     * @param {any} value
     */
    setLocalStateField (field, value) {
      const state = this.getLocalState();
      if (state !== null) {
        this.setLocalState({
          ...state,
          [field]: value
        });
      }
    }

    /**
     * @return {Map<number,Object<string,any>>}
     */
    getStates () {
      return this.states
    }
  }

  /**
   * Mark (remote) clients as inactive and remove them from the list of active peers.
   * This change will be propagated to remote clients.
   *
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @param {any} origin
   */
  const removeAwarenessStates = (awareness, clients, origin) => {
    const removed = [];
    for (let i = 0; i < clients.length; i++) {
      const clientID = clients[i];
      if (awareness.states.has(clientID)) {
        awareness.states.delete(clientID);
        if (clientID === awareness.clientID) {
          const curMeta = /** @type {MetaClientState} */ (awareness.meta.get(clientID));
          awareness.meta.set(clientID, {
            clock: curMeta.clock + 1,
            lastUpdated: getUnixTime()
          });
        }
        removed.push(clientID);
      }
    }
    if (removed.length > 0) {
      awareness.emit('change', [{ added: [], updated: [], removed }, origin]);
      awareness.emit('update', [{ added: [], updated: [], removed }, origin]);
    }
  };

  /**
   * @module bindings/quill
   */

  /**
   * Removes the pending '\n's if it has no attributes.
   */
  const normQuillDelta = delta => {
    if (delta.length > 0) {
      const d = delta[delta.length - 1];
      const insert = d.insert;
      if (d.attributes === undefined && insert !== undefined && insert.slice(-1) === '\n') {
        delta = delta.slice();
        let ins = insert.slice(0, -1);
        while (ins.slice(-1) === '\n') {
          ins = ins.slice(0, -1);
        }
        delta[delta.length - 1] = { insert: ins };
        if (ins.length === 0) {
          delta.pop();
        }
        return delta
      }
    }
    return delta
  };

  /**
   * @param {any} quillCursors
   */
  const updateCursor = (quillCursors, aw, clientId, doc, type) => {
    try {
      const cursorId = clientId === doc.clientID ? 'self' : clientId.toString();
      if (aw && aw.cursor) {
        const user = aw.user || {};
        const color = user.color || '#ffa500';
        const name = user.name || `User: ${clientId}`;
        quillCursors.createCursor(cursorId, name, color);
        const anchor = createAbsolutePositionFromRelativePosition(createRelativePositionFromJSON(aw.cursor.anchor), doc);
        const head = createAbsolutePositionFromRelativePosition(createRelativePositionFromJSON(aw.cursor.head), doc);
        if (anchor && head && anchor.type === type) {
          quillCursors.moveCursor(cursorId, { index: anchor.index, length: head.index - anchor.index });
        }
      } else {
        quillCursors.removeCursor(cursorId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  class QuillBinding {
    /**
     * @param {Y.Text} type
     * @param {any} quill
     * @param {Awareness} [awareness]
     */
    constructor (type, quill, awareness) {
      const doc = /** @type {Y.Doc} */ (type.doc);
      this.type = type;
      this.doc = doc;
      this.quill = quill;
      const quillCursors = quill.getModule('cursors') || null;
      this.quillCursors = quillCursors;
      // This object contains all attributes used in the quill instance
      this._negatedUsedFormats = {};
      this.awareness = awareness;
      this._awarenessChange = ({ added, removed, updated }) => {
        const states = /** @type {Awareness} */ (awareness).getStates();
        added.forEach(id => {
          updateCursor(quillCursors, states.get(id), id, doc, type);
        });
        updated.forEach(id => {
          updateCursor(quillCursors, states.get(id), id, doc, type);
        });
        removed.forEach(id => {
          quillCursors.removeCursor(id.toString());
        });
      };
      /**
       * @param {Y.YTextEvent} event
       */
      this._typeObserver = event => {
        if (event.transaction.origin !== this) {
          const eventDelta = event.delta;
          // We always explicitly set attributes, otherwise concurrent edits may
          // result in quill assuming that a text insertion shall inherit existing
          // attributes.
          const delta = [];
          for (let i = 0; i < eventDelta.length; i++) {
            const d = eventDelta[i];
            if (d.insert !== undefined) {
              delta.push(Object.assign({}, d, { attributes: Object.assign({}, this._negatedUsedFormats, d.attributes || {}) }));
            } else {
              delta.push(d);
            }
          }
          quill.updateContents(delta, this);
        }
      };
      type.observe(this._typeObserver);
      this._quillObserver = (eventType, delta, state, origin) => {
        if (delta && delta.ops) {
          // update content
          const ops = delta.ops;
          ops.forEach(op => {
            if (op.attributes !== undefined) {
              for (let key in op.attributes) {
                if (this._negatedUsedFormats[key] === undefined) {
                  this._negatedUsedFormats[key] = false;
                }
              }
            }
          });
          if (origin !== this) {
            doc.transact(() => {
              type.applyDelta(ops);
            }, this);
          }
        }
        // always check selection
        if (awareness && quillCursors) {
          const sel = quill.getSelection();
          const aw = /** @type {any} */ (awareness.getLocalState());
          if (sel === null) {
            if (awareness.getLocalState() !== null) {
              awareness.setLocalStateField('cursor', /** @type {any} */ (null));
            }
          } else {
            const anchor = createRelativePositionFromTypeIndex(type, sel.index);
            const head = createRelativePositionFromTypeIndex(type, sel.index + sel.length);
            if (!aw || !aw.cursor || !compareRelativePositions(anchor, aw.cursor.anchor) || !compareRelativePositions(head, aw.cursor.head)) {
              awareness.setLocalStateField('cursor', {
                anchor,
                head
              });
            }
          }
          // update all remote cursor locations
          awareness.getStates().forEach((aw, clientId) => {
            updateCursor(quillCursors, aw, clientId, doc, type);
          });
        }
      };
      quill.on('editor-change', this._quillObserver);
      // This indirectly initializes _negatedUsedFormats.
      // Make sure that this call this after the _quillObserver is set.
      quill.setContents(type.toDelta(), this);
      // init remote cursors
      if (quillCursors !== null && awareness) {
        awareness.getStates().forEach((aw, clientId) => {
          updateCursor(quillCursors, aw, clientId, doc, type);
        });
        awareness.on('change', this._awarenessChange);
      }
    }
    destroy () {
      this.type.unobserve(this._typeObserver);
      this.quill.off('editor-change', this._quillObserver);
      if (this.awareness) {
        this.awareness.off('change', this._awarenessChange);
      }
    }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  /*!
   * Quill Editor v1.3.7
   * https://quilljs.com/
   * Copyright (c) 2014, Jason Chen
   * Copyright (c) 2013, salesforce.com
   */

  var quill$1 = createCommonjsModule(function (module, exports) {
  (function webpackUniversalModuleDefinition(root, factory) {
  	module.exports = factory();
  })(typeof self !== 'undefined' ? self : commonjsGlobal, function() {
  return /******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  /******/
  /******/ 		// Check if module is in cache
  /******/ 		if(installedModules[moduleId]) {
  /******/ 			return installedModules[moduleId].exports;
  /******/ 		}
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = installedModules[moduleId] = {
  /******/ 			i: moduleId,
  /******/ 			l: false,
  /******/ 			exports: {}
  /******/ 		};
  /******/
  /******/ 		// Execute the module function
  /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  /******/
  /******/ 		// Flag the module as loaded
  /******/ 		module.l = true;
  /******/
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/
  /******/
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  /******/
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  /******/
  /******/ 	// define getter function for harmony exports
  /******/ 	__webpack_require__.d = function(exports, name, getter) {
  /******/ 		if(!__webpack_require__.o(exports, name)) {
  /******/ 			Object.defineProperty(exports, name, {
  /******/ 				configurable: false,
  /******/ 				enumerable: true,
  /******/ 				get: getter
  /******/ 			});
  /******/ 		}
  /******/ 	};
  /******/
  /******/ 	// getDefaultExport function for compatibility with non-harmony modules
  /******/ 	__webpack_require__.n = function(module) {
  /******/ 		var getter = module && module.__esModule ?
  /******/ 			function getDefault() { return module['default']; } :
  /******/ 			function getModuleExports() { return module; };
  /******/ 		__webpack_require__.d(getter, 'a', getter);
  /******/ 		return getter;
  /******/ 	};
  /******/
  /******/ 	// Object.prototype.hasOwnProperty.call
  /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  /******/
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  /******/
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(__webpack_require__.s = 109);
  /******/ })
  /************************************************************************/
  /******/ ([
  /* 0 */
  /***/ (function(module, exports, __webpack_require__) {

  Object.defineProperty(exports, "__esModule", { value: true });
  var container_1 = __webpack_require__(17);
  var format_1 = __webpack_require__(18);
  var leaf_1 = __webpack_require__(19);
  var scroll_1 = __webpack_require__(45);
  var inline_1 = __webpack_require__(46);
  var block_1 = __webpack_require__(47);
  var embed_1 = __webpack_require__(48);
  var text_1 = __webpack_require__(49);
  var attributor_1 = __webpack_require__(12);
  var class_1 = __webpack_require__(32);
  var style_1 = __webpack_require__(33);
  var store_1 = __webpack_require__(31);
  var Registry = __webpack_require__(1);
  var Parchment = {
      Scope: Registry.Scope,
      create: Registry.create,
      find: Registry.find,
      query: Registry.query,
      register: Registry.register,
      Container: container_1.default,
      Format: format_1.default,
      Leaf: leaf_1.default,
      Embed: embed_1.default,
      Scroll: scroll_1.default,
      Block: block_1.default,
      Inline: inline_1.default,
      Text: text_1.default,
      Attributor: {
          Attribute: attributor_1.default,
          Class: class_1.default,
          Style: style_1.default,
          Store: store_1.default,
      },
  };
  exports.default = Parchment;


  /***/ }),
  /* 1 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var ParchmentError = /** @class */ (function (_super) {
      __extends(ParchmentError, _super);
      function ParchmentError(message) {
          var _this = this;
          message = '[Parchment] ' + message;
          _this = _super.call(this, message) || this;
          _this.message = message;
          _this.name = _this.constructor.name;
          return _this;
      }
      return ParchmentError;
  }(Error));
  exports.ParchmentError = ParchmentError;
  var attributes = {};
  var classes = {};
  var tags = {};
  var types = {};
  exports.DATA_KEY = '__blot';
  var Scope;
  (function (Scope) {
      Scope[Scope["TYPE"] = 3] = "TYPE";
      Scope[Scope["LEVEL"] = 12] = "LEVEL";
      Scope[Scope["ATTRIBUTE"] = 13] = "ATTRIBUTE";
      Scope[Scope["BLOT"] = 14] = "BLOT";
      Scope[Scope["INLINE"] = 7] = "INLINE";
      Scope[Scope["BLOCK"] = 11] = "BLOCK";
      Scope[Scope["BLOCK_BLOT"] = 10] = "BLOCK_BLOT";
      Scope[Scope["INLINE_BLOT"] = 6] = "INLINE_BLOT";
      Scope[Scope["BLOCK_ATTRIBUTE"] = 9] = "BLOCK_ATTRIBUTE";
      Scope[Scope["INLINE_ATTRIBUTE"] = 5] = "INLINE_ATTRIBUTE";
      Scope[Scope["ANY"] = 15] = "ANY";
  })(Scope = exports.Scope || (exports.Scope = {}));
  function create(input, value) {
      var match = query(input);
      if (match == null) {
          throw new ParchmentError("Unable to create " + input + " blot");
      }
      var BlotClass = match;
      var node = 
      // @ts-ignore
      input instanceof Node || input['nodeType'] === Node.TEXT_NODE ? input : BlotClass.create(value);
      return new BlotClass(node, value);
  }
  exports.create = create;
  function find(node, bubble) {
      if (bubble === void 0) { bubble = false; }
      if (node == null)
          return null;
      // @ts-ignore
      if (node[exports.DATA_KEY] != null)
          return node[exports.DATA_KEY].blot;
      if (bubble)
          return find(node.parentNode, bubble);
      return null;
  }
  exports.find = find;
  function query(query, scope) {
      if (scope === void 0) { scope = Scope.ANY; }
      var match;
      if (typeof query === 'string') {
          match = types[query] || attributes[query];
          // @ts-ignore
      }
      else if (query instanceof Text || query['nodeType'] === Node.TEXT_NODE) {
          match = types['text'];
      }
      else if (typeof query === 'number') {
          if (query & Scope.LEVEL & Scope.BLOCK) {
              match = types['block'];
          }
          else if (query & Scope.LEVEL & Scope.INLINE) {
              match = types['inline'];
          }
      }
      else if (query instanceof HTMLElement) {
          var names = (query.getAttribute('class') || '').split(/\s+/);
          for (var i in names) {
              match = classes[names[i]];
              if (match)
                  break;
          }
          match = match || tags[query.tagName];
      }
      if (match == null)
          return null;
      // @ts-ignore
      if (scope & Scope.LEVEL & match.scope && scope & Scope.TYPE & match.scope)
          return match;
      return null;
  }
  exports.query = query;
  function register() {
      var Definitions = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          Definitions[_i] = arguments[_i];
      }
      if (Definitions.length > 1) {
          return Definitions.map(function (d) {
              return register(d);
          });
      }
      var Definition = Definitions[0];
      if (typeof Definition.blotName !== 'string' && typeof Definition.attrName !== 'string') {
          throw new ParchmentError('Invalid definition');
      }
      else if (Definition.blotName === 'abstract') {
          throw new ParchmentError('Cannot register abstract class');
      }
      types[Definition.blotName || Definition.attrName] = Definition;
      if (typeof Definition.keyName === 'string') {
          attributes[Definition.keyName] = Definition;
      }
      else {
          if (Definition.className != null) {
              classes[Definition.className] = Definition;
          }
          if (Definition.tagName != null) {
              if (Array.isArray(Definition.tagName)) {
                  Definition.tagName = Definition.tagName.map(function (tagName) {
                      return tagName.toUpperCase();
                  });
              }
              else {
                  Definition.tagName = Definition.tagName.toUpperCase();
              }
              var tagNames = Array.isArray(Definition.tagName) ? Definition.tagName : [Definition.tagName];
              tagNames.forEach(function (tag) {
                  if (tags[tag] == null || Definition.className == null) {
                      tags[tag] = Definition;
                  }
              });
          }
      }
      return Definition;
  }
  exports.register = register;


  /***/ }),
  /* 2 */
  /***/ (function(module, exports, __webpack_require__) {

  var diff = __webpack_require__(51);
  var equal = __webpack_require__(11);
  var extend = __webpack_require__(3);
  var op = __webpack_require__(20);


  var NULL_CHARACTER = String.fromCharCode(0);  // Placeholder char for embed in diff()


  var Delta = function (ops) {
    // Assume we are given a well formed ops
    if (Array.isArray(ops)) {
      this.ops = ops;
    } else if (ops != null && Array.isArray(ops.ops)) {
      this.ops = ops.ops;
    } else {
      this.ops = [];
    }
  };


  Delta.prototype.insert = function (text, attributes) {
    var newOp = {};
    if (text.length === 0) return this;
    newOp.insert = text;
    if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  };

  Delta.prototype['delete'] = function (length) {
    if (length <= 0) return this;
    return this.push({ 'delete': length });
  };

  Delta.prototype.retain = function (length, attributes) {
    if (length <= 0) return this;
    var newOp = { retain: length };
    if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  };

  Delta.prototype.push = function (newOp) {
    var index = this.ops.length;
    var lastOp = this.ops[index - 1];
    newOp = extend(true, {}, newOp);
    if (typeof lastOp === 'object') {
      if (typeof newOp['delete'] === 'number' && typeof lastOp['delete'] === 'number') {
        this.ops[index - 1] = { 'delete': lastOp['delete'] + newOp['delete'] };
        return this;
      }
      // Since it does not matter if we insert before or after deleting at the same index,
      // always prefer to insert first
      if (typeof lastOp['delete'] === 'number' && newOp.insert != null) {
        index -= 1;
        lastOp = this.ops[index - 1];
        if (typeof lastOp !== 'object') {
          this.ops.unshift(newOp);
          return this;
        }
      }
      if (equal(newOp.attributes, lastOp.attributes)) {
        if (typeof newOp.insert === 'string' && typeof lastOp.insert === 'string') {
          this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
          if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
          return this;
        } else if (typeof newOp.retain === 'number' && typeof lastOp.retain === 'number') {
          this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
          if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
          return this;
        }
      }
    }
    if (index === this.ops.length) {
      this.ops.push(newOp);
    } else {
      this.ops.splice(index, 0, newOp);
    }
    return this;
  };

  Delta.prototype.chop = function () {
    var lastOp = this.ops[this.ops.length - 1];
    if (lastOp && lastOp.retain && !lastOp.attributes) {
      this.ops.pop();
    }
    return this;
  };

  Delta.prototype.filter = function (predicate) {
    return this.ops.filter(predicate);
  };

  Delta.prototype.forEach = function (predicate) {
    this.ops.forEach(predicate);
  };

  Delta.prototype.map = function (predicate) {
    return this.ops.map(predicate);
  };

  Delta.prototype.partition = function (predicate) {
    var passed = [], failed = [];
    this.forEach(function(op) {
      var target = predicate(op) ? passed : failed;
      target.push(op);
    });
    return [passed, failed];
  };

  Delta.prototype.reduce = function (predicate, initial) {
    return this.ops.reduce(predicate, initial);
  };

  Delta.prototype.changeLength = function () {
    return this.reduce(function (length, elem) {
      if (elem.insert) {
        return length + op.length(elem);
      } else if (elem.delete) {
        return length - elem.delete;
      }
      return length;
    }, 0);
  };

  Delta.prototype.length = function () {
    return this.reduce(function (length, elem) {
      return length + op.length(elem);
    }, 0);
  };

  Delta.prototype.slice = function (start, end) {
    start = start || 0;
    if (typeof end !== 'number') end = Infinity;
    var ops = [];
    var iter = op.iterator(this.ops);
    var index = 0;
    while (index < end && iter.hasNext()) {
      var nextOp;
      if (index < start) {
        nextOp = iter.next(start - index);
      } else {
        nextOp = iter.next(end - index);
        ops.push(nextOp);
      }
      index += op.length(nextOp);
    }
    return new Delta(ops);
  };


  Delta.prototype.compose = function (other) {
    var thisIter = op.iterator(this.ops);
    var otherIter = op.iterator(other.ops);
    var ops = [];
    var firstOther = otherIter.peek();
    if (firstOther != null && typeof firstOther.retain === 'number' && firstOther.attributes == null) {
      var firstLeft = firstOther.retain;
      while (thisIter.peekType() === 'insert' && thisIter.peekLength() <= firstLeft) {
        firstLeft -= thisIter.peekLength();
        ops.push(thisIter.next());
      }
      if (firstOther.retain - firstLeft > 0) {
        otherIter.next(firstOther.retain - firstLeft);
      }
    }
    var delta = new Delta(ops);
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (otherIter.peekType() === 'insert') {
        delta.push(otherIter.next());
      } else if (thisIter.peekType() === 'delete') {
        delta.push(thisIter.next());
      } else {
        var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        var thisOp = thisIter.next(length);
        var otherOp = otherIter.next(length);
        if (typeof otherOp.retain === 'number') {
          var newOp = {};
          if (typeof thisOp.retain === 'number') {
            newOp.retain = length;
          } else {
            newOp.insert = thisOp.insert;
          }
          // Preserve null when composing with a retain, otherwise remove it for inserts
          var attributes = op.attributes.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === 'number');
          if (attributes) newOp.attributes = attributes;
          delta.push(newOp);

          // Optimization if rest of other is just retain
          if (!otherIter.hasNext() && equal(delta.ops[delta.ops.length - 1], newOp)) {
            var rest = new Delta(thisIter.rest());
            return delta.concat(rest).chop();
          }

        // Other op should be delete, we could be an insert or retain
        // Insert + delete cancels out
        } else if (typeof otherOp['delete'] === 'number' && typeof thisOp.retain === 'number') {
          delta.push(otherOp);
        }
      }
    }
    return delta.chop();
  };

  Delta.prototype.concat = function (other) {
    var delta = new Delta(this.ops.slice());
    if (other.ops.length > 0) {
      delta.push(other.ops[0]);
      delta.ops = delta.ops.concat(other.ops.slice(1));
    }
    return delta;
  };

  Delta.prototype.diff = function (other, index) {
    if (this.ops === other.ops) {
      return new Delta();
    }
    var strings = [this, other].map(function (delta) {
      return delta.map(function (op) {
        if (op.insert != null) {
          return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
        }
        var prep = (delta === other) ? 'on' : 'with';
        throw new Error('diff() called ' + prep + ' non-document');
      }).join('');
    });
    var delta = new Delta();
    var diffResult = diff(strings[0], strings[1], index);
    var thisIter = op.iterator(this.ops);
    var otherIter = op.iterator(other.ops);
    diffResult.forEach(function (component) {
      var length = component[1].length;
      while (length > 0) {
        var opLength = 0;
        switch (component[0]) {
          case diff.INSERT:
            opLength = Math.min(otherIter.peekLength(), length);
            delta.push(otherIter.next(opLength));
            break;
          case diff.DELETE:
            opLength = Math.min(length, thisIter.peekLength());
            thisIter.next(opLength);
            delta['delete'](opLength);
            break;
          case diff.EQUAL:
            opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
            var thisOp = thisIter.next(opLength);
            var otherOp = otherIter.next(opLength);
            if (equal(thisOp.insert, otherOp.insert)) {
              delta.retain(opLength, op.attributes.diff(thisOp.attributes, otherOp.attributes));
            } else {
              delta.push(otherOp)['delete'](opLength);
            }
            break;
        }
        length -= opLength;
      }
    });
    return delta.chop();
  };

  Delta.prototype.eachLine = function (predicate, newline) {
    newline = newline || '\n';
    var iter = op.iterator(this.ops);
    var line = new Delta();
    var i = 0;
    while (iter.hasNext()) {
      if (iter.peekType() !== 'insert') return;
      var thisOp = iter.peek();
      var start = op.length(thisOp) - iter.peekLength();
      var index = typeof thisOp.insert === 'string' ?
        thisOp.insert.indexOf(newline, start) - start : -1;
      if (index < 0) {
        line.push(iter.next());
      } else if (index > 0) {
        line.push(iter.next(index));
      } else {
        if (predicate(line, iter.next(1).attributes || {}, i) === false) {
          return;
        }
        i += 1;
        line = new Delta();
      }
    }
    if (line.length() > 0) {
      predicate(line, {}, i);
    }
  };

  Delta.prototype.transform = function (other, priority) {
    priority = !!priority;
    if (typeof other === 'number') {
      return this.transformPosition(other, priority);
    }
    var thisIter = op.iterator(this.ops);
    var otherIter = op.iterator(other.ops);
    var delta = new Delta();
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
        delta.retain(op.length(thisIter.next()));
      } else if (otherIter.peekType() === 'insert') {
        delta.push(otherIter.next());
      } else {
        var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        var thisOp = thisIter.next(length);
        var otherOp = otherIter.next(length);
        if (thisOp['delete']) {
          // Our delete either makes their delete redundant or removes their retain
          continue;
        } else if (otherOp['delete']) {
          delta.push(otherOp);
        } else {
          // We retain either their retain or insert
          delta.retain(length, op.attributes.transform(thisOp.attributes, otherOp.attributes, priority));
        }
      }
    }
    return delta.chop();
  };

  Delta.prototype.transformPosition = function (index, priority) {
    priority = !!priority;
    var thisIter = op.iterator(this.ops);
    var offset = 0;
    while (thisIter.hasNext() && offset <= index) {
      var length = thisIter.peekLength();
      var nextType = thisIter.peekType();
      thisIter.next();
      if (nextType === 'delete') {
        index -= Math.min(length, index - offset);
        continue;
      } else if (nextType === 'insert' && (offset < index || !priority)) {
        index += length;
      }
      offset += length;
    }
    return index;
  };


  module.exports = Delta;


  /***/ }),
  /* 3 */
  /***/ (function(module, exports) {

  var hasOwn = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var defineProperty = Object.defineProperty;
  var gOPD = Object.getOwnPropertyDescriptor;

  var isArray = function isArray(arr) {
  	if (typeof Array.isArray === 'function') {
  		return Array.isArray(arr);
  	}

  	return toStr.call(arr) === '[object Array]';
  };

  var isPlainObject = function isPlainObject(obj) {
  	if (!obj || toStr.call(obj) !== '[object Object]') {
  		return false;
  	}

  	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  	// Not own constructor property must be Object
  	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
  		return false;
  	}

  	// Own properties are enumerated firstly, so to speed up,
  	// if last one is own, then all properties are own.
  	var key;
  	for (key in obj) { /**/ }

  	return typeof key === 'undefined' || hasOwn.call(obj, key);
  };

  // If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
  var setProperty = function setProperty(target, options) {
  	if (defineProperty && options.name === '__proto__') {
  		defineProperty(target, options.name, {
  			enumerable: true,
  			configurable: true,
  			value: options.newValue,
  			writable: true
  		});
  	} else {
  		target[options.name] = options.newValue;
  	}
  };

  // Return undefined instead of __proto__ if '__proto__' is not an own property
  var getProperty = function getProperty(obj, name) {
  	if (name === '__proto__') {
  		if (!hasOwn.call(obj, name)) {
  			return void 0;
  		} else if (gOPD) {
  			// In early versions of node, obj['__proto__'] is buggy when obj has
  			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
  			return gOPD(obj, name).value;
  		}
  	}

  	return obj[name];
  };

  module.exports = function extend() {
  	var options, name, src, copy, copyIsArray, clone;
  	var target = arguments[0];
  	var i = 1;
  	var length = arguments.length;
  	var deep = false;

  	// Handle a deep copy situation
  	if (typeof target === 'boolean') {
  		deep = target;
  		target = arguments[1] || {};
  		// skip the boolean and the target
  		i = 2;
  	}
  	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
  		target = {};
  	}

  	for (; i < length; ++i) {
  		options = arguments[i];
  		// Only deal with non-null/undefined values
  		if (options != null) {
  			// Extend the base object
  			for (name in options) {
  				src = getProperty(target, name);
  				copy = getProperty(options, name);

  				// Prevent never-ending loop
  				if (target !== copy) {
  					// Recurse if we're merging plain objects or arrays
  					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
  						if (copyIsArray) {
  							copyIsArray = false;
  							clone = src && isArray(src) ? src : [];
  						} else {
  							clone = src && isPlainObject(src) ? src : {};
  						}

  						// Never move original objects, clone them
  						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

  					// Don't bring in undefined values
  					} else if (typeof copy !== 'undefined') {
  						setProperty(target, { name: name, newValue: copy });
  					}
  				}
  			}
  		}
  	}

  	// Return the modified object
  	return target;
  };


  /***/ }),
  /* 4 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.BlockEmbed = exports.bubbleFormats = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _break = __webpack_require__(16);

  var _break2 = _interopRequireDefault(_break);

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  var _text = __webpack_require__(7);

  var _text2 = _interopRequireDefault(_text);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var NEWLINE_LENGTH = 1;

  var BlockEmbed = function (_Parchment$Embed) {
    _inherits(BlockEmbed, _Parchment$Embed);

    function BlockEmbed() {
      _classCallCheck(this, BlockEmbed);

      return _possibleConstructorReturn(this, (BlockEmbed.__proto__ || Object.getPrototypeOf(BlockEmbed)).apply(this, arguments));
    }

    _createClass(BlockEmbed, [{
      key: 'attach',
      value: function attach() {
        _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'attach', this).call(this);
        this.attributes = new _parchment2.default.Attributor.Store(this.domNode);
      }
    }, {
      key: 'delta',
      value: function delta() {
        return new _quillDelta2.default().insert(this.value(), (0, _extend2.default)(this.formats(), this.attributes.values()));
      }
    }, {
      key: 'format',
      value: function format(name, value) {
        var attribute = _parchment2.default.query(name, _parchment2.default.Scope.BLOCK_ATTRIBUTE);
        if (attribute != null) {
          this.attributes.attribute(attribute, value);
        }
      }
    }, {
      key: 'formatAt',
      value: function formatAt(index, length, name, value) {
        this.format(name, value);
      }
    }, {
      key: 'insertAt',
      value: function insertAt(index, value, def) {
        if (typeof value === 'string' && value.endsWith('\n')) {
          var block = _parchment2.default.create(Block.blotName);
          this.parent.insertBefore(block, index === 0 ? this : this.next);
          block.insertAt(0, value.slice(0, -1));
        } else {
          _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'insertAt', this).call(this, index, value, def);
        }
      }
    }]);

    return BlockEmbed;
  }(_parchment2.default.Embed);

  BlockEmbed.scope = _parchment2.default.Scope.BLOCK_BLOT;
  // It is important for cursor behavior BlockEmbeds use tags that are block level elements


  var Block = function (_Parchment$Block) {
    _inherits(Block, _Parchment$Block);

    function Block(domNode) {
      _classCallCheck(this, Block);

      var _this2 = _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this, domNode));

      _this2.cache = {};
      return _this2;
    }

    _createClass(Block, [{
      key: 'delta',
      value: function delta() {
        if (this.cache.delta == null) {
          this.cache.delta = this.descendants(_parchment2.default.Leaf).reduce(function (delta, leaf) {
            if (leaf.length() === 0) {
              return delta;
            } else {
              return delta.insert(leaf.value(), bubbleFormats(leaf));
            }
          }, new _quillDelta2.default()).insert('\n', bubbleFormats(this));
        }
        return this.cache.delta;
      }
    }, {
      key: 'deleteAt',
      value: function deleteAt(index, length) {
        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'deleteAt', this).call(this, index, length);
        this.cache = {};
      }
    }, {
      key: 'formatAt',
      value: function formatAt(index, length, name, value) {
        if (length <= 0) return;
        if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
          if (index + length === this.length()) {
            this.format(name, value);
          }
        } else {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'formatAt', this).call(this, index, Math.min(length, this.length() - index - 1), name, value);
        }
        this.cache = {};
      }
    }, {
      key: 'insertAt',
      value: function insertAt(index, value, def) {
        if (def != null) return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, index, value, def);
        if (value.length === 0) return;
        var lines = value.split('\n');
        var text = lines.shift();
        if (text.length > 0) {
          if (index < this.length() - 1 || this.children.tail == null) {
            _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, Math.min(index, this.length() - 1), text);
          } else {
            this.children.tail.insertAt(this.children.tail.length(), text);
          }
          this.cache = {};
        }
        var block = this;
        lines.reduce(function (index, line) {
          block = block.split(index, true);
          block.insertAt(0, line);
          return line.length;
        }, index + text.length);
      }
    }, {
      key: 'insertBefore',
      value: function insertBefore(blot, ref) {
        var head = this.children.head;
        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertBefore', this).call(this, blot, ref);
        if (head instanceof _break2.default) {
          head.remove();
        }
        this.cache = {};
      }
    }, {
      key: 'length',
      value: function length() {
        if (this.cache.length == null) {
          this.cache.length = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'length', this).call(this) + NEWLINE_LENGTH;
        }
        return this.cache.length;
      }
    }, {
      key: 'moveChildren',
      value: function moveChildren(target, ref) {
        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'moveChildren', this).call(this, target, ref);
        this.cache = {};
      }
    }, {
      key: 'optimize',
      value: function optimize(context) {
        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'optimize', this).call(this, context);
        this.cache = {};
      }
    }, {
      key: 'path',
      value: function path(index) {
        return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'path', this).call(this, index, true);
      }
    }, {
      key: 'removeChild',
      value: function removeChild(child) {
        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'removeChild', this).call(this, child);
        this.cache = {};
      }
    }, {
      key: 'split',
      value: function split(index) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (force && (index === 0 || index >= this.length() - NEWLINE_LENGTH)) {
          var clone = this.clone();
          if (index === 0) {
            this.parent.insertBefore(clone, this);
            return this;
          } else {
            this.parent.insertBefore(clone, this.next);
            return clone;
          }
        } else {
          var next = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'split', this).call(this, index, force);
          this.cache = {};
          return next;
        }
      }
    }]);

    return Block;
  }(_parchment2.default.Block);

  Block.blotName = 'block';
  Block.tagName = 'P';
  Block.defaultChild = 'break';
  Block.allowedChildren = [_inline2.default, _parchment2.default.Embed, _text2.default];

  function bubbleFormats(blot) {
    var formats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (blot == null) return formats;
    if (typeof blot.formats === 'function') {
      formats = (0, _extend2.default)(formats, blot.formats());
    }
    if (blot.parent == null || blot.parent.blotName == 'scroll' || blot.parent.statics.scope !== blot.statics.scope) {
      return formats;
    }
    return bubbleFormats(blot.parent, formats);
  }

  exports.bubbleFormats = bubbleFormats;
  exports.BlockEmbed = BlockEmbed;
  exports.default = Block;

  /***/ }),
  /* 5 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.overload = exports.expandConfig = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  __webpack_require__(50);

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _editor = __webpack_require__(14);

  var _editor2 = _interopRequireDefault(_editor);

  var _emitter3 = __webpack_require__(8);

  var _emitter4 = _interopRequireDefault(_emitter3);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _selection = __webpack_require__(15);

  var _selection2 = _interopRequireDefault(_selection);

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  var _logger = __webpack_require__(10);

  var _logger2 = _interopRequireDefault(_logger);

  var _theme = __webpack_require__(34);

  var _theme2 = _interopRequireDefault(_theme);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var debug = (0, _logger2.default)('quill');

  var Quill = function () {
    _createClass(Quill, null, [{
      key: 'debug',
      value: function debug(limit) {
        if (limit === true) {
          limit = 'log';
        }
        _logger2.default.level(limit);
      }
    }, {
      key: 'find',
      value: function find(node) {
        return node.__quill || _parchment2.default.find(node);
      }
    }, {
      key: 'import',
      value: function _import(name) {
        if (this.imports[name] == null) {
          debug.error('Cannot import ' + name + '. Are you sure it was registered?');
        }
        return this.imports[name];
      }
    }, {
      key: 'register',
      value: function register(path, target) {
        var _this = this;

        var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (typeof path !== 'string') {
          var name = path.attrName || path.blotName;
          if (typeof name === 'string') {
            // register(Blot | Attributor, overwrite)
            this.register('formats/' + name, path, target);
          } else {
            Object.keys(path).forEach(function (key) {
              _this.register(key, path[key], target);
            });
          }
        } else {
          if (this.imports[path] != null && !overwrite) {
            debug.warn('Overwriting ' + path + ' with', target);
          }
          this.imports[path] = target;
          if ((path.startsWith('blots/') || path.startsWith('formats/')) && target.blotName !== 'abstract') {
            _parchment2.default.register(target);
          } else if (path.startsWith('modules') && typeof target.register === 'function') {
            target.register();
          }
        }
      }
    }]);

    function Quill(container) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Quill);

      this.options = expandConfig(container, options);
      this.container = this.options.container;
      if (this.container == null) {
        return debug.error('Invalid Quill container', container);
      }
      if (this.options.debug) {
        Quill.debug(this.options.debug);
      }
      var html = this.container.innerHTML.trim();
      this.container.classList.add('ql-container');
      this.container.innerHTML = '';
      this.container.__quill = this;
      this.root = this.addContainer('ql-editor');
      this.root.classList.add('ql-blank');
      this.root.setAttribute('data-gramm', false);
      this.scrollingContainer = this.options.scrollingContainer || this.root;
      this.emitter = new _emitter4.default();
      this.scroll = _parchment2.default.create(this.root, {
        emitter: this.emitter,
        whitelist: this.options.formats
      });
      this.editor = new _editor2.default(this.scroll);
      this.selection = new _selection2.default(this.scroll, this.emitter);
      this.theme = new this.options.theme(this, this.options);
      this.keyboard = this.theme.addModule('keyboard');
      this.clipboard = this.theme.addModule('clipboard');
      this.history = this.theme.addModule('history');
      this.theme.init();
      this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type) {
        if (type === _emitter4.default.events.TEXT_CHANGE) {
          _this2.root.classList.toggle('ql-blank', _this2.editor.isBlank());
        }
      });
      this.emitter.on(_emitter4.default.events.SCROLL_UPDATE, function (source, mutations) {
        var range = _this2.selection.lastRange;
        var index = range && range.length === 0 ? range.index : undefined;
        modify.call(_this2, function () {
          return _this2.editor.update(null, mutations, index);
        }, source);
      });
      var contents = this.clipboard.convert('<div class=\'ql-editor\' style="white-space: normal;">' + html + '<p><br></p></div>');
      this.setContents(contents);
      this.history.clear();
      if (this.options.placeholder) {
        this.root.setAttribute('data-placeholder', this.options.placeholder);
      }
      if (this.options.readOnly) {
        this.disable();
      }
    }

    _createClass(Quill, [{
      key: 'addContainer',
      value: function addContainer(container) {
        var refNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (typeof container === 'string') {
          var className = container;
          container = document.createElement('div');
          container.classList.add(className);
        }
        this.container.insertBefore(container, refNode);
        return container;
      }
    }, {
      key: 'blur',
      value: function blur() {
        this.selection.setRange(null);
      }
    }, {
      key: 'deleteText',
      value: function deleteText(index, length, source) {
        var _this3 = this;

        var _overload = overload(index, length, source);

        var _overload2 = _slicedToArray(_overload, 4);

        index = _overload2[0];
        length = _overload2[1];
        source = _overload2[3];

        return modify.call(this, function () {
          return _this3.editor.deleteText(index, length);
        }, source, index, -1 * length);
      }
    }, {
      key: 'disable',
      value: function disable() {
        this.enable(false);
      }
    }, {
      key: 'enable',
      value: function enable() {
        var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.scroll.enable(enabled);
        this.container.classList.toggle('ql-disabled', !enabled);
      }
    }, {
      key: 'focus',
      value: function focus() {
        var scrollTop = this.scrollingContainer.scrollTop;
        this.selection.focus();
        this.scrollingContainer.scrollTop = scrollTop;
        this.scrollIntoView();
      }
    }, {
      key: 'format',
      value: function format(name, value) {
        var _this4 = this;

        var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

        return modify.call(this, function () {
          var range = _this4.getSelection(true);
          var change = new _quillDelta2.default();
          if (range == null) {
            return change;
          } else if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
            change = _this4.editor.formatLine(range.index, range.length, _defineProperty({}, name, value));
          } else if (range.length === 0) {
            _this4.selection.format(name, value);
            return change;
          } else {
            change = _this4.editor.formatText(range.index, range.length, _defineProperty({}, name, value));
          }
          _this4.setSelection(range, _emitter4.default.sources.SILENT);
          return change;
        }, source);
      }
    }, {
      key: 'formatLine',
      value: function formatLine(index, length, name, value, source) {
        var _this5 = this;

        var formats = void 0;

        var _overload3 = overload(index, length, name, value, source);

        var _overload4 = _slicedToArray(_overload3, 4);

        index = _overload4[0];
        length = _overload4[1];
        formats = _overload4[2];
        source = _overload4[3];

        return modify.call(this, function () {
          return _this5.editor.formatLine(index, length, formats);
        }, source, index, 0);
      }
    }, {
      key: 'formatText',
      value: function formatText(index, length, name, value, source) {
        var _this6 = this;

        var formats = void 0;

        var _overload5 = overload(index, length, name, value, source);

        var _overload6 = _slicedToArray(_overload5, 4);

        index = _overload6[0];
        length = _overload6[1];
        formats = _overload6[2];
        source = _overload6[3];

        return modify.call(this, function () {
          return _this6.editor.formatText(index, length, formats);
        }, source, index, 0);
      }
    }, {
      key: 'getBounds',
      value: function getBounds(index) {
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var bounds = void 0;
        if (typeof index === 'number') {
          bounds = this.selection.getBounds(index, length);
        } else {
          bounds = this.selection.getBounds(index.index, index.length);
        }
        var containerBounds = this.container.getBoundingClientRect();
        return {
          bottom: bounds.bottom - containerBounds.top,
          height: bounds.height,
          left: bounds.left - containerBounds.left,
          right: bounds.right - containerBounds.left,
          top: bounds.top - containerBounds.top,
          width: bounds.width
        };
      }
    }, {
      key: 'getContents',
      value: function getContents() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

        var _overload7 = overload(index, length);

        var _overload8 = _slicedToArray(_overload7, 2);

        index = _overload8[0];
        length = _overload8[1];

        return this.editor.getContents(index, length);
      }
    }, {
      key: 'getFormat',
      value: function getFormat() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getSelection(true);
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        if (typeof index === 'number') {
          return this.editor.getFormat(index, length);
        } else {
          return this.editor.getFormat(index.index, index.length);
        }
      }
    }, {
      key: 'getIndex',
      value: function getIndex(blot) {
        return blot.offset(this.scroll);
      }
    }, {
      key: 'getLength',
      value: function getLength() {
        return this.scroll.length();
      }
    }, {
      key: 'getLeaf',
      value: function getLeaf(index) {
        return this.scroll.leaf(index);
      }
    }, {
      key: 'getLine',
      value: function getLine(index) {
        return this.scroll.line(index);
      }
    }, {
      key: 'getLines',
      value: function getLines() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

        if (typeof index !== 'number') {
          return this.scroll.lines(index.index, index.length);
        } else {
          return this.scroll.lines(index, length);
        }
      }
    }, {
      key: 'getModule',
      value: function getModule(name) {
        return this.theme.modules[name];
      }
    }, {
      key: 'getSelection',
      value: function getSelection() {
        var focus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (focus) this.focus();
        this.update(); // Make sure we access getRange with editor in consistent state
        return this.selection.getRange()[0];
      }
    }, {
      key: 'getText',
      value: function getText() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

        var _overload9 = overload(index, length);

        var _overload10 = _slicedToArray(_overload9, 2);

        index = _overload10[0];
        length = _overload10[1];

        return this.editor.getText(index, length);
      }
    }, {
      key: 'hasFocus',
      value: function hasFocus() {
        return this.selection.hasFocus();
      }
    }, {
      key: 'insertEmbed',
      value: function insertEmbed(index, embed, value) {
        var _this7 = this;

        var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Quill.sources.API;

        return modify.call(this, function () {
          return _this7.editor.insertEmbed(index, embed, value);
        }, source, index);
      }
    }, {
      key: 'insertText',
      value: function insertText(index, text, name, value, source) {
        var _this8 = this;

        var formats = void 0;

        var _overload11 = overload(index, 0, name, value, source);

        var _overload12 = _slicedToArray(_overload11, 4);

        index = _overload12[0];
        formats = _overload12[2];
        source = _overload12[3];

        return modify.call(this, function () {
          return _this8.editor.insertText(index, text, formats);
        }, source, index, text.length);
      }
    }, {
      key: 'isEnabled',
      value: function isEnabled() {
        return !this.container.classList.contains('ql-disabled');
      }
    }, {
      key: 'off',
      value: function off() {
        return this.emitter.off.apply(this.emitter, arguments);
      }
    }, {
      key: 'on',
      value: function on() {
        return this.emitter.on.apply(this.emitter, arguments);
      }
    }, {
      key: 'once',
      value: function once() {
        return this.emitter.once.apply(this.emitter, arguments);
      }
    }, {
      key: 'pasteHTML',
      value: function pasteHTML(index, html, source) {
        this.clipboard.dangerouslyPasteHTML(index, html, source);
      }
    }, {
      key: 'removeFormat',
      value: function removeFormat(index, length, source) {
        var _this9 = this;

        var _overload13 = overload(index, length, source);

        var _overload14 = _slicedToArray(_overload13, 4);

        index = _overload14[0];
        length = _overload14[1];
        source = _overload14[3];

        return modify.call(this, function () {
          return _this9.editor.removeFormat(index, length);
        }, source, index);
      }
    }, {
      key: 'scrollIntoView',
      value: function scrollIntoView() {
        this.selection.scrollIntoView(this.scrollingContainer);
      }
    }, {
      key: 'setContents',
      value: function setContents(delta) {
        var _this10 = this;

        var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

        return modify.call(this, function () {
          delta = new _quillDelta2.default(delta);
          var length = _this10.getLength();
          var deleted = _this10.editor.deleteText(0, length);
          var applied = _this10.editor.applyDelta(delta);
          var lastOp = applied.ops[applied.ops.length - 1];
          if (lastOp != null && typeof lastOp.insert === 'string' && lastOp.insert[lastOp.insert.length - 1] === '\n') {
            _this10.editor.deleteText(_this10.getLength() - 1, 1);
            applied.delete(1);
          }
          var ret = deleted.compose(applied);
          return ret;
        }, source);
      }
    }, {
      key: 'setSelection',
      value: function setSelection(index, length, source) {
        if (index == null) {
          this.selection.setRange(null, length || Quill.sources.API);
        } else {
          var _overload15 = overload(index, length, source);

          var _overload16 = _slicedToArray(_overload15, 4);

          index = _overload16[0];
          length = _overload16[1];
          source = _overload16[3];

          this.selection.setRange(new _selection.Range(index, length), source);
          if (source !== _emitter4.default.sources.SILENT) {
            this.selection.scrollIntoView(this.scrollingContainer);
          }
        }
      }
    }, {
      key: 'setText',
      value: function setText(text) {
        var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

        var delta = new _quillDelta2.default().insert(text);
        return this.setContents(delta, source);
      }
    }, {
      key: 'update',
      value: function update() {
        var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

        var change = this.scroll.update(source); // Will update selection before selection.update() does if text changes
        this.selection.update(source);
        return change;
      }
    }, {
      key: 'updateContents',
      value: function updateContents(delta) {
        var _this11 = this;

        var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

        return modify.call(this, function () {
          delta = new _quillDelta2.default(delta);
          return _this11.editor.applyDelta(delta, source);
        }, source, true);
      }
    }]);

    return Quill;
  }();

  Quill.DEFAULTS = {
    bounds: null,
    formats: null,
    modules: {},
    placeholder: '',
    readOnly: false,
    scrollingContainer: null,
    strict: true,
    theme: 'default'
  };
  Quill.events = _emitter4.default.events;
  Quill.sources = _emitter4.default.sources;
  // eslint-disable-next-line no-undef
  Quill.version =  "1.3.7";

  Quill.imports = {
    'delta': _quillDelta2.default,
    'parchment': _parchment2.default,
    'core/module': _module2.default,
    'core/theme': _theme2.default
  };

  function expandConfig(container, userConfig) {
    userConfig = (0, _extend2.default)(true, {
      container: container,
      modules: {
        clipboard: true,
        keyboard: true,
        history: true
      }
    }, userConfig);
    if (!userConfig.theme || userConfig.theme === Quill.DEFAULTS.theme) {
      userConfig.theme = _theme2.default;
    } else {
      userConfig.theme = Quill.import('themes/' + userConfig.theme);
      if (userConfig.theme == null) {
        throw new Error('Invalid theme ' + userConfig.theme + '. Did you register it?');
      }
    }
    var themeConfig = (0, _extend2.default)(true, {}, userConfig.theme.DEFAULTS);
    [themeConfig, userConfig].forEach(function (config) {
      config.modules = config.modules || {};
      Object.keys(config.modules).forEach(function (module) {
        if (config.modules[module] === true) {
          config.modules[module] = {};
        }
      });
    });
    var moduleNames = Object.keys(themeConfig.modules).concat(Object.keys(userConfig.modules));
    var moduleConfig = moduleNames.reduce(function (config, name) {
      var moduleClass = Quill.import('modules/' + name);
      if (moduleClass == null) {
        debug.error('Cannot load ' + name + ' module. Are you sure you registered it?');
      } else {
        config[name] = moduleClass.DEFAULTS || {};
      }
      return config;
    }, {});
    // Special case toolbar shorthand
    if (userConfig.modules != null && userConfig.modules.toolbar && userConfig.modules.toolbar.constructor !== Object) {
      userConfig.modules.toolbar = {
        container: userConfig.modules.toolbar
      };
    }
    userConfig = (0, _extend2.default)(true, {}, Quill.DEFAULTS, { modules: moduleConfig }, themeConfig, userConfig);
    ['bounds', 'container', 'scrollingContainer'].forEach(function (key) {
      if (typeof userConfig[key] === 'string') {
        userConfig[key] = document.querySelector(userConfig[key]);
      }
    });
    userConfig.modules = Object.keys(userConfig.modules).reduce(function (config, name) {
      if (userConfig.modules[name]) {
        config[name] = userConfig.modules[name];
      }
      return config;
    }, {});
    return userConfig;
  }

  // Handle selection preservation and TEXT_CHANGE emission
  // common to modification APIs
  function modify(modifier, source, index, shift) {
    if (this.options.strict && !this.isEnabled() && source === _emitter4.default.sources.USER) {
      return new _quillDelta2.default();
    }
    var range = index == null ? null : this.getSelection();
    var oldDelta = this.editor.delta;
    var change = modifier();
    if (range != null) {
      if (index === true) index = range.index;
      if (shift == null) {
        range = shiftRange(range, change, source);
      } else if (shift !== 0) {
        range = shiftRange(range, index, shift, source);
      }
      this.setSelection(range, _emitter4.default.sources.SILENT);
    }
    if (change.length() > 0) {
      var _emitter;

      var args = [_emitter4.default.events.TEXT_CHANGE, change, oldDelta, source];
      (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
      if (source !== _emitter4.default.sources.SILENT) {
        var _emitter2;

        (_emitter2 = this.emitter).emit.apply(_emitter2, args);
      }
    }
    return change;
  }

  function overload(index, length, name, value, source) {
    var formats = {};
    if (typeof index.index === 'number' && typeof index.length === 'number') {
      // Allow for throwaway end (used by insertText/insertEmbed)
      if (typeof length !== 'number') {
        source = value, value = name, name = length, length = index.length, index = index.index;
      } else {
        length = index.length, index = index.index;
      }
    } else if (typeof length !== 'number') {
      source = value, value = name, name = length, length = 0;
    }
    // Handle format being object, two format name/value strings or excluded
    if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
      formats = name;
      source = value;
    } else if (typeof name === 'string') {
      if (value != null) {
        formats[name] = value;
      } else {
        source = name;
      }
    }
    // Handle optional source
    source = source || _emitter4.default.sources.API;
    return [index, length, formats, source];
  }

  function shiftRange(range, index, length, source) {
    if (range == null) return null;
    var start = void 0,
        end = void 0;
    if (index instanceof _quillDelta2.default) {
      var _map = [range.index, range.index + range.length].map(function (pos) {
        return index.transformPosition(pos, source !== _emitter4.default.sources.USER);
      });

      var _map2 = _slicedToArray(_map, 2);

      start = _map2[0];
      end = _map2[1];
    } else {
      var _map3 = [range.index, range.index + range.length].map(function (pos) {
        if (pos < index || pos === index && source === _emitter4.default.sources.USER) return pos;
        if (length >= 0) {
          return pos + length;
        } else {
          return Math.max(index, pos + length);
        }
      });

      var _map4 = _slicedToArray(_map3, 2);

      start = _map4[0];
      end = _map4[1];
    }
    return new _selection.Range(start, end - start);
  }

  exports.expandConfig = expandConfig;
  exports.overload = overload;
  exports.default = Quill;

  /***/ }),
  /* 6 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _text = __webpack_require__(7);

  var _text2 = _interopRequireDefault(_text);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Inline = function (_Parchment$Inline) {
    _inherits(Inline, _Parchment$Inline);

    function Inline() {
      _classCallCheck(this, Inline);

      return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
    }

    _createClass(Inline, [{
      key: 'formatAt',
      value: function formatAt(index, length, name, value) {
        if (Inline.compare(this.statics.blotName, name) < 0 && _parchment2.default.query(name, _parchment2.default.Scope.BLOT)) {
          var blot = this.isolate(index, length);
          if (value) {
            blot.wrap(name, value);
          }
        } else {
          _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'formatAt', this).call(this, index, length, name, value);
        }
      }
    }, {
      key: 'optimize',
      value: function optimize(context) {
        _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'optimize', this).call(this, context);
        if (this.parent instanceof Inline && Inline.compare(this.statics.blotName, this.parent.statics.blotName) > 0) {
          var parent = this.parent.isolate(this.offset(), this.length());
          this.moveChildren(parent);
          parent.wrap(this);
        }
      }
    }], [{
      key: 'compare',
      value: function compare(self, other) {
        var selfIndex = Inline.order.indexOf(self);
        var otherIndex = Inline.order.indexOf(other);
        if (selfIndex >= 0 || otherIndex >= 0) {
          return selfIndex - otherIndex;
        } else if (self === other) {
          return 0;
        } else if (self < other) {
          return -1;
        } else {
          return 1;
        }
      }
    }]);

    return Inline;
  }(_parchment2.default.Inline);

  Inline.allowedChildren = [Inline, _parchment2.default.Embed, _text2.default];
  // Lower index means deeper in the DOM tree, since not found (-1) is for embeds
  Inline.order = ['cursor', 'inline', // Must be lower
  'underline', 'strike', 'italic', 'bold', 'script', 'link', 'code' // Must be higher
  ];

  exports.default = Inline;

  /***/ }),
  /* 7 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TextBlot = function (_Parchment$Text) {
    _inherits(TextBlot, _Parchment$Text);

    function TextBlot() {
      _classCallCheck(this, TextBlot);

      return _possibleConstructorReturn(this, (TextBlot.__proto__ || Object.getPrototypeOf(TextBlot)).apply(this, arguments));
    }

    return TextBlot;
  }(_parchment2.default.Text);

  exports.default = TextBlot;

  /***/ }),
  /* 8 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _eventemitter = __webpack_require__(54);

  var _eventemitter2 = _interopRequireDefault(_eventemitter);

  var _logger = __webpack_require__(10);

  var _logger2 = _interopRequireDefault(_logger);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var debug = (0, _logger2.default)('quill:events');

  var EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

  EVENTS.forEach(function (eventName) {
    document.addEventListener(eventName, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      [].slice.call(document.querySelectorAll('.ql-container')).forEach(function (node) {
        // TODO use WeakMap
        if (node.__quill && node.__quill.emitter) {
          var _node$__quill$emitter;

          (_node$__quill$emitter = node.__quill.emitter).handleDOM.apply(_node$__quill$emitter, args);
        }
      });
    });
  });

  var Emitter = function (_EventEmitter) {
    _inherits(Emitter, _EventEmitter);

    function Emitter() {
      _classCallCheck(this, Emitter);

      var _this = _possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

      _this.listeners = {};
      _this.on('error', debug.error);
      return _this;
    }

    _createClass(Emitter, [{
      key: 'emit',
      value: function emit() {
        debug.log.apply(debug, arguments);
        _get(Emitter.prototype.__proto__ || Object.getPrototypeOf(Emitter.prototype), 'emit', this).apply(this, arguments);
      }
    }, {
      key: 'handleDOM',
      value: function handleDOM(event) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        (this.listeners[event.type] || []).forEach(function (_ref) {
          var node = _ref.node,
              handler = _ref.handler;

          if (event.target === node || node.contains(event.target)) {
            handler.apply(undefined, [event].concat(args));
          }
        });
      }
    }, {
      key: 'listenDOM',
      value: function listenDOM(eventName, node, handler) {
        if (!this.listeners[eventName]) {
          this.listeners[eventName] = [];
        }
        this.listeners[eventName].push({ node: node, handler: handler });
      }
    }]);

    return Emitter;
  }(_eventemitter2.default);

  Emitter.events = {
    EDITOR_CHANGE: 'editor-change',
    SCROLL_BEFORE_UPDATE: 'scroll-before-update',
    SCROLL_OPTIMIZE: 'scroll-optimize',
    SCROLL_UPDATE: 'scroll-update',
    SELECTION_CHANGE: 'selection-change',
    TEXT_CHANGE: 'text-change'
  };
  Emitter.sources = {
    API: 'api',
    SILENT: 'silent',
    USER: 'user'
  };

  exports.default = Emitter;

  /***/ }),
  /* 9 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Module = function Module(quill) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Module);

    this.quill = quill;
    this.options = options;
  };

  Module.DEFAULTS = {};

  exports.default = Module;

  /***/ }),
  /* 10 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var levels = ['error', 'warn', 'log', 'info'];
  var level = 'warn';

  function debug(method) {
    if (levels.indexOf(method) <= levels.indexOf(level)) {
      var _console;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_console = console)[method].apply(_console, args); // eslint-disable-line no-console
    }
  }

  function namespace(ns) {
    return levels.reduce(function (logger, method) {
      logger[method] = debug.bind(console, method, ns);
      return logger;
    }, {});
  }

  debug.level = namespace.level = function (newLevel) {
    level = newLevel;
  };

  exports.default = namespace;

  /***/ }),
  /* 11 */
  /***/ (function(module, exports, __webpack_require__) {

  var pSlice = Array.prototype.slice;
  var objectKeys = __webpack_require__(52);
  var isArguments = __webpack_require__(53);

  var deepEqual = module.exports = function (actual, expected, opts) {
    if (!opts) opts = {};
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
      return true;

    } else if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();

    // 7.3. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
    } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
      return opts.strict ? actual === expected : actual == expected;

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else {
      return objEquiv(actual, expected, opts);
    }
  };

  function isUndefinedOrNull(value) {
    return value === null || value === undefined;
  }

  function isBuffer (x) {
    if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
    if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
      return false;
    }
    if (x.length > 0 && typeof x[0] !== 'number') return false;
    return true;
  }

  function objEquiv(a, b, opts) {
    var i, key;
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
      return false;
    // an identical 'prototype' property.
    if (a.prototype !== b.prototype) return false;
    //~~~I've managed to break Object.keys through screwy arguments passing.
    //   Converting to array solves the problem.
    if (isArguments(a)) {
      if (!isArguments(b)) {
        return false;
      }
      a = pSlice.call(a);
      b = pSlice.call(b);
      return deepEqual(a, b, opts);
    }
    if (isBuffer(a)) {
      if (!isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) return false;
      for (i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    try {
      var ka = objectKeys(a),
          kb = objectKeys(b);
    } catch (e) {//happens when one is a string literal and the other isn't
      return false;
    }
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (ka.length != kb.length)
      return false;
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i])
        return false;
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!deepEqual(a[key], b[key], opts)) return false;
    }
    return typeof a === typeof b;
  }


  /***/ }),
  /* 12 */
  /***/ (function(module, exports, __webpack_require__) {

  Object.defineProperty(exports, "__esModule", { value: true });
  var Registry = __webpack_require__(1);
  var Attributor = /** @class */ (function () {
      function Attributor(attrName, keyName, options) {
          if (options === void 0) { options = {}; }
          this.attrName = attrName;
          this.keyName = keyName;
          var attributeBit = Registry.Scope.TYPE & Registry.Scope.ATTRIBUTE;
          if (options.scope != null) {
              // Ignore type bits, force attribute bit
              this.scope = (options.scope & Registry.Scope.LEVEL) | attributeBit;
          }
          else {
              this.scope = Registry.Scope.ATTRIBUTE;
          }
          if (options.whitelist != null)
              this.whitelist = options.whitelist;
      }
      Attributor.keys = function (node) {
          return [].map.call(node.attributes, function (item) {
              return item.name;
          });
      };
      Attributor.prototype.add = function (node, value) {
          if (!this.canAdd(node, value))
              return false;
          node.setAttribute(this.keyName, value);
          return true;
      };
      Attributor.prototype.canAdd = function (node, value) {
          var match = Registry.query(node, Registry.Scope.BLOT & (this.scope | Registry.Scope.TYPE));
          if (match == null)
              return false;
          if (this.whitelist == null)
              return true;
          if (typeof value === 'string') {
              return this.whitelist.indexOf(value.replace(/["']/g, '')) > -1;
          }
          else {
              return this.whitelist.indexOf(value) > -1;
          }
      };
      Attributor.prototype.remove = function (node) {
          node.removeAttribute(this.keyName);
      };
      Attributor.prototype.value = function (node) {
          var value = node.getAttribute(this.keyName);
          if (this.canAdd(node, value) && value) {
              return value;
          }
          return '';
      };
      return Attributor;
  }());
  exports.default = Attributor;


  /***/ }),
  /* 13 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.Code = undefined;

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  var _text = __webpack_require__(7);

  var _text2 = _interopRequireDefault(_text);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Code = function (_Inline) {
    _inherits(Code, _Inline);

    function Code() {
      _classCallCheck(this, Code);

      return _possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).apply(this, arguments));
    }

    return Code;
  }(_inline2.default);

  Code.blotName = 'code';
  Code.tagName = 'CODE';

  var CodeBlock = function (_Block) {
    _inherits(CodeBlock, _Block);

    function CodeBlock() {
      _classCallCheck(this, CodeBlock);

      return _possibleConstructorReturn(this, (CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock)).apply(this, arguments));
    }

    _createClass(CodeBlock, [{
      key: 'delta',
      value: function delta() {
        var _this3 = this;

        var text = this.domNode.textContent;
        if (text.endsWith('\n')) {
          // Should always be true
          text = text.slice(0, -1);
        }
        return text.split('\n').reduce(function (delta, frag) {
          return delta.insert(frag).insert('\n', _this3.formats());
        }, new _quillDelta2.default());
      }
    }, {
      key: 'format',
      value: function format(name, value) {
        if (name === this.statics.blotName && value) return;

        var _descendant = this.descendant(_text2.default, this.length() - 1),
            _descendant2 = _slicedToArray(_descendant, 1),
            text = _descendant2[0];

        if (text != null) {
          text.deleteAt(text.length() - 1, 1);
        }
        _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'format', this).call(this, name, value);
      }
    }, {
      key: 'formatAt',
      value: function formatAt(index, length, name, value) {
        if (length === 0) return;
        if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK) == null || name === this.statics.blotName && value === this.statics.formats(this.domNode)) {
          return;
        }
        var nextNewline = this.newlineIndex(index);
        if (nextNewline < 0 || nextNewline >= index + length) return;
        var prevNewline = this.newlineIndex(index, true) + 1;
        var isolateLength = nextNewline - prevNewline + 1;
        var blot = this.isolate(prevNewline, isolateLength);
        var next = blot.next;
        blot.format(name, value);
        if (next instanceof CodeBlock) {
          next.formatAt(0, index - prevNewline + length - isolateLength, name, value);
        }
      }
    }, {
      key: 'insertAt',
      value: function insertAt(index, value, def) {
        if (def != null) return;

        var _descendant3 = this.descendant(_text2.default, index),
            _descendant4 = _slicedToArray(_descendant3, 2),
            text = _descendant4[0],
            offset = _descendant4[1];

        text.insertAt(offset, value);
      }
    }, {
      key: 'length',
      value: function length() {
        var length = this.domNode.textContent.length;
        if (!this.domNode.textContent.endsWith('\n')) {
          return length + 1;
        }
        return length;
      }
    }, {
      key: 'newlineIndex',
      value: function newlineIndex(searchIndex) {
        var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (!reverse) {
          var offset = this.domNode.textContent.slice(searchIndex).indexOf('\n');
          return offset > -1 ? searchIndex + offset : -1;
        } else {
          return this.domNode.textContent.slice(0, searchIndex).lastIndexOf('\n');
        }
      }
    }, {
      key: 'optimize',
      value: function optimize(context) {
        if (!this.domNode.textContent.endsWith('\n')) {
          this.appendChild(_parchment2.default.create('text', '\n'));
        }
        _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'optimize', this).call(this, context);
        var next = this.next;
        if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && this.statics.formats(this.domNode) === next.statics.formats(next.domNode)) {
          next.optimize(context);
          next.moveChildren(this);
          next.remove();
        }
      }
    }, {
      key: 'replace',
      value: function replace(target) {
        _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'replace', this).call(this, target);
        [].slice.call(this.domNode.querySelectorAll('*')).forEach(function (node) {
          var blot = _parchment2.default.find(node);
          if (blot == null) {
            node.parentNode.removeChild(node);
          } else if (blot instanceof _parchment2.default.Embed) {
            blot.remove();
          } else {
            blot.unwrap();
          }
        });
      }
    }], [{
      key: 'create',
      value: function create(value) {
        var domNode = _get(CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock), 'create', this).call(this, value);
        domNode.setAttribute('spellcheck', false);
        return domNode;
      }
    }, {
      key: 'formats',
      value: function formats() {
        return true;
      }
    }]);

    return CodeBlock;
  }(_block2.default);

  CodeBlock.blotName = 'code-block';
  CodeBlock.tagName = 'PRE';
  CodeBlock.TAB = '  ';

  exports.Code = Code;
  exports.default = CodeBlock;

  /***/ }),
  /* 14 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _op = __webpack_require__(20);

  var _op2 = _interopRequireDefault(_op);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _code = __webpack_require__(13);

  var _code2 = _interopRequireDefault(_code);

  var _cursor = __webpack_require__(24);

  var _cursor2 = _interopRequireDefault(_cursor);

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  var _break = __webpack_require__(16);

  var _break2 = _interopRequireDefault(_break);

  var _clone = __webpack_require__(21);

  var _clone2 = _interopRequireDefault(_clone);

  var _deepEqual = __webpack_require__(11);

  var _deepEqual2 = _interopRequireDefault(_deepEqual);

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var ASCII = /^[ -~]*$/;

  var Editor = function () {
    function Editor(scroll) {
      _classCallCheck(this, Editor);

      this.scroll = scroll;
      this.delta = this.getDelta();
    }

    _createClass(Editor, [{
      key: 'applyDelta',
      value: function applyDelta(delta) {
        var _this = this;

        var consumeNextNewline = false;
        this.scroll.update();
        var scrollLength = this.scroll.length();
        this.scroll.batchStart();
        delta = normalizeDelta(delta);
        delta.reduce(function (index, op) {
          var length = op.retain || op.delete || op.insert.length || 1;
          var attributes = op.attributes || {};
          if (op.insert != null) {
            if (typeof op.insert === 'string') {
              var text = op.insert;
              if (text.endsWith('\n') && consumeNextNewline) {
                consumeNextNewline = false;
                text = text.slice(0, -1);
              }
              if (index >= scrollLength && !text.endsWith('\n')) {
                consumeNextNewline = true;
              }
              _this.scroll.insertAt(index, text);

              var _scroll$line = _this.scroll.line(index),
                  _scroll$line2 = _slicedToArray(_scroll$line, 2),
                  line = _scroll$line2[0],
                  offset = _scroll$line2[1];

              var formats = (0, _extend2.default)({}, (0, _block.bubbleFormats)(line));
              if (line instanceof _block2.default) {
                var _line$descendant = line.descendant(_parchment2.default.Leaf, offset),
                    _line$descendant2 = _slicedToArray(_line$descendant, 1),
                    leaf = _line$descendant2[0];

                formats = (0, _extend2.default)(formats, (0, _block.bubbleFormats)(leaf));
              }
              attributes = _op2.default.attributes.diff(formats, attributes) || {};
            } else if (_typeof(op.insert) === 'object') {
              var key = Object.keys(op.insert)[0]; // There should only be one key
              if (key == null) return index;
              _this.scroll.insertAt(index, key, op.insert[key]);
            }
            scrollLength += length;
          }
          Object.keys(attributes).forEach(function (name) {
            _this.scroll.formatAt(index, length, name, attributes[name]);
          });
          return index + length;
        }, 0);
        delta.reduce(function (index, op) {
          if (typeof op.delete === 'number') {
            _this.scroll.deleteAt(index, op.delete);
            return index;
          }
          return index + (op.retain || op.insert.length || 1);
        }, 0);
        this.scroll.batchEnd();
        return this.update(delta);
      }
    }, {
      key: 'deleteText',
      value: function deleteText(index, length) {
        this.scroll.deleteAt(index, length);
        return this.update(new _quillDelta2.default().retain(index).delete(length));
      }
    }, {
      key: 'formatLine',
      value: function formatLine(index, length) {
        var _this2 = this;

        var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        this.scroll.update();
        Object.keys(formats).forEach(function (format) {
          if (_this2.scroll.whitelist != null && !_this2.scroll.whitelist[format]) return;
          var lines = _this2.scroll.lines(index, Math.max(length, 1));
          var lengthRemaining = length;
          lines.forEach(function (line) {
            var lineLength = line.length();
            if (!(line instanceof _code2.default)) {
              line.format(format, formats[format]);
            } else {
              var codeIndex = index - line.offset(_this2.scroll);
              var codeLength = line.newlineIndex(codeIndex + lengthRemaining) - codeIndex + 1;
              line.formatAt(codeIndex, codeLength, format, formats[format]);
            }
            lengthRemaining -= lineLength;
          });
        });
        this.scroll.optimize();
        return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
      }
    }, {
      key: 'formatText',
      value: function formatText(index, length) {
        var _this3 = this;

        var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        Object.keys(formats).forEach(function (format) {
          _this3.scroll.formatAt(index, length, format, formats[format]);
        });
        return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
      }
    }, {
      key: 'getContents',
      value: function getContents(index, length) {
        return this.delta.slice(index, index + length);
      }
    }, {
      key: 'getDelta',
      value: function getDelta() {
        return this.scroll.lines().reduce(function (delta, line) {
          return delta.concat(line.delta());
        }, new _quillDelta2.default());
      }
    }, {
      key: 'getFormat',
      value: function getFormat(index) {
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var lines = [],
            leaves = [];
        if (length === 0) {
          this.scroll.path(index).forEach(function (path) {
            var _path = _slicedToArray(path, 1),
                blot = _path[0];

            if (blot instanceof _block2.default) {
              lines.push(blot);
            } else if (blot instanceof _parchment2.default.Leaf) {
              leaves.push(blot);
            }
          });
        } else {
          lines = this.scroll.lines(index, length);
          leaves = this.scroll.descendants(_parchment2.default.Leaf, index, length);
        }
        var formatsArr = [lines, leaves].map(function (blots) {
          if (blots.length === 0) return {};
          var formats = (0, _block.bubbleFormats)(blots.shift());
          while (Object.keys(formats).length > 0) {
            var blot = blots.shift();
            if (blot == null) return formats;
            formats = combineFormats((0, _block.bubbleFormats)(blot), formats);
          }
          return formats;
        });
        return _extend2.default.apply(_extend2.default, formatsArr);
      }
    }, {
      key: 'getText',
      value: function getText(index, length) {
        return this.getContents(index, length).filter(function (op) {
          return typeof op.insert === 'string';
        }).map(function (op) {
          return op.insert;
        }).join('');
      }
    }, {
      key: 'insertEmbed',
      value: function insertEmbed(index, embed, value) {
        this.scroll.insertAt(index, embed, value);
        return this.update(new _quillDelta2.default().retain(index).insert(_defineProperty({}, embed, value)));
      }
    }, {
      key: 'insertText',
      value: function insertText(index, text) {
        var _this4 = this;

        var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        this.scroll.insertAt(index, text);
        Object.keys(formats).forEach(function (format) {
          _this4.scroll.formatAt(index, text.length, format, formats[format]);
        });
        return this.update(new _quillDelta2.default().retain(index).insert(text, (0, _clone2.default)(formats)));
      }
    }, {
      key: 'isBlank',
      value: function isBlank() {
        if (this.scroll.children.length == 0) return true;
        if (this.scroll.children.length > 1) return false;
        var block = this.scroll.children.head;
        if (block.statics.blotName !== _block2.default.blotName) return false;
        if (block.children.length > 1) return false;
        return block.children.head instanceof _break2.default;
      }
    }, {
      key: 'removeFormat',
      value: function removeFormat(index, length) {
        var text = this.getText(index, length);

        var _scroll$line3 = this.scroll.line(index + length),
            _scroll$line4 = _slicedToArray(_scroll$line3, 2),
            line = _scroll$line4[0],
            offset = _scroll$line4[1];

        var suffixLength = 0,
            suffix = new _quillDelta2.default();
        if (line != null) {
          if (!(line instanceof _code2.default)) {
            suffixLength = line.length() - offset;
          } else {
            suffixLength = line.newlineIndex(offset) - offset + 1;
          }
          suffix = line.delta().slice(offset, offset + suffixLength - 1).insert('\n');
        }
        var contents = this.getContents(index, length + suffixLength);
        var diff = contents.diff(new _quillDelta2.default().insert(text).concat(suffix));
        var delta = new _quillDelta2.default().retain(index).concat(diff);
        return this.applyDelta(delta);
      }
    }, {
      key: 'update',
      value: function update(change) {
        var mutations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var cursorIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

        var oldDelta = this.delta;
        if (mutations.length === 1 && mutations[0].type === 'characterData' && mutations[0].target.data.match(ASCII) && _parchment2.default.find(mutations[0].target)) {
          // Optimization for character changes
          var textBlot = _parchment2.default.find(mutations[0].target);
          var formats = (0, _block.bubbleFormats)(textBlot);
          var index = textBlot.offset(this.scroll);
          var oldValue = mutations[0].oldValue.replace(_cursor2.default.CONTENTS, '');
          var oldText = new _quillDelta2.default().insert(oldValue);
          var newText = new _quillDelta2.default().insert(textBlot.value());
          var diffDelta = new _quillDelta2.default().retain(index).concat(oldText.diff(newText, cursorIndex));
          change = diffDelta.reduce(function (delta, op) {
            if (op.insert) {
              return delta.insert(op.insert, formats);
            } else {
              return delta.push(op);
            }
          }, new _quillDelta2.default());
          this.delta = oldDelta.compose(change);
        } else {
          this.delta = this.getDelta();
          if (!change || !(0, _deepEqual2.default)(oldDelta.compose(change), this.delta)) {
            change = oldDelta.diff(this.delta, cursorIndex);
          }
        }
        return change;
      }
    }]);

    return Editor;
  }();

  function combineFormats(formats, combined) {
    return Object.keys(combined).reduce(function (merged, name) {
      if (formats[name] == null) return merged;
      if (combined[name] === formats[name]) {
        merged[name] = combined[name];
      } else if (Array.isArray(combined[name])) {
        if (combined[name].indexOf(formats[name]) < 0) {
          merged[name] = combined[name].concat([formats[name]]);
        }
      } else {
        merged[name] = [combined[name], formats[name]];
      }
      return merged;
    }, {});
  }

  function normalizeDelta(delta) {
    return delta.reduce(function (delta, op) {
      if (op.insert === 1) {
        var attributes = (0, _clone2.default)(op.attributes);
        delete attributes['image'];
        return delta.insert({ image: op.attributes.image }, attributes);
      }
      if (op.attributes != null && (op.attributes.list === true || op.attributes.bullet === true)) {
        op = (0, _clone2.default)(op);
        if (op.attributes.list) {
          op.attributes.list = 'ordered';
        } else {
          op.attributes.list = 'bullet';
          delete op.attributes.bullet;
        }
      }
      if (typeof op.insert === 'string') {
        var text = op.insert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return delta.insert(text, op.attributes);
      }
      return delta.push(op);
    }, new _quillDelta2.default());
  }

  exports.default = Editor;

  /***/ }),
  /* 15 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.Range = undefined;

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _clone = __webpack_require__(21);

  var _clone2 = _interopRequireDefault(_clone);

  var _deepEqual = __webpack_require__(11);

  var _deepEqual2 = _interopRequireDefault(_deepEqual);

  var _emitter3 = __webpack_require__(8);

  var _emitter4 = _interopRequireDefault(_emitter3);

  var _logger = __webpack_require__(10);

  var _logger2 = _interopRequireDefault(_logger);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var debug = (0, _logger2.default)('quill:selection');

  var Range = function Range(index) {
    var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Range);

    this.index = index;
    this.length = length;
  };

  var Selection = function () {
    function Selection(scroll, emitter) {
      var _this = this;

      _classCallCheck(this, Selection);

      this.emitter = emitter;
      this.scroll = scroll;
      this.composing = false;
      this.mouseDown = false;
      this.root = this.scroll.domNode;
      this.cursor = _parchment2.default.create('cursor', this);
      // savedRange is last non-null range
      this.lastRange = this.savedRange = new Range(0, 0);
      this.handleComposition();
      this.handleDragging();
      this.emitter.listenDOM('selectionchange', document, function () {
        if (!_this.mouseDown) {
          setTimeout(_this.update.bind(_this, _emitter4.default.sources.USER), 1);
        }
      });
      this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type, delta) {
        if (type === _emitter4.default.events.TEXT_CHANGE && delta.length() > 0) {
          _this.update(_emitter4.default.sources.SILENT);
        }
      });
      this.emitter.on(_emitter4.default.events.SCROLL_BEFORE_UPDATE, function () {
        if (!_this.hasFocus()) return;
        var native = _this.getNativeRange();
        if (native == null) return;
        if (native.start.node === _this.cursor.textNode) return; // cursor.restore() will handle
        // TODO unclear if this has negative side effects
        _this.emitter.once(_emitter4.default.events.SCROLL_UPDATE, function () {
          try {
            _this.setNativeRange(native.start.node, native.start.offset, native.end.node, native.end.offset);
          } catch (ignored) {}
        });
      });
      this.emitter.on(_emitter4.default.events.SCROLL_OPTIMIZE, function (mutations, context) {
        if (context.range) {
          var _context$range = context.range,
              startNode = _context$range.startNode,
              startOffset = _context$range.startOffset,
              endNode = _context$range.endNode,
              endOffset = _context$range.endOffset;

          _this.setNativeRange(startNode, startOffset, endNode, endOffset);
        }
      });
      this.update(_emitter4.default.sources.SILENT);
    }

    _createClass(Selection, [{
      key: 'handleComposition',
      value: function handleComposition() {
        var _this2 = this;

        this.root.addEventListener('compositionstart', function () {
          _this2.composing = true;
        });
        this.root.addEventListener('compositionend', function () {
          _this2.composing = false;
          if (_this2.cursor.parent) {
            var range = _this2.cursor.restore();
            if (!range) return;
            setTimeout(function () {
              _this2.setNativeRange(range.startNode, range.startOffset, range.endNode, range.endOffset);
            }, 1);
          }
        });
      }
    }, {
      key: 'handleDragging',
      value: function handleDragging() {
        var _this3 = this;

        this.emitter.listenDOM('mousedown', document.body, function () {
          _this3.mouseDown = true;
        });
        this.emitter.listenDOM('mouseup', document.body, function () {
          _this3.mouseDown = false;
          _this3.update(_emitter4.default.sources.USER);
        });
      }
    }, {
      key: 'focus',
      value: function focus() {
        if (this.hasFocus()) return;
        this.root.focus();
        this.setRange(this.savedRange);
      }
    }, {
      key: 'format',
      value: function format(_format, value) {
        if (this.scroll.whitelist != null && !this.scroll.whitelist[_format]) return;
        this.scroll.update();
        var nativeRange = this.getNativeRange();
        if (nativeRange == null || !nativeRange.native.collapsed || _parchment2.default.query(_format, _parchment2.default.Scope.BLOCK)) return;
        if (nativeRange.start.node !== this.cursor.textNode) {
          var blot = _parchment2.default.find(nativeRange.start.node, false);
          if (blot == null) return;
          // TODO Give blot ability to not split
          if (blot instanceof _parchment2.default.Leaf) {
            var after = blot.split(nativeRange.start.offset);
            blot.parent.insertBefore(this.cursor, after);
          } else {
            blot.insertBefore(this.cursor, nativeRange.start.node); // Should never happen
          }
          this.cursor.attach();
        }
        this.cursor.format(_format, value);
        this.scroll.optimize();
        this.setNativeRange(this.cursor.textNode, this.cursor.textNode.data.length);
        this.update();
      }
    }, {
      key: 'getBounds',
      value: function getBounds(index) {
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var scrollLength = this.scroll.length();
        index = Math.min(index, scrollLength - 1);
        length = Math.min(index + length, scrollLength - 1) - index;
        var node = void 0,
            _scroll$leaf = this.scroll.leaf(index),
            _scroll$leaf2 = _slicedToArray(_scroll$leaf, 2),
            leaf = _scroll$leaf2[0],
            offset = _scroll$leaf2[1];
        if (leaf == null) return null;

        var _leaf$position = leaf.position(offset, true);

        var _leaf$position2 = _slicedToArray(_leaf$position, 2);

        node = _leaf$position2[0];
        offset = _leaf$position2[1];

        var range = document.createRange();
        if (length > 0) {
          range.setStart(node, offset);

          var _scroll$leaf3 = this.scroll.leaf(index + length);

          var _scroll$leaf4 = _slicedToArray(_scroll$leaf3, 2);

          leaf = _scroll$leaf4[0];
          offset = _scroll$leaf4[1];

          if (leaf == null) return null;

          var _leaf$position3 = leaf.position(offset, true);

          var _leaf$position4 = _slicedToArray(_leaf$position3, 2);

          node = _leaf$position4[0];
          offset = _leaf$position4[1];

          range.setEnd(node, offset);
          return range.getBoundingClientRect();
        } else {
          var side = 'left';
          var rect = void 0;
          if (node instanceof Text) {
            if (offset < node.data.length) {
              range.setStart(node, offset);
              range.setEnd(node, offset + 1);
            } else {
              range.setStart(node, offset - 1);
              range.setEnd(node, offset);
              side = 'right';
            }
            rect = range.getBoundingClientRect();
          } else {
            rect = leaf.domNode.getBoundingClientRect();
            if (offset > 0) side = 'right';
          }
          return {
            bottom: rect.top + rect.height,
            height: rect.height,
            left: rect[side],
            right: rect[side],
            top: rect.top,
            width: 0
          };
        }
      }
    }, {
      key: 'getNativeRange',
      value: function getNativeRange() {
        var selection = document.getSelection();
        if (selection == null || selection.rangeCount <= 0) return null;
        var nativeRange = selection.getRangeAt(0);
        if (nativeRange == null) return null;
        var range = this.normalizeNative(nativeRange);
        debug.info('getNativeRange', range);
        return range;
      }
    }, {
      key: 'getRange',
      value: function getRange() {
        var normalized = this.getNativeRange();
        if (normalized == null) return [null, null];
        var range = this.normalizedToRange(normalized);
        return [range, normalized];
      }
    }, {
      key: 'hasFocus',
      value: function hasFocus() {
        return document.activeElement === this.root;
      }
    }, {
      key: 'normalizedToRange',
      value: function normalizedToRange(range) {
        var _this4 = this;

        var positions = [[range.start.node, range.start.offset]];
        if (!range.native.collapsed) {
          positions.push([range.end.node, range.end.offset]);
        }
        var indexes = positions.map(function (position) {
          var _position = _slicedToArray(position, 2),
              node = _position[0],
              offset = _position[1];

          var blot = _parchment2.default.find(node, true);
          var index = blot.offset(_this4.scroll);
          if (offset === 0) {
            return index;
          } else if (blot instanceof _parchment2.default.Container) {
            return index + blot.length();
          } else {
            return index + blot.index(node, offset);
          }
        });
        var end = Math.min(Math.max.apply(Math, _toConsumableArray(indexes)), this.scroll.length() - 1);
        var start = Math.min.apply(Math, [end].concat(_toConsumableArray(indexes)));
        return new Range(start, end - start);
      }
    }, {
      key: 'normalizeNative',
      value: function normalizeNative(nativeRange) {
        if (!contains(this.root, nativeRange.startContainer) || !nativeRange.collapsed && !contains(this.root, nativeRange.endContainer)) {
          return null;
        }
        var range = {
          start: { node: nativeRange.startContainer, offset: nativeRange.startOffset },
          end: { node: nativeRange.endContainer, offset: nativeRange.endOffset },
          native: nativeRange
        };
        [range.start, range.end].forEach(function (position) {
          var node = position.node,
              offset = position.offset;
          while (!(node instanceof Text) && node.childNodes.length > 0) {
            if (node.childNodes.length > offset) {
              node = node.childNodes[offset];
              offset = 0;
            } else if (node.childNodes.length === offset) {
              node = node.lastChild;
              offset = node instanceof Text ? node.data.length : node.childNodes.length + 1;
            } else {
              break;
            }
          }
          position.node = node, position.offset = offset;
        });
        return range;
      }
    }, {
      key: 'rangeToNative',
      value: function rangeToNative(range) {
        var _this5 = this;

        var indexes = range.collapsed ? [range.index] : [range.index, range.index + range.length];
        var args = [];
        var scrollLength = this.scroll.length();
        indexes.forEach(function (index, i) {
          index = Math.min(scrollLength - 1, index);
          var node = void 0,
              _scroll$leaf5 = _this5.scroll.leaf(index),
              _scroll$leaf6 = _slicedToArray(_scroll$leaf5, 2),
              leaf = _scroll$leaf6[0],
              offset = _scroll$leaf6[1];
          var _leaf$position5 = leaf.position(offset, i !== 0);

          var _leaf$position6 = _slicedToArray(_leaf$position5, 2);

          node = _leaf$position6[0];
          offset = _leaf$position6[1];

          args.push(node, offset);
        });
        if (args.length < 2) {
          args = args.concat(args);
        }
        return args;
      }
    }, {
      key: 'scrollIntoView',
      value: function scrollIntoView(scrollingContainer) {
        var range = this.lastRange;
        if (range == null) return;
        var bounds = this.getBounds(range.index, range.length);
        if (bounds == null) return;
        var limit = this.scroll.length() - 1;

        var _scroll$line = this.scroll.line(Math.min(range.index, limit)),
            _scroll$line2 = _slicedToArray(_scroll$line, 1),
            first = _scroll$line2[0];

        var last = first;
        if (range.length > 0) {
          var _scroll$line3 = this.scroll.line(Math.min(range.index + range.length, limit));

          var _scroll$line4 = _slicedToArray(_scroll$line3, 1);

          last = _scroll$line4[0];
        }
        if (first == null || last == null) return;
        var scrollBounds = scrollingContainer.getBoundingClientRect();
        if (bounds.top < scrollBounds.top) {
          scrollingContainer.scrollTop -= scrollBounds.top - bounds.top;
        } else if (bounds.bottom > scrollBounds.bottom) {
          scrollingContainer.scrollTop += bounds.bottom - scrollBounds.bottom;
        }
      }
    }, {
      key: 'setNativeRange',
      value: function setNativeRange(startNode, startOffset) {
        var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : startNode;
        var endOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : startOffset;
        var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

        debug.info('setNativeRange', startNode, startOffset, endNode, endOffset);
        if (startNode != null && (this.root.parentNode == null || startNode.parentNode == null || endNode.parentNode == null)) {
          return;
        }
        var selection = document.getSelection();
        if (selection == null) return;
        if (startNode != null) {
          if (!this.hasFocus()) this.root.focus();
          var native = (this.getNativeRange() || {}).native;
          if (native == null || force || startNode !== native.startContainer || startOffset !== native.startOffset || endNode !== native.endContainer || endOffset !== native.endOffset) {

            if (startNode.tagName == "BR") {
              startOffset = [].indexOf.call(startNode.parentNode.childNodes, startNode);
              startNode = startNode.parentNode;
            }
            if (endNode.tagName == "BR") {
              endOffset = [].indexOf.call(endNode.parentNode.childNodes, endNode);
              endNode = endNode.parentNode;
            }
            var range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else {
          selection.removeAllRanges();
          this.root.blur();
          document.body.focus(); // root.blur() not enough on IE11+Travis+SauceLabs (but not local VMs)
        }
      }
    }, {
      key: 'setRange',
      value: function setRange(range) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

        if (typeof force === 'string') {
          source = force;
          force = false;
        }
        debug.info('setRange', range);
        if (range != null) {
          var args = this.rangeToNative(range);
          this.setNativeRange.apply(this, _toConsumableArray(args).concat([force]));
        } else {
          this.setNativeRange(null);
        }
        this.update(source);
      }
    }, {
      key: 'update',
      value: function update() {
        var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

        var oldRange = this.lastRange;

        var _getRange = this.getRange(),
            _getRange2 = _slicedToArray(_getRange, 2),
            lastRange = _getRange2[0],
            nativeRange = _getRange2[1];

        this.lastRange = lastRange;
        if (this.lastRange != null) {
          this.savedRange = this.lastRange;
        }
        if (!(0, _deepEqual2.default)(oldRange, this.lastRange)) {
          var _emitter;

          if (!this.composing && nativeRange != null && nativeRange.native.collapsed && nativeRange.start.node !== this.cursor.textNode) {
            this.cursor.restore();
          }
          var args = [_emitter4.default.events.SELECTION_CHANGE, (0, _clone2.default)(this.lastRange), (0, _clone2.default)(oldRange), source];
          (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
          if (source !== _emitter4.default.sources.SILENT) {
            var _emitter2;

            (_emitter2 = this.emitter).emit.apply(_emitter2, args);
          }
        }
      }
    }]);

    return Selection;
  }();

  function contains(parent, descendant) {
    try {
      // Firefox inserts inaccessible nodes around video elements
      descendant.parentNode;
    } catch (e) {
      return false;
    }
    // IE11 has bug with Text nodes
    // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
    if (descendant instanceof Text) {
      descendant = descendant.parentNode;
    }
    return parent.contains(descendant);
  }

  exports.Range = Range;
  exports.default = Selection;

  /***/ }),
  /* 16 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Break = function (_Parchment$Embed) {
    _inherits(Break, _Parchment$Embed);

    function Break() {
      _classCallCheck(this, Break);

      return _possibleConstructorReturn(this, (Break.__proto__ || Object.getPrototypeOf(Break)).apply(this, arguments));
    }

    _createClass(Break, [{
      key: 'insertInto',
      value: function insertInto(parent, ref) {
        if (parent.children.length === 0) {
          _get(Break.prototype.__proto__ || Object.getPrototypeOf(Break.prototype), 'insertInto', this).call(this, parent, ref);
        } else {
          this.remove();
        }
      }
    }, {
      key: 'length',
      value: function length() {
        return 0;
      }
    }, {
      key: 'value',
      value: function value() {
        return '';
      }
    }], [{
      key: 'value',
      value: function value() {
        return undefined;
      }
    }]);

    return Break;
  }(_parchment2.default.Embed);

  Break.blotName = 'break';
  Break.tagName = 'BR';

  exports.default = Break;

  /***/ }),
  /* 17 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var linked_list_1 = __webpack_require__(44);
  var shadow_1 = __webpack_require__(30);
  var Registry = __webpack_require__(1);
  var ContainerBlot = /** @class */ (function (_super) {
      __extends(ContainerBlot, _super);
      function ContainerBlot(domNode) {
          var _this = _super.call(this, domNode) || this;
          _this.build();
          return _this;
      }
      ContainerBlot.prototype.appendChild = function (other) {
          this.insertBefore(other);
      };
      ContainerBlot.prototype.attach = function () {
          _super.prototype.attach.call(this);
          this.children.forEach(function (child) {
              child.attach();
          });
      };
      ContainerBlot.prototype.build = function () {
          var _this = this;
          this.children = new linked_list_1.default();
          // Need to be reversed for if DOM nodes already in order
          [].slice
              .call(this.domNode.childNodes)
              .reverse()
              .forEach(function (node) {
              try {
                  var child = makeBlot(node);
                  _this.insertBefore(child, _this.children.head || undefined);
              }
              catch (err) {
                  if (err instanceof Registry.ParchmentError)
                      return;
                  else
                      throw err;
              }
          });
      };
      ContainerBlot.prototype.deleteAt = function (index, length) {
          if (index === 0 && length === this.length()) {
              return this.remove();
          }
          this.children.forEachAt(index, length, function (child, offset, length) {
              child.deleteAt(offset, length);
          });
      };
      ContainerBlot.prototype.descendant = function (criteria, index) {
          var _a = this.children.find(index), child = _a[0], offset = _a[1];
          if ((criteria.blotName == null && criteria(child)) ||
              (criteria.blotName != null && child instanceof criteria)) {
              return [child, offset];
          }
          else if (child instanceof ContainerBlot) {
              return child.descendant(criteria, offset);
          }
          else {
              return [null, -1];
          }
      };
      ContainerBlot.prototype.descendants = function (criteria, index, length) {
          if (index === void 0) { index = 0; }
          if (length === void 0) { length = Number.MAX_VALUE; }
          var descendants = [];
          var lengthLeft = length;
          this.children.forEachAt(index, length, function (child, index, length) {
              if ((criteria.blotName == null && criteria(child)) ||
                  (criteria.blotName != null && child instanceof criteria)) {
                  descendants.push(child);
              }
              if (child instanceof ContainerBlot) {
                  descendants = descendants.concat(child.descendants(criteria, index, lengthLeft));
              }
              lengthLeft -= length;
          });
          return descendants;
      };
      ContainerBlot.prototype.detach = function () {
          this.children.forEach(function (child) {
              child.detach();
          });
          _super.prototype.detach.call(this);
      };
      ContainerBlot.prototype.formatAt = function (index, length, name, value) {
          this.children.forEachAt(index, length, function (child, offset, length) {
              child.formatAt(offset, length, name, value);
          });
      };
      ContainerBlot.prototype.insertAt = function (index, value, def) {
          var _a = this.children.find(index), child = _a[0], offset = _a[1];
          if (child) {
              child.insertAt(offset, value, def);
          }
          else {
              var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
              this.appendChild(blot);
          }
      };
      ContainerBlot.prototype.insertBefore = function (childBlot, refBlot) {
          if (this.statics.allowedChildren != null &&
              !this.statics.allowedChildren.some(function (child) {
                  return childBlot instanceof child;
              })) {
              throw new Registry.ParchmentError("Cannot insert " + childBlot.statics.blotName + " into " + this.statics.blotName);
          }
          childBlot.insertInto(this, refBlot);
      };
      ContainerBlot.prototype.length = function () {
          return this.children.reduce(function (memo, child) {
              return memo + child.length();
          }, 0);
      };
      ContainerBlot.prototype.moveChildren = function (targetParent, refNode) {
          this.children.forEach(function (child) {
              targetParent.insertBefore(child, refNode);
          });
      };
      ContainerBlot.prototype.optimize = function (context) {
          _super.prototype.optimize.call(this, context);
          if (this.children.length === 0) {
              if (this.statics.defaultChild != null) {
                  var child = Registry.create(this.statics.defaultChild);
                  this.appendChild(child);
                  child.optimize(context);
              }
              else {
                  this.remove();
              }
          }
      };
      ContainerBlot.prototype.path = function (index, inclusive) {
          if (inclusive === void 0) { inclusive = false; }
          var _a = this.children.find(index, inclusive), child = _a[0], offset = _a[1];
          var position = [[this, index]];
          if (child instanceof ContainerBlot) {
              return position.concat(child.path(offset, inclusive));
          }
          else if (child != null) {
              position.push([child, offset]);
          }
          return position;
      };
      ContainerBlot.prototype.removeChild = function (child) {
          this.children.remove(child);
      };
      ContainerBlot.prototype.replace = function (target) {
          if (target instanceof ContainerBlot) {
              target.moveChildren(this);
          }
          _super.prototype.replace.call(this, target);
      };
      ContainerBlot.prototype.split = function (index, force) {
          if (force === void 0) { force = false; }
          if (!force) {
              if (index === 0)
                  return this;
              if (index === this.length())
                  return this.next;
          }
          var after = this.clone();
          this.parent.insertBefore(after, this.next);
          this.children.forEachAt(index, this.length(), function (child, offset, length) {
              child = child.split(offset, force);
              after.appendChild(child);
          });
          return after;
      };
      ContainerBlot.prototype.unwrap = function () {
          this.moveChildren(this.parent, this.next);
          this.remove();
      };
      ContainerBlot.prototype.update = function (mutations, context) {
          var _this = this;
          var addedNodes = [];
          var removedNodes = [];
          mutations.forEach(function (mutation) {
              if (mutation.target === _this.domNode && mutation.type === 'childList') {
                  addedNodes.push.apply(addedNodes, mutation.addedNodes);
                  removedNodes.push.apply(removedNodes, mutation.removedNodes);
              }
          });
          removedNodes.forEach(function (node) {
              // Check node has actually been removed
              // One exception is Chrome does not immediately remove IFRAMEs
              // from DOM but MutationRecord is correct in its reported removal
              if (node.parentNode != null &&
                  // @ts-ignore
                  node.tagName !== 'IFRAME' &&
                  document.body.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                  return;
              }
              var blot = Registry.find(node);
              if (blot == null)
                  return;
              if (blot.domNode.parentNode == null || blot.domNode.parentNode === _this.domNode) {
                  blot.detach();
              }
          });
          addedNodes
              .filter(function (node) {
              return node.parentNode == _this.domNode;
          })
              .sort(function (a, b) {
              if (a === b)
                  return 0;
              if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
                  return 1;
              }
              return -1;
          })
              .forEach(function (node) {
              var refBlot = null;
              if (node.nextSibling != null) {
                  refBlot = Registry.find(node.nextSibling);
              }
              var blot = makeBlot(node);
              if (blot.next != refBlot || blot.next == null) {
                  if (blot.parent != null) {
                      blot.parent.removeChild(_this);
                  }
                  _this.insertBefore(blot, refBlot || undefined);
              }
          });
      };
      return ContainerBlot;
  }(shadow_1.default));
  function makeBlot(node) {
      var blot = Registry.find(node);
      if (blot == null) {
          try {
              blot = Registry.create(node);
          }
          catch (e) {
              blot = Registry.create(Registry.Scope.INLINE);
              [].slice.call(node.childNodes).forEach(function (child) {
                  // @ts-ignore
                  blot.domNode.appendChild(child);
              });
              if (node.parentNode) {
                  node.parentNode.replaceChild(blot.domNode, node);
              }
              blot.attach();
          }
      }
      return blot;
  }
  exports.default = ContainerBlot;


  /***/ }),
  /* 18 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var attributor_1 = __webpack_require__(12);
  var store_1 = __webpack_require__(31);
  var container_1 = __webpack_require__(17);
  var Registry = __webpack_require__(1);
  var FormatBlot = /** @class */ (function (_super) {
      __extends(FormatBlot, _super);
      function FormatBlot(domNode) {
          var _this = _super.call(this, domNode) || this;
          _this.attributes = new store_1.default(_this.domNode);
          return _this;
      }
      FormatBlot.formats = function (domNode) {
          if (typeof this.tagName === 'string') {
              return true;
          }
          else if (Array.isArray(this.tagName)) {
              return domNode.tagName.toLowerCase();
          }
          return undefined;
      };
      FormatBlot.prototype.format = function (name, value) {
          var format = Registry.query(name);
          if (format instanceof attributor_1.default) {
              this.attributes.attribute(format, value);
          }
          else if (value) {
              if (format != null && (name !== this.statics.blotName || this.formats()[name] !== value)) {
                  this.replaceWith(name, value);
              }
          }
      };
      FormatBlot.prototype.formats = function () {
          var formats = this.attributes.values();
          var format = this.statics.formats(this.domNode);
          if (format != null) {
              formats[this.statics.blotName] = format;
          }
          return formats;
      };
      FormatBlot.prototype.replaceWith = function (name, value) {
          var replacement = _super.prototype.replaceWith.call(this, name, value);
          this.attributes.copy(replacement);
          return replacement;
      };
      FormatBlot.prototype.update = function (mutations, context) {
          var _this = this;
          _super.prototype.update.call(this, mutations, context);
          if (mutations.some(function (mutation) {
              return mutation.target === _this.domNode && mutation.type === 'attributes';
          })) {
              this.attributes.build();
          }
      };
      FormatBlot.prototype.wrap = function (name, value) {
          var wrapper = _super.prototype.wrap.call(this, name, value);
          if (wrapper instanceof FormatBlot && wrapper.statics.scope === this.statics.scope) {
              this.attributes.move(wrapper);
          }
          return wrapper;
      };
      return FormatBlot;
  }(container_1.default));
  exports.default = FormatBlot;


  /***/ }),
  /* 19 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var shadow_1 = __webpack_require__(30);
  var Registry = __webpack_require__(1);
  var LeafBlot = /** @class */ (function (_super) {
      __extends(LeafBlot, _super);
      function LeafBlot() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      LeafBlot.value = function (domNode) {
          return true;
      };
      LeafBlot.prototype.index = function (node, offset) {
          if (this.domNode === node ||
              this.domNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
              return Math.min(offset, 1);
          }
          return -1;
      };
      LeafBlot.prototype.position = function (index, inclusive) {
          var offset = [].indexOf.call(this.parent.domNode.childNodes, this.domNode);
          if (index > 0)
              offset += 1;
          return [this.parent.domNode, offset];
      };
      LeafBlot.prototype.value = function () {
          var _a;
          return _a = {}, _a[this.statics.blotName] = this.statics.value(this.domNode) || true, _a;
      };
      LeafBlot.scope = Registry.Scope.INLINE_BLOT;
      return LeafBlot;
  }(shadow_1.default));
  exports.default = LeafBlot;


  /***/ }),
  /* 20 */
  /***/ (function(module, exports, __webpack_require__) {

  var equal = __webpack_require__(11);
  var extend = __webpack_require__(3);


  var lib = {
    attributes: {
      compose: function (a, b, keepNull) {
        if (typeof a !== 'object') a = {};
        if (typeof b !== 'object') b = {};
        var attributes = extend(true, {}, b);
        if (!keepNull) {
          attributes = Object.keys(attributes).reduce(function (copy, key) {
            if (attributes[key] != null) {
              copy[key] = attributes[key];
            }
            return copy;
          }, {});
        }
        for (var key in a) {
          if (a[key] !== undefined && b[key] === undefined) {
            attributes[key] = a[key];
          }
        }
        return Object.keys(attributes).length > 0 ? attributes : undefined;
      },

      diff: function(a, b) {
        if (typeof a !== 'object') a = {};
        if (typeof b !== 'object') b = {};
        var attributes = Object.keys(a).concat(Object.keys(b)).reduce(function (attributes, key) {
          if (!equal(a[key], b[key])) {
            attributes[key] = b[key] === undefined ? null : b[key];
          }
          return attributes;
        }, {});
        return Object.keys(attributes).length > 0 ? attributes : undefined;
      },

      transform: function (a, b, priority) {
        if (typeof a !== 'object') return b;
        if (typeof b !== 'object') return undefined;
        if (!priority) return b;  // b simply overwrites us without priority
        var attributes = Object.keys(b).reduce(function (attributes, key) {
          if (a[key] === undefined) attributes[key] = b[key];  // null is a valid value
          return attributes;
        }, {});
        return Object.keys(attributes).length > 0 ? attributes : undefined;
      }
    },

    iterator: function (ops) {
      return new Iterator(ops);
    },

    length: function (op) {
      if (typeof op['delete'] === 'number') {
        return op['delete'];
      } else if (typeof op.retain === 'number') {
        return op.retain;
      } else {
        return typeof op.insert === 'string' ? op.insert.length : 1;
      }
    }
  };


  function Iterator(ops) {
    this.ops = ops;
    this.index = 0;
    this.offset = 0;
  }
  Iterator.prototype.hasNext = function () {
    return this.peekLength() < Infinity;
  };

  Iterator.prototype.next = function (length) {
    if (!length) length = Infinity;
    var nextOp = this.ops[this.index];
    if (nextOp) {
      var offset = this.offset;
      var opLength = lib.length(nextOp);
      if (length >= opLength - offset) {
        length = opLength - offset;
        this.index += 1;
        this.offset = 0;
      } else {
        this.offset += length;
      }
      if (typeof nextOp['delete'] === 'number') {
        return { 'delete': length };
      } else {
        var retOp = {};
        if (nextOp.attributes) {
          retOp.attributes = nextOp.attributes;
        }
        if (typeof nextOp.retain === 'number') {
          retOp.retain = length;
        } else if (typeof nextOp.insert === 'string') {
          retOp.insert = nextOp.insert.substr(offset, length);
        } else {
          // offset should === 0, length should === 1
          retOp.insert = nextOp.insert;
        }
        return retOp;
      }
    } else {
      return { retain: Infinity };
    }
  };

  Iterator.prototype.peek = function () {
    return this.ops[this.index];
  };

  Iterator.prototype.peekLength = function () {
    if (this.ops[this.index]) {
      // Should never return 0 if our index is being managed correctly
      return lib.length(this.ops[this.index]) - this.offset;
    } else {
      return Infinity;
    }
  };

  Iterator.prototype.peekType = function () {
    if (this.ops[this.index]) {
      if (typeof this.ops[this.index]['delete'] === 'number') {
        return 'delete';
      } else if (typeof this.ops[this.index].retain === 'number') {
        return 'retain';
      } else {
        return 'insert';
      }
    }
    return 'retain';
  };

  Iterator.prototype.rest = function () {
    if (!this.hasNext()) {
      return [];
    } else if (this.offset === 0) {
      return this.ops.slice(this.index);
    } else {
      var offset = this.offset;
      var index = this.index;
      var next = this.next();
      var rest = this.ops.slice(this.index);
      this.offset = offset;
      this.index = index;
      return [next].concat(rest);
    }
  };


  module.exports = lib;


  /***/ }),
  /* 21 */
  /***/ (function(module, exports) {

  var clone = (function() {

  function _instanceof(obj, type) {
    return type != null && obj instanceof type;
  }

  var nativeMap;
  try {
    nativeMap = Map;
  } catch(_) {
    // maybe a reference error because no `Map`. Give it a dummy value that no
    // value will ever be an instanceof.
    nativeMap = function() {};
  }

  var nativeSet;
  try {
    nativeSet = Set;
  } catch(_) {
    nativeSet = function() {};
  }

  var nativePromise;
  try {
    nativePromise = Promise;
  } catch(_) {
    nativePromise = function() {};
  }

  /**
   * Clones (copies) an Object using deep copying.
   *
   * This function supports circular references by default, but if you are certain
   * there are no circular references in your object, you can save some CPU time
   * by calling clone(obj, false).
   *
   * Caution: if `circular` is false and `parent` contains circular references,
   * your program may enter an infinite loop and crash.
   *
   * @param `parent` - the object to be cloned
   * @param `circular` - set to true if the object to be cloned may contain
   *    circular references. (optional - true by default)
   * @param `depth` - set to a number if the object is only to be cloned to
   *    a particular depth. (optional - defaults to Infinity)
   * @param `prototype` - sets the prototype to be used when cloning an object.
   *    (optional - defaults to parent prototype).
   * @param `includeNonEnumerable` - set to true if the non-enumerable properties
   *    should be cloned as well. Non-enumerable properties on the prototype
   *    chain will be ignored. (optional - false by default)
  */
  function clone(parent, circular, depth, prototype, includeNonEnumerable) {
    if (typeof circular === 'object') {
      depth = circular.depth;
      prototype = circular.prototype;
      includeNonEnumerable = circular.includeNonEnumerable;
      circular = circular.circular;
    }
    // maintain two arrays for circular references, where corresponding parents
    // and children have the same index
    var allParents = [];
    var allChildren = [];

    var useBuffer = typeof Buffer != 'undefined';

    if (typeof circular == 'undefined')
      circular = true;

    if (typeof depth == 'undefined')
      depth = Infinity;

    // recurse this function so we don't reset allParents and allChildren
    function _clone(parent, depth) {
      // cloning null always returns null
      if (parent === null)
        return null;

      if (depth === 0)
        return parent;

      var child;
      var proto;
      if (typeof parent != 'object') {
        return parent;
      }

      if (_instanceof(parent, nativeMap)) {
        child = new nativeMap();
      } else if (_instanceof(parent, nativeSet)) {
        child = new nativeSet();
      } else if (_instanceof(parent, nativePromise)) {
        child = new nativePromise(function (resolve, reject) {
          parent.then(function(value) {
            resolve(_clone(value, depth - 1));
          }, function(err) {
            reject(_clone(err, depth - 1));
          });
        });
      } else if (clone.__isArray(parent)) {
        child = [];
      } else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, __getRegExpFlags(parent));
        if (parent.lastIndex) child.lastIndex = parent.lastIndex;
      } else if (clone.__isDate(parent)) {
        child = new Date(parent.getTime());
      } else if (useBuffer && Buffer.isBuffer(parent)) {
        if (Buffer.allocUnsafe) {
          // Node.js >= 4.5.0
          child = Buffer.allocUnsafe(parent.length);
        } else {
          // Older Node.js versions
          child = new Buffer(parent.length);
        }
        parent.copy(child);
        return child;
      } else if (_instanceof(parent, Error)) {
        child = Object.create(parent);
      } else {
        if (typeof prototype == 'undefined') {
          proto = Object.getPrototypeOf(parent);
          child = Object.create(proto);
        }
        else {
          child = Object.create(prototype);
          proto = prototype;
        }
      }

      if (circular) {
        var index = allParents.indexOf(parent);

        if (index != -1) {
          return allChildren[index];
        }
        allParents.push(parent);
        allChildren.push(child);
      }

      if (_instanceof(parent, nativeMap)) {
        parent.forEach(function(value, key) {
          var keyChild = _clone(key, depth - 1);
          var valueChild = _clone(value, depth - 1);
          child.set(keyChild, valueChild);
        });
      }
      if (_instanceof(parent, nativeSet)) {
        parent.forEach(function(value) {
          var entryChild = _clone(value, depth - 1);
          child.add(entryChild);
        });
      }

      for (var i in parent) {
        var attrs;
        if (proto) {
          attrs = Object.getOwnPropertyDescriptor(proto, i);
        }

        if (attrs && attrs.set == null) {
          continue;
        }
        child[i] = _clone(parent[i], depth - 1);
      }

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(parent);
        for (var i = 0; i < symbols.length; i++) {
          // Don't need to worry about cloning a symbol because it is a primitive,
          // like a number or string.
          var symbol = symbols[i];
          var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
          if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
            continue;
          }
          child[symbol] = _clone(parent[symbol], depth - 1);
          if (!descriptor.enumerable) {
            Object.defineProperty(child, symbol, {
              enumerable: false
            });
          }
        }
      }

      if (includeNonEnumerable) {
        var allPropertyNames = Object.getOwnPropertyNames(parent);
        for (var i = 0; i < allPropertyNames.length; i++) {
          var propertyName = allPropertyNames[i];
          var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
          if (descriptor && descriptor.enumerable) {
            continue;
          }
          child[propertyName] = _clone(parent[propertyName], depth - 1);
          Object.defineProperty(child, propertyName, {
            enumerable: false
          });
        }
      }

      return child;
    }

    return _clone(parent, depth);
  }

  /**
   * Simple flat clone using prototype, accepts only objects, usefull for property
   * override on FLAT configuration object (no nested props).
   *
   * USE WITH CAUTION! This may not behave as you wish if you do not know how this
   * works.
   */
  clone.clonePrototype = function clonePrototype(parent) {
    if (parent === null)
      return null;

    var c = function () {};
    c.prototype = parent;
    return new c();
  };

  // private utility functions

  function __objToStr(o) {
    return Object.prototype.toString.call(o);
  }
  clone.__objToStr = __objToStr;

  function __isDate(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Date]';
  }
  clone.__isDate = __isDate;

  function __isArray(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Array]';
  }
  clone.__isArray = __isArray;

  function __isRegExp(o) {
    return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
  }
  clone.__isRegExp = __isRegExp;

  function __getRegExpFlags(re) {
    var flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    return flags;
  }
  clone.__getRegExpFlags = __getRegExpFlags;

  return clone;
  })();

  if (typeof module === 'object' && module.exports) {
    module.exports = clone;
  }


  /***/ }),
  /* 22 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _emitter = __webpack_require__(8);

  var _emitter2 = _interopRequireDefault(_emitter);

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  var _break = __webpack_require__(16);

  var _break2 = _interopRequireDefault(_break);

  var _code = __webpack_require__(13);

  var _code2 = _interopRequireDefault(_code);

  var _container = __webpack_require__(25);

  var _container2 = _interopRequireDefault(_container);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function isLine(blot) {
    return blot instanceof _block2.default || blot instanceof _block.BlockEmbed;
  }

  var Scroll = function (_Parchment$Scroll) {
    _inherits(Scroll, _Parchment$Scroll);

    function Scroll(domNode, config) {
      _classCallCheck(this, Scroll);

      var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this, domNode));

      _this.emitter = config.emitter;
      if (Array.isArray(config.whitelist)) {
        _this.whitelist = config.whitelist.reduce(function (whitelist, format) {
          whitelist[format] = true;
          return whitelist;
        }, {});
      }
      // Some reason fixes composition issues with character languages in Windows/Chrome, Safari
      _this.domNode.addEventListener('DOMNodeInserted', function () {});
      _this.optimize();
      _this.enable();
      return _this;
    }

    _createClass(Scroll, [{
      key: 'batchStart',
      value: function batchStart() {
        this.batch = true;
      }
    }, {
      key: 'batchEnd',
      value: function batchEnd() {
        this.batch = false;
        this.optimize();
      }
    }, {
      key: 'deleteAt',
      value: function deleteAt(index, length) {
        var _line = this.line(index),
            _line2 = _slicedToArray(_line, 2),
            first = _line2[0],
            offset = _line2[1];

        var _line3 = this.line(index + length),
            _line4 = _slicedToArray(_line3, 1),
            last = _line4[0];

        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'deleteAt', this).call(this, index, length);
        if (last != null && first !== last && offset > 0) {
          if (first instanceof _block.BlockEmbed || last instanceof _block.BlockEmbed) {
            this.optimize();
            return;
          }
          if (first instanceof _code2.default) {
            var newlineIndex = first.newlineIndex(first.length(), true);
            if (newlineIndex > -1) {
              first = first.split(newlineIndex + 1);
              if (first === last) {
                this.optimize();
                return;
              }
            }
          } else if (last instanceof _code2.default) {
            var _newlineIndex = last.newlineIndex(0);
            if (_newlineIndex > -1) {
              last.split(_newlineIndex + 1);
            }
          }
          var ref = last.children.head instanceof _break2.default ? null : last.children.head;
          first.moveChildren(last, ref);
          first.remove();
        }
        this.optimize();
      }
    }, {
      key: 'enable',
      value: function enable() {
        var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.domNode.setAttribute('contenteditable', enabled);
      }
    }, {
      key: 'formatAt',
      value: function formatAt(index, length, format, value) {
        if (this.whitelist != null && !this.whitelist[format]) return;
        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'formatAt', this).call(this, index, length, format, value);
        this.optimize();
      }
    }, {
      key: 'insertAt',
      value: function insertAt(index, value, def) {
        if (def != null && this.whitelist != null && !this.whitelist[value]) return;
        if (index >= this.length()) {
          if (def == null || _parchment2.default.query(value, _parchment2.default.Scope.BLOCK) == null) {
            var blot = _parchment2.default.create(this.statics.defaultChild);
            this.appendChild(blot);
            if (def == null && value.endsWith('\n')) {
              value = value.slice(0, -1);
            }
            blot.insertAt(0, value, def);
          } else {
            var embed = _parchment2.default.create(value, def);
            this.appendChild(embed);
          }
        } else {
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertAt', this).call(this, index, value, def);
        }
        this.optimize();
      }
    }, {
      key: 'insertBefore',
      value: function insertBefore(blot, ref) {
        if (blot.statics.scope === _parchment2.default.Scope.INLINE_BLOT) {
          var wrapper = _parchment2.default.create(this.statics.defaultChild);
          wrapper.appendChild(blot);
          blot = wrapper;
        }
        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertBefore', this).call(this, blot, ref);
      }
    }, {
      key: 'leaf',
      value: function leaf(index) {
        return this.path(index).pop() || [null, -1];
      }
    }, {
      key: 'line',
      value: function line(index) {
        if (index === this.length()) {
          return this.line(index - 1);
        }
        return this.descendant(isLine, index);
      }
    }, {
      key: 'lines',
      value: function lines() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

        var getLines = function getLines(blot, index, length) {
          var lines = [],
              lengthLeft = length;
          blot.children.forEachAt(index, length, function (child, index, length) {
            if (isLine(child)) {
              lines.push(child);
            } else if (child instanceof _parchment2.default.Container) {
              lines = lines.concat(getLines(child, index, lengthLeft));
            }
            lengthLeft -= length;
          });
          return lines;
        };
        return getLines(this, index, length);
      }
    }, {
      key: 'optimize',
      value: function optimize() {
        var mutations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.batch === true) return;
        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'optimize', this).call(this, mutations, context);
        if (mutations.length > 0) {
          this.emitter.emit(_emitter2.default.events.SCROLL_OPTIMIZE, mutations, context);
        }
      }
    }, {
      key: 'path',
      value: function path(index) {
        return _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'path', this).call(this, index).slice(1); // Exclude self
      }
    }, {
      key: 'update',
      value: function update(mutations) {
        if (this.batch === true) return;
        var source = _emitter2.default.sources.USER;
        if (typeof mutations === 'string') {
          source = mutations;
        }
        if (!Array.isArray(mutations)) {
          mutations = this.observer.takeRecords();
        }
        if (mutations.length > 0) {
          this.emitter.emit(_emitter2.default.events.SCROLL_BEFORE_UPDATE, source, mutations);
        }
        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'update', this).call(this, mutations.concat([])); // pass copy
        if (mutations.length > 0) {
          this.emitter.emit(_emitter2.default.events.SCROLL_UPDATE, source, mutations);
        }
      }
    }]);

    return Scroll;
  }(_parchment2.default.Scroll);

  Scroll.blotName = 'scroll';
  Scroll.className = 'ql-editor';
  Scroll.tagName = 'DIV';
  Scroll.defaultChild = 'block';
  Scroll.allowedChildren = [_block2.default, _block.BlockEmbed, _container2.default];

  exports.default = Scroll;

  /***/ }),
  /* 23 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SHORTKEY = exports.default = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _clone = __webpack_require__(21);

  var _clone2 = _interopRequireDefault(_clone);

  var _deepEqual = __webpack_require__(11);

  var _deepEqual2 = _interopRequireDefault(_deepEqual);

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _op = __webpack_require__(20);

  var _op2 = _interopRequireDefault(_op);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _logger = __webpack_require__(10);

  var _logger2 = _interopRequireDefault(_logger);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var debug = (0, _logger2.default)('quill:keyboard');

  var SHORTKEY = /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';

  var Keyboard = function (_Module) {
    _inherits(Keyboard, _Module);

    _createClass(Keyboard, null, [{
      key: 'match',
      value: function match(evt, binding) {
        binding = normalize(binding);
        if (['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(function (key) {
          return !!binding[key] !== evt[key] && binding[key] !== null;
        })) {
          return false;
        }
        return binding.key === (evt.which || evt.keyCode);
      }
    }]);

    function Keyboard(quill, options) {
      _classCallCheck(this, Keyboard);

      var _this = _possibleConstructorReturn(this, (Keyboard.__proto__ || Object.getPrototypeOf(Keyboard)).call(this, quill, options));

      _this.bindings = {};
      Object.keys(_this.options.bindings).forEach(function (name) {
        if (name === 'list autofill' && quill.scroll.whitelist != null && !quill.scroll.whitelist['list']) {
          return;
        }
        if (_this.options.bindings[name]) {
          _this.addBinding(_this.options.bindings[name]);
        }
      });
      _this.addBinding({ key: Keyboard.keys.ENTER, shiftKey: null }, handleEnter);
      _this.addBinding({ key: Keyboard.keys.ENTER, metaKey: null, ctrlKey: null, altKey: null }, function () {});
      if (/Firefox/i.test(navigator.userAgent)) {
        // Need to handle delete and backspace for Firefox in the general case #1171
        _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true }, handleBackspace);
        _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true }, handleDelete);
      } else {
        _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true, prefix: /^.?$/ }, handleBackspace);
        _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true, suffix: /^.?$/ }, handleDelete);
      }
      _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: false }, handleDeleteRange);
      _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: false }, handleDeleteRange);
      _this.addBinding({ key: Keyboard.keys.BACKSPACE, altKey: null, ctrlKey: null, metaKey: null, shiftKey: null }, { collapsed: true, offset: 0 }, handleBackspace);
      _this.listen();
      return _this;
    }

    _createClass(Keyboard, [{
      key: 'addBinding',
      value: function addBinding(key) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var binding = normalize(key);
        if (binding == null || binding.key == null) {
          return debug.warn('Attempted to add invalid keyboard binding', binding);
        }
        if (typeof context === 'function') {
          context = { handler: context };
        }
        if (typeof handler === 'function') {
          handler = { handler: handler };
        }
        binding = (0, _extend2.default)(binding, context, handler);
        this.bindings[binding.key] = this.bindings[binding.key] || [];
        this.bindings[binding.key].push(binding);
      }
    }, {
      key: 'listen',
      value: function listen() {
        var _this2 = this;

        this.quill.root.addEventListener('keydown', function (evt) {
          if (evt.defaultPrevented) return;
          var which = evt.which || evt.keyCode;
          var bindings = (_this2.bindings[which] || []).filter(function (binding) {
            return Keyboard.match(evt, binding);
          });
          if (bindings.length === 0) return;
          var range = _this2.quill.getSelection();
          if (range == null || !_this2.quill.hasFocus()) return;

          var _quill$getLine = _this2.quill.getLine(range.index),
              _quill$getLine2 = _slicedToArray(_quill$getLine, 2),
              line = _quill$getLine2[0],
              offset = _quill$getLine2[1];

          var _quill$getLeaf = _this2.quill.getLeaf(range.index),
              _quill$getLeaf2 = _slicedToArray(_quill$getLeaf, 2),
              leafStart = _quill$getLeaf2[0],
              offsetStart = _quill$getLeaf2[1];

          var _ref = range.length === 0 ? [leafStart, offsetStart] : _this2.quill.getLeaf(range.index + range.length),
              _ref2 = _slicedToArray(_ref, 2),
              leafEnd = _ref2[0],
              offsetEnd = _ref2[1];

          var prefixText = leafStart instanceof _parchment2.default.Text ? leafStart.value().slice(0, offsetStart) : '';
          var suffixText = leafEnd instanceof _parchment2.default.Text ? leafEnd.value().slice(offsetEnd) : '';
          var curContext = {
            collapsed: range.length === 0,
            empty: range.length === 0 && line.length() <= 1,
            format: _this2.quill.getFormat(range),
            offset: offset,
            prefix: prefixText,
            suffix: suffixText
          };
          var prevented = bindings.some(function (binding) {
            if (binding.collapsed != null && binding.collapsed !== curContext.collapsed) return false;
            if (binding.empty != null && binding.empty !== curContext.empty) return false;
            if (binding.offset != null && binding.offset !== curContext.offset) return false;
            if (Array.isArray(binding.format)) {
              // any format is present
              if (binding.format.every(function (name) {
                return curContext.format[name] == null;
              })) {
                return false;
              }
            } else if (_typeof(binding.format) === 'object') {
              // all formats must match
              if (!Object.keys(binding.format).every(function (name) {
                if (binding.format[name] === true) return curContext.format[name] != null;
                if (binding.format[name] === false) return curContext.format[name] == null;
                return (0, _deepEqual2.default)(binding.format[name], curContext.format[name]);
              })) {
                return false;
              }
            }
            if (binding.prefix != null && !binding.prefix.test(curContext.prefix)) return false;
            if (binding.suffix != null && !binding.suffix.test(curContext.suffix)) return false;
            return binding.handler.call(_this2, range, curContext) !== true;
          });
          if (prevented) {
            evt.preventDefault();
          }
        });
      }
    }]);

    return Keyboard;
  }(_module2.default);

  Keyboard.keys = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46
  };

  Keyboard.DEFAULTS = {
    bindings: {
      'bold': makeFormatHandler('bold'),
      'italic': makeFormatHandler('italic'),
      'underline': makeFormatHandler('underline'),
      'indent': {
        // highlight tab or tab at beginning of list, indent or blockquote
        key: Keyboard.keys.TAB,
        format: ['blockquote', 'indent', 'list'],
        handler: function handler(range, context) {
          if (context.collapsed && context.offset !== 0) return true;
          this.quill.format('indent', '+1', _quill2.default.sources.USER);
        }
      },
      'outdent': {
        key: Keyboard.keys.TAB,
        shiftKey: true,
        format: ['blockquote', 'indent', 'list'],
        // highlight tab or tab at beginning of list, indent or blockquote
        handler: function handler(range, context) {
          if (context.collapsed && context.offset !== 0) return true;
          this.quill.format('indent', '-1', _quill2.default.sources.USER);
        }
      },
      'outdent backspace': {
        key: Keyboard.keys.BACKSPACE,
        collapsed: true,
        shiftKey: null,
        metaKey: null,
        ctrlKey: null,
        altKey: null,
        format: ['indent', 'list'],
        offset: 0,
        handler: function handler(range, context) {
          if (context.format.indent != null) {
            this.quill.format('indent', '-1', _quill2.default.sources.USER);
          } else if (context.format.list != null) {
            this.quill.format('list', false, _quill2.default.sources.USER);
          }
        }
      },
      'indent code-block': makeCodeBlockHandler(true),
      'outdent code-block': makeCodeBlockHandler(false),
      'remove tab': {
        key: Keyboard.keys.TAB,
        shiftKey: true,
        collapsed: true,
        prefix: /\t$/,
        handler: function handler(range) {
          this.quill.deleteText(range.index - 1, 1, _quill2.default.sources.USER);
        }
      },
      'tab': {
        key: Keyboard.keys.TAB,
        handler: function handler(range) {
          this.quill.history.cutoff();
          var delta = new _quillDelta2.default().retain(range.index).delete(range.length).insert('\t');
          this.quill.updateContents(delta, _quill2.default.sources.USER);
          this.quill.history.cutoff();
          this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
        }
      },
      'list empty enter': {
        key: Keyboard.keys.ENTER,
        collapsed: true,
        format: ['list'],
        empty: true,
        handler: function handler(range, context) {
          this.quill.format('list', false, _quill2.default.sources.USER);
          if (context.format.indent) {
            this.quill.format('indent', false, _quill2.default.sources.USER);
          }
        }
      },
      'checklist enter': {
        key: Keyboard.keys.ENTER,
        collapsed: true,
        format: { list: 'checked' },
        handler: function handler(range) {
          var _quill$getLine3 = this.quill.getLine(range.index),
              _quill$getLine4 = _slicedToArray(_quill$getLine3, 2),
              line = _quill$getLine4[0],
              offset = _quill$getLine4[1];

          var formats = (0, _extend2.default)({}, line.formats(), { list: 'checked' });
          var delta = new _quillDelta2.default().retain(range.index).insert('\n', formats).retain(line.length() - offset - 1).retain(1, { list: 'unchecked' });
          this.quill.updateContents(delta, _quill2.default.sources.USER);
          this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
          this.quill.scrollIntoView();
        }
      },
      'header enter': {
        key: Keyboard.keys.ENTER,
        collapsed: true,
        format: ['header'],
        suffix: /^$/,
        handler: function handler(range, context) {
          var _quill$getLine5 = this.quill.getLine(range.index),
              _quill$getLine6 = _slicedToArray(_quill$getLine5, 2),
              line = _quill$getLine6[0],
              offset = _quill$getLine6[1];

          var delta = new _quillDelta2.default().retain(range.index).insert('\n', context.format).retain(line.length() - offset - 1).retain(1, { header: null });
          this.quill.updateContents(delta, _quill2.default.sources.USER);
          this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
          this.quill.scrollIntoView();
        }
      },
      'list autofill': {
        key: ' ',
        collapsed: true,
        format: { list: false },
        prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
        handler: function handler(range, context) {
          var length = context.prefix.length;

          var _quill$getLine7 = this.quill.getLine(range.index),
              _quill$getLine8 = _slicedToArray(_quill$getLine7, 2),
              line = _quill$getLine8[0],
              offset = _quill$getLine8[1];

          if (offset > length) return true;
          var value = void 0;
          switch (context.prefix.trim()) {
            case '[]':case '[ ]':
              value = 'unchecked';
              break;
            case '[x]':
              value = 'checked';
              break;
            case '-':case '*':
              value = 'bullet';
              break;
            default:
              value = 'ordered';
          }
          this.quill.insertText(range.index, ' ', _quill2.default.sources.USER);
          this.quill.history.cutoff();
          var delta = new _quillDelta2.default().retain(range.index - offset).delete(length + 1).retain(line.length() - 2 - offset).retain(1, { list: value });
          this.quill.updateContents(delta, _quill2.default.sources.USER);
          this.quill.history.cutoff();
          this.quill.setSelection(range.index - length, _quill2.default.sources.SILENT);
        }
      },
      'code exit': {
        key: Keyboard.keys.ENTER,
        collapsed: true,
        format: ['code-block'],
        prefix: /\n\n$/,
        suffix: /^\s+$/,
        handler: function handler(range) {
          var _quill$getLine9 = this.quill.getLine(range.index),
              _quill$getLine10 = _slicedToArray(_quill$getLine9, 2),
              line = _quill$getLine10[0],
              offset = _quill$getLine10[1];

          var delta = new _quillDelta2.default().retain(range.index + line.length() - offset - 2).retain(1, { 'code-block': null }).delete(1);
          this.quill.updateContents(delta, _quill2.default.sources.USER);
        }
      },
      'embed left': makeEmbedArrowHandler(Keyboard.keys.LEFT, false),
      'embed left shift': makeEmbedArrowHandler(Keyboard.keys.LEFT, true),
      'embed right': makeEmbedArrowHandler(Keyboard.keys.RIGHT, false),
      'embed right shift': makeEmbedArrowHandler(Keyboard.keys.RIGHT, true)
    }
  };

  function makeEmbedArrowHandler(key, shiftKey) {
    var _ref3;

    var where = key === Keyboard.keys.LEFT ? 'prefix' : 'suffix';
    return _ref3 = {
      key: key,
      shiftKey: shiftKey,
      altKey: null
    }, _defineProperty(_ref3, where, /^$/), _defineProperty(_ref3, 'handler', function handler(range) {
      var index = range.index;
      if (key === Keyboard.keys.RIGHT) {
        index += range.length + 1;
      }

      var _quill$getLeaf3 = this.quill.getLeaf(index),
          _quill$getLeaf4 = _slicedToArray(_quill$getLeaf3, 1),
          leaf = _quill$getLeaf4[0];

      if (!(leaf instanceof _parchment2.default.Embed)) return true;
      if (key === Keyboard.keys.LEFT) {
        if (shiftKey) {
          this.quill.setSelection(range.index - 1, range.length + 1, _quill2.default.sources.USER);
        } else {
          this.quill.setSelection(range.index - 1, _quill2.default.sources.USER);
        }
      } else {
        if (shiftKey) {
          this.quill.setSelection(range.index, range.length + 1, _quill2.default.sources.USER);
        } else {
          this.quill.setSelection(range.index + range.length + 1, _quill2.default.sources.USER);
        }
      }
      return false;
    }), _ref3;
  }

  function handleBackspace(range, context) {
    if (range.index === 0 || this.quill.getLength() <= 1) return;

    var _quill$getLine11 = this.quill.getLine(range.index),
        _quill$getLine12 = _slicedToArray(_quill$getLine11, 1),
        line = _quill$getLine12[0];

    var formats = {};
    if (context.offset === 0) {
      var _quill$getLine13 = this.quill.getLine(range.index - 1),
          _quill$getLine14 = _slicedToArray(_quill$getLine13, 1),
          prev = _quill$getLine14[0];

      if (prev != null && prev.length() > 1) {
        var curFormats = line.formats();
        var prevFormats = this.quill.getFormat(range.index - 1, 1);
        formats = _op2.default.attributes.diff(curFormats, prevFormats) || {};
      }
    }
    // Check for astral symbols
    var length = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(context.prefix) ? 2 : 1;
    this.quill.deleteText(range.index - length, length, _quill2.default.sources.USER);
    if (Object.keys(formats).length > 0) {
      this.quill.formatLine(range.index - length, length, formats, _quill2.default.sources.USER);
    }
    this.quill.focus();
  }

  function handleDelete(range, context) {
    // Check for astral symbols
    var length = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(context.suffix) ? 2 : 1;
    if (range.index >= this.quill.getLength() - length) return;
    var formats = {},
        nextLength = 0;

    var _quill$getLine15 = this.quill.getLine(range.index),
        _quill$getLine16 = _slicedToArray(_quill$getLine15, 1),
        line = _quill$getLine16[0];

    if (context.offset >= line.length() - 1) {
      var _quill$getLine17 = this.quill.getLine(range.index + 1),
          _quill$getLine18 = _slicedToArray(_quill$getLine17, 1),
          next = _quill$getLine18[0];

      if (next) {
        var curFormats = line.formats();
        var nextFormats = this.quill.getFormat(range.index, 1);
        formats = _op2.default.attributes.diff(curFormats, nextFormats) || {};
        nextLength = next.length();
      }
    }
    this.quill.deleteText(range.index, length, _quill2.default.sources.USER);
    if (Object.keys(formats).length > 0) {
      this.quill.formatLine(range.index + nextLength - 1, length, formats, _quill2.default.sources.USER);
    }
  }

  function handleDeleteRange(range) {
    var lines = this.quill.getLines(range);
    var formats = {};
    if (lines.length > 1) {
      var firstFormats = lines[0].formats();
      var lastFormats = lines[lines.length - 1].formats();
      formats = _op2.default.attributes.diff(lastFormats, firstFormats) || {};
    }
    this.quill.deleteText(range, _quill2.default.sources.USER);
    if (Object.keys(formats).length > 0) {
      this.quill.formatLine(range.index, 1, formats, _quill2.default.sources.USER);
    }
    this.quill.setSelection(range.index, _quill2.default.sources.SILENT);
    this.quill.focus();
  }

  function handleEnter(range, context) {
    var _this3 = this;

    if (range.length > 0) {
      this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
    }
    var lineFormats = Object.keys(context.format).reduce(function (lineFormats, format) {
      if (_parchment2.default.query(format, _parchment2.default.Scope.BLOCK) && !Array.isArray(context.format[format])) {
        lineFormats[format] = context.format[format];
      }
      return lineFormats;
    }, {});
    this.quill.insertText(range.index, '\n', lineFormats, _quill2.default.sources.USER);
    // Earlier scroll.deleteAt might have messed up our selection,
    // so insertText's built in selection preservation is not reliable
    this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
    this.quill.focus();
    Object.keys(context.format).forEach(function (name) {
      if (lineFormats[name] != null) return;
      if (Array.isArray(context.format[name])) return;
      if (name === 'link') return;
      _this3.quill.format(name, context.format[name], _quill2.default.sources.USER);
    });
  }

  function makeCodeBlockHandler(indent) {
    return {
      key: Keyboard.keys.TAB,
      shiftKey: !indent,
      format: { 'code-block': true },
      handler: function handler(range) {
        var CodeBlock = _parchment2.default.query('code-block');
        var index = range.index,
            length = range.length;

        var _quill$scroll$descend = this.quill.scroll.descendant(CodeBlock, index),
            _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
            block = _quill$scroll$descend2[0],
            offset = _quill$scroll$descend2[1];

        if (block == null) return;
        var scrollIndex = this.quill.getIndex(block);
        var start = block.newlineIndex(offset, true) + 1;
        var end = block.newlineIndex(scrollIndex + offset + length);
        var lines = block.domNode.textContent.slice(start, end).split('\n');
        offset = 0;
        lines.forEach(function (line, i) {
          if (indent) {
            block.insertAt(start + offset, CodeBlock.TAB);
            offset += CodeBlock.TAB.length;
            if (i === 0) {
              index += CodeBlock.TAB.length;
            } else {
              length += CodeBlock.TAB.length;
            }
          } else if (line.startsWith(CodeBlock.TAB)) {
            block.deleteAt(start + offset, CodeBlock.TAB.length);
            offset -= CodeBlock.TAB.length;
            if (i === 0) {
              index -= CodeBlock.TAB.length;
            } else {
              length -= CodeBlock.TAB.length;
            }
          }
          offset += line.length + 1;
        });
        this.quill.update(_quill2.default.sources.USER);
        this.quill.setSelection(index, length, _quill2.default.sources.SILENT);
      }
    };
  }

  function makeFormatHandler(format) {
    return {
      key: format[0].toUpperCase(),
      shortKey: true,
      handler: function handler(range, context) {
        this.quill.format(format, !context.format[format], _quill2.default.sources.USER);
      }
    };
  }

  function normalize(binding) {
    if (typeof binding === 'string' || typeof binding === 'number') {
      return normalize({ key: binding });
    }
    if ((typeof binding === 'undefined' ? 'undefined' : _typeof(binding)) === 'object') {
      binding = (0, _clone2.default)(binding, false);
    }
    if (typeof binding.key === 'string') {
      if (Keyboard.keys[binding.key.toUpperCase()] != null) {
        binding.key = Keyboard.keys[binding.key.toUpperCase()];
      } else if (binding.key.length === 1) {
        binding.key = binding.key.toUpperCase().charCodeAt(0);
      } else {
        return null;
      }
    }
    if (binding.shortKey) {
      binding[SHORTKEY] = binding.shortKey;
      delete binding.shortKey;
    }
    return binding;
  }

  exports.default = Keyboard;
  exports.SHORTKEY = SHORTKEY;

  /***/ }),
  /* 24 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _text = __webpack_require__(7);

  var _text2 = _interopRequireDefault(_text);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Cursor = function (_Parchment$Embed) {
    _inherits(Cursor, _Parchment$Embed);

    _createClass(Cursor, null, [{
      key: 'value',
      value: function value() {
        return undefined;
      }
    }]);

    function Cursor(domNode, selection) {
      _classCallCheck(this, Cursor);

      var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this, domNode));

      _this.selection = selection;
      _this.textNode = document.createTextNode(Cursor.CONTENTS);
      _this.domNode.appendChild(_this.textNode);
      _this._length = 0;
      return _this;
    }

    _createClass(Cursor, [{
      key: 'detach',
      value: function detach() {
        // super.detach() will also clear domNode.__blot
        if (this.parent != null) this.parent.removeChild(this);
      }
    }, {
      key: 'format',
      value: function format(name, value) {
        if (this._length !== 0) {
          return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'format', this).call(this, name, value);
        }
        var target = this,
            index = 0;
        while (target != null && target.statics.scope !== _parchment2.default.Scope.BLOCK_BLOT) {
          index += target.offset(target.parent);
          target = target.parent;
        }
        if (target != null) {
          this._length = Cursor.CONTENTS.length;
          target.optimize();
          target.formatAt(index, Cursor.CONTENTS.length, name, value);
          this._length = 0;
        }
      }
    }, {
      key: 'index',
      value: function index(node, offset) {
        if (node === this.textNode) return 0;
        return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'index', this).call(this, node, offset);
      }
    }, {
      key: 'length',
      value: function length() {
        return this._length;
      }
    }, {
      key: 'position',
      value: function position() {
        return [this.textNode, this.textNode.data.length];
      }
    }, {
      key: 'remove',
      value: function remove() {
        _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'remove', this).call(this);
        this.parent = null;
      }
    }, {
      key: 'restore',
      value: function restore() {
        if (this.selection.composing || this.parent == null) return;
        var textNode = this.textNode;
        var range = this.selection.getNativeRange();
        var restoreText = void 0,
            start = void 0,
            end = void 0;
        if (range != null && range.start.node === textNode && range.end.node === textNode) {
          var _ref = [textNode, range.start.offset, range.end.offset];
          restoreText = _ref[0];
          start = _ref[1];
          end = _ref[2];
        }
        // Link format will insert text outside of anchor tag
        while (this.domNode.lastChild != null && this.domNode.lastChild !== this.textNode) {
          this.domNode.parentNode.insertBefore(this.domNode.lastChild, this.domNode);
        }
        if (this.textNode.data !== Cursor.CONTENTS) {
          var text = this.textNode.data.split(Cursor.CONTENTS).join('');
          if (this.next instanceof _text2.default) {
            restoreText = this.next.domNode;
            this.next.insertAt(0, text);
            this.textNode.data = Cursor.CONTENTS;
          } else {
            this.textNode.data = text;
            this.parent.insertBefore(_parchment2.default.create(this.textNode), this);
            this.textNode = document.createTextNode(Cursor.CONTENTS);
            this.domNode.appendChild(this.textNode);
          }
        }
        this.remove();
        if (start != null) {
          var _map = [start, end].map(function (offset) {
            return Math.max(0, Math.min(restoreText.data.length, offset - 1));
          });

          var _map2 = _slicedToArray(_map, 2);

          start = _map2[0];
          end = _map2[1];

          return {
            startNode: restoreText,
            startOffset: start,
            endNode: restoreText,
            endOffset: end
          };
        }
      }
    }, {
      key: 'update',
      value: function update(mutations, context) {
        var _this2 = this;

        if (mutations.some(function (mutation) {
          return mutation.type === 'characterData' && mutation.target === _this2.textNode;
        })) {
          var range = this.restore();
          if (range) context.range = range;
        }
      }
    }, {
      key: 'value',
      value: function value() {
        return '';
      }
    }]);

    return Cursor;
  }(_parchment2.default.Embed);

  Cursor.blotName = 'cursor';
  Cursor.className = 'ql-cursor';
  Cursor.tagName = 'span';
  Cursor.CONTENTS = '\uFEFF'; // Zero width no break space


  exports.default = Cursor;

  /***/ }),
  /* 25 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Container = function (_Parchment$Container) {
    _inherits(Container, _Parchment$Container);

    function Container() {
      _classCallCheck(this, Container);

      return _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).apply(this, arguments));
    }

    return Container;
  }(_parchment2.default.Container);

  Container.allowedChildren = [_block2.default, _block.BlockEmbed, Container];

  exports.default = Container;

  /***/ }),
  /* 26 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ColorStyle = exports.ColorClass = exports.ColorAttributor = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ColorAttributor = function (_Parchment$Attributor) {
    _inherits(ColorAttributor, _Parchment$Attributor);

    function ColorAttributor() {
      _classCallCheck(this, ColorAttributor);

      return _possibleConstructorReturn(this, (ColorAttributor.__proto__ || Object.getPrototypeOf(ColorAttributor)).apply(this, arguments));
    }

    _createClass(ColorAttributor, [{
      key: 'value',
      value: function value(domNode) {
        var value = _get(ColorAttributor.prototype.__proto__ || Object.getPrototypeOf(ColorAttributor.prototype), 'value', this).call(this, domNode);
        if (!value.startsWith('rgb(')) return value;
        value = value.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
        return '#' + value.split(',').map(function (component) {
          return ('00' + parseInt(component).toString(16)).slice(-2);
        }).join('');
      }
    }]);

    return ColorAttributor;
  }(_parchment2.default.Attributor.Style);

  var ColorClass = new _parchment2.default.Attributor.Class('color', 'ql-color', {
    scope: _parchment2.default.Scope.INLINE
  });
  var ColorStyle = new ColorAttributor('color', 'color', {
    scope: _parchment2.default.Scope.INLINE
  });

  exports.ColorAttributor = ColorAttributor;
  exports.ColorClass = ColorClass;
  exports.ColorStyle = ColorStyle;

  /***/ }),
  /* 27 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.sanitize = exports.default = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Link = function (_Inline) {
    _inherits(Link, _Inline);

    function Link() {
      _classCallCheck(this, Link);

      return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    }

    _createClass(Link, [{
      key: 'format',
      value: function format(name, value) {
        if (name !== this.statics.blotName || !value) return _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), 'format', this).call(this, name, value);
        value = this.constructor.sanitize(value);
        this.domNode.setAttribute('href', value);
      }
    }], [{
      key: 'create',
      value: function create(value) {
        var node = _get(Link.__proto__ || Object.getPrototypeOf(Link), 'create', this).call(this, value);
        value = this.sanitize(value);
        node.setAttribute('href', value);
        node.setAttribute('rel', 'noopener noreferrer');
        node.setAttribute('target', '_blank');
        return node;
      }
    }, {
      key: 'formats',
      value: function formats(domNode) {
        return domNode.getAttribute('href');
      }
    }, {
      key: 'sanitize',
      value: function sanitize(url) {
        return _sanitize(url, this.PROTOCOL_WHITELIST) ? url : this.SANITIZED_URL;
      }
    }]);

    return Link;
  }(_inline2.default);

  Link.blotName = 'link';
  Link.tagName = 'A';
  Link.SANITIZED_URL = 'about:blank';
  Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel'];

  function _sanitize(url, protocols) {
    var anchor = document.createElement('a');
    anchor.href = url;
    var protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
    return protocols.indexOf(protocol) > -1;
  }

  exports.default = Link;
  exports.sanitize = _sanitize;

  /***/ }),
  /* 28 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _keyboard = __webpack_require__(23);

  var _keyboard2 = _interopRequireDefault(_keyboard);

  var _dropdown = __webpack_require__(107);

  var _dropdown2 = _interopRequireDefault(_dropdown);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var optionsCounter = 0;

  function toggleAriaAttribute(element, attribute) {
    element.setAttribute(attribute, !(element.getAttribute(attribute) === 'true'));
  }

  var Picker = function () {
    function Picker(select) {
      var _this = this;

      _classCallCheck(this, Picker);

      this.select = select;
      this.container = document.createElement('span');
      this.buildPicker();
      this.select.style.display = 'none';
      this.select.parentNode.insertBefore(this.container, this.select);

      this.label.addEventListener('mousedown', function () {
        _this.togglePicker();
      });
      this.label.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
          // Allows the "Enter" key to open the picker
          case _keyboard2.default.keys.ENTER:
            _this.togglePicker();
            break;

          // Allows the "Escape" key to close the picker
          case _keyboard2.default.keys.ESCAPE:
            _this.escape();
            event.preventDefault();
            break;
        }
      });
      this.select.addEventListener('change', this.update.bind(this));
    }

    _createClass(Picker, [{
      key: 'togglePicker',
      value: function togglePicker() {
        this.container.classList.toggle('ql-expanded');
        // Toggle aria-expanded and aria-hidden to make the picker accessible
        toggleAriaAttribute(this.label, 'aria-expanded');
        toggleAriaAttribute(this.options, 'aria-hidden');
      }
    }, {
      key: 'buildItem',
      value: function buildItem(option) {
        var _this2 = this;

        var item = document.createElement('span');
        item.tabIndex = '0';
        item.setAttribute('role', 'button');

        item.classList.add('ql-picker-item');
        if (option.hasAttribute('value')) {
          item.setAttribute('data-value', option.getAttribute('value'));
        }
        if (option.textContent) {
          item.setAttribute('data-label', option.textContent);
        }
        item.addEventListener('click', function () {
          _this2.selectItem(item, true);
        });
        item.addEventListener('keydown', function (event) {
          switch (event.keyCode) {
            // Allows the "Enter" key to select an item
            case _keyboard2.default.keys.ENTER:
              _this2.selectItem(item, true);
              event.preventDefault();
              break;

            // Allows the "Escape" key to close the picker
            case _keyboard2.default.keys.ESCAPE:
              _this2.escape();
              event.preventDefault();
              break;
          }
        });

        return item;
      }
    }, {
      key: 'buildLabel',
      value: function buildLabel() {
        var label = document.createElement('span');
        label.classList.add('ql-picker-label');
        label.innerHTML = _dropdown2.default;
        label.tabIndex = '0';
        label.setAttribute('role', 'button');
        label.setAttribute('aria-expanded', 'false');
        this.container.appendChild(label);
        return label;
      }
    }, {
      key: 'buildOptions',
      value: function buildOptions() {
        var _this3 = this;

        var options = document.createElement('span');
        options.classList.add('ql-picker-options');

        // Don't want screen readers to read this until options are visible
        options.setAttribute('aria-hidden', 'true');
        options.tabIndex = '-1';

        // Need a unique id for aria-controls
        options.id = 'ql-picker-options-' + optionsCounter;
        optionsCounter += 1;
        this.label.setAttribute('aria-controls', options.id);

        this.options = options;

        [].slice.call(this.select.options).forEach(function (option) {
          var item = _this3.buildItem(option);
          options.appendChild(item);
          if (option.selected === true) {
            _this3.selectItem(item);
          }
        });
        this.container.appendChild(options);
      }
    }, {
      key: 'buildPicker',
      value: function buildPicker() {
        var _this4 = this;

        [].slice.call(this.select.attributes).forEach(function (item) {
          _this4.container.setAttribute(item.name, item.value);
        });
        this.container.classList.add('ql-picker');
        this.label = this.buildLabel();
        this.buildOptions();
      }
    }, {
      key: 'escape',
      value: function escape() {
        var _this5 = this;

        // Close menu and return focus to trigger label
        this.close();
        // Need setTimeout for accessibility to ensure that the browser executes
        // focus on the next process thread and after any DOM content changes
        setTimeout(function () {
          return _this5.label.focus();
        }, 1);
      }
    }, {
      key: 'close',
      value: function close() {
        this.container.classList.remove('ql-expanded');
        this.label.setAttribute('aria-expanded', 'false');
        this.options.setAttribute('aria-hidden', 'true');
      }
    }, {
      key: 'selectItem',
      value: function selectItem(item) {
        var trigger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var selected = this.container.querySelector('.ql-selected');
        if (item === selected) return;
        if (selected != null) {
          selected.classList.remove('ql-selected');
        }
        if (item == null) return;
        item.classList.add('ql-selected');
        this.select.selectedIndex = [].indexOf.call(item.parentNode.children, item);
        if (item.hasAttribute('data-value')) {
          this.label.setAttribute('data-value', item.getAttribute('data-value'));
        } else {
          this.label.removeAttribute('data-value');
        }
        if (item.hasAttribute('data-label')) {
          this.label.setAttribute('data-label', item.getAttribute('data-label'));
        } else {
          this.label.removeAttribute('data-label');
        }
        if (trigger) {
          if (typeof Event === 'function') {
            this.select.dispatchEvent(new Event('change'));
          } else if ((typeof Event === 'undefined' ? 'undefined' : _typeof(Event)) === 'object') {
            // IE11
            var event = document.createEvent('Event');
            event.initEvent('change', true, true);
            this.select.dispatchEvent(event);
          }
          this.close();
        }
      }
    }, {
      key: 'update',
      value: function update() {
        var option = void 0;
        if (this.select.selectedIndex > -1) {
          var item = this.container.querySelector('.ql-picker-options').children[this.select.selectedIndex];
          option = this.select.options[this.select.selectedIndex];
          this.selectItem(item);
        } else {
          this.selectItem(null);
        }
        var isActive = option != null && option !== this.select.querySelector('option[selected]');
        this.label.classList.toggle('ql-active', isActive);
      }
    }]);

    return Picker;
  }();

  exports.default = Picker;

  /***/ }),
  /* 29 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  var _break = __webpack_require__(16);

  var _break2 = _interopRequireDefault(_break);

  var _container = __webpack_require__(25);

  var _container2 = _interopRequireDefault(_container);

  var _cursor = __webpack_require__(24);

  var _cursor2 = _interopRequireDefault(_cursor);

  var _embed = __webpack_require__(35);

  var _embed2 = _interopRequireDefault(_embed);

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  var _scroll = __webpack_require__(22);

  var _scroll2 = _interopRequireDefault(_scroll);

  var _text = __webpack_require__(7);

  var _text2 = _interopRequireDefault(_text);

  var _clipboard = __webpack_require__(55);

  var _clipboard2 = _interopRequireDefault(_clipboard);

  var _history = __webpack_require__(42);

  var _history2 = _interopRequireDefault(_history);

  var _keyboard = __webpack_require__(23);

  var _keyboard2 = _interopRequireDefault(_keyboard);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  _quill2.default.register({
    'blots/block': _block2.default,
    'blots/block/embed': _block.BlockEmbed,
    'blots/break': _break2.default,
    'blots/container': _container2.default,
    'blots/cursor': _cursor2.default,
    'blots/embed': _embed2.default,
    'blots/inline': _inline2.default,
    'blots/scroll': _scroll2.default,
    'blots/text': _text2.default,

    'modules/clipboard': _clipboard2.default,
    'modules/history': _history2.default,
    'modules/keyboard': _keyboard2.default
  });

  _parchment2.default.register(_block2.default, _break2.default, _cursor2.default, _inline2.default, _scroll2.default, _text2.default);

  exports.default = _quill2.default;

  /***/ }),
  /* 30 */
  /***/ (function(module, exports, __webpack_require__) {

  Object.defineProperty(exports, "__esModule", { value: true });
  var Registry = __webpack_require__(1);
  var ShadowBlot = /** @class */ (function () {
      function ShadowBlot(domNode) {
          this.domNode = domNode;
          // @ts-ignore
          this.domNode[Registry.DATA_KEY] = { blot: this };
      }
      Object.defineProperty(ShadowBlot.prototype, "statics", {
          // Hack for accessing inherited static methods
          get: function () {
              return this.constructor;
          },
          enumerable: true,
          configurable: true
      });
      ShadowBlot.create = function (value) {
          if (this.tagName == null) {
              throw new Registry.ParchmentError('Blot definition missing tagName');
          }
          var node;
          if (Array.isArray(this.tagName)) {
              if (typeof value === 'string') {
                  value = value.toUpperCase();
                  if (parseInt(value).toString() === value) {
                      value = parseInt(value);
                  }
              }
              if (typeof value === 'number') {
                  node = document.createElement(this.tagName[value - 1]);
              }
              else if (this.tagName.indexOf(value) > -1) {
                  node = document.createElement(value);
              }
              else {
                  node = document.createElement(this.tagName[0]);
              }
          }
          else {
              node = document.createElement(this.tagName);
          }
          if (this.className) {
              node.classList.add(this.className);
          }
          return node;
      };
      ShadowBlot.prototype.attach = function () {
          if (this.parent != null) {
              this.scroll = this.parent.scroll;
          }
      };
      ShadowBlot.prototype.clone = function () {
          var domNode = this.domNode.cloneNode(false);
          return Registry.create(domNode);
      };
      ShadowBlot.prototype.detach = function () {
          if (this.parent != null)
              this.parent.removeChild(this);
          // @ts-ignore
          delete this.domNode[Registry.DATA_KEY];
      };
      ShadowBlot.prototype.deleteAt = function (index, length) {
          var blot = this.isolate(index, length);
          blot.remove();
      };
      ShadowBlot.prototype.formatAt = function (index, length, name, value) {
          var blot = this.isolate(index, length);
          if (Registry.query(name, Registry.Scope.BLOT) != null && value) {
              blot.wrap(name, value);
          }
          else if (Registry.query(name, Registry.Scope.ATTRIBUTE) != null) {
              var parent = Registry.create(this.statics.scope);
              blot.wrap(parent);
              parent.format(name, value);
          }
      };
      ShadowBlot.prototype.insertAt = function (index, value, def) {
          var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
          var ref = this.split(index);
          this.parent.insertBefore(blot, ref);
      };
      ShadowBlot.prototype.insertInto = function (parentBlot, refBlot) {
          if (refBlot === void 0) { refBlot = null; }
          if (this.parent != null) {
              this.parent.children.remove(this);
          }
          var refDomNode = null;
          parentBlot.children.insertBefore(this, refBlot);
          if (refBlot != null) {
              refDomNode = refBlot.domNode;
          }
          if (this.domNode.parentNode != parentBlot.domNode ||
              this.domNode.nextSibling != refDomNode) {
              parentBlot.domNode.insertBefore(this.domNode, refDomNode);
          }
          this.parent = parentBlot;
          this.attach();
      };
      ShadowBlot.prototype.isolate = function (index, length) {
          var target = this.split(index);
          target.split(length);
          return target;
      };
      ShadowBlot.prototype.length = function () {
          return 1;
      };
      ShadowBlot.prototype.offset = function (root) {
          if (root === void 0) { root = this.parent; }
          if (this.parent == null || this == root)
              return 0;
          return this.parent.children.offset(this) + this.parent.offset(root);
      };
      ShadowBlot.prototype.optimize = function (context) {
          // TODO clean up once we use WeakMap
          // @ts-ignore
          if (this.domNode[Registry.DATA_KEY] != null) {
              // @ts-ignore
              delete this.domNode[Registry.DATA_KEY].mutations;
          }
      };
      ShadowBlot.prototype.remove = function () {
          if (this.domNode.parentNode != null) {
              this.domNode.parentNode.removeChild(this.domNode);
          }
          this.detach();
      };
      ShadowBlot.prototype.replace = function (target) {
          if (target.parent == null)
              return;
          target.parent.insertBefore(this, target.next);
          target.remove();
      };
      ShadowBlot.prototype.replaceWith = function (name, value) {
          var replacement = typeof name === 'string' ? Registry.create(name, value) : name;
          replacement.replace(this);
          return replacement;
      };
      ShadowBlot.prototype.split = function (index, force) {
          return index === 0 ? this : this.next;
      };
      ShadowBlot.prototype.update = function (mutations, context) {
          // Nothing to do by default
      };
      ShadowBlot.prototype.wrap = function (name, value) {
          var wrapper = typeof name === 'string' ? Registry.create(name, value) : name;
          if (this.parent != null) {
              this.parent.insertBefore(wrapper, this.next);
          }
          wrapper.appendChild(this);
          return wrapper;
      };
      ShadowBlot.blotName = 'abstract';
      return ShadowBlot;
  }());
  exports.default = ShadowBlot;


  /***/ }),
  /* 31 */
  /***/ (function(module, exports, __webpack_require__) {

  Object.defineProperty(exports, "__esModule", { value: true });
  var attributor_1 = __webpack_require__(12);
  var class_1 = __webpack_require__(32);
  var style_1 = __webpack_require__(33);
  var Registry = __webpack_require__(1);
  var AttributorStore = /** @class */ (function () {
      function AttributorStore(domNode) {
          this.attributes = {};
          this.domNode = domNode;
          this.build();
      }
      AttributorStore.prototype.attribute = function (attribute, value) {
          // verb
          if (value) {
              if (attribute.add(this.domNode, value)) {
                  if (attribute.value(this.domNode) != null) {
                      this.attributes[attribute.attrName] = attribute;
                  }
                  else {
                      delete this.attributes[attribute.attrName];
                  }
              }
          }
          else {
              attribute.remove(this.domNode);
              delete this.attributes[attribute.attrName];
          }
      };
      AttributorStore.prototype.build = function () {
          var _this = this;
          this.attributes = {};
          var attributes = attributor_1.default.keys(this.domNode);
          var classes = class_1.default.keys(this.domNode);
          var styles = style_1.default.keys(this.domNode);
          attributes
              .concat(classes)
              .concat(styles)
              .forEach(function (name) {
              var attr = Registry.query(name, Registry.Scope.ATTRIBUTE);
              if (attr instanceof attributor_1.default) {
                  _this.attributes[attr.attrName] = attr;
              }
          });
      };
      AttributorStore.prototype.copy = function (target) {
          var _this = this;
          Object.keys(this.attributes).forEach(function (key) {
              var value = _this.attributes[key].value(_this.domNode);
              target.format(key, value);
          });
      };
      AttributorStore.prototype.move = function (target) {
          var _this = this;
          this.copy(target);
          Object.keys(this.attributes).forEach(function (key) {
              _this.attributes[key].remove(_this.domNode);
          });
          this.attributes = {};
      };
      AttributorStore.prototype.values = function () {
          var _this = this;
          return Object.keys(this.attributes).reduce(function (attributes, name) {
              attributes[name] = _this.attributes[name].value(_this.domNode);
              return attributes;
          }, {});
      };
      return AttributorStore;
  }());
  exports.default = AttributorStore;


  /***/ }),
  /* 32 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var attributor_1 = __webpack_require__(12);
  function match(node, prefix) {
      var className = node.getAttribute('class') || '';
      return className.split(/\s+/).filter(function (name) {
          return name.indexOf(prefix + "-") === 0;
      });
  }
  var ClassAttributor = /** @class */ (function (_super) {
      __extends(ClassAttributor, _super);
      function ClassAttributor() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      ClassAttributor.keys = function (node) {
          return (node.getAttribute('class') || '').split(/\s+/).map(function (name) {
              return name
                  .split('-')
                  .slice(0, -1)
                  .join('-');
          });
      };
      ClassAttributor.prototype.add = function (node, value) {
          if (!this.canAdd(node, value))
              return false;
          this.remove(node);
          node.classList.add(this.keyName + "-" + value);
          return true;
      };
      ClassAttributor.prototype.remove = function (node) {
          var matches = match(node, this.keyName);
          matches.forEach(function (name) {
              node.classList.remove(name);
          });
          if (node.classList.length === 0) {
              node.removeAttribute('class');
          }
      };
      ClassAttributor.prototype.value = function (node) {
          var result = match(node, this.keyName)[0] || '';
          var value = result.slice(this.keyName.length + 1); // +1 for hyphen
          return this.canAdd(node, value) ? value : '';
      };
      return ClassAttributor;
  }(attributor_1.default));
  exports.default = ClassAttributor;


  /***/ }),
  /* 33 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var attributor_1 = __webpack_require__(12);
  function camelize(name) {
      var parts = name.split('-');
      var rest = parts
          .slice(1)
          .map(function (part) {
          return part[0].toUpperCase() + part.slice(1);
      })
          .join('');
      return parts[0] + rest;
  }
  var StyleAttributor = /** @class */ (function (_super) {
      __extends(StyleAttributor, _super);
      function StyleAttributor() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      StyleAttributor.keys = function (node) {
          return (node.getAttribute('style') || '').split(';').map(function (value) {
              var arr = value.split(':');
              return arr[0].trim();
          });
      };
      StyleAttributor.prototype.add = function (node, value) {
          if (!this.canAdd(node, value))
              return false;
          // @ts-ignore
          node.style[camelize(this.keyName)] = value;
          return true;
      };
      StyleAttributor.prototype.remove = function (node) {
          // @ts-ignore
          node.style[camelize(this.keyName)] = '';
          if (!node.getAttribute('style')) {
              node.removeAttribute('style');
          }
      };
      StyleAttributor.prototype.value = function (node) {
          // @ts-ignore
          var value = node.style[camelize(this.keyName)];
          return this.canAdd(node, value) ? value : '';
      };
      return StyleAttributor;
  }(attributor_1.default));
  exports.default = StyleAttributor;


  /***/ }),
  /* 34 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Theme = function () {
    function Theme(quill, options) {
      _classCallCheck(this, Theme);

      this.quill = quill;
      this.options = options;
      this.modules = {};
    }

    _createClass(Theme, [{
      key: 'init',
      value: function init() {
        var _this = this;

        Object.keys(this.options.modules).forEach(function (name) {
          if (_this.modules[name] == null) {
            _this.addModule(name);
          }
        });
      }
    }, {
      key: 'addModule',
      value: function addModule(name) {
        var moduleClass = this.quill.constructor.import('modules/' + name);
        this.modules[name] = new moduleClass(this.quill, this.options.modules[name] || {});
        return this.modules[name];
      }
    }]);

    return Theme;
  }();

  Theme.DEFAULTS = {
    modules: {}
  };
  Theme.themes = {
    'default': Theme
  };

  exports.default = Theme;

  /***/ }),
  /* 35 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _text = __webpack_require__(7);

  var _text2 = _interopRequireDefault(_text);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var GUARD_TEXT = '\uFEFF';

  var Embed = function (_Parchment$Embed) {
    _inherits(Embed, _Parchment$Embed);

    function Embed(node) {
      _classCallCheck(this, Embed);

      var _this = _possibleConstructorReturn(this, (Embed.__proto__ || Object.getPrototypeOf(Embed)).call(this, node));

      _this.contentNode = document.createElement('span');
      _this.contentNode.setAttribute('contenteditable', false);
      [].slice.call(_this.domNode.childNodes).forEach(function (childNode) {
        _this.contentNode.appendChild(childNode);
      });
      _this.leftGuard = document.createTextNode(GUARD_TEXT);
      _this.rightGuard = document.createTextNode(GUARD_TEXT);
      _this.domNode.appendChild(_this.leftGuard);
      _this.domNode.appendChild(_this.contentNode);
      _this.domNode.appendChild(_this.rightGuard);
      return _this;
    }

    _createClass(Embed, [{
      key: 'index',
      value: function index(node, offset) {
        if (node === this.leftGuard) return 0;
        if (node === this.rightGuard) return 1;
        return _get(Embed.prototype.__proto__ || Object.getPrototypeOf(Embed.prototype), 'index', this).call(this, node, offset);
      }
    }, {
      key: 'restore',
      value: function restore(node) {
        var range = void 0,
            textNode = void 0;
        var text = node.data.split(GUARD_TEXT).join('');
        if (node === this.leftGuard) {
          if (this.prev instanceof _text2.default) {
            var prevLength = this.prev.length();
            this.prev.insertAt(prevLength, text);
            range = {
              startNode: this.prev.domNode,
              startOffset: prevLength + text.length
            };
          } else {
            textNode = document.createTextNode(text);
            this.parent.insertBefore(_parchment2.default.create(textNode), this);
            range = {
              startNode: textNode,
              startOffset: text.length
            };
          }
        } else if (node === this.rightGuard) {
          if (this.next instanceof _text2.default) {
            this.next.insertAt(0, text);
            range = {
              startNode: this.next.domNode,
              startOffset: text.length
            };
          } else {
            textNode = document.createTextNode(text);
            this.parent.insertBefore(_parchment2.default.create(textNode), this.next);
            range = {
              startNode: textNode,
              startOffset: text.length
            };
          }
        }
        node.data = GUARD_TEXT;
        return range;
      }
    }, {
      key: 'update',
      value: function update(mutations, context) {
        var _this2 = this;

        mutations.forEach(function (mutation) {
          if (mutation.type === 'characterData' && (mutation.target === _this2.leftGuard || mutation.target === _this2.rightGuard)) {
            var range = _this2.restore(mutation.target);
            if (range) context.range = range;
          }
        });
      }
    }]);

    return Embed;
  }(_parchment2.default.Embed);

  exports.default = Embed;

  /***/ }),
  /* 36 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AlignStyle = exports.AlignClass = exports.AlignAttribute = undefined;

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var config = {
    scope: _parchment2.default.Scope.BLOCK,
    whitelist: ['right', 'center', 'justify']
  };

  var AlignAttribute = new _parchment2.default.Attributor.Attribute('align', 'align', config);
  var AlignClass = new _parchment2.default.Attributor.Class('align', 'ql-align', config);
  var AlignStyle = new _parchment2.default.Attributor.Style('align', 'text-align', config);

  exports.AlignAttribute = AlignAttribute;
  exports.AlignClass = AlignClass;
  exports.AlignStyle = AlignStyle;

  /***/ }),
  /* 37 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BackgroundStyle = exports.BackgroundClass = undefined;

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _color = __webpack_require__(26);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var BackgroundClass = new _parchment2.default.Attributor.Class('background', 'ql-bg', {
    scope: _parchment2.default.Scope.INLINE
  });
  var BackgroundStyle = new _color.ColorAttributor('background', 'background-color', {
    scope: _parchment2.default.Scope.INLINE
  });

  exports.BackgroundClass = BackgroundClass;
  exports.BackgroundStyle = BackgroundStyle;

  /***/ }),
  /* 38 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DirectionStyle = exports.DirectionClass = exports.DirectionAttribute = undefined;

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var config = {
    scope: _parchment2.default.Scope.BLOCK,
    whitelist: ['rtl']
  };

  var DirectionAttribute = new _parchment2.default.Attributor.Attribute('direction', 'dir', config);
  var DirectionClass = new _parchment2.default.Attributor.Class('direction', 'ql-direction', config);
  var DirectionStyle = new _parchment2.default.Attributor.Style('direction', 'direction', config);

  exports.DirectionAttribute = DirectionAttribute;
  exports.DirectionClass = DirectionClass;
  exports.DirectionStyle = DirectionStyle;

  /***/ }),
  /* 39 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.FontClass = exports.FontStyle = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var config = {
    scope: _parchment2.default.Scope.INLINE,
    whitelist: ['serif', 'monospace']
  };

  var FontClass = new _parchment2.default.Attributor.Class('font', 'ql-font', config);

  var FontStyleAttributor = function (_Parchment$Attributor) {
    _inherits(FontStyleAttributor, _Parchment$Attributor);

    function FontStyleAttributor() {
      _classCallCheck(this, FontStyleAttributor);

      return _possibleConstructorReturn(this, (FontStyleAttributor.__proto__ || Object.getPrototypeOf(FontStyleAttributor)).apply(this, arguments));
    }

    _createClass(FontStyleAttributor, [{
      key: 'value',
      value: function value(node) {
        return _get(FontStyleAttributor.prototype.__proto__ || Object.getPrototypeOf(FontStyleAttributor.prototype), 'value', this).call(this, node).replace(/["']/g, '');
      }
    }]);

    return FontStyleAttributor;
  }(_parchment2.default.Attributor.Style);

  var FontStyle = new FontStyleAttributor('font', 'font-family', config);

  exports.FontStyle = FontStyle;
  exports.FontClass = FontClass;

  /***/ }),
  /* 40 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SizeStyle = exports.SizeClass = undefined;

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var SizeClass = new _parchment2.default.Attributor.Class('size', 'ql-size', {
    scope: _parchment2.default.Scope.INLINE,
    whitelist: ['small', 'large', 'huge']
  });
  var SizeStyle = new _parchment2.default.Attributor.Style('size', 'font-size', {
    scope: _parchment2.default.Scope.INLINE,
    whitelist: ['10px', '18px', '32px']
  });

  exports.SizeClass = SizeClass;
  exports.SizeStyle = SizeStyle;

  /***/ }),
  /* 41 */
  /***/ (function(module, exports, __webpack_require__) {


  module.exports = {
    'align': {
      '': __webpack_require__(76),
      'center': __webpack_require__(77),
      'right': __webpack_require__(78),
      'justify': __webpack_require__(79)
    },
    'background': __webpack_require__(80),
    'blockquote': __webpack_require__(81),
    'bold': __webpack_require__(82),
    'clean': __webpack_require__(83),
    'code': __webpack_require__(58),
    'code-block': __webpack_require__(58),
    'color': __webpack_require__(84),
    'direction': {
      '': __webpack_require__(85),
      'rtl': __webpack_require__(86)
    },
    'float': {
      'center': __webpack_require__(87),
      'full': __webpack_require__(88),
      'left': __webpack_require__(89),
      'right': __webpack_require__(90)
    },
    'formula': __webpack_require__(91),
    'header': {
      '1': __webpack_require__(92),
      '2': __webpack_require__(93)
    },
    'italic': __webpack_require__(94),
    'image': __webpack_require__(95),
    'indent': {
      '+1': __webpack_require__(96),
      '-1': __webpack_require__(97)
    },
    'link': __webpack_require__(98),
    'list': {
      'ordered': __webpack_require__(99),
      'bullet': __webpack_require__(100),
      'check': __webpack_require__(101)
    },
    'script': {
      'sub': __webpack_require__(102),
      'super': __webpack_require__(103)
    },
    'strike': __webpack_require__(104),
    'underline': __webpack_require__(105),
    'video': __webpack_require__(106)
  };

  /***/ }),
  /* 42 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getLastChangeIndex = exports.default = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var History = function (_Module) {
    _inherits(History, _Module);

    function History(quill, options) {
      _classCallCheck(this, History);

      var _this = _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).call(this, quill, options));

      _this.lastRecorded = 0;
      _this.ignoreChange = false;
      _this.clear();
      _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (eventName, delta, oldDelta, source) {
        if (eventName !== _quill2.default.events.TEXT_CHANGE || _this.ignoreChange) return;
        if (!_this.options.userOnly || source === _quill2.default.sources.USER) {
          _this.record(delta, oldDelta);
        } else {
          _this.transform(delta);
        }
      });
      _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true }, _this.undo.bind(_this));
      _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true, shiftKey: true }, _this.redo.bind(_this));
      if (/Win/i.test(navigator.platform)) {
        _this.quill.keyboard.addBinding({ key: 'Y', shortKey: true }, _this.redo.bind(_this));
      }
      return _this;
    }

    _createClass(History, [{
      key: 'change',
      value: function change(source, dest) {
        if (this.stack[source].length === 0) return;
        var delta = this.stack[source].pop();
        this.stack[dest].push(delta);
        this.lastRecorded = 0;
        this.ignoreChange = true;
        this.quill.updateContents(delta[source], _quill2.default.sources.USER);
        this.ignoreChange = false;
        var index = getLastChangeIndex(delta[source]);
        this.quill.setSelection(index);
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.stack = { undo: [], redo: [] };
      }
    }, {
      key: 'cutoff',
      value: function cutoff() {
        this.lastRecorded = 0;
      }
    }, {
      key: 'record',
      value: function record(changeDelta, oldDelta) {
        if (changeDelta.ops.length === 0) return;
        this.stack.redo = [];
        var undoDelta = this.quill.getContents().diff(oldDelta);
        var timestamp = Date.now();
        if (this.lastRecorded + this.options.delay > timestamp && this.stack.undo.length > 0) {
          var delta = this.stack.undo.pop();
          undoDelta = undoDelta.compose(delta.undo);
          changeDelta = delta.redo.compose(changeDelta);
        } else {
          this.lastRecorded = timestamp;
        }
        this.stack.undo.push({
          redo: changeDelta,
          undo: undoDelta
        });
        if (this.stack.undo.length > this.options.maxStack) {
          this.stack.undo.shift();
        }
      }
    }, {
      key: 'redo',
      value: function redo() {
        this.change('redo', 'undo');
      }
    }, {
      key: 'transform',
      value: function transform(delta) {
        this.stack.undo.forEach(function (change) {
          change.undo = delta.transform(change.undo, true);
          change.redo = delta.transform(change.redo, true);
        });
        this.stack.redo.forEach(function (change) {
          change.undo = delta.transform(change.undo, true);
          change.redo = delta.transform(change.redo, true);
        });
      }
    }, {
      key: 'undo',
      value: function undo() {
        this.change('undo', 'redo');
      }
    }]);

    return History;
  }(_module2.default);

  History.DEFAULTS = {
    delay: 1000,
    maxStack: 100,
    userOnly: false
  };

  function endsWithNewlineChange(delta) {
    var lastOp = delta.ops[delta.ops.length - 1];
    if (lastOp == null) return false;
    if (lastOp.insert != null) {
      return typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n');
    }
    if (lastOp.attributes != null) {
      return Object.keys(lastOp.attributes).some(function (attr) {
        return _parchment2.default.query(attr, _parchment2.default.Scope.BLOCK) != null;
      });
    }
    return false;
  }

  function getLastChangeIndex(delta) {
    var deleteLength = delta.reduce(function (length, op) {
      length += op.delete || 0;
      return length;
    }, 0);
    var changeIndex = delta.length() - deleteLength;
    if (endsWithNewlineChange(delta)) {
      changeIndex -= 1;
    }
    return changeIndex;
  }

  exports.default = History;
  exports.getLastChangeIndex = getLastChangeIndex;

  /***/ }),
  /* 43 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.BaseTooltip = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _emitter = __webpack_require__(8);

  var _emitter2 = _interopRequireDefault(_emitter);

  var _keyboard = __webpack_require__(23);

  var _keyboard2 = _interopRequireDefault(_keyboard);

  var _theme = __webpack_require__(34);

  var _theme2 = _interopRequireDefault(_theme);

  var _colorPicker = __webpack_require__(59);

  var _colorPicker2 = _interopRequireDefault(_colorPicker);

  var _iconPicker = __webpack_require__(60);

  var _iconPicker2 = _interopRequireDefault(_iconPicker);

  var _picker = __webpack_require__(28);

  var _picker2 = _interopRequireDefault(_picker);

  var _tooltip = __webpack_require__(61);

  var _tooltip2 = _interopRequireDefault(_tooltip);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ALIGNS = [false, 'center', 'right', 'justify'];

  var COLORS = ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"];

  var FONTS = [false, 'serif', 'monospace'];

  var HEADERS = ['1', '2', '3', false];

  var SIZES = ['small', false, 'large', 'huge'];

  var BaseTheme = function (_Theme) {
    _inherits(BaseTheme, _Theme);

    function BaseTheme(quill, options) {
      _classCallCheck(this, BaseTheme);

      var _this = _possibleConstructorReturn(this, (BaseTheme.__proto__ || Object.getPrototypeOf(BaseTheme)).call(this, quill, options));

      var listener = function listener(e) {
        if (!document.body.contains(quill.root)) {
          return document.body.removeEventListener('click', listener);
        }
        if (_this.tooltip != null && !_this.tooltip.root.contains(e.target) && document.activeElement !== _this.tooltip.textbox && !_this.quill.hasFocus()) {
          _this.tooltip.hide();
        }
        if (_this.pickers != null) {
          _this.pickers.forEach(function (picker) {
            if (!picker.container.contains(e.target)) {
              picker.close();
            }
          });
        }
      };
      quill.emitter.listenDOM('click', document.body, listener);
      return _this;
    }

    _createClass(BaseTheme, [{
      key: 'addModule',
      value: function addModule(name) {
        var module = _get(BaseTheme.prototype.__proto__ || Object.getPrototypeOf(BaseTheme.prototype), 'addModule', this).call(this, name);
        if (name === 'toolbar') {
          this.extendToolbar(module);
        }
        return module;
      }
    }, {
      key: 'buildButtons',
      value: function buildButtons(buttons, icons) {
        buttons.forEach(function (button) {
          var className = button.getAttribute('class') || '';
          className.split(/\s+/).forEach(function (name) {
            if (!name.startsWith('ql-')) return;
            name = name.slice('ql-'.length);
            if (icons[name] == null) return;
            if (name === 'direction') {
              button.innerHTML = icons[name][''] + icons[name]['rtl'];
            } else if (typeof icons[name] === 'string') {
              button.innerHTML = icons[name];
            } else {
              var value = button.value || '';
              if (value != null && icons[name][value]) {
                button.innerHTML = icons[name][value];
              }
            }
          });
        });
      }
    }, {
      key: 'buildPickers',
      value: function buildPickers(selects, icons) {
        var _this2 = this;

        this.pickers = selects.map(function (select) {
          if (select.classList.contains('ql-align')) {
            if (select.querySelector('option') == null) {
              fillSelect(select, ALIGNS);
            }
            return new _iconPicker2.default(select, icons.align);
          } else if (select.classList.contains('ql-background') || select.classList.contains('ql-color')) {
            var format = select.classList.contains('ql-background') ? 'background' : 'color';
            if (select.querySelector('option') == null) {
              fillSelect(select, COLORS, format === 'background' ? '#ffffff' : '#000000');
            }
            return new _colorPicker2.default(select, icons[format]);
          } else {
            if (select.querySelector('option') == null) {
              if (select.classList.contains('ql-font')) {
                fillSelect(select, FONTS);
              } else if (select.classList.contains('ql-header')) {
                fillSelect(select, HEADERS);
              } else if (select.classList.contains('ql-size')) {
                fillSelect(select, SIZES);
              }
            }
            return new _picker2.default(select);
          }
        });
        var update = function update() {
          _this2.pickers.forEach(function (picker) {
            picker.update();
          });
        };
        this.quill.on(_emitter2.default.events.EDITOR_CHANGE, update);
      }
    }]);

    return BaseTheme;
  }(_theme2.default);

  BaseTheme.DEFAULTS = (0, _extend2.default)(true, {}, _theme2.default.DEFAULTS, {
    modules: {
      toolbar: {
        handlers: {
          formula: function formula() {
            this.quill.theme.tooltip.edit('formula');
          },
          image: function image() {
            var _this3 = this;

            var fileInput = this.container.querySelector('input.ql-image[type=file]');
            if (fileInput == null) {
              fileInput = document.createElement('input');
              fileInput.setAttribute('type', 'file');
              fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
              fileInput.classList.add('ql-image');
              fileInput.addEventListener('change', function () {
                if (fileInput.files != null && fileInput.files[0] != null) {
                  var reader = new FileReader();
                  reader.onload = function (e) {
                    var range = _this3.quill.getSelection(true);
                    _this3.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert({ image: e.target.result }), _emitter2.default.sources.USER);
                    _this3.quill.setSelection(range.index + 1, _emitter2.default.sources.SILENT);
                    fileInput.value = "";
                  };
                  reader.readAsDataURL(fileInput.files[0]);
                }
              });
              this.container.appendChild(fileInput);
            }
            fileInput.click();
          },
          video: function video() {
            this.quill.theme.tooltip.edit('video');
          }
        }
      }
    }
  });

  var BaseTooltip = function (_Tooltip) {
    _inherits(BaseTooltip, _Tooltip);

    function BaseTooltip(quill, boundsContainer) {
      _classCallCheck(this, BaseTooltip);

      var _this4 = _possibleConstructorReturn(this, (BaseTooltip.__proto__ || Object.getPrototypeOf(BaseTooltip)).call(this, quill, boundsContainer));

      _this4.textbox = _this4.root.querySelector('input[type="text"]');
      _this4.listen();
      return _this4;
    }

    _createClass(BaseTooltip, [{
      key: 'listen',
      value: function listen() {
        var _this5 = this;

        this.textbox.addEventListener('keydown', function (event) {
          if (_keyboard2.default.match(event, 'enter')) {
            _this5.save();
            event.preventDefault();
          } else if (_keyboard2.default.match(event, 'escape')) {
            _this5.cancel();
            event.preventDefault();
          }
        });
      }
    }, {
      key: 'cancel',
      value: function cancel() {
        this.hide();
      }
    }, {
      key: 'edit',
      value: function edit() {
        var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'link';
        var preview = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this.root.classList.remove('ql-hidden');
        this.root.classList.add('ql-editing');
        if (preview != null) {
          this.textbox.value = preview;
        } else if (mode !== this.root.getAttribute('data-mode')) {
          this.textbox.value = '';
        }
        this.position(this.quill.getBounds(this.quill.selection.savedRange));
        this.textbox.select();
        this.textbox.setAttribute('placeholder', this.textbox.getAttribute('data-' + mode) || '');
        this.root.setAttribute('data-mode', mode);
      }
    }, {
      key: 'restoreFocus',
      value: function restoreFocus() {
        var scrollTop = this.quill.scrollingContainer.scrollTop;
        this.quill.focus();
        this.quill.scrollingContainer.scrollTop = scrollTop;
      }
    }, {
      key: 'save',
      value: function save() {
        var value = this.textbox.value;
        switch (this.root.getAttribute('data-mode')) {
          case 'link':
            {
              var scrollTop = this.quill.root.scrollTop;
              if (this.linkRange) {
                this.quill.formatText(this.linkRange, 'link', value, _emitter2.default.sources.USER);
                delete this.linkRange;
              } else {
                this.restoreFocus();
                this.quill.format('link', value, _emitter2.default.sources.USER);
              }
              this.quill.root.scrollTop = scrollTop;
              break;
            }
          case 'video':
            {
              value = extractVideoUrl(value);
            } // eslint-disable-next-line no-fallthrough
          case 'formula':
            {
              if (!value) break;
              var range = this.quill.getSelection(true);
              if (range != null) {
                var index = range.index + range.length;
                this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value, _emitter2.default.sources.USER);
                if (this.root.getAttribute('data-mode') === 'formula') {
                  this.quill.insertText(index + 1, ' ', _emitter2.default.sources.USER);
                }
                this.quill.setSelection(index + 2, _emitter2.default.sources.USER);
              }
              break;
            }
        }
        this.textbox.value = '';
        this.hide();
      }
    }]);

    return BaseTooltip;
  }(_tooltip2.default);

  function extractVideoUrl(url) {
    var match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return (match[1] || 'https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
    }
    if (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)) {
      // eslint-disable-line no-cond-assign
      return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/';
    }
    return url;
  }

  function fillSelect(select, values) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    values.forEach(function (value) {
      var option = document.createElement('option');
      if (value === defaultValue) {
        option.setAttribute('selected', 'selected');
      } else {
        option.setAttribute('value', value);
      }
      select.appendChild(option);
    });
  }

  exports.BaseTooltip = BaseTooltip;
  exports.default = BaseTheme;

  /***/ }),
  /* 44 */
  /***/ (function(module, exports, __webpack_require__) {

  Object.defineProperty(exports, "__esModule", { value: true });
  var LinkedList = /** @class */ (function () {
      function LinkedList() {
          this.head = this.tail = null;
          this.length = 0;
      }
      LinkedList.prototype.append = function () {
          var nodes = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              nodes[_i] = arguments[_i];
          }
          this.insertBefore(nodes[0], null);
          if (nodes.length > 1) {
              this.append.apply(this, nodes.slice(1));
          }
      };
      LinkedList.prototype.contains = function (node) {
          var cur, next = this.iterator();
          while ((cur = next())) {
              if (cur === node)
                  return true;
          }
          return false;
      };
      LinkedList.prototype.insertBefore = function (node, refNode) {
          if (!node)
              return;
          node.next = refNode;
          if (refNode != null) {
              node.prev = refNode.prev;
              if (refNode.prev != null) {
                  refNode.prev.next = node;
              }
              refNode.prev = node;
              if (refNode === this.head) {
                  this.head = node;
              }
          }
          else if (this.tail != null) {
              this.tail.next = node;
              node.prev = this.tail;
              this.tail = node;
          }
          else {
              node.prev = null;
              this.head = this.tail = node;
          }
          this.length += 1;
      };
      LinkedList.prototype.offset = function (target) {
          var index = 0, cur = this.head;
          while (cur != null) {
              if (cur === target)
                  return index;
              index += cur.length();
              cur = cur.next;
          }
          return -1;
      };
      LinkedList.prototype.remove = function (node) {
          if (!this.contains(node))
              return;
          if (node.prev != null)
              node.prev.next = node.next;
          if (node.next != null)
              node.next.prev = node.prev;
          if (node === this.head)
              this.head = node.next;
          if (node === this.tail)
              this.tail = node.prev;
          this.length -= 1;
      };
      LinkedList.prototype.iterator = function (curNode) {
          if (curNode === void 0) { curNode = this.head; }
          // TODO use yield when we can
          return function () {
              var ret = curNode;
              if (curNode != null)
                  curNode = curNode.next;
              return ret;
          };
      };
      LinkedList.prototype.find = function (index, inclusive) {
          if (inclusive === void 0) { inclusive = false; }
          var cur, next = this.iterator();
          while ((cur = next())) {
              var length = cur.length();
              if (index < length ||
                  (inclusive && index === length && (cur.next == null || cur.next.length() !== 0))) {
                  return [cur, index];
              }
              index -= length;
          }
          return [null, 0];
      };
      LinkedList.prototype.forEach = function (callback) {
          var cur, next = this.iterator();
          while ((cur = next())) {
              callback(cur);
          }
      };
      LinkedList.prototype.forEachAt = function (index, length, callback) {
          if (length <= 0)
              return;
          var _a = this.find(index), startNode = _a[0], offset = _a[1];
          var cur, curIndex = index - offset, next = this.iterator(startNode);
          while ((cur = next()) && curIndex < index + length) {
              var curLength = cur.length();
              if (index > curIndex) {
                  callback(cur, index - curIndex, Math.min(length, curIndex + curLength - index));
              }
              else {
                  callback(cur, 0, Math.min(curLength, index + length - curIndex));
              }
              curIndex += curLength;
          }
      };
      LinkedList.prototype.map = function (callback) {
          return this.reduce(function (memo, cur) {
              memo.push(callback(cur));
              return memo;
          }, []);
      };
      LinkedList.prototype.reduce = function (callback, memo) {
          var cur, next = this.iterator();
          while ((cur = next())) {
              memo = callback(memo, cur);
          }
          return memo;
      };
      return LinkedList;
  }());
  exports.default = LinkedList;


  /***/ }),
  /* 45 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var container_1 = __webpack_require__(17);
  var Registry = __webpack_require__(1);
  var OBSERVER_CONFIG = {
      attributes: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
  };
  var MAX_OPTIMIZE_ITERATIONS = 100;
  var ScrollBlot = /** @class */ (function (_super) {
      __extends(ScrollBlot, _super);
      function ScrollBlot(node) {
          var _this = _super.call(this, node) || this;
          _this.scroll = _this;
          _this.observer = new MutationObserver(function (mutations) {
              _this.update(mutations);
          });
          _this.observer.observe(_this.domNode, OBSERVER_CONFIG);
          _this.attach();
          return _this;
      }
      ScrollBlot.prototype.detach = function () {
          _super.prototype.detach.call(this);
          this.observer.disconnect();
      };
      ScrollBlot.prototype.deleteAt = function (index, length) {
          this.update();
          if (index === 0 && length === this.length()) {
              this.children.forEach(function (child) {
                  child.remove();
              });
          }
          else {
              _super.prototype.deleteAt.call(this, index, length);
          }
      };
      ScrollBlot.prototype.formatAt = function (index, length, name, value) {
          this.update();
          _super.prototype.formatAt.call(this, index, length, name, value);
      };
      ScrollBlot.prototype.insertAt = function (index, value, def) {
          this.update();
          _super.prototype.insertAt.call(this, index, value, def);
      };
      ScrollBlot.prototype.optimize = function (mutations, context) {
          var _this = this;
          if (mutations === void 0) { mutations = []; }
          if (context === void 0) { context = {}; }
          _super.prototype.optimize.call(this, context);
          // We must modify mutations directly, cannot make copy and then modify
          var records = [].slice.call(this.observer.takeRecords());
          // Array.push currently seems to be implemented by a non-tail recursive function
          // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
          while (records.length > 0)
              mutations.push(records.pop());
          // TODO use WeakMap
          var mark = function (blot, markParent) {
              if (markParent === void 0) { markParent = true; }
              if (blot == null || blot === _this)
                  return;
              if (blot.domNode.parentNode == null)
                  return;
              // @ts-ignore
              if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                  // @ts-ignore
                  blot.domNode[Registry.DATA_KEY].mutations = [];
              }
              if (markParent)
                  mark(blot.parent);
          };
          var optimize = function (blot) {
              // Post-order traversal
              if (
              // @ts-ignore
              blot.domNode[Registry.DATA_KEY] == null ||
                  // @ts-ignore
                  blot.domNode[Registry.DATA_KEY].mutations == null) {
                  return;
              }
              if (blot instanceof container_1.default) {
                  blot.children.forEach(optimize);
              }
              blot.optimize(context);
          };
          var remaining = mutations;
          for (var i = 0; remaining.length > 0; i += 1) {
              if (i >= MAX_OPTIMIZE_ITERATIONS) {
                  throw new Error('[Parchment] Maximum optimize iterations reached');
              }
              remaining.forEach(function (mutation) {
                  var blot = Registry.find(mutation.target, true);
                  if (blot == null)
                      return;
                  if (blot.domNode === mutation.target) {
                      if (mutation.type === 'childList') {
                          mark(Registry.find(mutation.previousSibling, false));
                          [].forEach.call(mutation.addedNodes, function (node) {
                              var child = Registry.find(node, false);
                              mark(child, false);
                              if (child instanceof container_1.default) {
                                  child.children.forEach(function (grandChild) {
                                      mark(grandChild, false);
                                  });
                              }
                          });
                      }
                      else if (mutation.type === 'attributes') {
                          mark(blot.prev);
                      }
                  }
                  mark(blot);
              });
              this.children.forEach(optimize);
              remaining = [].slice.call(this.observer.takeRecords());
              records = remaining.slice();
              while (records.length > 0)
                  mutations.push(records.pop());
          }
      };
      ScrollBlot.prototype.update = function (mutations, context) {
          var _this = this;
          if (context === void 0) { context = {}; }
          mutations = mutations || this.observer.takeRecords();
          // TODO use WeakMap
          mutations
              .map(function (mutation) {
              var blot = Registry.find(mutation.target, true);
              if (blot == null)
                  return null;
              // @ts-ignore
              if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                  // @ts-ignore
                  blot.domNode[Registry.DATA_KEY].mutations = [mutation];
                  return blot;
              }
              else {
                  // @ts-ignore
                  blot.domNode[Registry.DATA_KEY].mutations.push(mutation);
                  return null;
              }
          })
              .forEach(function (blot) {
              if (blot == null ||
                  blot === _this ||
                  //@ts-ignore
                  blot.domNode[Registry.DATA_KEY] == null)
                  return;
              // @ts-ignore
              blot.update(blot.domNode[Registry.DATA_KEY].mutations || [], context);
          });
          // @ts-ignore
          if (this.domNode[Registry.DATA_KEY].mutations != null) {
              // @ts-ignore
              _super.prototype.update.call(this, this.domNode[Registry.DATA_KEY].mutations, context);
          }
          this.optimize(mutations, context);
      };
      ScrollBlot.blotName = 'scroll';
      ScrollBlot.defaultChild = 'block';
      ScrollBlot.scope = Registry.Scope.BLOCK_BLOT;
      ScrollBlot.tagName = 'DIV';
      return ScrollBlot;
  }(container_1.default));
  exports.default = ScrollBlot;


  /***/ }),
  /* 46 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var format_1 = __webpack_require__(18);
  var Registry = __webpack_require__(1);
  // Shallow object comparison
  function isEqual(obj1, obj2) {
      if (Object.keys(obj1).length !== Object.keys(obj2).length)
          return false;
      // @ts-ignore
      for (var prop in obj1) {
          // @ts-ignore
          if (obj1[prop] !== obj2[prop])
              return false;
      }
      return true;
  }
  var InlineBlot = /** @class */ (function (_super) {
      __extends(InlineBlot, _super);
      function InlineBlot() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      InlineBlot.formats = function (domNode) {
          if (domNode.tagName === InlineBlot.tagName)
              return undefined;
          return _super.formats.call(this, domNode);
      };
      InlineBlot.prototype.format = function (name, value) {
          var _this = this;
          if (name === this.statics.blotName && !value) {
              this.children.forEach(function (child) {
                  if (!(child instanceof format_1.default)) {
                      child = child.wrap(InlineBlot.blotName, true);
                  }
                  _this.attributes.copy(child);
              });
              this.unwrap();
          }
          else {
              _super.prototype.format.call(this, name, value);
          }
      };
      InlineBlot.prototype.formatAt = function (index, length, name, value) {
          if (this.formats()[name] != null || Registry.query(name, Registry.Scope.ATTRIBUTE)) {
              var blot = this.isolate(index, length);
              blot.format(name, value);
          }
          else {
              _super.prototype.formatAt.call(this, index, length, name, value);
          }
      };
      InlineBlot.prototype.optimize = function (context) {
          _super.prototype.optimize.call(this, context);
          var formats = this.formats();
          if (Object.keys(formats).length === 0) {
              return this.unwrap(); // unformatted span
          }
          var next = this.next;
          if (next instanceof InlineBlot && next.prev === this && isEqual(formats, next.formats())) {
              next.moveChildren(this);
              next.remove();
          }
      };
      InlineBlot.blotName = 'inline';
      InlineBlot.scope = Registry.Scope.INLINE_BLOT;
      InlineBlot.tagName = 'SPAN';
      return InlineBlot;
  }(format_1.default));
  exports.default = InlineBlot;


  /***/ }),
  /* 47 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var format_1 = __webpack_require__(18);
  var Registry = __webpack_require__(1);
  var BlockBlot = /** @class */ (function (_super) {
      __extends(BlockBlot, _super);
      function BlockBlot() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      BlockBlot.formats = function (domNode) {
          var tagName = Registry.query(BlockBlot.blotName).tagName;
          if (domNode.tagName === tagName)
              return undefined;
          return _super.formats.call(this, domNode);
      };
      BlockBlot.prototype.format = function (name, value) {
          if (Registry.query(name, Registry.Scope.BLOCK) == null) {
              return;
          }
          else if (name === this.statics.blotName && !value) {
              this.replaceWith(BlockBlot.blotName);
          }
          else {
              _super.prototype.format.call(this, name, value);
          }
      };
      BlockBlot.prototype.formatAt = function (index, length, name, value) {
          if (Registry.query(name, Registry.Scope.BLOCK) != null) {
              this.format(name, value);
          }
          else {
              _super.prototype.formatAt.call(this, index, length, name, value);
          }
      };
      BlockBlot.prototype.insertAt = function (index, value, def) {
          if (def == null || Registry.query(value, Registry.Scope.INLINE) != null) {
              // Insert text or inline
              _super.prototype.insertAt.call(this, index, value, def);
          }
          else {
              var after = this.split(index);
              var blot = Registry.create(value, def);
              after.parent.insertBefore(blot, after);
          }
      };
      BlockBlot.prototype.update = function (mutations, context) {
          if (navigator.userAgent.match(/Trident/)) {
              this.build();
          }
          else {
              _super.prototype.update.call(this, mutations, context);
          }
      };
      BlockBlot.blotName = 'block';
      BlockBlot.scope = Registry.Scope.BLOCK_BLOT;
      BlockBlot.tagName = 'P';
      return BlockBlot;
  }(format_1.default));
  exports.default = BlockBlot;


  /***/ }),
  /* 48 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var leaf_1 = __webpack_require__(19);
  var EmbedBlot = /** @class */ (function (_super) {
      __extends(EmbedBlot, _super);
      function EmbedBlot() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      EmbedBlot.formats = function (domNode) {
          return undefined;
      };
      EmbedBlot.prototype.format = function (name, value) {
          // super.formatAt wraps, which is what we want in general,
          // but this allows subclasses to overwrite for formats
          // that just apply to particular embeds
          _super.prototype.formatAt.call(this, 0, this.length(), name, value);
      };
      EmbedBlot.prototype.formatAt = function (index, length, name, value) {
          if (index === 0 && length === this.length()) {
              this.format(name, value);
          }
          else {
              _super.prototype.formatAt.call(this, index, length, name, value);
          }
      };
      EmbedBlot.prototype.formats = function () {
          return this.statics.formats(this.domNode);
      };
      return EmbedBlot;
  }(leaf_1.default));
  exports.default = EmbedBlot;


  /***/ }),
  /* 49 */
  /***/ (function(module, exports, __webpack_require__) {

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var leaf_1 = __webpack_require__(19);
  var Registry = __webpack_require__(1);
  var TextBlot = /** @class */ (function (_super) {
      __extends(TextBlot, _super);
      function TextBlot(node) {
          var _this = _super.call(this, node) || this;
          _this.text = _this.statics.value(_this.domNode);
          return _this;
      }
      TextBlot.create = function (value) {
          return document.createTextNode(value);
      };
      TextBlot.value = function (domNode) {
          var text = domNode.data;
          // @ts-ignore
          if (text['normalize'])
              text = text['normalize']();
          return text;
      };
      TextBlot.prototype.deleteAt = function (index, length) {
          this.domNode.data = this.text = this.text.slice(0, index) + this.text.slice(index + length);
      };
      TextBlot.prototype.index = function (node, offset) {
          if (this.domNode === node) {
              return offset;
          }
          return -1;
      };
      TextBlot.prototype.insertAt = function (index, value, def) {
          if (def == null) {
              this.text = this.text.slice(0, index) + value + this.text.slice(index);
              this.domNode.data = this.text;
          }
          else {
              _super.prototype.insertAt.call(this, index, value, def);
          }
      };
      TextBlot.prototype.length = function () {
          return this.text.length;
      };
      TextBlot.prototype.optimize = function (context) {
          _super.prototype.optimize.call(this, context);
          this.text = this.statics.value(this.domNode);
          if (this.text.length === 0) {
              this.remove();
          }
          else if (this.next instanceof TextBlot && this.next.prev === this) {
              this.insertAt(this.length(), this.next.value());
              this.next.remove();
          }
      };
      TextBlot.prototype.position = function (index, inclusive) {
          return [this.domNode, index];
      };
      TextBlot.prototype.split = function (index, force) {
          if (force === void 0) { force = false; }
          if (!force) {
              if (index === 0)
                  return this;
              if (index === this.length())
                  return this.next;
          }
          var after = Registry.create(this.domNode.splitText(index));
          this.parent.insertBefore(after, this.next);
          this.text = this.statics.value(this.domNode);
          return after;
      };
      TextBlot.prototype.update = function (mutations, context) {
          var _this = this;
          if (mutations.some(function (mutation) {
              return mutation.type === 'characterData' && mutation.target === _this.domNode;
          })) {
              this.text = this.statics.value(this.domNode);
          }
      };
      TextBlot.prototype.value = function () {
          return this.text;
      };
      TextBlot.blotName = 'text';
      TextBlot.scope = Registry.Scope.INLINE_BLOT;
      return TextBlot;
  }(leaf_1.default));
  exports.default = TextBlot;


  /***/ }),
  /* 50 */
  /***/ (function(module, exports, __webpack_require__) {


  var elem = document.createElement('div');
  elem.classList.toggle('test-class', false);
  if (elem.classList.contains('test-class')) {
    var _toggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function (token, force) {
      if (arguments.length > 1 && !this.contains(token) === !force) {
        return force;
      } else {
        return _toggle.call(this, token);
      }
    };
  }

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }

  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, "find", {
      value: function value(predicate) {
        if (this === null) {
          throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
        return undefined;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Disable resizing in Firefox
    document.execCommand("enableObjectResizing", false, false);
    // Disable automatic linkifying in IE11
    document.execCommand("autoUrlDetect", false, false);
  });

  /***/ }),
  /* 51 */
  /***/ (function(module, exports) {

  /**
   * This library modifies the diff-patch-match library by Neil Fraser
   * by removing the patch and match functionality and certain advanced
   * options in the diff function. The original license is as follows:
   *
   * ===
   *
   * Diff Match and Patch
   *
   * Copyright 2006 Google Inc.
   * http://code.google.com/p/google-diff-match-patch/
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */


  /**
   * The data structure representing a diff is an array of tuples:
   * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
   * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
   */
  var DIFF_DELETE = -1;
  var DIFF_INSERT = 1;
  var DIFF_EQUAL = 0;


  /**
   * Find the differences between two texts.  Simplifies the problem by stripping
   * any common prefix or suffix off the texts before diffing.
   * @param {string} text1 Old string to be diffed.
   * @param {string} text2 New string to be diffed.
   * @param {Int} cursor_pos Expected edit position in text1 (optional)
   * @return {Array} Array of diff tuples.
   */
  function diff_main(text1, text2, cursor_pos) {
    // Check for equality (speedup).
    if (text1 == text2) {
      if (text1) {
        return [[DIFF_EQUAL, text1]];
      }
      return [];
    }

    // Check cursor_pos within bounds
    if (cursor_pos < 0 || text1.length < cursor_pos) {
      cursor_pos = null;
    }

    // Trim off common prefix (speedup).
    var commonlength = diff_commonPrefix(text1, text2);
    var commonprefix = text1.substring(0, commonlength);
    text1 = text1.substring(commonlength);
    text2 = text2.substring(commonlength);

    // Trim off common suffix (speedup).
    commonlength = diff_commonSuffix(text1, text2);
    var commonsuffix = text1.substring(text1.length - commonlength);
    text1 = text1.substring(0, text1.length - commonlength);
    text2 = text2.substring(0, text2.length - commonlength);

    // Compute the diff on the middle block.
    var diffs = diff_compute_(text1, text2);

    // Restore the prefix and suffix.
    if (commonprefix) {
      diffs.unshift([DIFF_EQUAL, commonprefix]);
    }
    if (commonsuffix) {
      diffs.push([DIFF_EQUAL, commonsuffix]);
    }
    diff_cleanupMerge(diffs);
    if (cursor_pos != null) {
      diffs = fix_cursor(diffs, cursor_pos);
    }
    diffs = fix_emoji(diffs);
    return diffs;
  }

  /**
   * Find the differences between two texts.  Assumes that the texts do not
   * have any common prefix or suffix.
   * @param {string} text1 Old string to be diffed.
   * @param {string} text2 New string to be diffed.
   * @return {Array} Array of diff tuples.
   */
  function diff_compute_(text1, text2) {
    var diffs;

    if (!text1) {
      // Just add some text (speedup).
      return [[DIFF_INSERT, text2]];
    }

    if (!text2) {
      // Just delete some text (speedup).
      return [[DIFF_DELETE, text1]];
    }

    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    var i = longtext.indexOf(shorttext);
    if (i != -1) {
      // Shorter text is inside the longer text (speedup).
      diffs = [[DIFF_INSERT, longtext.substring(0, i)],
               [DIFF_EQUAL, shorttext],
               [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
      // Swap insertions for deletions if diff is reversed.
      if (text1.length > text2.length) {
        diffs[0][0] = diffs[2][0] = DIFF_DELETE;
      }
      return diffs;
    }

    if (shorttext.length == 1) {
      // Single character string.
      // After the previous speedup, the character can't be an equality.
      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    }

    // Check to see if the problem can be split in two.
    var hm = diff_halfMatch_(text1, text2);
    if (hm) {
      // A half-match was found, sort out the return data.
      var text1_a = hm[0];
      var text1_b = hm[1];
      var text2_a = hm[2];
      var text2_b = hm[3];
      var mid_common = hm[4];
      // Send both pairs off for separate processing.
      var diffs_a = diff_main(text1_a, text2_a);
      var diffs_b = diff_main(text1_b, text2_b);
      // Merge the results.
      return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
    }

    return diff_bisect_(text1, text2);
  }

  /**
   * Find the 'middle snake' of a diff, split the problem in two
   * and return the recursively constructed diff.
   * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
   * @param {string} text1 Old string to be diffed.
   * @param {string} text2 New string to be diffed.
   * @return {Array} Array of diff tuples.
   * @private
   */
  function diff_bisect_(text1, text2) {
    // Cache the text lengths to prevent multiple calls.
    var text1_length = text1.length;
    var text2_length = text2.length;
    var max_d = Math.ceil((text1_length + text2_length) / 2);
    var v_offset = max_d;
    var v_length = 2 * max_d;
    var v1 = new Array(v_length);
    var v2 = new Array(v_length);
    // Setting all elements to -1 is faster in Chrome & Firefox than mixing
    // integers and undefined.
    for (var x = 0; x < v_length; x++) {
      v1[x] = -1;
      v2[x] = -1;
    }
    v1[v_offset + 1] = 0;
    v2[v_offset + 1] = 0;
    var delta = text1_length - text2_length;
    // If the total number of characters is odd, then the front path will collide
    // with the reverse path.
    var front = (delta % 2 != 0);
    // Offsets for start and end of k loop.
    // Prevents mapping of space beyond the grid.
    var k1start = 0;
    var k1end = 0;
    var k2start = 0;
    var k2end = 0;
    for (var d = 0; d < max_d; d++) {
      // Walk the front path one step.
      for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
        var k1_offset = v_offset + k1;
        var x1;
        if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
          x1 = v1[k1_offset + 1];
        } else {
          x1 = v1[k1_offset - 1] + 1;
        }
        var y1 = x1 - k1;
        while (x1 < text1_length && y1 < text2_length &&
               text1.charAt(x1) == text2.charAt(y1)) {
          x1++;
          y1++;
        }
        v1[k1_offset] = x1;
        if (x1 > text1_length) {
          // Ran off the right of the graph.
          k1end += 2;
        } else if (y1 > text2_length) {
          // Ran off the bottom of the graph.
          k1start += 2;
        } else if (front) {
          var k2_offset = v_offset + delta - k1;
          if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
            // Mirror x2 onto top-left coordinate system.
            var x2 = text1_length - v2[k2_offset];
            if (x1 >= x2) {
              // Overlap detected.
              return diff_bisectSplit_(text1, text2, x1, y1);
            }
          }
        }
      }

      // Walk the reverse path one step.
      for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
        var k2_offset = v_offset + k2;
        var x2;
        if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
          x2 = v2[k2_offset + 1];
        } else {
          x2 = v2[k2_offset - 1] + 1;
        }
        var y2 = x2 - k2;
        while (x2 < text1_length && y2 < text2_length &&
               text1.charAt(text1_length - x2 - 1) ==
               text2.charAt(text2_length - y2 - 1)) {
          x2++;
          y2++;
        }
        v2[k2_offset] = x2;
        if (x2 > text1_length) {
          // Ran off the left of the graph.
          k2end += 2;
        } else if (y2 > text2_length) {
          // Ran off the top of the graph.
          k2start += 2;
        } else if (!front) {
          var k1_offset = v_offset + delta - k2;
          if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
            var x1 = v1[k1_offset];
            var y1 = v_offset + x1 - k1_offset;
            // Mirror x2 onto top-left coordinate system.
            x2 = text1_length - x2;
            if (x1 >= x2) {
              // Overlap detected.
              return diff_bisectSplit_(text1, text2, x1, y1);
            }
          }
        }
      }
    }
    // Diff took too long and hit the deadline or
    // number of diffs equals number of characters, no commonality at all.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  /**
   * Given the location of the 'middle snake', split the diff in two parts
   * and recurse.
   * @param {string} text1 Old string to be diffed.
   * @param {string} text2 New string to be diffed.
   * @param {number} x Index of split point in text1.
   * @param {number} y Index of split point in text2.
   * @return {Array} Array of diff tuples.
   */
  function diff_bisectSplit_(text1, text2, x, y) {
    var text1a = text1.substring(0, x);
    var text2a = text2.substring(0, y);
    var text1b = text1.substring(x);
    var text2b = text2.substring(y);

    // Compute both diffs serially.
    var diffs = diff_main(text1a, text2a);
    var diffsb = diff_main(text1b, text2b);

    return diffs.concat(diffsb);
  }

  /**
   * Determine the common prefix of two strings.
   * @param {string} text1 First string.
   * @param {string} text2 Second string.
   * @return {number} The number of characters common to the start of each
   *     string.
   */
  function diff_commonPrefix(text1, text2) {
    // Quick check for common null cases.
    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
      return 0;
    }
    // Binary search.
    // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerstart = 0;
    while (pointermin < pointermid) {
      if (text1.substring(pointerstart, pointermid) ==
          text2.substring(pointerstart, pointermid)) {
        pointermin = pointermid;
        pointerstart = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
  }

  /**
   * Determine the common suffix of two strings.
   * @param {string} text1 First string.
   * @param {string} text2 Second string.
   * @return {number} The number of characters common to the end of each string.
   */
  function diff_commonSuffix(text1, text2) {
    // Quick check for common null cases.
    if (!text1 || !text2 ||
        text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
      return 0;
    }
    // Binary search.
    // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerend = 0;
    while (pointermin < pointermid) {
      if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
          text2.substring(text2.length - pointermid, text2.length - pointerend)) {
        pointermin = pointermid;
        pointerend = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
  }

  /**
   * Do the two texts share a substring which is at least half the length of the
   * longer text?
   * This speedup can produce non-minimal diffs.
   * @param {string} text1 First string.
   * @param {string} text2 Second string.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     text1, the suffix of text1, the prefix of text2, the suffix of
   *     text2 and the common middle.  Or null if there was no match.
   */
  function diff_halfMatch_(text1, text2) {
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
      return null;  // Pointless.
    }

    /**
     * Does a substring of shorttext exist within longtext such that the substring
     * is at least half the length of longtext?
     * Closure, but does not reference any external variables.
     * @param {string} longtext Longer string.
     * @param {string} shorttext Shorter string.
     * @param {number} i Start index of quarter length substring within longtext.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
     *     of shorttext and the common middle.  Or null if there was no match.
     * @private
     */
    function diff_halfMatchI_(longtext, shorttext, i) {
      // Start with a 1/4 length substring at position i as a seed.
      var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
      var j = -1;
      var best_common = '';
      var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
      while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
        var prefixLength = diff_commonPrefix(longtext.substring(i),
                                             shorttext.substring(j));
        var suffixLength = diff_commonSuffix(longtext.substring(0, i),
                                             shorttext.substring(0, j));
        if (best_common.length < suffixLength + prefixLength) {
          best_common = shorttext.substring(j - suffixLength, j) +
              shorttext.substring(j, j + prefixLength);
          best_longtext_a = longtext.substring(0, i - suffixLength);
          best_longtext_b = longtext.substring(i + prefixLength);
          best_shorttext_a = shorttext.substring(0, j - suffixLength);
          best_shorttext_b = shorttext.substring(j + prefixLength);
        }
      }
      if (best_common.length * 2 >= longtext.length) {
        return [best_longtext_a, best_longtext_b,
                best_shorttext_a, best_shorttext_b, best_common];
      } else {
        return null;
      }
    }

    // First check if the second quarter is the seed for a half-match.
    var hm1 = diff_halfMatchI_(longtext, shorttext,
                               Math.ceil(longtext.length / 4));
    // Check again based on the third quarter.
    var hm2 = diff_halfMatchI_(longtext, shorttext,
                               Math.ceil(longtext.length / 2));
    var hm;
    if (!hm1 && !hm2) {
      return null;
    } else if (!hm2) {
      hm = hm1;
    } else if (!hm1) {
      hm = hm2;
    } else {
      // Both matched.  Select the longest.
      hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
    }

    // A half-match was found, sort out the return data.
    var text1_a, text1_b, text2_a, text2_b;
    if (text1.length > text2.length) {
      text1_a = hm[0];
      text1_b = hm[1];
      text2_a = hm[2];
      text2_b = hm[3];
    } else {
      text2_a = hm[0];
      text2_b = hm[1];
      text1_a = hm[2];
      text1_b = hm[3];
    }
    var mid_common = hm[4];
    return [text1_a, text1_b, text2_a, text2_b, mid_common];
  }

  /**
   * Reorder and merge like edit sections.  Merge equalities.
   * Any edit section can move as long as it doesn't cross an equality.
   * @param {Array} diffs Array of diff tuples.
   */
  function diff_cleanupMerge(diffs) {
    diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete = '';
    var text_insert = '';
    var commonlength;
    while (pointer < diffs.length) {
      switch (diffs[pointer][0]) {
        case DIFF_INSERT:
          count_insert++;
          text_insert += diffs[pointer][1];
          pointer++;
          break;
        case DIFF_DELETE:
          count_delete++;
          text_delete += diffs[pointer][1];
          pointer++;
          break;
        case DIFF_EQUAL:
          // Upon reaching an equality, check for prior redundancies.
          if (count_delete + count_insert > 1) {
            if (count_delete !== 0 && count_insert !== 0) {
              // Factor out any common prefixies.
              commonlength = diff_commonPrefix(text_insert, text_delete);
              if (commonlength !== 0) {
                if ((pointer - count_delete - count_insert) > 0 &&
                    diffs[pointer - count_delete - count_insert - 1][0] ==
                    DIFF_EQUAL) {
                  diffs[pointer - count_delete - count_insert - 1][1] +=
                      text_insert.substring(0, commonlength);
                } else {
                  diffs.splice(0, 0, [DIFF_EQUAL,
                                      text_insert.substring(0, commonlength)]);
                  pointer++;
                }
                text_insert = text_insert.substring(commonlength);
                text_delete = text_delete.substring(commonlength);
              }
              // Factor out any common suffixies.
              commonlength = diff_commonSuffix(text_insert, text_delete);
              if (commonlength !== 0) {
                diffs[pointer][1] = text_insert.substring(text_insert.length -
                    commonlength) + diffs[pointer][1];
                text_insert = text_insert.substring(0, text_insert.length -
                    commonlength);
                text_delete = text_delete.substring(0, text_delete.length -
                    commonlength);
              }
            }
            // Delete the offending records and add the merged ones.
            if (count_delete === 0) {
              diffs.splice(pointer - count_insert,
                  count_delete + count_insert, [DIFF_INSERT, text_insert]);
            } else if (count_insert === 0) {
              diffs.splice(pointer - count_delete,
                  count_delete + count_insert, [DIFF_DELETE, text_delete]);
            } else {
              diffs.splice(pointer - count_delete - count_insert,
                  count_delete + count_insert, [DIFF_DELETE, text_delete],
                  [DIFF_INSERT, text_insert]);
            }
            pointer = pointer - count_delete - count_insert +
                      (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
          } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
            // Merge this equality with the previous one.
            diffs[pointer - 1][1] += diffs[pointer][1];
            diffs.splice(pointer, 1);
          } else {
            pointer++;
          }
          count_insert = 0;
          count_delete = 0;
          text_delete = '';
          text_insert = '';
          break;
      }
    }
    if (diffs[diffs.length - 1][1] === '') {
      diffs.pop();  // Remove the dummy entry at the end.
    }

    // Second pass: look for single edits surrounded on both sides by equalities
    // which can be shifted sideways to eliminate an equality.
    // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
    var changes = false;
    pointer = 1;
    // Intentionally ignore the first and last element (don't need checking).
    while (pointer < diffs.length - 1) {
      if (diffs[pointer - 1][0] == DIFF_EQUAL &&
          diffs[pointer + 1][0] == DIFF_EQUAL) {
        // This is a single edit surrounded by equalities.
        if (diffs[pointer][1].substring(diffs[pointer][1].length -
            diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
          // Shift the edit over the previous equality.
          diffs[pointer][1] = diffs[pointer - 1][1] +
              diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                          diffs[pointer - 1][1].length);
          diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
          diffs.splice(pointer - 1, 1);
          changes = true;
        } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
            diffs[pointer + 1][1]) {
          // Shift the edit over the next equality.
          diffs[pointer - 1][1] += diffs[pointer + 1][1];
          diffs[pointer][1] =
              diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
              diffs[pointer + 1][1];
          diffs.splice(pointer + 1, 1);
          changes = true;
        }
      }
      pointer++;
    }
    // If shifts were made, the diff needs reordering and another shift sweep.
    if (changes) {
      diff_cleanupMerge(diffs);
    }
  }

  var diff = diff_main;
  diff.INSERT = DIFF_INSERT;
  diff.DELETE = DIFF_DELETE;
  diff.EQUAL = DIFF_EQUAL;

  module.exports = diff;

  /*
   * Modify a diff such that the cursor position points to the start of a change:
   * E.g.
   *   cursor_normalize_diff([[DIFF_EQUAL, 'abc']], 1)
   *     => [1, [[DIFF_EQUAL, 'a'], [DIFF_EQUAL, 'bc']]]
   *   cursor_normalize_diff([[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xyz']], 2)
   *     => [2, [[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xy'], [DIFF_DELETE, 'z']]]
   *
   * @param {Array} diffs Array of diff tuples
   * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
   * @return {Array} A tuple [cursor location in the modified diff, modified diff]
   */
  function cursor_normalize_diff (diffs, cursor_pos) {
    if (cursor_pos === 0) {
      return [DIFF_EQUAL, diffs];
    }
    for (var current_pos = 0, i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (d[0] === DIFF_DELETE || d[0] === DIFF_EQUAL) {
        var next_pos = current_pos + d[1].length;
        if (cursor_pos === next_pos) {
          return [i + 1, diffs];
        } else if (cursor_pos < next_pos) {
          // copy to prevent side effects
          diffs = diffs.slice();
          // split d into two diff changes
          var split_pos = cursor_pos - current_pos;
          var d_left = [d[0], d[1].slice(0, split_pos)];
          var d_right = [d[0], d[1].slice(split_pos)];
          diffs.splice(i, 1, d_left, d_right);
          return [i + 1, diffs];
        } else {
          current_pos = next_pos;
        }
      }
    }
    throw new Error('cursor_pos is out of bounds!')
  }

  /*
   * Modify a diff such that the edit position is "shifted" to the proposed edit location (cursor_position).
   *
   * Case 1)
   *   Check if a naive shift is possible:
   *     [0, X], [ 1, Y] -> [ 1, Y], [0, X]    (if X + Y === Y + X)
   *     [0, X], [-1, Y] -> [-1, Y], [0, X]    (if X + Y === Y + X) - holds same result
   * Case 2)
   *   Check if the following shifts are possible:
   *     [0, 'pre'], [ 1, 'prefix'] -> [ 1, 'pre'], [0, 'pre'], [ 1, 'fix']
   *     [0, 'pre'], [-1, 'prefix'] -> [-1, 'pre'], [0, 'pre'], [-1, 'fix']
   *         ^            ^
   *         d          d_next
   *
   * @param {Array} diffs Array of diff tuples
   * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
   * @return {Array} Array of diff tuples
   */
  function fix_cursor (diffs, cursor_pos) {
    var norm = cursor_normalize_diff(diffs, cursor_pos);
    var ndiffs = norm[1];
    var cursor_pointer = norm[0];
    var d = ndiffs[cursor_pointer];
    var d_next = ndiffs[cursor_pointer + 1];

    if (d == null) {
      // Text was deleted from end of original string,
      // cursor is now out of bounds in new string
      return diffs;
    } else if (d[0] !== DIFF_EQUAL) {
      // A modification happened at the cursor location.
      // This is the expected outcome, so we can return the original diff.
      return diffs;
    } else {
      if (d_next != null && d[1] + d_next[1] === d_next[1] + d[1]) {
        // Case 1)
        // It is possible to perform a naive shift
        ndiffs.splice(cursor_pointer, 2, d_next, d);
        return merge_tuples(ndiffs, cursor_pointer, 2)
      } else if (d_next != null && d_next[1].indexOf(d[1]) === 0) {
        // Case 2)
        // d[1] is a prefix of d_next[1]
        // We can assume that d_next[0] !== 0, since d[0] === 0
        // Shift edit locations..
        ndiffs.splice(cursor_pointer, 2, [d_next[0], d[1]], [0, d[1]]);
        var suffix = d_next[1].slice(d[1].length);
        if (suffix.length > 0) {
          ndiffs.splice(cursor_pointer + 2, 0, [d_next[0], suffix]);
        }
        return merge_tuples(ndiffs, cursor_pointer, 3)
      } else {
        // Not possible to perform any modification
        return diffs;
      }
    }
  }

  /*
   * Check diff did not split surrogate pairs.
   * Ex. [0, '\uD83D'], [-1, '\uDC36'], [1, '\uDC2F'] -> [-1, '\uD83D\uDC36'], [1, '\uD83D\uDC2F']
   *     '\uD83D\uDC36' === '🐶', '\uD83D\uDC2F' === '🐯'
   *
   * @param {Array} diffs Array of diff tuples
   * @return {Array} Array of diff tuples
   */
  function fix_emoji (diffs) {
    var compact = false;
    var starts_with_pair_end = function(str) {
      return str.charCodeAt(0) >= 0xDC00 && str.charCodeAt(0) <= 0xDFFF;
    };
    var ends_with_pair_start = function(str) {
      return str.charCodeAt(str.length-1) >= 0xD800 && str.charCodeAt(str.length-1) <= 0xDBFF;
    };
    for (var i = 2; i < diffs.length; i += 1) {
      if (diffs[i-2][0] === DIFF_EQUAL && ends_with_pair_start(diffs[i-2][1]) &&
          diffs[i-1][0] === DIFF_DELETE && starts_with_pair_end(diffs[i-1][1]) &&
          diffs[i][0] === DIFF_INSERT && starts_with_pair_end(diffs[i][1])) {
        compact = true;

        diffs[i-1][1] = diffs[i-2][1].slice(-1) + diffs[i-1][1];
        diffs[i][1] = diffs[i-2][1].slice(-1) + diffs[i][1];

        diffs[i-2][1] = diffs[i-2][1].slice(0, -1);
      }
    }
    if (!compact) {
      return diffs;
    }
    var fixed_diffs = [];
    for (var i = 0; i < diffs.length; i += 1) {
      if (diffs[i][1].length > 0) {
        fixed_diffs.push(diffs[i]);
      }
    }
    return fixed_diffs;
  }

  /*
   * Try to merge tuples with their neigbors in a given range.
   * E.g. [0, 'a'], [0, 'b'] -> [0, 'ab']
   *
   * @param {Array} diffs Array of diff tuples.
   * @param {Int} start Position of the first element to merge (diffs[start] is also merged with diffs[start - 1]).
   * @param {Int} length Number of consecutive elements to check.
   * @return {Array} Array of merged diff tuples.
   */
  function merge_tuples (diffs, start, length) {
    // Check from (start-1) to (start+length).
    for (var i = start + length - 1; i >= 0 && i >= start - 1; i--) {
      if (i + 1 < diffs.length) {
        var left_d = diffs[i];
        var right_d = diffs[i+1];
        if (left_d[0] === right_d[1]) {
          diffs.splice(i, 2, [left_d[0], left_d[1] + right_d[1]]);
        }
      }
    }
    return diffs;
  }


  /***/ }),
  /* 52 */
  /***/ (function(module, exports) {

  exports = module.exports = typeof Object.keys === 'function'
    ? Object.keys : shim;

  exports.shim = shim;
  function shim (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
  }


  /***/ }),
  /* 53 */
  /***/ (function(module, exports) {

  var supportsArgumentsClass = (function(){
    return Object.prototype.toString.call(arguments)
  })() == '[object Arguments]';

  exports = module.exports = supportsArgumentsClass ? supported : unsupported;

  exports.supported = supported;
  function supported(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }
  exports.unsupported = unsupported;
  function unsupported(object){
    return object &&
      typeof object == 'object' &&
      typeof object.length == 'number' &&
      Object.prototype.hasOwnProperty.call(object, 'callee') &&
      !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
      false;
  }

  /***/ }),
  /* 54 */
  /***/ (function(module, exports) {

  var has = Object.prototype.hasOwnProperty
    , prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @api private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {Mixed} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @api private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @api public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @api public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = []
      , events
      , name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Boolean} exists Only check if there are listeners.
   * @returns {Array|Boolean}
   * @api public
   */
  EventEmitter.prototype.listeners = function listeners(event, exists) {
    var evt = prefix ? prefix + event : event
      , available = this._events[evt];

    if (exists) return !!available;
    if (!available) return [];
    if (available.fn) return [available.fn];

    for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
      ee[i] = available[i].fn;
    }

    return ee;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @api public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
      , len = arguments.length
      , args
      , i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1: return listeners.fn.call(listeners.context), true;
        case 2: return listeners.fn.call(listeners.context, a1), true;
        case 3: return listeners.fn.call(listeners.context, a1, a2), true;
        case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len -1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length
        , j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1: listeners[i].fn.call(listeners[i].context); break;
          case 2: listeners[i].fn.call(listeners[i].context, a1); break;
          case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
          case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
          default:
            if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn The listener function.
   * @param {Mixed} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    var listener = new EE(fn, context || this)
      , evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
    else if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [this._events[evt], listener];

    return this;
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn The listener function.
   * @param {Mixed} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    var listener = new EE(fn, context || this, true)
      , evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
    else if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [this._events[evt], listener];

    return this;
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {Mixed} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (
           listeners.fn === fn
        && (!once || listeners.once)
        && (!context || listeners.context === context)
      ) {
        if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
      else if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {String|Symbol} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) {
        if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
      }
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // This function doesn't apply anymore.
  //
  EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    return this;
  };

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  if ('undefined' !== typeof module) {
    module.exports = EventEmitter;
  }


  /***/ }),
  /* 55 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.matchText = exports.matchSpacing = exports.matchNewline = exports.matchBlot = exports.matchAttributor = exports.default = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _extend2 = __webpack_require__(3);

  var _extend3 = _interopRequireDefault(_extend2);

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _logger = __webpack_require__(10);

  var _logger2 = _interopRequireDefault(_logger);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  var _align = __webpack_require__(36);

  var _background = __webpack_require__(37);

  var _code = __webpack_require__(13);

  var _code2 = _interopRequireDefault(_code);

  var _color = __webpack_require__(26);

  var _direction = __webpack_require__(38);

  var _font = __webpack_require__(39);

  var _size = __webpack_require__(40);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var debug = (0, _logger2.default)('quill:clipboard');

  var DOM_KEY = '__ql-matcher';

  var CLIPBOARD_CONFIG = [[Node.TEXT_NODE, matchText], [Node.TEXT_NODE, matchNewline], ['br', matchBreak], [Node.ELEMENT_NODE, matchNewline], [Node.ELEMENT_NODE, matchBlot], [Node.ELEMENT_NODE, matchSpacing], [Node.ELEMENT_NODE, matchAttributor], [Node.ELEMENT_NODE, matchStyles], ['li', matchIndent], ['b', matchAlias.bind(matchAlias, 'bold')], ['i', matchAlias.bind(matchAlias, 'italic')], ['style', matchIgnore]];

  var ATTRIBUTE_ATTRIBUTORS = [_align.AlignAttribute, _direction.DirectionAttribute].reduce(function (memo, attr) {
    memo[attr.keyName] = attr;
    return memo;
  }, {});

  var STYLE_ATTRIBUTORS = [_align.AlignStyle, _background.BackgroundStyle, _color.ColorStyle, _direction.DirectionStyle, _font.FontStyle, _size.SizeStyle].reduce(function (memo, attr) {
    memo[attr.keyName] = attr;
    return memo;
  }, {});

  var Clipboard = function (_Module) {
    _inherits(Clipboard, _Module);

    function Clipboard(quill, options) {
      _classCallCheck(this, Clipboard);

      var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this, quill, options));

      _this.quill.root.addEventListener('paste', _this.onPaste.bind(_this));
      _this.container = _this.quill.addContainer('ql-clipboard');
      _this.container.setAttribute('contenteditable', true);
      _this.container.setAttribute('tabindex', -1);
      _this.matchers = [];
      CLIPBOARD_CONFIG.concat(_this.options.matchers).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            selector = _ref2[0],
            matcher = _ref2[1];

        if (!options.matchVisual && matcher === matchSpacing) return;
        _this.addMatcher(selector, matcher);
      });
      return _this;
    }

    _createClass(Clipboard, [{
      key: 'addMatcher',
      value: function addMatcher(selector, matcher) {
        this.matchers.push([selector, matcher]);
      }
    }, {
      key: 'convert',
      value: function convert(html) {
        if (typeof html === 'string') {
          this.container.innerHTML = html.replace(/\>\r?\n +\</g, '><'); // Remove spaces between tags
          return this.convert();
        }
        var formats = this.quill.getFormat(this.quill.selection.savedRange.index);
        if (formats[_code2.default.blotName]) {
          var text = this.container.innerText;
          this.container.innerHTML = '';
          return new _quillDelta2.default().insert(text, _defineProperty({}, _code2.default.blotName, formats[_code2.default.blotName]));
        }

        var _prepareMatching = this.prepareMatching(),
            _prepareMatching2 = _slicedToArray(_prepareMatching, 2),
            elementMatchers = _prepareMatching2[0],
            textMatchers = _prepareMatching2[1];

        var delta = traverse(this.container, elementMatchers, textMatchers);
        // Remove trailing newline
        if (deltaEndsWith(delta, '\n') && delta.ops[delta.ops.length - 1].attributes == null) {
          delta = delta.compose(new _quillDelta2.default().retain(delta.length() - 1).delete(1));
        }
        debug.log('convert', this.container.innerHTML, delta);
        this.container.innerHTML = '';
        return delta;
      }
    }, {
      key: 'dangerouslyPasteHTML',
      value: function dangerouslyPasteHTML(index, html) {
        var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _quill2.default.sources.API;

        if (typeof index === 'string') {
          this.quill.setContents(this.convert(index), html);
          this.quill.setSelection(0, _quill2.default.sources.SILENT);
        } else {
          var paste = this.convert(html);
          this.quill.updateContents(new _quillDelta2.default().retain(index).concat(paste), source);
          this.quill.setSelection(index + paste.length(), _quill2.default.sources.SILENT);
        }
      }
    }, {
      key: 'onPaste',
      value: function onPaste(e) {
        var _this2 = this;

        if (e.defaultPrevented || !this.quill.isEnabled()) return;
        var range = this.quill.getSelection();
        var delta = new _quillDelta2.default().retain(range.index);
        var scrollTop = this.quill.scrollingContainer.scrollTop;
        this.container.focus();
        this.quill.selection.update(_quill2.default.sources.SILENT);
        setTimeout(function () {
          delta = delta.concat(_this2.convert()).delete(range.length);
          _this2.quill.updateContents(delta, _quill2.default.sources.USER);
          // range.length contributes to delta.length()
          _this2.quill.setSelection(delta.length() - range.length, _quill2.default.sources.SILENT);
          _this2.quill.scrollingContainer.scrollTop = scrollTop;
          _this2.quill.focus();
        }, 1);
      }
    }, {
      key: 'prepareMatching',
      value: function prepareMatching() {
        var _this3 = this;

        var elementMatchers = [],
            textMatchers = [];
        this.matchers.forEach(function (pair) {
          var _pair = _slicedToArray(pair, 2),
              selector = _pair[0],
              matcher = _pair[1];

          switch (selector) {
            case Node.TEXT_NODE:
              textMatchers.push(matcher);
              break;
            case Node.ELEMENT_NODE:
              elementMatchers.push(matcher);
              break;
            default:
              [].forEach.call(_this3.container.querySelectorAll(selector), function (node) {
                // TODO use weakmap
                node[DOM_KEY] = node[DOM_KEY] || [];
                node[DOM_KEY].push(matcher);
              });
              break;
          }
        });
        return [elementMatchers, textMatchers];
      }
    }]);

    return Clipboard;
  }(_module2.default);

  Clipboard.DEFAULTS = {
    matchers: [],
    matchVisual: true
  };

  function applyFormat(delta, format, value) {
    if ((typeof format === 'undefined' ? 'undefined' : _typeof(format)) === 'object') {
      return Object.keys(format).reduce(function (delta, key) {
        return applyFormat(delta, key, format[key]);
      }, delta);
    } else {
      return delta.reduce(function (delta, op) {
        if (op.attributes && op.attributes[format]) {
          return delta.push(op);
        } else {
          return delta.insert(op.insert, (0, _extend3.default)({}, _defineProperty({}, format, value), op.attributes));
        }
      }, new _quillDelta2.default());
    }
  }

  function computeStyle(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return {};
    var DOM_KEY = '__ql-computed-style';
    return node[DOM_KEY] || (node[DOM_KEY] = window.getComputedStyle(node));
  }

  function deltaEndsWith(delta, text) {
    var endText = "";
    for (var i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
      var op = delta.ops[i];
      if (typeof op.insert !== 'string') break;
      endText = op.insert + endText;
    }
    return endText.slice(-1 * text.length) === text;
  }

  function isLine(node) {
    if (node.childNodes.length === 0) return false; // Exclude embed blocks
    var style = computeStyle(node);
    return ['block', 'list-item'].indexOf(style.display) > -1;
  }

  function traverse(node, elementMatchers, textMatchers) {
    // Post-order
    if (node.nodeType === node.TEXT_NODE) {
      return textMatchers.reduce(function (delta, matcher) {
        return matcher(node, delta);
      }, new _quillDelta2.default());
    } else if (node.nodeType === node.ELEMENT_NODE) {
      return [].reduce.call(node.childNodes || [], function (delta, childNode) {
        var childrenDelta = traverse(childNode, elementMatchers, textMatchers);
        if (childNode.nodeType === node.ELEMENT_NODE) {
          childrenDelta = elementMatchers.reduce(function (childrenDelta, matcher) {
            return matcher(childNode, childrenDelta);
          }, childrenDelta);
          childrenDelta = (childNode[DOM_KEY] || []).reduce(function (childrenDelta, matcher) {
            return matcher(childNode, childrenDelta);
          }, childrenDelta);
        }
        return delta.concat(childrenDelta);
      }, new _quillDelta2.default());
    } else {
      return new _quillDelta2.default();
    }
  }

  function matchAlias(format, node, delta) {
    return applyFormat(delta, format, true);
  }

  function matchAttributor(node, delta) {
    var attributes = _parchment2.default.Attributor.Attribute.keys(node);
    var classes = _parchment2.default.Attributor.Class.keys(node);
    var styles = _parchment2.default.Attributor.Style.keys(node);
    var formats = {};
    attributes.concat(classes).concat(styles).forEach(function (name) {
      var attr = _parchment2.default.query(name, _parchment2.default.Scope.ATTRIBUTE);
      if (attr != null) {
        formats[attr.attrName] = attr.value(node);
        if (formats[attr.attrName]) return;
      }
      attr = ATTRIBUTE_ATTRIBUTORS[name];
      if (attr != null && (attr.attrName === name || attr.keyName === name)) {
        formats[attr.attrName] = attr.value(node) || undefined;
      }
      attr = STYLE_ATTRIBUTORS[name];
      if (attr != null && (attr.attrName === name || attr.keyName === name)) {
        attr = STYLE_ATTRIBUTORS[name];
        formats[attr.attrName] = attr.value(node) || undefined;
      }
    });
    if (Object.keys(formats).length > 0) {
      delta = applyFormat(delta, formats);
    }
    return delta;
  }

  function matchBlot(node, delta) {
    var match = _parchment2.default.query(node);
    if (match == null) return delta;
    if (match.prototype instanceof _parchment2.default.Embed) {
      var embed = {};
      var value = match.value(node);
      if (value != null) {
        embed[match.blotName] = value;
        delta = new _quillDelta2.default().insert(embed, match.formats(node));
      }
    } else if (typeof match.formats === 'function') {
      delta = applyFormat(delta, match.blotName, match.formats(node));
    }
    return delta;
  }

  function matchBreak(node, delta) {
    if (!deltaEndsWith(delta, '\n')) {
      delta.insert('\n');
    }
    return delta;
  }

  function matchIgnore() {
    return new _quillDelta2.default();
  }

  function matchIndent(node, delta) {
    var match = _parchment2.default.query(node);
    if (match == null || match.blotName !== 'list-item' || !deltaEndsWith(delta, '\n')) {
      return delta;
    }
    var indent = -1,
        parent = node.parentNode;
    while (!parent.classList.contains('ql-clipboard')) {
      if ((_parchment2.default.query(parent) || {}).blotName === 'list') {
        indent += 1;
      }
      parent = parent.parentNode;
    }
    if (indent <= 0) return delta;
    return delta.compose(new _quillDelta2.default().retain(delta.length() - 1).retain(1, { indent: indent }));
  }

  function matchNewline(node, delta) {
    if (!deltaEndsWith(delta, '\n')) {
      if (isLine(node) || delta.length() > 0 && node.nextSibling && isLine(node.nextSibling)) {
        delta.insert('\n');
      }
    }
    return delta;
  }

  function matchSpacing(node, delta) {
    if (isLine(node) && node.nextElementSibling != null && !deltaEndsWith(delta, '\n\n')) {
      var nodeHeight = node.offsetHeight + parseFloat(computeStyle(node).marginTop) + parseFloat(computeStyle(node).marginBottom);
      if (node.nextElementSibling.offsetTop > node.offsetTop + nodeHeight * 1.5) {
        delta.insert('\n');
      }
    }
    return delta;
  }

  function matchStyles(node, delta) {
    var formats = {};
    var style = node.style || {};
    if (style.fontStyle && computeStyle(node).fontStyle === 'italic') {
      formats.italic = true;
    }
    if (style.fontWeight && (computeStyle(node).fontWeight.startsWith('bold') || parseInt(computeStyle(node).fontWeight) >= 700)) {
      formats.bold = true;
    }
    if (Object.keys(formats).length > 0) {
      delta = applyFormat(delta, formats);
    }
    if (parseFloat(style.textIndent || 0) > 0) {
      // Could be 0.5in
      delta = new _quillDelta2.default().insert('\t').concat(delta);
    }
    return delta;
  }

  function matchText(node, delta) {
    var text = node.data;
    // Word represents empty line with <o:p>&nbsp;</o:p>
    if (node.parentNode.tagName === 'O:P') {
      return delta.insert(text.trim());
    }
    if (text.trim().length === 0 && node.parentNode.classList.contains('ql-clipboard')) {
      return delta;
    }
    if (!computeStyle(node.parentNode).whiteSpace.startsWith('pre')) {
      // eslint-disable-next-line func-style
      var replacer = function replacer(collapse, match) {
        match = match.replace(/[^\u00a0]/g, ''); // \u00a0 is nbsp;
        return match.length < 1 && collapse ? ' ' : match;
      };
      text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
      text = text.replace(/\s\s+/g, replacer.bind(replacer, true)); // collapse whitespace
      if (node.previousSibling == null && isLine(node.parentNode) || node.previousSibling != null && isLine(node.previousSibling)) {
        text = text.replace(/^\s+/, replacer.bind(replacer, false));
      }
      if (node.nextSibling == null && isLine(node.parentNode) || node.nextSibling != null && isLine(node.nextSibling)) {
        text = text.replace(/\s+$/, replacer.bind(replacer, false));
      }
    }
    return delta.insert(text);
  }

  exports.default = Clipboard;
  exports.matchAttributor = matchAttributor;
  exports.matchBlot = matchBlot;
  exports.matchNewline = matchNewline;
  exports.matchSpacing = matchSpacing;
  exports.matchText = matchText;

  /***/ }),
  /* 56 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Bold = function (_Inline) {
    _inherits(Bold, _Inline);

    function Bold() {
      _classCallCheck(this, Bold);

      return _possibleConstructorReturn(this, (Bold.__proto__ || Object.getPrototypeOf(Bold)).apply(this, arguments));
    }

    _createClass(Bold, [{
      key: 'optimize',
      value: function optimize(context) {
        _get(Bold.prototype.__proto__ || Object.getPrototypeOf(Bold.prototype), 'optimize', this).call(this, context);
        if (this.domNode.tagName !== this.statics.tagName[0]) {
          this.replaceWith(this.statics.blotName);
        }
      }
    }], [{
      key: 'create',
      value: function create() {
        return _get(Bold.__proto__ || Object.getPrototypeOf(Bold), 'create', this).call(this);
      }
    }, {
      key: 'formats',
      value: function formats() {
        return true;
      }
    }]);

    return Bold;
  }(_inline2.default);

  Bold.blotName = 'bold';
  Bold.tagName = ['STRONG', 'B'];

  exports.default = Bold;

  /***/ }),
  /* 57 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.addControls = exports.default = undefined;

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _quillDelta = __webpack_require__(2);

  var _quillDelta2 = _interopRequireDefault(_quillDelta);

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _logger = __webpack_require__(10);

  var _logger2 = _interopRequireDefault(_logger);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var debug = (0, _logger2.default)('quill:toolbar');

  var Toolbar = function (_Module) {
    _inherits(Toolbar, _Module);

    function Toolbar(quill, options) {
      _classCallCheck(this, Toolbar);

      var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, quill, options));

      if (Array.isArray(_this.options.container)) {
        var container = document.createElement('div');
        addControls(container, _this.options.container);
        quill.container.parentNode.insertBefore(container, quill.container);
        _this.container = container;
      } else if (typeof _this.options.container === 'string') {
        _this.container = document.querySelector(_this.options.container);
      } else {
        _this.container = _this.options.container;
      }
      if (!(_this.container instanceof HTMLElement)) {
        var _ret;

        return _ret = debug.error('Container required for toolbar', _this.options), _possibleConstructorReturn(_this, _ret);
      }
      _this.container.classList.add('ql-toolbar');
      _this.controls = [];
      _this.handlers = {};
      Object.keys(_this.options.handlers).forEach(function (format) {
        _this.addHandler(format, _this.options.handlers[format]);
      });
      [].forEach.call(_this.container.querySelectorAll('button, select'), function (input) {
        _this.attach(input);
      });
      _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (type, range) {
        if (type === _quill2.default.events.SELECTION_CHANGE) {
          _this.update(range);
        }
      });
      _this.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
        var _this$quill$selection = _this.quill.selection.getRange(),
            _this$quill$selection2 = _slicedToArray(_this$quill$selection, 1),
            range = _this$quill$selection2[0]; // quill.getSelection triggers update


        _this.update(range);
      });
      return _this;
    }

    _createClass(Toolbar, [{
      key: 'addHandler',
      value: function addHandler(format, handler) {
        this.handlers[format] = handler;
      }
    }, {
      key: 'attach',
      value: function attach(input) {
        var _this2 = this;

        var format = [].find.call(input.classList, function (className) {
          return className.indexOf('ql-') === 0;
        });
        if (!format) return;
        format = format.slice('ql-'.length);
        if (input.tagName === 'BUTTON') {
          input.setAttribute('type', 'button');
        }
        if (this.handlers[format] == null) {
          if (this.quill.scroll.whitelist != null && this.quill.scroll.whitelist[format] == null) {
            debug.warn('ignoring attaching to disabled format', format, input);
            return;
          }
          if (_parchment2.default.query(format) == null) {
            debug.warn('ignoring attaching to nonexistent format', format, input);
            return;
          }
        }
        var eventName = input.tagName === 'SELECT' ? 'change' : 'click';
        input.addEventListener(eventName, function (e) {
          var value = void 0;
          if (input.tagName === 'SELECT') {
            if (input.selectedIndex < 0) return;
            var selected = input.options[input.selectedIndex];
            if (selected.hasAttribute('selected')) {
              value = false;
            } else {
              value = selected.value || false;
            }
          } else {
            if (input.classList.contains('ql-active')) {
              value = false;
            } else {
              value = input.value || !input.hasAttribute('value');
            }
            e.preventDefault();
          }
          _this2.quill.focus();

          var _quill$selection$getR = _this2.quill.selection.getRange(),
              _quill$selection$getR2 = _slicedToArray(_quill$selection$getR, 1),
              range = _quill$selection$getR2[0];

          if (_this2.handlers[format] != null) {
            _this2.handlers[format].call(_this2, value);
          } else if (_parchment2.default.query(format).prototype instanceof _parchment2.default.Embed) {
            value = prompt('Enter ' + format);
            if (!value) return;
            _this2.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert(_defineProperty({}, format, value)), _quill2.default.sources.USER);
          } else {
            _this2.quill.format(format, value, _quill2.default.sources.USER);
          }
          _this2.update(range);
        });
        // TODO use weakmap
        this.controls.push([format, input]);
      }
    }, {
      key: 'update',
      value: function update(range) {
        var formats = range == null ? {} : this.quill.getFormat(range);
        this.controls.forEach(function (pair) {
          var _pair = _slicedToArray(pair, 2),
              format = _pair[0],
              input = _pair[1];

          if (input.tagName === 'SELECT') {
            var option = void 0;
            if (range == null) {
              option = null;
            } else if (formats[format] == null) {
              option = input.querySelector('option[selected]');
            } else if (!Array.isArray(formats[format])) {
              var value = formats[format];
              if (typeof value === 'string') {
                value = value.replace(/\"/g, '\\"');
              }
              option = input.querySelector('option[value="' + value + '"]');
            }
            if (option == null) {
              input.value = ''; // TODO make configurable?
              input.selectedIndex = -1;
            } else {
              option.selected = true;
            }
          } else {
            if (range == null) {
              input.classList.remove('ql-active');
            } else if (input.hasAttribute('value')) {
              // both being null should match (default values)
              // '1' should match with 1 (headers)
              var isActive = formats[format] === input.getAttribute('value') || formats[format] != null && formats[format].toString() === input.getAttribute('value') || formats[format] == null && !input.getAttribute('value');
              input.classList.toggle('ql-active', isActive);
            } else {
              input.classList.toggle('ql-active', formats[format] != null);
            }
          }
        });
      }
    }]);

    return Toolbar;
  }(_module2.default);

  Toolbar.DEFAULTS = {};

  function addButton(container, format, value) {
    var input = document.createElement('button');
    input.setAttribute('type', 'button');
    input.classList.add('ql-' + format);
    if (value != null) {
      input.value = value;
    }
    container.appendChild(input);
  }

  function addControls(container, groups) {
    if (!Array.isArray(groups[0])) {
      groups = [groups];
    }
    groups.forEach(function (controls) {
      var group = document.createElement('span');
      group.classList.add('ql-formats');
      controls.forEach(function (control) {
        if (typeof control === 'string') {
          addButton(group, control);
        } else {
          var format = Object.keys(control)[0];
          var value = control[format];
          if (Array.isArray(value)) {
            addSelect(group, format, value);
          } else {
            addButton(group, format, value);
          }
        }
      });
      container.appendChild(group);
    });
  }

  function addSelect(container, format, values) {
    var input = document.createElement('select');
    input.classList.add('ql-' + format);
    values.forEach(function (value) {
      var option = document.createElement('option');
      if (value !== false) {
        option.setAttribute('value', value);
      } else {
        option.setAttribute('selected', 'selected');
      }
      input.appendChild(option);
    });
    container.appendChild(input);
  }

  Toolbar.DEFAULTS = {
    container: null,
    handlers: {
      clean: function clean() {
        var _this3 = this;

        var range = this.quill.getSelection();
        if (range == null) return;
        if (range.length == 0) {
          var formats = this.quill.getFormat();
          Object.keys(formats).forEach(function (name) {
            // Clean functionality in existing apps only clean inline formats
            if (_parchment2.default.query(name, _parchment2.default.Scope.INLINE) != null) {
              _this3.quill.format(name, false);
            }
          });
        } else {
          this.quill.removeFormat(range, _quill2.default.sources.USER);
        }
      },
      direction: function direction(value) {
        var align = this.quill.getFormat()['align'];
        if (value === 'rtl' && align == null) {
          this.quill.format('align', 'right', _quill2.default.sources.USER);
        } else if (!value && align === 'right') {
          this.quill.format('align', false, _quill2.default.sources.USER);
        }
        this.quill.format('direction', value, _quill2.default.sources.USER);
      },
      indent: function indent(value) {
        var range = this.quill.getSelection();
        var formats = this.quill.getFormat(range);
        var indent = parseInt(formats.indent || 0);
        if (value === '+1' || value === '-1') {
          var modifier = value === '+1' ? 1 : -1;
          if (formats.direction === 'rtl') modifier *= -1;
          this.quill.format('indent', indent + modifier, _quill2.default.sources.USER);
        }
      },
      link: function link(value) {
        if (value === true) {
          value = prompt('Enter link URL:');
        }
        this.quill.format('link', value, _quill2.default.sources.USER);
      },
      list: function list(value) {
        var range = this.quill.getSelection();
        var formats = this.quill.getFormat(range);
        if (value === 'check') {
          if (formats['list'] === 'checked' || formats['list'] === 'unchecked') {
            this.quill.format('list', false, _quill2.default.sources.USER);
          } else {
            this.quill.format('list', 'unchecked', _quill2.default.sources.USER);
          }
        } else {
          this.quill.format('list', value, _quill2.default.sources.USER);
        }
      }
    }
  };

  exports.default = Toolbar;
  exports.addControls = addControls;

  /***/ }),
  /* 58 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <polyline class=\"ql-even ql-stroke\" points=\"5 7 3 9 5 11\"></polyline> <polyline class=\"ql-even ql-stroke\" points=\"13 7 15 9 13 11\"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>";

  /***/ }),
  /* 59 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _picker = __webpack_require__(28);

  var _picker2 = _interopRequireDefault(_picker);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ColorPicker = function (_Picker) {
    _inherits(ColorPicker, _Picker);

    function ColorPicker(select, label) {
      _classCallCheck(this, ColorPicker);

      var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, select));

      _this.label.innerHTML = label;
      _this.container.classList.add('ql-color-picker');
      [].slice.call(_this.container.querySelectorAll('.ql-picker-item'), 0, 7).forEach(function (item) {
        item.classList.add('ql-primary');
      });
      return _this;
    }

    _createClass(ColorPicker, [{
      key: 'buildItem',
      value: function buildItem(option) {
        var item = _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'buildItem', this).call(this, option);
        item.style.backgroundColor = option.getAttribute('value') || '';
        return item;
      }
    }, {
      key: 'selectItem',
      value: function selectItem(item, trigger) {
        _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'selectItem', this).call(this, item, trigger);
        var colorLabel = this.label.querySelector('.ql-color-label');
        var value = item ? item.getAttribute('data-value') || '' : '';
        if (colorLabel) {
          if (colorLabel.tagName === 'line') {
            colorLabel.style.stroke = value;
          } else {
            colorLabel.style.fill = value;
          }
        }
      }
    }]);

    return ColorPicker;
  }(_picker2.default);

  exports.default = ColorPicker;

  /***/ }),
  /* 60 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _picker = __webpack_require__(28);

  var _picker2 = _interopRequireDefault(_picker);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var IconPicker = function (_Picker) {
    _inherits(IconPicker, _Picker);

    function IconPicker(select, icons) {
      _classCallCheck(this, IconPicker);

      var _this = _possibleConstructorReturn(this, (IconPicker.__proto__ || Object.getPrototypeOf(IconPicker)).call(this, select));

      _this.container.classList.add('ql-icon-picker');
      [].forEach.call(_this.container.querySelectorAll('.ql-picker-item'), function (item) {
        item.innerHTML = icons[item.getAttribute('data-value') || ''];
      });
      _this.defaultItem = _this.container.querySelector('.ql-selected');
      _this.selectItem(_this.defaultItem);
      return _this;
    }

    _createClass(IconPicker, [{
      key: 'selectItem',
      value: function selectItem(item, trigger) {
        _get(IconPicker.prototype.__proto__ || Object.getPrototypeOf(IconPicker.prototype), 'selectItem', this).call(this, item, trigger);
        item = item || this.defaultItem;
        this.label.innerHTML = item.innerHTML;
      }
    }]);

    return IconPicker;
  }(_picker2.default);

  exports.default = IconPicker;

  /***/ }),
  /* 61 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Tooltip = function () {
    function Tooltip(quill, boundsContainer) {
      var _this = this;

      _classCallCheck(this, Tooltip);

      this.quill = quill;
      this.boundsContainer = boundsContainer || document.body;
      this.root = quill.addContainer('ql-tooltip');
      this.root.innerHTML = this.constructor.TEMPLATE;
      if (this.quill.root === this.quill.scrollingContainer) {
        this.quill.root.addEventListener('scroll', function () {
          _this.root.style.marginTop = -1 * _this.quill.root.scrollTop + 'px';
        });
      }
      this.hide();
    }

    _createClass(Tooltip, [{
      key: 'hide',
      value: function hide() {
        this.root.classList.add('ql-hidden');
      }
    }, {
      key: 'position',
      value: function position(reference) {
        var left = reference.left + reference.width / 2 - this.root.offsetWidth / 2;
        // root.scrollTop should be 0 if scrollContainer !== root
        var top = reference.bottom + this.quill.root.scrollTop;
        this.root.style.left = left + 'px';
        this.root.style.top = top + 'px';
        this.root.classList.remove('ql-flip');
        var containerBounds = this.boundsContainer.getBoundingClientRect();
        var rootBounds = this.root.getBoundingClientRect();
        var shift = 0;
        if (rootBounds.right > containerBounds.right) {
          shift = containerBounds.right - rootBounds.right;
          this.root.style.left = left + shift + 'px';
        }
        if (rootBounds.left < containerBounds.left) {
          shift = containerBounds.left - rootBounds.left;
          this.root.style.left = left + shift + 'px';
        }
        if (rootBounds.bottom > containerBounds.bottom) {
          var height = rootBounds.bottom - rootBounds.top;
          var verticalShift = reference.bottom - reference.top + height;
          this.root.style.top = top - verticalShift + 'px';
          this.root.classList.add('ql-flip');
        }
        return shift;
      }
    }, {
      key: 'show',
      value: function show() {
        this.root.classList.remove('ql-editing');
        this.root.classList.remove('ql-hidden');
      }
    }]);

    return Tooltip;
  }();

  exports.default = Tooltip;

  /***/ }),
  /* 62 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  var _emitter = __webpack_require__(8);

  var _emitter2 = _interopRequireDefault(_emitter);

  var _base = __webpack_require__(43);

  var _base2 = _interopRequireDefault(_base);

  var _link = __webpack_require__(27);

  var _link2 = _interopRequireDefault(_link);

  var _selection = __webpack_require__(15);

  var _icons = __webpack_require__(41);

  var _icons2 = _interopRequireDefault(_icons);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TOOLBAR_CONFIG = [[{ header: ['1', '2', '3', false] }], ['bold', 'italic', 'underline', 'link'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']];

  var SnowTheme = function (_BaseTheme) {
    _inherits(SnowTheme, _BaseTheme);

    function SnowTheme(quill, options) {
      _classCallCheck(this, SnowTheme);

      if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
        options.modules.toolbar.container = TOOLBAR_CONFIG;
      }

      var _this = _possibleConstructorReturn(this, (SnowTheme.__proto__ || Object.getPrototypeOf(SnowTheme)).call(this, quill, options));

      _this.quill.container.classList.add('ql-snow');
      return _this;
    }

    _createClass(SnowTheme, [{
      key: 'extendToolbar',
      value: function extendToolbar(toolbar) {
        toolbar.container.classList.add('ql-snow');
        this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
        this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
        this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
        if (toolbar.container.querySelector('.ql-link')) {
          this.quill.keyboard.addBinding({ key: 'K', shortKey: true }, function (range, context) {
            toolbar.handlers['link'].call(toolbar, !context.format.link);
          });
        }
      }
    }]);

    return SnowTheme;
  }(_base2.default);

  SnowTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
    modules: {
      toolbar: {
        handlers: {
          link: function link(value) {
            if (value) {
              var range = this.quill.getSelection();
              if (range == null || range.length == 0) return;
              var preview = this.quill.getText(range);
              if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
                preview = 'mailto:' + preview;
              }
              var tooltip = this.quill.theme.tooltip;
              tooltip.edit('link', preview);
            } else {
              this.quill.format('link', false);
            }
          }
        }
      }
    }
  });

  var SnowTooltip = function (_BaseTooltip) {
    _inherits(SnowTooltip, _BaseTooltip);

    function SnowTooltip(quill, bounds) {
      _classCallCheck(this, SnowTooltip);

      var _this2 = _possibleConstructorReturn(this, (SnowTooltip.__proto__ || Object.getPrototypeOf(SnowTooltip)).call(this, quill, bounds));

      _this2.preview = _this2.root.querySelector('a.ql-preview');
      return _this2;
    }

    _createClass(SnowTooltip, [{
      key: 'listen',
      value: function listen() {
        var _this3 = this;

        _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'listen', this).call(this);
        this.root.querySelector('a.ql-action').addEventListener('click', function (event) {
          if (_this3.root.classList.contains('ql-editing')) {
            _this3.save();
          } else {
            _this3.edit('link', _this3.preview.textContent);
          }
          event.preventDefault();
        });
        this.root.querySelector('a.ql-remove').addEventListener('click', function (event) {
          if (_this3.linkRange != null) {
            var range = _this3.linkRange;
            _this3.restoreFocus();
            _this3.quill.formatText(range, 'link', false, _emitter2.default.sources.USER);
            delete _this3.linkRange;
          }
          event.preventDefault();
          _this3.hide();
        });
        this.quill.on(_emitter2.default.events.SELECTION_CHANGE, function (range, oldRange, source) {
          if (range == null) return;
          if (range.length === 0 && source === _emitter2.default.sources.USER) {
            var _quill$scroll$descend = _this3.quill.scroll.descendant(_link2.default, range.index),
                _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
                link = _quill$scroll$descend2[0],
                offset = _quill$scroll$descend2[1];

            if (link != null) {
              _this3.linkRange = new _selection.Range(range.index - offset, link.length());
              var preview = _link2.default.formats(link.domNode);
              _this3.preview.textContent = preview;
              _this3.preview.setAttribute('href', preview);
              _this3.show();
              _this3.position(_this3.quill.getBounds(_this3.linkRange));
              return;
            }
          } else {
            delete _this3.linkRange;
          }
          _this3.hide();
        });
      }
    }, {
      key: 'show',
      value: function show() {
        _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'show', this).call(this);
        this.root.removeAttribute('data-mode');
      }
    }]);

    return SnowTooltip;
  }(_base.BaseTooltip);

  SnowTooltip.TEMPLATE = ['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-action"></a>', '<a class="ql-remove"></a>'].join('');

  exports.default = SnowTheme;

  /***/ }),
  /* 63 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _core = __webpack_require__(29);

  var _core2 = _interopRequireDefault(_core);

  var _align = __webpack_require__(36);

  var _direction = __webpack_require__(38);

  var _indent = __webpack_require__(64);

  var _blockquote = __webpack_require__(65);

  var _blockquote2 = _interopRequireDefault(_blockquote);

  var _header = __webpack_require__(66);

  var _header2 = _interopRequireDefault(_header);

  var _list = __webpack_require__(67);

  var _list2 = _interopRequireDefault(_list);

  var _background = __webpack_require__(37);

  var _color = __webpack_require__(26);

  var _font = __webpack_require__(39);

  var _size = __webpack_require__(40);

  var _bold = __webpack_require__(56);

  var _bold2 = _interopRequireDefault(_bold);

  var _italic = __webpack_require__(68);

  var _italic2 = _interopRequireDefault(_italic);

  var _link = __webpack_require__(27);

  var _link2 = _interopRequireDefault(_link);

  var _script = __webpack_require__(69);

  var _script2 = _interopRequireDefault(_script);

  var _strike = __webpack_require__(70);

  var _strike2 = _interopRequireDefault(_strike);

  var _underline = __webpack_require__(71);

  var _underline2 = _interopRequireDefault(_underline);

  var _image = __webpack_require__(72);

  var _image2 = _interopRequireDefault(_image);

  var _video = __webpack_require__(73);

  var _video2 = _interopRequireDefault(_video);

  var _code = __webpack_require__(13);

  var _code2 = _interopRequireDefault(_code);

  var _formula = __webpack_require__(74);

  var _formula2 = _interopRequireDefault(_formula);

  var _syntax = __webpack_require__(75);

  var _syntax2 = _interopRequireDefault(_syntax);

  var _toolbar = __webpack_require__(57);

  var _toolbar2 = _interopRequireDefault(_toolbar);

  var _icons = __webpack_require__(41);

  var _icons2 = _interopRequireDefault(_icons);

  var _picker = __webpack_require__(28);

  var _picker2 = _interopRequireDefault(_picker);

  var _colorPicker = __webpack_require__(59);

  var _colorPicker2 = _interopRequireDefault(_colorPicker);

  var _iconPicker = __webpack_require__(60);

  var _iconPicker2 = _interopRequireDefault(_iconPicker);

  var _tooltip = __webpack_require__(61);

  var _tooltip2 = _interopRequireDefault(_tooltip);

  var _bubble = __webpack_require__(108);

  var _bubble2 = _interopRequireDefault(_bubble);

  var _snow = __webpack_require__(62);

  var _snow2 = _interopRequireDefault(_snow);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  _core2.default.register({
    'attributors/attribute/direction': _direction.DirectionAttribute,

    'attributors/class/align': _align.AlignClass,
    'attributors/class/background': _background.BackgroundClass,
    'attributors/class/color': _color.ColorClass,
    'attributors/class/direction': _direction.DirectionClass,
    'attributors/class/font': _font.FontClass,
    'attributors/class/size': _size.SizeClass,

    'attributors/style/align': _align.AlignStyle,
    'attributors/style/background': _background.BackgroundStyle,
    'attributors/style/color': _color.ColorStyle,
    'attributors/style/direction': _direction.DirectionStyle,
    'attributors/style/font': _font.FontStyle,
    'attributors/style/size': _size.SizeStyle
  }, true);

  _core2.default.register({
    'formats/align': _align.AlignClass,
    'formats/direction': _direction.DirectionClass,
    'formats/indent': _indent.IndentClass,

    'formats/background': _background.BackgroundStyle,
    'formats/color': _color.ColorStyle,
    'formats/font': _font.FontClass,
    'formats/size': _size.SizeClass,

    'formats/blockquote': _blockquote2.default,
    'formats/code-block': _code2.default,
    'formats/header': _header2.default,
    'formats/list': _list2.default,

    'formats/bold': _bold2.default,
    'formats/code': _code.Code,
    'formats/italic': _italic2.default,
    'formats/link': _link2.default,
    'formats/script': _script2.default,
    'formats/strike': _strike2.default,
    'formats/underline': _underline2.default,

    'formats/image': _image2.default,
    'formats/video': _video2.default,

    'formats/list/item': _list.ListItem,

    'modules/formula': _formula2.default,
    'modules/syntax': _syntax2.default,
    'modules/toolbar': _toolbar2.default,

    'themes/bubble': _bubble2.default,
    'themes/snow': _snow2.default,

    'ui/icons': _icons2.default,
    'ui/picker': _picker2.default,
    'ui/icon-picker': _iconPicker2.default,
    'ui/color-picker': _colorPicker2.default,
    'ui/tooltip': _tooltip2.default
  }, true);

  exports.default = _core2.default;

  /***/ }),
  /* 64 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.IndentClass = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var IdentAttributor = function (_Parchment$Attributor) {
    _inherits(IdentAttributor, _Parchment$Attributor);

    function IdentAttributor() {
      _classCallCheck(this, IdentAttributor);

      return _possibleConstructorReturn(this, (IdentAttributor.__proto__ || Object.getPrototypeOf(IdentAttributor)).apply(this, arguments));
    }

    _createClass(IdentAttributor, [{
      key: 'add',
      value: function add(node, value) {
        if (value === '+1' || value === '-1') {
          var indent = this.value(node) || 0;
          value = value === '+1' ? indent + 1 : indent - 1;
        }
        if (value === 0) {
          this.remove(node);
          return true;
        } else {
          return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'add', this).call(this, node, value);
        }
      }
    }, {
      key: 'canAdd',
      value: function canAdd(node, value) {
        return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, value) || _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, parseInt(value));
      }
    }, {
      key: 'value',
      value: function value(node) {
        return parseInt(_get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'value', this).call(this, node)) || undefined; // Don't return NaN
      }
    }]);

    return IdentAttributor;
  }(_parchment2.default.Attributor.Class);

  var IndentClass = new IdentAttributor('indent', 'ql-indent', {
    scope: _parchment2.default.Scope.BLOCK,
    whitelist: [1, 2, 3, 4, 5, 6, 7, 8]
  });

  exports.IndentClass = IndentClass;

  /***/ }),
  /* 65 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Blockquote = function (_Block) {
    _inherits(Blockquote, _Block);

    function Blockquote() {
      _classCallCheck(this, Blockquote);

      return _possibleConstructorReturn(this, (Blockquote.__proto__ || Object.getPrototypeOf(Blockquote)).apply(this, arguments));
    }

    return Blockquote;
  }(_block2.default);

  Blockquote.blotName = 'blockquote';
  Blockquote.tagName = 'blockquote';

  exports.default = Blockquote;

  /***/ }),
  /* 66 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Header = function (_Block) {
    _inherits(Header, _Block);

    function Header() {
      _classCallCheck(this, Header);

      return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
    }

    _createClass(Header, null, [{
      key: 'formats',
      value: function formats(domNode) {
        return this.tagName.indexOf(domNode.tagName) + 1;
      }
    }]);

    return Header;
  }(_block2.default);

  Header.blotName = 'header';
  Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

  exports.default = Header;

  /***/ }),
  /* 67 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.ListItem = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _block = __webpack_require__(4);

  var _block2 = _interopRequireDefault(_block);

  var _container = __webpack_require__(25);

  var _container2 = _interopRequireDefault(_container);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ListItem = function (_Block) {
    _inherits(ListItem, _Block);

    function ListItem() {
      _classCallCheck(this, ListItem);

      return _possibleConstructorReturn(this, (ListItem.__proto__ || Object.getPrototypeOf(ListItem)).apply(this, arguments));
    }

    _createClass(ListItem, [{
      key: 'format',
      value: function format(name, value) {
        if (name === List.blotName && !value) {
          this.replaceWith(_parchment2.default.create(this.statics.scope));
        } else {
          _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'format', this).call(this, name, value);
        }
      }
    }, {
      key: 'remove',
      value: function remove() {
        if (this.prev == null && this.next == null) {
          this.parent.remove();
        } else {
          _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'remove', this).call(this);
        }
      }
    }, {
      key: 'replaceWith',
      value: function replaceWith(name, value) {
        this.parent.isolate(this.offset(this.parent), this.length());
        if (name === this.parent.statics.blotName) {
          this.parent.replaceWith(name, value);
          return this;
        } else {
          this.parent.unwrap();
          return _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'replaceWith', this).call(this, name, value);
        }
      }
    }], [{
      key: 'formats',
      value: function formats(domNode) {
        return domNode.tagName === this.tagName ? undefined : _get(ListItem.__proto__ || Object.getPrototypeOf(ListItem), 'formats', this).call(this, domNode);
      }
    }]);

    return ListItem;
  }(_block2.default);

  ListItem.blotName = 'list-item';
  ListItem.tagName = 'LI';

  var List = function (_Container) {
    _inherits(List, _Container);

    _createClass(List, null, [{
      key: 'create',
      value: function create(value) {
        var tagName = value === 'ordered' ? 'OL' : 'UL';
        var node = _get(List.__proto__ || Object.getPrototypeOf(List), 'create', this).call(this, tagName);
        if (value === 'checked' || value === 'unchecked') {
          node.setAttribute('data-checked', value === 'checked');
        }
        return node;
      }
    }, {
      key: 'formats',
      value: function formats(domNode) {
        if (domNode.tagName === 'OL') return 'ordered';
        if (domNode.tagName === 'UL') {
          if (domNode.hasAttribute('data-checked')) {
            return domNode.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked';
          } else {
            return 'bullet';
          }
        }
        return undefined;
      }
    }]);

    function List(domNode) {
      _classCallCheck(this, List);

      var _this2 = _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, domNode));

      var listEventHandler = function listEventHandler(e) {
        if (e.target.parentNode !== domNode) return;
        var format = _this2.statics.formats(domNode);
        var blot = _parchment2.default.find(e.target);
        if (format === 'checked') {
          blot.format('list', 'unchecked');
        } else if (format === 'unchecked') {
          blot.format('list', 'checked');
        }
      };

      domNode.addEventListener('touchstart', listEventHandler);
      domNode.addEventListener('mousedown', listEventHandler);
      return _this2;
    }

    _createClass(List, [{
      key: 'format',
      value: function format(name, value) {
        if (this.children.length > 0) {
          this.children.tail.format(name, value);
        }
      }
    }, {
      key: 'formats',
      value: function formats() {
        // We don't inherit from FormatBlot
        return _defineProperty({}, this.statics.blotName, this.statics.formats(this.domNode));
      }
    }, {
      key: 'insertBefore',
      value: function insertBefore(blot, ref) {
        if (blot instanceof ListItem) {
          _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'insertBefore', this).call(this, blot, ref);
        } else {
          var index = ref == null ? this.length() : ref.offset(this);
          var after = this.split(index);
          after.parent.insertBefore(blot, after);
        }
      }
    }, {
      key: 'optimize',
      value: function optimize(context) {
        _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'optimize', this).call(this, context);
        var next = this.next;
        if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName && next.domNode.getAttribute('data-checked') === this.domNode.getAttribute('data-checked')) {
          next.moveChildren(this);
          next.remove();
        }
      }
    }, {
      key: 'replace',
      value: function replace(target) {
        if (target.statics.blotName !== this.statics.blotName) {
          var item = _parchment2.default.create(this.statics.defaultChild);
          target.moveChildren(item);
          this.appendChild(item);
        }
        _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'replace', this).call(this, target);
      }
    }]);

    return List;
  }(_container2.default);

  List.blotName = 'list';
  List.scope = _parchment2.default.Scope.BLOCK_BLOT;
  List.tagName = ['OL', 'UL'];
  List.defaultChild = 'list-item';
  List.allowedChildren = [ListItem];

  exports.ListItem = ListItem;
  exports.default = List;

  /***/ }),
  /* 68 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _bold = __webpack_require__(56);

  var _bold2 = _interopRequireDefault(_bold);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Italic = function (_Bold) {
    _inherits(Italic, _Bold);

    function Italic() {
      _classCallCheck(this, Italic);

      return _possibleConstructorReturn(this, (Italic.__proto__ || Object.getPrototypeOf(Italic)).apply(this, arguments));
    }

    return Italic;
  }(_bold2.default);

  Italic.blotName = 'italic';
  Italic.tagName = ['EM', 'I'];

  exports.default = Italic;

  /***/ }),
  /* 69 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Script = function (_Inline) {
    _inherits(Script, _Inline);

    function Script() {
      _classCallCheck(this, Script);

      return _possibleConstructorReturn(this, (Script.__proto__ || Object.getPrototypeOf(Script)).apply(this, arguments));
    }

    _createClass(Script, null, [{
      key: 'create',
      value: function create(value) {
        if (value === 'super') {
          return document.createElement('sup');
        } else if (value === 'sub') {
          return document.createElement('sub');
        } else {
          return _get(Script.__proto__ || Object.getPrototypeOf(Script), 'create', this).call(this, value);
        }
      }
    }, {
      key: 'formats',
      value: function formats(domNode) {
        if (domNode.tagName === 'SUB') return 'sub';
        if (domNode.tagName === 'SUP') return 'super';
        return undefined;
      }
    }]);

    return Script;
  }(_inline2.default);

  Script.blotName = 'script';
  Script.tagName = ['SUB', 'SUP'];

  exports.default = Script;

  /***/ }),
  /* 70 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Strike = function (_Inline) {
    _inherits(Strike, _Inline);

    function Strike() {
      _classCallCheck(this, Strike);

      return _possibleConstructorReturn(this, (Strike.__proto__ || Object.getPrototypeOf(Strike)).apply(this, arguments));
    }

    return Strike;
  }(_inline2.default);

  Strike.blotName = 'strike';
  Strike.tagName = 'S';

  exports.default = Strike;

  /***/ }),
  /* 71 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _inline = __webpack_require__(6);

  var _inline2 = _interopRequireDefault(_inline);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Underline = function (_Inline) {
    _inherits(Underline, _Inline);

    function Underline() {
      _classCallCheck(this, Underline);

      return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).apply(this, arguments));
    }

    return Underline;
  }(_inline2.default);

  Underline.blotName = 'underline';
  Underline.tagName = 'U';

  exports.default = Underline;

  /***/ }),
  /* 72 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _link = __webpack_require__(27);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ATTRIBUTES = ['alt', 'height', 'width'];

  var Image = function (_Parchment$Embed) {
    _inherits(Image, _Parchment$Embed);

    function Image() {
      _classCallCheck(this, Image);

      return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
    }

    _createClass(Image, [{
      key: 'format',
      value: function format(name, value) {
        if (ATTRIBUTES.indexOf(name) > -1) {
          if (value) {
            this.domNode.setAttribute(name, value);
          } else {
            this.domNode.removeAttribute(name);
          }
        } else {
          _get(Image.prototype.__proto__ || Object.getPrototypeOf(Image.prototype), 'format', this).call(this, name, value);
        }
      }
    }], [{
      key: 'create',
      value: function create(value) {
        var node = _get(Image.__proto__ || Object.getPrototypeOf(Image), 'create', this).call(this, value);
        if (typeof value === 'string') {
          node.setAttribute('src', this.sanitize(value));
        }
        return node;
      }
    }, {
      key: 'formats',
      value: function formats(domNode) {
        return ATTRIBUTES.reduce(function (formats, attribute) {
          if (domNode.hasAttribute(attribute)) {
            formats[attribute] = domNode.getAttribute(attribute);
          }
          return formats;
        }, {});
      }
    }, {
      key: 'match',
      value: function match(url) {
        return (/\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url)
        );
      }
    }, {
      key: 'sanitize',
      value: function sanitize(url) {
        return (0, _link.sanitize)(url, ['http', 'https', 'data']) ? url : '//:0';
      }
    }, {
      key: 'value',
      value: function value(domNode) {
        return domNode.getAttribute('src');
      }
    }]);

    return Image;
  }(_parchment2.default.Embed);

  Image.blotName = 'image';
  Image.tagName = 'IMG';

  exports.default = Image;

  /***/ }),
  /* 73 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _block = __webpack_require__(4);

  var _link = __webpack_require__(27);

  var _link2 = _interopRequireDefault(_link);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ATTRIBUTES = ['height', 'width'];

  var Video = function (_BlockEmbed) {
    _inherits(Video, _BlockEmbed);

    function Video() {
      _classCallCheck(this, Video);

      return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
    }

    _createClass(Video, [{
      key: 'format',
      value: function format(name, value) {
        if (ATTRIBUTES.indexOf(name) > -1) {
          if (value) {
            this.domNode.setAttribute(name, value);
          } else {
            this.domNode.removeAttribute(name);
          }
        } else {
          _get(Video.prototype.__proto__ || Object.getPrototypeOf(Video.prototype), 'format', this).call(this, name, value);
        }
      }
    }], [{
      key: 'create',
      value: function create(value) {
        var node = _get(Video.__proto__ || Object.getPrototypeOf(Video), 'create', this).call(this, value);
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', true);
        node.setAttribute('src', this.sanitize(value));
        return node;
      }
    }, {
      key: 'formats',
      value: function formats(domNode) {
        return ATTRIBUTES.reduce(function (formats, attribute) {
          if (domNode.hasAttribute(attribute)) {
            formats[attribute] = domNode.getAttribute(attribute);
          }
          return formats;
        }, {});
      }
    }, {
      key: 'sanitize',
      value: function sanitize(url) {
        return _link2.default.sanitize(url);
      }
    }, {
      key: 'value',
      value: function value(domNode) {
        return domNode.getAttribute('src');
      }
    }]);

    return Video;
  }(_block.BlockEmbed);

  Video.blotName = 'video';
  Video.className = 'ql-video';
  Video.tagName = 'IFRAME';

  exports.default = Video;

  /***/ }),
  /* 74 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.FormulaBlot = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _embed = __webpack_require__(35);

  var _embed2 = _interopRequireDefault(_embed);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var FormulaBlot = function (_Embed) {
    _inherits(FormulaBlot, _Embed);

    function FormulaBlot() {
      _classCallCheck(this, FormulaBlot);

      return _possibleConstructorReturn(this, (FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot)).apply(this, arguments));
    }

    _createClass(FormulaBlot, null, [{
      key: 'create',
      value: function create(value) {
        var node = _get(FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot), 'create', this).call(this, value);
        if (typeof value === 'string') {
          window.katex.render(value, node, {
            throwOnError: false,
            errorColor: '#f00'
          });
          node.setAttribute('data-value', value);
        }
        return node;
      }
    }, {
      key: 'value',
      value: function value(domNode) {
        return domNode.getAttribute('data-value');
      }
    }]);

    return FormulaBlot;
  }(_embed2.default);

  FormulaBlot.blotName = 'formula';
  FormulaBlot.className = 'ql-formula';
  FormulaBlot.tagName = 'SPAN';

  var Formula = function (_Module) {
    _inherits(Formula, _Module);

    _createClass(Formula, null, [{
      key: 'register',
      value: function register() {
        _quill2.default.register(FormulaBlot, true);
      }
    }]);

    function Formula() {
      _classCallCheck(this, Formula);

      var _this2 = _possibleConstructorReturn(this, (Formula.__proto__ || Object.getPrototypeOf(Formula)).call(this));

      if (window.katex == null) {
        throw new Error('Formula module requires KaTeX.');
      }
      return _this2;
    }

    return Formula;
  }(_module2.default);

  exports.FormulaBlot = FormulaBlot;
  exports.default = Formula;

  /***/ }),
  /* 75 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.CodeToken = exports.CodeBlock = undefined;

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _parchment = __webpack_require__(0);

  var _parchment2 = _interopRequireDefault(_parchment);

  var _quill = __webpack_require__(5);

  var _quill2 = _interopRequireDefault(_quill);

  var _module = __webpack_require__(9);

  var _module2 = _interopRequireDefault(_module);

  var _code = __webpack_require__(13);

  var _code2 = _interopRequireDefault(_code);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var SyntaxCodeBlock = function (_CodeBlock) {
    _inherits(SyntaxCodeBlock, _CodeBlock);

    function SyntaxCodeBlock() {
      _classCallCheck(this, SyntaxCodeBlock);

      return _possibleConstructorReturn(this, (SyntaxCodeBlock.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock)).apply(this, arguments));
    }

    _createClass(SyntaxCodeBlock, [{
      key: 'replaceWith',
      value: function replaceWith(block) {
        this.domNode.textContent = this.domNode.textContent;
        this.attach();
        _get(SyntaxCodeBlock.prototype.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock.prototype), 'replaceWith', this).call(this, block);
      }
    }, {
      key: 'highlight',
      value: function highlight(_highlight) {
        var text = this.domNode.textContent;
        if (this.cachedText !== text) {
          if (text.trim().length > 0 || this.cachedText == null) {
            this.domNode.innerHTML = _highlight(text);
            this.domNode.normalize();
            this.attach();
          }
          this.cachedText = text;
        }
      }
    }]);

    return SyntaxCodeBlock;
  }(_code2.default);

  SyntaxCodeBlock.className = 'ql-syntax';

  var CodeToken = new _parchment2.default.Attributor.Class('token', 'hljs', {
    scope: _parchment2.default.Scope.INLINE
  });

  var Syntax = function (_Module) {
    _inherits(Syntax, _Module);

    _createClass(Syntax, null, [{
      key: 'register',
      value: function register() {
        _quill2.default.register(CodeToken, true);
        _quill2.default.register(SyntaxCodeBlock, true);
      }
    }]);

    function Syntax(quill, options) {
      _classCallCheck(this, Syntax);

      var _this2 = _possibleConstructorReturn(this, (Syntax.__proto__ || Object.getPrototypeOf(Syntax)).call(this, quill, options));

      if (typeof _this2.options.highlight !== 'function') {
        throw new Error('Syntax module requires highlight.js. Please include the library on the page before Quill.');
      }
      var timer = null;
      _this2.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          _this2.highlight();
          timer = null;
        }, _this2.options.interval);
      });
      _this2.highlight();
      return _this2;
    }

    _createClass(Syntax, [{
      key: 'highlight',
      value: function highlight() {
        var _this3 = this;

        if (this.quill.selection.composing) return;
        this.quill.update(_quill2.default.sources.USER);
        var range = this.quill.getSelection();
        this.quill.scroll.descendants(SyntaxCodeBlock).forEach(function (code) {
          code.highlight(_this3.options.highlight);
        });
        this.quill.update(_quill2.default.sources.SILENT);
        if (range != null) {
          this.quill.setSelection(range, _quill2.default.sources.SILENT);
        }
      }
    }]);

    return Syntax;
  }(_module2.default);

  Syntax.DEFAULTS = {
    highlight: function () {
      if (window.hljs == null) return null;
      return function (text) {
        var result = window.hljs.highlightAuto(text);
        return result.value;
      };
    }(),
    interval: 1000
  };

  exports.CodeBlock = SyntaxCodeBlock;
  exports.CodeToken = CodeToken;
  exports.default = Syntax;

  /***/ }),
  /* 76 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>";

  /***/ }),
  /* 77 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>";

  /***/ }),
  /* 78 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>";

  /***/ }),
  /* 79 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>";

  /***/ }),
  /* 80 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <g class=\"ql-fill ql-color-label\"> <polygon points=\"6 6.868 6 6 5 6 5 7 5.942 7 6 6.868\"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points=\"6.817 5 6 5 6 6 6.38 6 6.817 5\"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points=\"4 11.439 4 11 3 11 3 12 3.755 12 4 11.439\"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points=\"4.63 10 4 10 4 11 4.192 11 4.63 10\"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points=\"13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174\"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points=\"12 6.868 12 6 11.62 6 12 6.868\"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points=\"12.933 9 13 9 13 8 12.495 8 12.933 9\"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points=\"5.5 13 9 5 12.5 13\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>";

  /***/ }),
  /* 81 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=4 y=5></rect> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=11 y=5></rect> <path class=\"ql-even ql-fill ql-stroke\" d=M7,8c0,4.031-3,5-3,5></path> <path class=\"ql-even ql-fill ql-stroke\" d=M14,8c0,4.031-3,5-3,5></path> </svg>";

  /***/ }),
  /* 82 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>";

  /***/ }),
  /* 83 */
  /***/ (function(module, exports) {

  module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>";

  /***/ }),
  /* 84 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-color-label ql-stroke ql-transparent\" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points=\"5.5 11 9 3 12.5 11\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>";

  /***/ }),
  /* 85 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"3 11 5 9 3 7 3 11\"></polygon> <line class=\"ql-stroke ql-fill\" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>";

  /***/ }),
  /* 86 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"15 12 13 10 15 8 15 12\"></polygon> <line class=\"ql-stroke ql-fill\" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>";

  /***/ }),
  /* 87 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>";

  /***/ }),
  /* 88 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>";

  /***/ }),
  /* 89 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>";

  /***/ }),
  /* 90 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform=\"translate(24 18) rotate(-180)\"/> </svg>";

  /***/ }),
  /* 91 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>";

  /***/ }),
  /* 92 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>";

  /***/ }),
  /* 93 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>";

  /***/ }),
  /* 94 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>";

  /***/ }),
  /* 95 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class=\"ql-even ql-fill\" points=\"5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12\"></polyline> </svg>";

  /***/ }),
  /* 96 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=\"ql-fill ql-stroke\" points=\"3 7 3 11 5 9 3 7\"></polyline> </svg>";

  /***/ }),
  /* 97 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"5 7 5 11 3 9 5 7\"></polyline> </svg>";

  /***/ }),
  /* 98 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class=\"ql-even ql-stroke\" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class=\"ql-even ql-stroke\" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>";

  /***/ }),
  /* 99 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class=\"ql-stroke ql-thin\" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class=\"ql-stroke ql-thin\" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class=\"ql-stroke ql-thin\" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>";

  /***/ }),
  /* 100 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>";

  /***/ }),
  /* 101 */
  /***/ (function(module, exports) {

  module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points=\"3 4 4 5 6 3\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points=\"3 14 4 15 6 13\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"3 9 4 10 6 8\"></polyline> </svg>";

  /***/ }),
  /* 102 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>";

  /***/ }),
  /* 103 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>";

  /***/ }),
  /* 104 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-stroke ql-thin\" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>";

  /***/ }),
  /* 105 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>";

  /***/ }),
  /* 106 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>";

  /***/ }),
  /* 107 */
  /***/ (function(module, exports) {

  module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=ql-stroke points=\"7 11 9 13 11 11 7 11\"></polygon> <polygon class=ql-stroke points=\"7 7 9 5 11 7 7 7\"></polygon> </svg>";

  /***/ }),
  /* 108 */
  /***/ (function(module, exports, __webpack_require__) {


  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = exports.BubbleTooltip = undefined;

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _extend = __webpack_require__(3);

  var _extend2 = _interopRequireDefault(_extend);

  var _emitter = __webpack_require__(8);

  var _emitter2 = _interopRequireDefault(_emitter);

  var _base = __webpack_require__(43);

  var _base2 = _interopRequireDefault(_base);

  var _selection = __webpack_require__(15);

  var _icons = __webpack_require__(41);

  var _icons2 = _interopRequireDefault(_icons);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TOOLBAR_CONFIG = [['bold', 'italic', 'link'], [{ header: 1 }, { header: 2 }, 'blockquote']];

  var BubbleTheme = function (_BaseTheme) {
    _inherits(BubbleTheme, _BaseTheme);

    function BubbleTheme(quill, options) {
      _classCallCheck(this, BubbleTheme);

      if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
        options.modules.toolbar.container = TOOLBAR_CONFIG;
      }

      var _this = _possibleConstructorReturn(this, (BubbleTheme.__proto__ || Object.getPrototypeOf(BubbleTheme)).call(this, quill, options));

      _this.quill.container.classList.add('ql-bubble');
      return _this;
    }

    _createClass(BubbleTheme, [{
      key: 'extendToolbar',
      value: function extendToolbar(toolbar) {
        this.tooltip = new BubbleTooltip(this.quill, this.options.bounds);
        this.tooltip.root.appendChild(toolbar.container);
        this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
        this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
      }
    }]);

    return BubbleTheme;
  }(_base2.default);

  BubbleTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
    modules: {
      toolbar: {
        handlers: {
          link: function link(value) {
            if (!value) {
              this.quill.format('link', false);
            } else {
              this.quill.theme.tooltip.edit();
            }
          }
        }
      }
    }
  });

  var BubbleTooltip = function (_BaseTooltip) {
    _inherits(BubbleTooltip, _BaseTooltip);

    function BubbleTooltip(quill, bounds) {
      _classCallCheck(this, BubbleTooltip);

      var _this2 = _possibleConstructorReturn(this, (BubbleTooltip.__proto__ || Object.getPrototypeOf(BubbleTooltip)).call(this, quill, bounds));

      _this2.quill.on(_emitter2.default.events.EDITOR_CHANGE, function (type, range, oldRange, source) {
        if (type !== _emitter2.default.events.SELECTION_CHANGE) return;
        if (range != null && range.length > 0 && source === _emitter2.default.sources.USER) {
          _this2.show();
          // Lock our width so we will expand beyond our offsetParent boundaries
          _this2.root.style.left = '0px';
          _this2.root.style.width = '';
          _this2.root.style.width = _this2.root.offsetWidth + 'px';
          var lines = _this2.quill.getLines(range.index, range.length);
          if (lines.length === 1) {
            _this2.position(_this2.quill.getBounds(range));
          } else {
            var lastLine = lines[lines.length - 1];
            var index = _this2.quill.getIndex(lastLine);
            var length = Math.min(lastLine.length() - 1, range.index + range.length - index);
            var _bounds = _this2.quill.getBounds(new _selection.Range(index, length));
            _this2.position(_bounds);
          }
        } else if (document.activeElement !== _this2.textbox && _this2.quill.hasFocus()) {
          _this2.hide();
        }
      });
      return _this2;
    }

    _createClass(BubbleTooltip, [{
      key: 'listen',
      value: function listen() {
        var _this3 = this;

        _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'listen', this).call(this);
        this.root.querySelector('.ql-close').addEventListener('click', function () {
          _this3.root.classList.remove('ql-editing');
        });
        this.quill.on(_emitter2.default.events.SCROLL_OPTIMIZE, function () {
          // Let selection be restored by toolbar handlers before repositioning
          setTimeout(function () {
            if (_this3.root.classList.contains('ql-hidden')) return;
            var range = _this3.quill.getSelection();
            if (range != null) {
              _this3.position(_this3.quill.getBounds(range));
            }
          }, 1);
        });
      }
    }, {
      key: 'cancel',
      value: function cancel() {
        this.show();
      }
    }, {
      key: 'position',
      value: function position(reference) {
        var shift = _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'position', this).call(this, reference);
        var arrow = this.root.querySelector('.ql-tooltip-arrow');
        arrow.style.marginLeft = '';
        if (shift === 0) return shift;
        arrow.style.marginLeft = -1 * shift - arrow.offsetWidth / 2 + 'px';
      }
    }]);

    return BubbleTooltip;
  }(_base.BaseTooltip);

  BubbleTooltip.TEMPLATE = ['<span class="ql-tooltip-arrow"></span>', '<div class="ql-tooltip-editor">', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-close"></a>', '</div>'].join('');

  exports.BubbleTooltip = BubbleTooltip;
  exports.default = BubbleTheme;

  /***/ }),
  /* 109 */
  /***/ (function(module, exports, __webpack_require__) {

  module.exports = __webpack_require__(63);


  /***/ })
  /******/ ])["default"];
  });
  });

  var Quill = /*@__PURE__*/getDefaultExportFromCjs(quill$1);

  /**
   * @typedef {object} TestData
   * @property {any} TestData.editor
   * @property {QuillBinding} TestData.binding
   * @property {Y.Text} type
   */

  /**
   * @param {any} [y]
   * @return {TestData}
   */
  const createQuillEditor = (y = new Doc()) => {
    const type = y.getText('text');
    const editor = new Quill(document.createElement('div'));
    const binding = new QuillBinding(type, editor);
    return {
      editor, binding, type
    }
  };

  const testBasicInsert = () => {
    const { editor, type } = createQuillEditor();
    type.insert(0, 'text');
    assert(editor.getText() === 'text\n');
    editor.insertText(0, 'text');
    assert(editor.getText() === 'texttext\n');
  };

  /**
   * @param {t.TestCase} tc
   */
  const testConcurrentOverlappingFormatting = tc => {
    const { editor, type } = createQuillEditor();
    const { editor: editor2, type: type2 } = createQuillEditor();
    type.insert(0, 'abcdef');
    applyUpdate(type2.doc, encodeStateAsUpdate(type.doc));
    editor.updateContents([{ retain: 3, attributes: { bold: true } }]);
    editor2.updateContents([{ retain: 2 }, { retain: 2, attributes: { bold: true } }]);
    // sync
    applyUpdate(type.doc, encodeStateAsUpdate(type2.doc));
    applyUpdate(type2.doc, encodeStateAsUpdate(type.doc));
    console.log(editor.getContents().ops);
    console.log(editor2.getContents().ops);
    compare$1(editor.getContents().ops, editor2.getContents().ops);
  };

  let charCounter = 0;

  const marksChoices = [
    undefined,
    { bold: true },
    { italic: true },
    { italic: true, color: '#888' }
  ];

  /**
   * @type Array<function(any,prng.PRNG,TestData):void>
   */
  const qChanges = [
    /**
     * @param {Y.Doc} y
     * @param {prng.PRNG} gen
     * @param {TestData} p
     */
    (y, gen, p) => { // insert text
      const insertPos = int32(gen, 0, p.editor.getText().length);
      const attrs = oneOf(gen, marksChoices);
      const text = charCounter++ + word(gen);
      p.editor.insertText(insertPos, text, attrs);
    },
    /**
     * @param {Y.Doc} y
     * @param {prng.PRNG} gen
     * @param {TestData} p
     */
    (y, gen, p) => { // insert embed
      const insertPos = int32(gen, 0, p.editor.getText().length);
      p.editor.insertEmbed(insertPos, 'image', 'https://user-images.githubusercontent.com/5553757/48975307-61efb100-f06d-11e8-9177-ee895e5916e5.png');
    },
    /**
     * @param {Y.Doc} y
     * @param {prng.PRNG} gen
     * @param {TestData} p
     */
    (y, gen, p) => { // delete text
      const contentLen = p.editor.getText().length;
      const insertPos = int32(gen, 0, contentLen);
      const overwrite = min(int32(gen, 0, contentLen - insertPos), 2);
      p.editor.deleteText(insertPos, overwrite);
    },
    /**
     * @param {Y.Doc} y
     * @param {prng.PRNG} gen
     * @param {TestData} p
     */
    (y, gen, p) => { // format text
      const contentLen = p.editor.getText().length;
      const insertPos = int32(gen, 0, contentLen);
      const overwrite = min(int32(gen, 0, contentLen - insertPos), 2);
      const format = oneOf(gen, marksChoices);
      p.editor.format(insertPos, overwrite, format);
    },
    /**
     * @param {Y.Doc} y
     * @param {prng.PRNG} gen
     * @param {TestData} p
     */
    (y, gen, p) => { // insert codeblock
      const insertPos = int32(gen, 0, p.editor.getText().length);
      const text = charCounter++ + word(gen);
      const ops = [];
      if (insertPos > 0) {
        ops.push({ retain: insertPos });
      }
      ops.push({ insert: text }, { insert: '\n', format: { 'code-block': true } });
      p.editor.updateContents(ops);
    }
  ];

  /**
   * @param {any} result
   */
  const checkResult = result => {
    for (let i = 1; i < result.testObjects.length; i++) {
      const p1 = normQuillDelta(result.testObjects[i - 1].editor.getContents().ops);
      const p2 = normQuillDelta(result.testObjects[i].editor.getContents().ops);
      compare$1(p1, p2);
    }
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges1 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 1, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges2 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 2, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges3 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 3, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges30 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 30, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges40 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 40, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges70 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 70, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges100 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 100, createQuillEditor));
  };

  /**
   * @param {t.TestCase} tc
   */
  const testRepeatGenerateQuillChanges300 = tc => {
    checkResult(applyRandomTests(tc, qChanges, 300, createQuillEditor));
  };

  var quill = /*#__PURE__*/Object.freeze({
    __proto__: null,
    testBasicInsert: testBasicInsert,
    testConcurrentOverlappingFormatting: testConcurrentOverlappingFormatting,
    testRepeatGenerateQuillChanges1: testRepeatGenerateQuillChanges1,
    testRepeatGenerateQuillChanges2: testRepeatGenerateQuillChanges2,
    testRepeatGenerateQuillChanges3: testRepeatGenerateQuillChanges3,
    testRepeatGenerateQuillChanges30: testRepeatGenerateQuillChanges30,
    testRepeatGenerateQuillChanges40: testRepeatGenerateQuillChanges40,
    testRepeatGenerateQuillChanges70: testRepeatGenerateQuillChanges70,
    testRepeatGenerateQuillChanges100: testRepeatGenerateQuillChanges100,
    testRepeatGenerateQuillChanges300: testRepeatGenerateQuillChanges300
  });

  if (isBrowser) {
    createVConsole(document.body);
  }
  runTests({
    quill
  }).then(success => {
    /* istanbul ignore next */
    if (isNode) {
      process.exit(success ? 0 : 1);
    }
  });

})();
//# sourceMappingURL=test.js.map
