import { memo, useRef, forwardRef, useImperativeHandle } from 'react'
import { gsap } from 'gsap'

import styles from './styles.module.scss'

export const BattleTransition = memo(forwardRef<BattleTransitionRef, Props>(({ onCompleted }: Props, ref) => {
    const wrapper = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
        start: () => {
            gsap.timeline()
                .to(wrapper.current, {
                    display: 'block'
                })
                .to(wrapper.current, {
                    opacity: 1,
                    repeat: 4,
                    yoyo: true,
                    duration: 0.5,
                    ease: 'ease-in-out',
                    onComplete: () => {
                        onCompleted()
                        console.log('end')
                    }
                })
                .to(wrapper.current, {
                    opacity: 0,
                    duration: 0.5,
                })
                .to(wrapper.current, {
                    display: 'none'
                })
        }
    }))

    return (
        <div className={styles.wrapper} ref={wrapper} />
    )
}))

type Props = {
    onCompleted: () => void
}

export type BattleTransitionRef = {
    start: () => void
}
