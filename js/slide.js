import debounce from './debounce.js'
export class Slide {
  constructor(wrapper, slide) {
    this.wrapper = document.querySelector(wrapper)
    this.slide = document.querySelector(slide)
    this.dist = { finalPosition: 0, firstPositionX: 0, movement:0 }
    this.activeClass = 'active'
    this.changeEvent = new Event('changeEvent');
  }

  // Efeito de mudança suave
  transition(active) {
    this.slide.style.transition = active ? 'transform .3s' : '';
  }

  // Slide config
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element };
    });
  }

  slidePosition(element) {
    const margin = (this.wrapper.offsetWidth - element.offsetWidth) / 2;
    return -(element.offsetLeft - margin); // precisa ser negativo
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    }
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000)
    this.slidesConfig();
    this.changeSlide(this.index.active);
  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize)
  }

  addEvents() {
    this.slide.addEventListener('mousedown', this.onStart);
    this.slide.addEventListener('touchstart', this.onStart);
    this.slide.addEventListener('mouseup', this.onEnd);
    this.slide.addEventListener('touchend', this.onEnd);
  }

  onStart(event) {
    let movetype;
    if (event.type === 'mousedown') {
      event.preventDefault()
      this.dist.firstPositionX = event.clientX; // ClientX pega a posição X
      movetype = 'mousemove'
    } else {
      this.dist.firstPositionX = event.changedTouches[0].clientX;
      movetype = 'touchmove';
    }
    this.wrapper.addEventListener(movetype,this.onMove)
    this.transition(false);
  }

  onEnd(event) {
    const movetype = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(movetype,this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true)
    this.changeSlideonEnd();
  }

  changeSlideonEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide()
    } else {
      this.changeSlide(this.index.active)
    }
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev)
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next)
  }

  changeActiveClass() {
    this.slideArray.forEach(item => item.element.classList.remove(this.activeClass))
    this.slideArray[this.index.active].element.classList.add(this.activeClass)
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  onMove(event) {
    const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX // se for mousemove, evento de mouse, se não, evento de touch
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  updatePosition(pointerPosition) {
    this.dist.movement = (this.dist.firstPositionX - pointerPosition) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  moveSlide(finalPosition) {
    this.dist.movePosition = finalPosition;
    this.slide.style.transform = `translate3d(${finalPosition}px, 0, 0)`;
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this)
    this.activeNextSlide = this.activeNextSlide.bind(this)

    this.onResize = debounce(this.onResize.bind(this), 50)
  }

  init() {
    this.bindEvents();
    this.transition(true)
    this.addEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

export default class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper);
    this.bindControlEvents();
  }

  addArrow(prev,next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener('click', this.activePrevSlide)
    this.nextElement.addEventListener('click', this.activeNextSlide)
  }

  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';

    this.slideArray.forEach((item,index) => {
      control.innerHTML += `<li><a href='#slide${index + 1}'>${index + 1}</a></li>`
    })
    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item,index) {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      this.changeSlide(index);
      this.activeControlItem();
    });
    this.wrapper.addEventListener('changeEvent',this.activeControlItem);
  }

  activeControlItem() {
    this.controlArray.forEach(item => item.classList.remove(this.activeClass))
    this.controlArray[this.index.active].classList.add(this.activeClass)
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children]

    this.activeControlItem()
    this.controlArray.forEach(this.eventControl)
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this)
  }
}