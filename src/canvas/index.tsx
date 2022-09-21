import { CanvasHTMLAttributes, forwardRef, memo } from 'react'
import { useCanvas } from './hooks/useCanvas'
import { Draw } from '../types'

export const Canvas = memo(forwardRef<HTMLCanvasElement, Props>((props, ref) => {

    return <canvas ref={ref} {...props} />
}))

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
}

