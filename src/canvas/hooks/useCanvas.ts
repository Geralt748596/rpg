import { useRef, useEffect } from 'react'
import { Draw } from '../../types'
import { animation } from '../../store/animation'

export const useCanvas = (draw: Draw) => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    context.fillStyle = 'black'
    let animationFrameId: number
    
    const render = () => {
      draw(context, canvas, animationFrameId)
      // console.log(animationFrameId)
      if (!animation.pause) {
        animationFrameId = window.requestAnimationFrame(render)
      } else {
        window.cancelAnimationFrame(animationFrameId)
      }
      
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
  
  return canvasRef
}