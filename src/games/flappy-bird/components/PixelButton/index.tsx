import type { ButtonHTMLAttributes } from 'react'
import classes from './index.module.css'

export function PixelButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`${classes.button} ${className ?? ''}`} {...props} />
}
