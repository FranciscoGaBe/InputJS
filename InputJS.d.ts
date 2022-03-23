type Vector2 = {
  x: number,
  y: number
}
type Keys = {
  lastKeyPressed: string,
  [key: string]: boolean
}
type Mouse = {
  position: Vector2,
  [key: string]: boolean
}
type Joystick = {
  active: boolean,
  start: Vector2,
  current: Vector2,
  move: Vector2
  vertical: number,
  horizontal: number,
  normalized: Vector2
}
type Options = {
  threshold: number
}
type InputJSInstance = {
  readonly keys: Keys,
  readonly mouse: Mouse,
  readonly joystick: Joystick,
  destroy: () => void
}
declare const InputJS: (element: HTMLElement, options: Options = {}) => InputJSInstance
export default InputJS