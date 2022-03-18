/**
 *
 * @typedef {{
 *  x: number,
 *  y: number
 * }} Vector2
 *
 * @typedef {{
 *  lastKeyPressed: string,
 *  [key: string]: boolean
 * }} Keys
 *
 * @typedef {{
 *  position: Vector2,
 *  [key: string]: boolean
 * }} Mouse
 *
 * @typedef {{
 *  active: boolean,
 *  start: Vector2,
 *  current: Vector2,
 *  move: Vector2
 *  vertical: number,
 *  horizontal: number,
 *  normalized: Vector2,
 * }} Joystick
 *
 * @typedef {{
 *  threshold: number
 * }} Options
 *
 * @typedef {{
 *  readonly keys: Keys,
 *  readonly mouse: Mouse,
 *  readonly joystick: Joystick,
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

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);
const round = (value) => Math.round(value * 100) / 100;
const getMagnitude = (x, y) => Math.sqrt(x ** 2 + y ** 2);
const getZeroPosition = () => ({ x: 0, y: 0 });

/**
 * @param {HTMLElement} element
 * @param {Options} options
 * @returns {InputJSInstance}
 */
const InputJS = (element, options = {}) => {
  /** @type {Keys} */
  const keys = generateProxy({ lastKeyPressed: '' });
  /** @type {Mouse} */
  const mouse = generateProxy({ position: getZeroPosition() });
  /** @type {Joystick} */
  const joystick = {
    active: false,
    start: getZeroPosition(),
    current: getZeroPosition(),
    move: getZeroPosition(),
    vertical: 0,
    horizontal: 0,
    normalized: getZeroPosition(),
  };

  const verticalKeys = [
    { code: 'KeyW', value: -1 },
    { code: 'KeyS', value: 1 },
    { code: 'ArrowUp', value: -1 },
    { code: 'ArrowDown', value: 1 },
  ];
  const horizontalKeys = [
    { code: 'KeyA', value: -1 },
    { code: 'KeyD', value: 1 },
    { code: 'ArrowLeft', value: -1 },
    { code: 'ArrowRight', value: 1 },
  ];
  const setAxis = () => {
    const getMouseJoystick = (axis) => {
      if (!options.threshold) return 0;
      const move = joystick.move[axis === 'vertical' ? 'y' : 'x'];
      const direction = Math.sign(move);
      return Math.min(Math.abs(move) / options.threshold, 1) * direction;
    };
    const vertical = clamp(
      verticalKeys.reduce(
        (a, b) => a + (keys[b.code] ? b.value : 0),
        getMouseJoystick('vertical'),
      ),
      -1,
      1,
    );
    const horizontal = clamp(
      horizontalKeys.reduce(
        (a, b) => a + (keys[b.code] ? b.value : 0),
        getMouseJoystick('horizontal'),
      ),
      -1,
      1,
    );
    const magnitude = getMagnitude(horizontal, vertical) || 1;
    const getNormalized = (value) => {
      const abs = Math.abs(value);
      const normalized = round(abs / magnitude);
      return clamp(abs, 0, normalized) * Math.sign(value);
    };
    joystick.vertical = round(vertical);
    joystick.horizontal = round(horizontal);
    joystick.normalized = {
      x: getNormalized(horizontal),
      y: getNormalized(vertical),
    };
  };

  const getMousePosition = ({ clientX, clientY }) => ({
    x: round(clientX - (element.offsetLeft || 0)),
    y: round(clientY - (element.offsetTop || 0)),
  });

  /** @type {Record<string, (event: Event) => void>} */
  const events = {
    keydown: ({ code }) => {
      keys[code] = true;
      keys.lastKeyPressed = code;
      setAxis();
    },
    keyup: ({ code }) => {
      keys[code] = false;
      setAxis();
    },
    pointerdown: (event) => {
      mouse[event.button] = true;
      joystick.active = true;
      joystick.start = getMousePosition(event);
      setAxis();
    },
    pointerup: ({ button }) => {
      mouse[button] = false;
      joystick.active = false;
      joystick.move = getZeroPosition();
      joystick.start = getZeroPosition();
      joystick.current = getZeroPosition();
      setAxis();
    },
    pointermove: (event) => {
      mouse.position = getMousePosition(event);
      if (joystick.active) {
        joystick.current = getMousePosition(event);
        joystick.move = {
          x: round(joystick.current.x - joystick.start.x),
          y: round(joystick.current.y - joystick.start.y),
        };
        setAxis();
      }
    },
    blur: () => {
      const toReset = [keys, mouse];

      toReset.forEach((obj) => {
        const myObj = obj;
        Object.keys(obj).forEach((key) => { myObj[key] = false; });
      });
    },
  };

  const styles = element.style;
  styles.touchAction = 'none';

  Object.entries(events).forEach(([type, cb]) => {
    const target = type.slice(0, 3) === 'key' ? document : element;
    target.addEventListener(type, cb);
  });

  return {
    get keys() { return keys; },
    get mouse() { return mouse; },
    get joystick() { return joystick; },
    destroy: () => {
      Object.entries(events).forEach(([type, cb]) => {
        const target = type.slice(0, 3) === 'key' ? document : element;
        target.removeEventListener(type, cb);
      });
    },
  };
};

export default InputJS;
