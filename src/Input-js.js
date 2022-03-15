/**
 *
 * @typedef {{
 *  lastKeyPressed: string,
 *  [key: string]: boolean
 * }} Keys
 *
 * @typedef {{
 *  readonly keys: Keys,
 *  readonly mouse: Record<string, boolean>,
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
  const mouse = new Proxy({}, { get: (target, prop) => !!target[prop] });

  /** @type {Record<string, (event: KeyboardEvent) => void>} */
  const events = {
    keydown: ({ code }) => {
      keys[code] = true;
      keys.lastKeyPressed = code;
    },
    keyup: ({ code }) => { keys[code] = false; },
    mousedown: ({ button }) => { mouse[button] = true; },
    mouseup: ({ button }) => { mouse[button] = false; },
    blur: () => {
      const toReset = [keys, mouse];

      toReset.forEach((obj) => {
        const myObj = obj;
        Object.keys(obj).forEach((key) => { myObj[key] = false; });
      });
    },
  };

  Object.entries(events).forEach(([type, cb]) => {
    element.addEventListener(type, cb);
  });

  return {
    get keys() { return keys; },
    get mouse() { return mouse; },
    destroy: () => {
      Object.entries(events).forEach(([type, cb]) => {
        element.removeEventListener(type, cb);
      });
    },
  };
};

export default InputJS;
