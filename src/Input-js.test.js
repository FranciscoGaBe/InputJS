/** @jest-environment jsdom */
import InputJS from './Input-js';

function PointerEvent(...args) { return new MouseEvent(...args); }
window.PointerEvent = PointerEvent;

/**  @typedef {(code: string) => KeyboardEvent} KeyEvent */

const keyboardEvent = (type, code) => new KeyboardEvent(type, { code });

/** @type {KeyEvent} */ const keyboardDown = keyboardEvent.bind({}, 'keydown');
/** @type {KeyEvent} */ const keyboardUp = keyboardEvent.bind({}, 'keyup');

/**
 *
 * @param {string} device
 * @param {string} type
 * @param {any} data
 */
const fireEvent = (device, type, data) => {
  const getEvent = () => {
    switch (device) {
      case 'keyboard': return new KeyboardEvent(type, { code: data });
      case 'mouse': return new PointerEvent(type, { button: data });
      default: return new Event(type, { details: data });
    }
  };
  document.body.dispatchEvent(getEvent());
};
describe('InputJS', () => {
  /** @type {ReturnType<typeof InputJS>} */
  let inputjs = InputJS(document.body);

  beforeEach(() => {
    inputjs = InputJS(document.body);
  });

  afterEach(() => {
    inputjs.destroy();
  });

  describe('.keys', () => {
    it('keeps tracks of currently pressed keys', () => {
      document.body.dispatchEvent(keyboardDown('KeyW'));
      expect(inputjs.keys.KeyW).toBe(true);
      document.body.dispatchEvent(keyboardUp('KeyW'));
      expect(inputjs.keys.KeyW).toBe(false);
    });
    it('return false when the key hasn\'t been pressed', () => {
      expect(inputjs.keys.a).toBe(false);
    });
    it('sets all keys to false when onBlur', () => {
      document.body.dispatchEvent(keyboardDown('KeyW'));
      document.body.dispatchEvent(keyboardDown('KeyA'));
      document.body.dispatchEvent(new Event('blur'));
      expect(inputjs.keys.KeyW).toBe(false);
      expect(inputjs.keys.KeyA).toBe(false);
    });
    it('keeps track of last pressed key in .lastKeyPressed', () => {
      document.body.dispatchEvent(keyboardDown('KeyW'));
      expect(inputjs.keys.lastKeyPressed).toBe('KeyW');
      document.body.dispatchEvent(keyboardDown('KeyS'));
      expect(inputjs.keys.lastKeyPressed).toBe('KeyS');
    });
  });
  describe('.mouse', () => {
    it('keeps tracks of currently pressed mouse buttons', () => {
      fireEvent('mouse', 'mousedown', 1);
      expect(inputjs.mouse[1]).toBe(true);
      fireEvent('mouse', 'mouseup', 1);
      expect(inputjs.mouse[1]).toBe(false);
    });
    it('keeps tracks of currently pressed mouse buttons', () => {
      expect(inputjs.mouse[1]).toBe(false);
    });
    it('sets all buttons to false when onBlur', () => {
      fireEvent('mouse', 'mousedown', 1);
      fireEvent('mouse', 'mousedown', 0);
      fireEvent('blur', 'blur');
      expect(inputjs.mouse[1]).toBe(false);
      expect(inputjs.mouse[0]).toBe(false);
    });
  });
});
