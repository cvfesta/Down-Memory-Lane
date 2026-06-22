import { useState } from 'react'
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

type HoverButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  baseStyle: CSSProperties
  hoverStyle: CSSProperties
}

/** A button that merges `hoverStyle` over `baseStyle` while hovered. */
export function HoverButton({ baseStyle, hoverStyle, children, ...rest }: HoverButtonProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      {...rest}
      style={{ ...baseStyle, ...(hover ? hoverStyle : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  )
}

type FocusInputProps = InputHTMLAttributes<HTMLInputElement> & {
  baseStyle: CSSProperties
  focusStyle: CSSProperties
}

/** An input that merges `focusStyle` over `baseStyle` while focused. */
export function FocusInput({ baseStyle, focusStyle, ...rest }: FocusInputProps) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      {...rest}
      style={{ ...baseStyle, ...(focus ? focusStyle : null) }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  )
}

type FocusTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  baseStyle: CSSProperties
  focusStyle: CSSProperties
}

/** A textarea that merges `focusStyle` over `baseStyle` while focused. */
export function FocusTextarea({ baseStyle, focusStyle, ...rest }: FocusTextareaProps) {
  const [focus, setFocus] = useState(false)
  return (
    <textarea
      {...rest}
      style={{ ...baseStyle, ...(focus ? focusStyle : null) }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  )
}
