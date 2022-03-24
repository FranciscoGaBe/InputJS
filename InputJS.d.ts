type Vector2 = {
  x: number,
  y: number
}
type Keys = {
  lastKeyPressed: string
} & Record<string, boolean>
type Mouse = {
  position: Vector2
} & Record<string, boolean>
type JoystickAxis = {
  vertical: number,
  horizontal: number,
  normalized: Vector2,
  clamped: Vector2
}
type Joystick = {
  active: boolean,
  start: Vector2,
  current: Vector2,
  move: Vector2
  axis: JoystickAxis
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
declare const InputJS: (element: HTMLElement, options?: Options) => InputJSInstance
export default InputJS