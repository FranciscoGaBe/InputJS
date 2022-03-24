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
 *  vertical: number,
 *  horizontal: number,
 *  normalized: Vector2,
 *  clamped: Vector2
 * }} JoystickAxis
 *
 * @typedef {{
 *  active: boolean,
 *  start: Vector2,
 *  current: Vector2,
 *  move: Vector2
 *  axis: JoystickAxis
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
 * }} JSITInstance
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
 * @returns {JSITInstance}
 */
const JSIT = (element, options = {}) => {
  /** @type {Keys} */
  const keys = generateProxy({ lastKeyPressed: '' });
  /** @type {Mouse} */
  const mouse = generateProxy({ position: getZeroPosition() });
  /** @type {JoystickAxis} */
  const joystickAxis = {
    vertical: 0,
    horizontal: 0,
    normalized: getZeroPosition(),
    clamped: getZeroPosition(),
  };
  /** @type {Joystick} */
  const joystick = {
    active: false,
    start: getZeroPosition(),
    current: getZeroPosition(),
    move: getZeroPosition(),
    axis: joystickAxis,
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
      const move = joystick.move[axis];
      return Math.min(Math.abs(move) / options.threshold, 1) * Math.sign(move);
    };
    const vertical = clamp(
      verticalKeys.reduce(
        (a, b) => a + (keys[b.code] ? b.value : 0),
        getMouseJoystick('y'),
      ),
      -1,
      1,
    );
    const horizontal = clamp(
      horizontalKeys.reduce(
        (a, b) => a + (keys[b.code] ? b.value : 0),
        getMouseJoystick('x'),
      ),
      -1,
      1,
    );
    const magnitude = getMagnitude(horizontal, vertical) || 1;
    const getNormalized = (value) => round(value / magnitude);
    const getClamped = (value, axis) => clamp(
      Math.abs(value),
      0,
      Math.abs(joystickAxis.normalized[axis]),
    ) * Math.sign(value);
    joystickAxis.vertical = round(vertical);
    joystickAxis.horizontal = round(horizontal);
    joystickAxis.normalized = {
      x: getNormalized(horizontal),
      y: getNormalized(vertical),
    };
    joystickAxis.clamped = {
      x: getClamped(horizontal, 'x'),
      y: getClamped(vertical, 'y'),
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
  if (styles) styles.touchAction = 'none';

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

export default JSIT;
