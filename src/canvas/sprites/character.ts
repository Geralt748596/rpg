import { Sprite, Props as ViewProps } from './sprite'
import { Velocity, Sprites } from '../../types'

export class Character extends Sprite {
    velocity: Velocity
    // sprites: Sprites

    constructor({ velocity, ...rest }: Props) {
        super(rest)
        this.velocity = velocity
        // this.sprites = sprites
        // for (let key in this.sprites) {
        //     //@ts-ignore
        //     const sprite: SpriteType = sprites[key]
        //     sprite.image = new Image()
        //     sprite.image.src = sprite.imageSrc
        // }
    }

    
}

export type Props = ViewProps & {
    velocity: Velocity;
    // sprites: Sprites;
}