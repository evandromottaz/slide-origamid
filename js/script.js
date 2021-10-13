import {SlideNav,Slide} from './slide.js'

const slide = new SlideNav('.slide-wrapper','.slide')
slide.init()
slide.addArrow('.prev','.next')

slide.addControl();