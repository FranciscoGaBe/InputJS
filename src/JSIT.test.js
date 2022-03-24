/** @jest-environment jsdom */
import JSIT from './JSIT';

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
  /** @type {ReturnType<typeof JSIT>} */
  let jsit = JSIT(document);

  beforeEach(() => {
    jsit = JSIT(document);
  });

  afterEach(() => {
    jsit.destroy();
  });

  describe('.keys', () => {
    it('keeps tracks of currently pressed keys', () => {
      document.dispatchEvent(keyboardDown('KeyW'));
      expect(jsit.keys.KeyW).toBe(true);
      document.dispatchEvent(keyboardUp('KeyW'));
      expect(jsit.keys.KeyW).toBe(false);
    });
    it('return false when the key hasn\'t been pressed', () => {
      expect(jsit.keys.a).toBe(false);
    });
    it('sets all keys to false when onBlur', () => {
      document.dispatchEvent(keyboardDown('KeyW'));
      document.dispatchEvent(keyboardDown('KeyA'));
      document.dispatchEvent(new Event('blur'));
      expect(jsit.keys.KeyW).toBe(false);
      expect(jsit.keys.KeyA).toBe(false);
    });
    it('keeps track of last pressed key in .lastKeyPressed', () => {
      document.dispatchEvent(keyboardDown('KeyW'));
      expect(jsit.keys.lastKeyPressed).toBe('KeyW');
      document.dispatchEvent(keyboardDown('KeyS'));
      expect(jsit.keys.lastKeyPressed).toBe('KeyS');
    });
  });
  describe('.mouse', () => {
    it('keeps tracks of currently pressed mouse buttons', () => {
      fireEvent('mouse', 'pointerdown', { button: 1 });
      expect(jsit.mouse[1]).toBe(true);
      fireEvent('mouse', 'pointerup', { button: 1 });
      expect(jsit.mouse[1]).toBe(false);
    });
    it('keeps tracks of currently pressed mouse buttons', () => {
      expect(jsit.mouse[1]).toBe(false);
    });
    it('sets all buttons to false when onBlur', () => {
      fireEvent('mouse', 'mousedown', { button: 1 });
      fireEvent('mouse', 'mousedown', { button: 0 });
      fireEvent('blur', 'blur');
      expect(jsit.mouse[1]).toBe(false);
      expect(jsit.mouse[0]).toBe(false);
    });
    it('keeps track of current mouse position', () => {
      fireEvent('mouse', 'pointermove', { clientX: 20, clientY: 30 });
      expect(jsit.mouse.position).toEqual({ x: 20, y: 30 });
    });
  });
  describe('.joystick', () => {
    it('has an .active property to know if it\'s active', () => {
      expect(jsit.joystick.active).toBe(false);
      fireEvent('mouse', 'pointerdown');
      expect(jsit.joystick.active).toBe(true);
      fireEvent('mouse', 'pointerup');
      expect(jsit.joystick.active).toBe(false);
    });
    it('keeps track of starting position', () => {
      fireEvent('mouse', 'pointerdown', { clientX: 20, clientY: 30 });
      expect(jsit.joystick.start).toEqual({ x: 20, y: 30 });
    });
    it('keeps track of current position', () => {
      fireEvent('mouse', 'pointerdown', { clientX: 10, clientY: 10 });
      fireEvent('mouse', 'pointermove', { clientX: 20, clientY: 30 });
      expect(jsit.joystick.current).toEqual({ x: 20, y: 30 });
    });
    it('keeps track of horizontal and vertical move', () => {
      fireEvent('mouse', 'pointerdown', { clientX: 10, clientY: 10 });
      fireEvent('mouse', 'pointermove', { clientX: 20, clientY: 30 });
      expect(jsit.joystick.move).toEqual({ x: 10, y: 20 });
    });
    it('passing threshold in options makes the mouse act as joystick', () => {
      jsit.destroy();
      jsit = JSIT(document, { threshold: 300 });
      fireEvent('mouse', 'pointerdown', { clientX: 0, clientY: 0 });
      expect(jsit.joystick.axis.horizontal).toBe(0);
      fireEvent('mouse', 'pointermove', { clientX: 150, clientY: 150 });
      expect(jsit.joystick.axis.horizontal).toBe(0.5);
    });
    it('when inactive, reset move, starting and end positions', () => {
      const zeroPosition = { x: 0, y: 0 };
      fireEvent('mouse', 'mousedown', { clientX: 10, clientY: 10 });
      fireEvent('mouse', 'mousemove', { clientX: 20, clientY: 30 });
      fireEvent('mouse', 'mouseup', { clientX: 20, clientY: 30 });
      expect(jsit.joystick.start).toEqual(zeroPosition);
      expect(jsit.joystick.current).toEqual(zeroPosition);
      expect(jsit.joystick.move).toEqual(zeroPosition);
    });
    describe('.vertical', () => {
      it('returns -1 if KeyW or ArrowUp is pressed', () => {
        expect(jsit.joystick.axis.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyW' });
        expect(jsit.joystick.axis.vertical).toBe(-1);
        fireEvent('keyboard', 'keyup', { code: 'KeyW' });
        expect(jsit.joystick.axis.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowUp' });
        expect(jsit.joystick.axis.vertical).toBe(-1);
      });
      it('returns 1 if KeyS or ArrowDown is pressed', () => {
        expect(jsit.joystick.axis.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyS' });
        expect(jsit.joystick.axis.vertical).toBe(1);
        fireEvent('keyboard', 'keyup', { code: 'KeyS' });
        expect(jsit.joystick.axis.vertical).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowDown' });
        expect(jsit.joystick.axis.vertical).toBe(1);
      });
    });
    describe('.horizontal', () => {
      it('returns -1 if KeyA or ArrowLeft is pressed', () => {
        expect(jsit.joystick.axis.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyA' });
        expect(jsit.joystick.axis.horizontal).toBe(-1);
        fireEvent('keyboard', 'keyup', { code: 'KeyA' });
        expect(jsit.joystick.axis.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowLeft' });
        expect(jsit.joystick.axis.horizontal).toBe(-1);
      });
      it('returns 1 if KeyD or ArrowRight is pressed', () => {
        expect(jsit.joystick.axis.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'KeyD' });
        expect(jsit.joystick.axis.horizontal).toBe(1);
        fireEvent('keyboard', 'keyup', { code: 'KeyD' });
        expect(jsit.joystick.axis.horizontal).toBe(0);
        fireEvent('keyboard', 'keydown', { code: 'ArrowRight' });
        expect(jsit.joystick.axis.horizontal).toBe(1);
      });
    });
    it('has a normalized vector of horizontal and vertical', () => {
      expect(jsit.joystick.axis.normalized).toEqual({ x: 0, y: 0 });
      fireEvent('keyboard', 'keydown', { code: 'KeyD' });
      fireEvent('keyboard', 'keydown', { code: 'KeyS' });
      expect(jsit.joystick.axis.normalized).toEqual({ x: 0.71, y: 0.71 });
    });
  });
});
