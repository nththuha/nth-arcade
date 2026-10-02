import type { ButtonHTMLAttributes } from 'react'
import classes from './index.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
}

export default function Button({ fullWidth, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${classes.button} ${fullWidth ? classes.fullWidth : ''} ${className ?? ''}`}
      {...props}
    />
  )
}
