/** @jest-environment jsdom */
import InputJS from './Input-js';

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
      case 'keyboard': return new KeyboardEvent(type, data);
      case 'mouse': return new MouseEvent(type, data);
      default: return new Event(type, { details: data });
    }
  };
  document.dispatchEvent(getEvent());
};
describe('InputJS', () => {
  /** @type {ReturnType<typeof InputJS>} */
  let inputjs = InputJS(document);

  beforeEach(() => {
    inputjs = InputJS(document);
  });

  afterEach(() => {
    inputjs.destroy();
  });

  describe('.keys', () => {
    it('keeps tracks of currently pressed keys', () => {
      document.dispatchEvent(keyboardDown('KeyW'));
      expect(inputjs.keys.KeyW).toBe(true);
      document.dispatchEvent(keyboardUp('KeyW'));
      expect(inputjs.keys.KeyW).toBe(false);
    });
    it('return false when the key hasn\'t been pressed', () => {
      expect(inputjs.keys.a).toBe(false);
    });
    it('sets all keys to false when onBlur', () => {
      document.dispatchEvent(keyboardDown('KeyW'));
      document.dispatchEvent(keyboardDown('KeyA'));
      document.dispatchEvent(new Event('blur'));
      expect(inputjs.keys.KeyW).toBe(false);
      expect(inputjs.keys.KeyA).toBe(false);
    });
    it('keeps track of last pressed key in .lastKeyPressed', () => {
      document.dispatchEvent(keyboardDown('KeyW'));
      expect(inputjs.keys.lastKeyPressed).toBe('KeyW');
      document.dispatchEvent(keyboardDown('KeyS'));
      expect(inputjs.keys.lastKeyPressed).toBe('KeyS');
    });
  });
  describe('.mouse', () => {
    it('keeps tracks of currently pressed mouse buttons', () => {
      fireEvent('mouse', 'mousedown', { button: 1 });
      expect(inputjs.mouse[1]).toBe(true);
      fireEvent('mouse', 'mouseup', { button: 1 });
      expect(inputjs.mouse[1]).toBe(false);
    });
    it('keeps tracks of currently pressed mouse buttons', () => {
      expect(inputjs.mouse[1]).toBe(false);
    });
    it('sets all buttons to false when onBlur', () => {
      fireEvent('mouse', 'mousedown', { button: 1 });
      fireEvent('mouse', 'mousedown', { button: 0 });
      fireEvent('blur', 'blur');
      expect(inputjs.mouse[1]).toBe(false);
      expect(inputjs.mouse[0]).toBe(false);
    });
    it('keeps track of current mouse position', () => {
      fireEvent('mouse', 'mousemove', { clientX: 20, clientY: 30 });
      expect(inputjs.mouse.position).toEqual({ x: 20, y: 30 });
    });
  });
  describe('.joystick', () => {
    it('has an .active property to know if it\'s active', () => {
      expect(inputjs.joystick.active).toBe(false);
      fireEvent('mouse', 'mousedown');
      expect(inputjs.joystick.active).toBe(true);
      fireEvent('mouse', 'mouseup');
      expect(inputjs.joystick.active).toBe(false);
    });
    it('keeps track of starting position', () => {
      fireEvent('mouse', 'mousedown', { clientX: 20, clientY: 30 });
      expect(inputjs.joystick.start).toEqual({ x: 20, y: 30 });
    });
    it('keeps track of current position', () => {
      fireEvent('mouse', 'mousedown', { clientX: 10, clientY: 10 });
      fireEvent('mouse', 'mousemove', { clientX: 20, clientY: 30 });
      expect(inputjs.joystick.current).toEqual({ x: 20, y: 30 });
    });
    it('keeps track of horizontal and vertical move', () => {
      fireEvent('mouse', 'mousedown', { clientX: 10, clientY: 10 });
      fireEvent('mouse', 'mousemove', { clientX: 20, clientY: 30 });
      expect(inputjs.joystick.move).toEqual({ x: 10, y: 20 });
    });
    it('passing threshold in options makes the mouse act as joystick', () => {
      inputjs.destroy();
      inputjs = InputJS(document, { threshold: 300 });
      fireEvent('mouse', 'mousedown', { clientX: 0, clientY: 0 });
      expect(inputjs.joystick.horizontal).toBe(0);
      fireEvent('mouse', 'mousemove', { clientX: 150, clientY: 150 });
      expect(inputjs.joystick.horizontal).toBe(0.5);
    });
    it('when inactive, reset move, starting and end positions', () => {
      const zeroPosition = { x: 0, y: 0 };
      fireEvent('mouse', 'mousedown', { clientX: 10, clientY: 10 });
      fireEvent('mouse', 'mousemove', { clientX: 20, clientY: 30 });
      fireEvent('mouse', 'mouseup', { clientX: 20, clientY: 30 });
      expect(inputjs.joystick.start).toEqual(zeroPosition);
      expect(inputjs.joystick.current).toEqual(zeroPosition);
      expect(inputjs.joystick.move).toEqual(zeroPosition);
    });
    describe('.vertical', () => {
      it('returns -1 if KeyW or ArrowUp is pressed', () => {
        expect(inputjs.joystick.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyW' });
        expect(inputjs.joystick.vertical).toBe(-1);
        fireEvent('keyboard', 'keyup', { code: 'KeyW' });
        expect(inputjs.joystick.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowUp' });
        expect(inputjs.joystick.vertical).toBe(-1);
      });
      it('returns 1 if KeyS or ArrowDown is pressed', () => {
        expect(inputjs.joystick.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyS' });
        expect(inputjs.joystick.vertical).toBe(1);
        fireEvent('keyboard', 'keyup', { code: 'KeyS' });
        expect(inputjs.joystick.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowDown' });
        expect(inputjs.joystick.vertical).toBe(1);
      });
    });
    describe('.horizontal', () => {
      it('returns -1 if KeyA or ArrowLeft is pressed', () => {
        expect(inputjs.joystick.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyA' });
        expect(inputjs.joystick.horizontal).toBe(-1);
        fireEvent('keyboard', 'keyup', { code: 'KeyA' });
        expect(inputjs.joystick.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowLeft' });
        expect(inputjs.joystick.horizontal).toBe(-1);
      });
      it('returns 1 if KeyD or ArrowRight is pressed', () => {
        expect(inputjs.joystick.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyD' });
        expect(inputjs.joystick.horizontal).toBe(1);
        fireEvent('keyboard', 'keyup', { code: 'KeyD' });
        expect(inputjs.joystick.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowRight' });
        expect(inputjs.joystick.horizontal).toBe(1);
      });
    });
    it('has a normalized vector of horizontal and vertical', () => {
      expect(inputjs.joystick.normalized).toEqual({ x: 0, y: 0 });
      fireEvent('keyboard', 'keydown', { code: 'KeyD' });
      fireEvent('keyboard', 'keydown', { code: 'KeyS' });
      expect(inputjs.joystick.normalized).toEqual({ x: 0.7, y: 0.7 });
    });
  });
});
