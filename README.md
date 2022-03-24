# JSIT (JavaScript Input Tracker)

A lightweight package to keep track of keys and mouse buttons being pressed. Made for game development, where keys are checked by a set interval.

## Installation
```bash
// with npm
npm install jsit

// with yarn
yarn add jsit
```

## Demo
A small demo can be seen in the following link: [Demo](https://franciscogabe.github.io/JSIT/)

## How to use
Accepts a HTML Element and returns an instance of JSIT
```JS
import JSIT from 'jsit'

const element = document.querySelector('#game')
const jsit = JSIT(element)
```

### JSIT.keys
A readonly object where they keys are the keycode of the key being pressed, it's value is `true` for a pressed key or `false` by default.

```JS
import JSIT from 'jsit'

const element = document.querySelector('#game')
const jsit = JSIT(element)

const update = () => {
  if (jsit.keys.KeyW) console.log('W is pressed!')
  else console.log('W is not pressed!')
  requestAnimationFrame(update)
}
update()
```

### JSIT.mouse
A readonly object where they keys are the mouse button number, it's value is `true` for a pressed button or `false` by default.

```JS
import JSIT from 'jsit'

const element = document.querySelector('#game')
const jsit = JSIT(element)

const update = () => {
  if (jsit.mouse[0]) console.log('Left click is pressed!')
  else console.log('Left click is not pressed!')
  requestAnimationFrame(update)
}
update()
```

### JSIT.joystick
A readonly object to simulate a joystick by using "wasd", arrow keys or mouse/pointer.

#### Enable mouse/pointer/touch movement
By default joystick only works with "wasd" and arrow keys, to enable it to work with a pointer, a threshold has to be specified in the options object.

```JS
import JSIT from 'jsit'

const element = document.querySelector('#game')
// How many pixels away the pointer has to move from the starting position
const options = { threshold: 300 }
const jsit = JSIT(element, options)
```

#### Structure
```JS
import JSIT from 'jsit'

const element = document.querySelector('#game')
// How many pixels away the pointer has to move from the starting position
const options = { threshold: 300 }
const { joystick } = JSIT(element, options)
const { axis } = joystick

joystick.active
// Is set to `true` or `false` whenever the joystick is being engaged by a pointer.

joystick.start
/* When the joystick is active, it's value is the starting position of the
 * gesture, otherwise it's value is set at 0.
 * The value is supplied as an object with x and y keys `{ x: 0, y: 0 }`. 
 */

joystick.current
/* When the joystick is active, it's value is the current position of the
 * gesture, otherwise it's value is set at 0.
 * The value is supplied as an object with x and y keys `{ x: 0, y: 0 }`.
 */

joystick.move
/* When the joystick is active, it's value is the difference between current
 * and starting position, otherwise it's value is set at 0.
 * The value is supplied as an object with x and y keys `{ x: 0, y: 0 }`.
 */

// joystick.axis
axis.vertical
/* Ranges from -1 to 1, KeyS and ArrowDown sets the value to 1, KeyW and
 * ArrowUp sets the value to -1, if a threshold is supplied, the pointer
 * vertical movement will also contribute to this value.
 */

axis.horizontal
/* Ranges from -1 to 1, KeyD and ArrowRight sets the value to 1, KeyA and
 * ArrowLeft sets the value to -1, if a threshold is supplied, the pointer
 * horizontal movement will also contribute to this value.
 */

axis.normalized
/* A combination of vertical and horizontal movement, the magnitude of the
 * vector created by both values is 1.
 * The value is supplied as an object with x and y keys `{ x: 0, y: 0 }`.
 */

axis.clamped
/* A combination of vertical and horizontal movement, the magnitude of the
 * vector created by both won't exceed 1.
 * The value is supplied as an object with x and y keys `{ x: 0, y: 0 }`.
 */
```