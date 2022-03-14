/**
 *
 * @typedef {{
 *  lastKeyPressed: string,
 *  [key: string]: boolean
 * }} Keys
 *
 * @typedef {{
 *  keys: Keys,
 *  destroy: () => void
 * }} InputJSInstance
 *
 * @param {HTMLElement} element
 * @returns {InputJSInstance}
 */
const InputJS = (element) => {
  /** @type {Keys} */
  const keys = new Proxy({
    lastKeyPressed: '',
  }, {
    get: (...args) => {
      const [target, prop] = args;
      if (prop in target) return Reflect.get(...args);
      return !!target[prop];
    },
  });

  /** @type {Record<string, (event: KeyboardEvent) => void>} */
  const events = {
    keydown: ({ code }) => {
      keys[code] = true;
      keys.lastKeyPressed = code;
    },
    keyup: ({ code }) => { keys[code] = false; },
    blur: () => { Object.keys(keys).forEach((key) => { keys[key] = false; }); },
  };

  Object.entries(events).forEach(([type, cb]) => {
    element.addEventListener(type, cb);
  });

  return {
    get keys() { return keys; },
    destroy: () => {
      Object.entries(events).forEach(([type, cb]) => {
        element.removeEventListener(type, cb);
      });
    },
  };
};

export default InputJS;
