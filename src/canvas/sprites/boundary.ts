import { Draw, Position } from "../../types"

export class Boundary {
    static width = 48
    static height = 48
    position: Position
    width: number = 48
    height: number = 48

    constructor({ position }: Props) {
        this.position = position
    }

    draw: Draw = (ctx, canvas) => {
        ctx.fillStyle = 'red'
        ctx.fillRect(this.position.x, this.position.y, Boundary.width, Boundary.height)
    }

    update: Draw = (ctx, canvas) => {
        this.draw(ctx, canvas)
    }
}

type Props = {
    position: Position
}