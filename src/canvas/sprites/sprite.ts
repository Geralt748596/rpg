import gsap from 'gsap'
import { Attack as AttackType } from '../../types'
import { Position, Offset, Sprites, AttackNames } from '../../types'

export class Sprite {
    position: Position
    image: HTMLImageElement
    scale: number
    framesMax: number
    framesCurrent: number
    framesElapsed: number
    framesHold: number
    offset: Offset

    width: number = 0
    height: number = 0
    animate?: boolean
    sprites?: Sprites
    opacity: number = 1
    rotation: number
    health: number = 100

    constructor({ position, imageSrc, scale = 1, framesMax = 1,
        framesCurrent = 0, offset = { x: 0, y: 0 },
        framesElapsed = 0, framesHold = 10, sprites, animate, rotation = 0
    }: Props) {
        this.position = position

        this.image = new Image()
        this.image.src = imageSrc
        this.framesMax = framesMax
        this.image.onload = () => {
            this.width = this.image.width / this.framesMax
            this.height = this.image.height
        }

        this.framesCurrent = framesCurrent
        this.scale = scale
        this.framesElapsed = framesElapsed
        this.framesHold = framesHold
        this.offset = offset
        this.animate = animate
        this.rotation = rotation
        if (sprites) {
            this.sprites = sprites
            for (let key in this.sprites) {
                //@ts-ignore
                const sprite: SpriteType = sprites[key]
                sprite.image = new Image()
                sprite.image.src = sprite.imageSrc
            }
        }
    }

    setSprite = (image: HTMLImageElement, framesMax: number) => {
        this.image = image
        this.framesMax = framesMax
        this.framesCurrent = 0
    }

    draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.save()
        // this.width = this.image.width / this.framesMax
        // this.height = this.image.height
        if (this.rotation) {
            ctx.translate(this.position.x + this.width / 2, this.position.y + this.health / 2)
            ctx.rotate(this.rotation)
            ctx.translate(
                -this.position.x - this.width / 2,
                -this.position.y - this.health / 2
            )
        }

        // console.log(this.framesCurrent)

        ctx.globalAlpha = this.opacity
        ctx.drawImage(
            this.image,
            this.framesCurrent * this.width,
            0,
            this.width,
            this.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            this.width * this.scale,
            this.height * this.scale
        )
        ctx.restore()
    }

    animateFrames = () => {
        this.framesElapsed++
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent += 1
            } else {
                this.framesCurrent = 0
            }
        }
    }

    update = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        this.draw(ctx, canvas)
        this.animate && this.animateFrames()
    }

    damage = (damage: number) => {
        this.health -= damage
        gsap.to(this.position, {
            x: this.position.x + 10,
            yoyo: true,
            repeat: 5,
            duration: 0.08
        })
        gsap.to(this, {
            opacity: 0,
            yoyo: true,
            repeat: 5,
            duration: 0.08
        })
    }

    attack = ({ attack, recipient, renderSprites }: Attack) => {
        switch(attack.name) {
            case AttackNames.Fireball:
                if (attack.sprite) {
                    renderSprites.push(attack.sprite)
                    const fireballSpeed = 1 
                    gsap.to(attack.sprite, {
                        rotation: 5,
                        duration: fireballSpeed,
                    })
                    
                    gsap.to(attack.sprite.position, {
                        x: recipient.position.x,
                        y: recipient.position.y,
                        duration: fireballSpeed,
                        onComplete: () => {
                            recipient.damage(attack.damage)
                            renderSprites.pop()
                        }
                    })
                }
            break
            case AttackNames.Tackle:
                const tl = gsap.timeline()

                tl
                    .to(this.position, { x: this.position.x - 20 })
                    .to(this.position,
                        {
                            x: this.position.x + 40,
                            duration: 0.1,
                            onComplete: () => {
                                recipient.damage(attack.damage)
                            }
                        }
                    )
                    .to(this.position, { x: this.position.x - 20 })
            break
        }
    }

    switchSprites = (sprite: keyof Sprites) => {
        if (!this.sprites) return
        switch (sprite) {
            case 'up':
                if (this.image !== this.sprites.up.image) {
                    this.setSprite(this.sprites.up.image!, this.sprites.up.framesMax)
                }
                break
            case 'down':
                if (this.image !== this.sprites.down.image) {
                    this.setSprite(this.sprites.down.image!, this.sprites.down.framesMax)
                }
                break
            case 'left':
                if (this.image !== this.sprites.left.image) {
                    this.setSprite(this.sprites.left.image!, this.sprites.left.framesMax)
                }
                break
            case 'right':
                if (this.image !== this.sprites.right.image) {
                    this.setSprite(this.sprites.right.image!, this.sprites.right.framesMax)
                }
                break
            default:
                return
        }
    }
}

export type Props = {
    position: Position;
    imageSrc: string;
    scale?: number;
    framesMax?: number;
    framesCurrent?: number;
    framesElapsed?: number;
    framesHold?: number;
    offset?: Offset;
    sprites?: Sprites;
    animate?: boolean
    rotation?: number;
}

export type Attack = {
    attack: AttackType,
    recipient: Sprite,
    renderSprites: Sprite[]
}
