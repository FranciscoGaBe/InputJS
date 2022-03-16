/**
 *
 * @typedef {{
 *  lastKeyPressed: string,
 *  [key: string]: boolean
 * }} Keys
 *
 * @typedef {{
 *  position: {
 *    x: number,
 *    y: number
 *  },
 *  [key: string]: boolean
 * }} Mouse
 *
 * @typedef {{
 *  readonly keys: Keys,
 *  readonly mouse: Mouse,
 *  destroy: () => void
 * }} InputJSInstance
 */

const generateProxy = (obj) => new Proxy(obj, {
  get: (...args) => {
    const [target, prop] = args;
    if (prop in target) return Reflect.get(...args);
    return !!target[prop];
  },
});

/*
 * @param {HTMLElement} element
 * @returns {InputJSInstance}
 */
const InputJS = (element) => {
  /** @type {Keys} */
  const keys = generateProxy({ lastKeyPressed: '' });
  /** @type {Mouse} */
  const mouse = generateProxy({ position: { x: 0, y: 0 } });

  /** @type {Record<string, (event: Event) => void>} */
  const events = {
    keydown: ({ code }) => {
      keys[code] = true;
      keys.lastKeyPressed = code;
    },
    keyup: ({ code }) => { keys[code] = false; },
    mousedown: ({ button }) => { mouse[button] = true; },
    mouseup: ({ button }) => { mouse[button] = false; },
    mousemove: ({ clientX, clientY, currentTarget }) => {
      mouse.position = {
        x: clientX - (currentTarget.offsetLeft || 0),
        y: clientY - (currentTarget.offsetTop || 0),
      };
    },
    blur: () => {
      const toReset = [keys, mouse];

      toReset.forEach((obj) => {
        const myObj = obj;
        Object.keys(obj).forEach((key) => { myObj[key] = false; });
      });
    },
  };

  Object.entries(events).forEach(([type, cb]) => {
    const target = type.slice(0, 3) === 'key' ? document : element;
    target.addEventListener(type, cb);
  });

  return {
    get keys() { return keys; },
    get mouse() { return mouse; },
    destroy: () => {
      Object.entries(events).forEach(([type, cb]) => {
        const target = type.slice(0, 3) === 'key' ? document : element;
        target.removeEventListener(type, cb);
      });
    },
  };
};

export default InputJS;
