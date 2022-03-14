/**
 * 
 * @typedef {
 *  keys: Record<string, boolean>,
 *  destroy: () => void
 * } InputJSIntance
 */

/**
 *
 * @param {HTMLElement} element
 * @returns {InputJSInstance}
 */
const InputJS = (element) => {
  const keys = new Proxy({}, {
    get: (target, prop) => !!target[prop],
  });

  /** @type {Record<string, (event: KeyboardEvent) => void>} */
  const events = {
    keydown: ({ code }) => { keys[code] = true; },
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
