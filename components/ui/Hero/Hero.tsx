import { FC } from 'react'
import Container from '../Container'
import { RightArrow } from '../../icons'
import s from './Hero.module.css'
import Link from 'next/link'

export interface HeroProps {
  headline: string
  description: string
}

const Hero: FC<HeroProps> = ({ headline, description }) => {
  return (
    <div className="bg-secondary">
      <Container>
        <div className={s.root}>
          <h2 className="text-4xl leading-10 font-thin text-white sm:text-5xl sm:leading-none sm:tracking-tight lg:text-6xl">
            {headline}
          </h2>
          <div className="flex flex-col justify-between">
            <p className="mt-5 text-xl leading-7 font-light text-accent-2 text-white">
              {description}
            </p>
            <Link href="/blog">
              <a className="text-white pt-3 font-light hover:underline flex flex-row cursor-pointer w-max-content">
                Read it here
                <RightArrow width="20" heigh="20" className="ml-1" />
              </a>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Hero
