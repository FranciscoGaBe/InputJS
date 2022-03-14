/** @jest-environment jsdom */
import InputJS from './Input-js';

/**  @typedef {(code: string) => KeyboardEvent} KeyEvent */

const keyboardEvent = (type, code) => new KeyboardEvent(type, { code });

/** @type {KeyEvent} */ const keyboardDown = keyboardEvent.bind({}, 'keydown');
/** @type {KeyEvent} */ const keyboardUp = keyboardEvent.bind({}, 'keyup');
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
});
