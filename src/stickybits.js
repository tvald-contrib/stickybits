/*
  STICKYBITS 💉
  --------
  > a lightweight alternative to `position: sticky` polyfills 🍬
  --------
  - each method is documented above it our view the readme
  - Stickybits does not manage polymorphic functionality (position like properties)
  * polymorphic functionality: (in the context of describing Stickybits)
    means making things like `position: sticky` be loosely supported with position fixed.
    It also means that features like `useStickyClasses` takes on styles like `position: fixed`.
  --------
  defaults 🔌
  --------
  - version = `package.json` version
  - userAgent = viewer browser agent
  - target = DOM element selector
  - noStyles = boolean
  - offset = number
  - parentClass = 'string'
  - scrollEl = window || DOM element selector
  - stickyClass = 'string'
  - stuckClass = 'string'
  - useStickyClasses = boolean
  - verticalPosition = 'string'
  --------
  props🔌
  --------
  - p = props {object}
  --------
  instance note
  --------
  - stickybits parent methods return this
  - stickybits instance methods return an instance item
  --------
  nomenclature
  --------
  - target => el => e
  - props => o || p
  - instance => item => it
  --------
  methods
  --------
  - .definePosition = defines sticky or fixed
  - .addInstance = an array of objects for each Stickybits Target
  - .getClosestParent = gets the parent for non-window scroll
  - .computeScrollOffsets = computes scroll position
  - .toggleClasses = older browser toggler
  - .manageState = manages sticky state
  - .removeClass = older browser support class remover
  - .removeInstance = removes an instance
  - .cleanup = removes all Stickybits instances and cleans up dom from stickybits
*/
function Stickybits (target, obj) {
  const o = typeof obj !== 'undefined' ? obj : {}
  this.version = 'VERSION'
  this.userAgent = window.navigator.userAgent || 'no `userAgent` provided by the browser'
  this.props = {
    customStickyChangeNumber: o.customStickyChangeNumber || null,
    noStyles: o.noStyles || false,
    stickyBitStickyOffset: o.stickyBitStickyOffset || 0,
    parentClass: o.parentClass || 'js-stickybit-parent',
    scrollEl: document.querySelector(o.scrollEl) || window,
    stickyClass: o.stickyClass || 'js-is-sticky',
    stuckClass: o.stuckClass || 'js-is-stuck',
    stickyChangeClass: o.stickyChangeClass || 'js-is-sticky--change',
    useStickyClasses: o.useStickyClasses || false,
    verticalPosition: o.verticalPosition || 'top',
  }
  const p = this.props
  /*
    define positionVal
    ----
    -  uses a computed (`.definePosition()`)
    -  defined the position
  */
  p.positionVal = this.definePosition() || 'fixed'
  const vp = p.verticalPosition
  const ns = p.noStyles
  const pv = p.positionVal
  this.els = typeof target === 'string' ? document.querySelectorAll(target) : target
  if (!('length' in this.els)) this.els = [this.els]
  this.instances = []
  for (let i = 0; i < this.els.length; i += 1) {
    const el = this.els[i]
    const styles = el.style
    // set vertical position
    styles[vp] = vp === 'top' && !ns ? `${p.stickyBitStickyOffset}px` : ''
    styles.position = pv !== 'fixed' ? pv : ''
    if (pv === 'fixed' || p.useStickyClasses) {
      const instance = this.addInstance(el, p)
      // instances are an array of objects
      this.instances.push(instance)
    }
  }
  return this
}

/*
  setStickyPosition ✔️
  --------
  —  most basic thing stickybits does
  => checks to see if position sticky is supported
  => defined the position to be used
  => stickybits works accordingly
*/
Stickybits.prototype.definePosition = () => {
  const prefix = ['', '-o-', '-webkit-', '-moz-', '-ms-']
  const test = document.head.style
  for (let i = 0; i < prefix.length; i += 1) {
    test.position = `${prefix[i]}sticky`
  }
  const stickyProp = test.position ? test.position : 'fixed'
  test.position = ''
  return stickyProp
}

/*
  addInstance ✔️
  --------
  — manages instances of items
  - takes in an el and props
  - returns an item object
  ---
  - target = el
  - o = {object} = props
    - scrollEl = 'string'
    - verticalPosition = number
    - off = boolean
    - parentClass = 'string'
    - stickyClass = 'string'
    - stuckClass = 'string'
  ---
  - defined later
    - parent = dom element
    - state = 'string'
    - offset = number
    - stickyStart = number
    - stickyStop = number
  - returns an instance object
*/
Stickybits.prototype.addInstance = function addInstance (el, props) {
  const item = {
    el,
    parent: el.parentNode,
    props,
  }
  this.isWin = this.props.scrollEl === window
  const se = this.isWin ? window : this.getClosestParent(item.el, item.props.scrollEl)
  this.computeScrollOffsets(item)
  item.parent.className += ` ${props.parentClass}`
  item.state = 'default'
  item.stateContainer = () => this.manageState(item)
  se.addEventListener('scroll', item.stateContainer)
  return item
}

/*
  --------
  getParent 👨‍
  --------
  - a helper function that gets the target element's parent selected el
  - only used for non `window` scroll elements
  - supports older browsers
*/
Stickybits.prototype.getClosestParent = (el, match) => {
  // p = parent element
  const p = match
  let e = el
  if (e.parentElement === p) return p
  // traverse up the dom tree until we get to the parent
  while (e.parentElement !== p) e = e.parentElement
  // return parent element
  return p
}

/*
  computeScrollOffsets 📊
  ---
  computeScrollOffsets for Stickybits
  - defines
    - offset
    - start
    - stop
*/
Stickybits.prototype.computeScrollOffsets = function computeScrollOffsets (item) {
  const it = item
  const p = it.props
  const el = it.el
  const parent = it.parent
  const isCustom = !this.isWin && p.positionVal === 'fixed'
  const isBottom = p.verticalPosition !== 'bottom'
  const scrollElOffset = isCustom ? p.scrollEl.getBoundingClientRect().top : 0
  const stickyStart = isCustom
    ? parent.getBoundingClientRect().top - scrollElOffset
    : parent.getBoundingClientRect().top
  const stickyChangeOffset = p.customStickyChangeNumber !== null
    ? p.customStickyChangeNumber
    : el.offsetHeight
  it.offset = scrollElOffset + p.stickyBitStickyOffset
  it.stickyStart = isBottom ? stickyStart - it.offset : 0
  it.stickyChange = it.stickyStart + stickyChangeOffset
  it.stickyStop = isBottom
    ? (stickyStart + parent.offsetHeight) - (it.el.offsetHeight + it.offset)
    : stickyStart + parent.offsetHeight
  return it
}

/*
  toggleClasses ⚖️
  ---
  toggles classes (for older browser support)
  r = removed class
  a = added class
*/
Stickybits.prototype.toggleClasses = (el, r, a) => {
  const e = el
  const cArray = e.className.split(' ')
  if (a && cArray.indexOf(a) === -1) cArray.push(a)
  const rItem = cArray.indexOf(r)
  if (rItem !== -1) cArray.splice(rItem, 1)
  e.className = cArray.join(' ')
}

/*
  manageState 📝
  ---
  - defines the state
    - normal
    - sticky
    - stuck
*/
Stickybits.prototype.manageState = function manageState (item) {
  // cache object
  const it = item
  const e = it.el
  const p = it.props
  const state = it.state
  const start = it.stickyStart
  const change = it.stickyChange
  const stop = it.stickyStop
  const stl = e.style
  // cache props
  const ns = p.noStyles
  const pv = p.positionVal
  const se = p.scrollEl
  const sticky = p.stickyClass
  const stickyChange = p.stickyChangeClass
  const stuck = p.stuckClass
  const vp = p.verticalPosition
  /*
    requestAnimationFrame
    ---
    - use rAF
    - or stub rAF
  */
  const rAFStub = function rAFDummy (f) { f() }
  const rAF = !this.isWin
    ? rAFStub
    : window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    rAFStub

  /*
    define scroll vars
    ---
    - scroll
    - notSticky
    - isSticky
    - isStuck
  */
  const tC = this.toggleClasses
  let scroll
  if (this.isWin) {
    scroll = window.scrollY || window.pageYOffset
  } else {
    scroll = se.scrollTop
  }
  const notSticky = scroll > start && scroll < stop && (state === 'default' || state === 'stuck')
  const isSticky = scroll <= start && state === 'sticky'
  const isStuck = scroll >= stop && state === 'sticky'
  /*
    Unnamed arrow functions within this block
    ---
    - help wanted or discussion
    - view test.stickybits.js
      - `stickybits .manageState  `position: fixed` interface` for more awareness 👀
  */
  if (notSticky) {
    it.state = 'sticky'
    rAF(() => {
      tC(e, stuck, sticky)
      stl.position = pv
      if (ns) return
      stl.bottom = ''
      stl[vp] = `${p.stickyBitStickyOffset}px`
    })
  } else if (isSticky) {
    it.state = 'default'
    rAF(() => {
      tC(e, sticky)
      if (pv === 'fixed') stl.position = ''
    })
  } else if (isStuck) {
    it.state = 'stuck'
    rAF(() => {
      tC(e, sticky, stuck)
      if (pv !== 'fixed' || ns) return
      stl.top = ''
      stl.bottom = '0'
      stl.position = 'absolute'
    })
  }

  const isStickyChange = scroll >= change && scroll <= stop
  const isNotStickyChange = scroll < change || scroll > stop
  const stub = 'stub' // a stub css class to remove
  if (isNotStickyChange) {
    rAF(() => { tC(e, stickyChange) })
  } else if (isStickyChange) {
    rAF(() => { tC(e, stub, stickyChange) })
  }

  return it
}

/*
  removes an instance 👋
  --------
  - cleanup instance
*/
Stickybits.prototype.removeInstance = function removeInstance (instance) {
  const e = instance.el
  const p = instance.props
  const tC = this.toggleClasses
  e.style.position = ''
  e.style[p.verticalPosition] = ''
  tC(e, p.stickyClass)
  tC(e, p.stuckClass)
  tC(e.parentNode, p.parentClass)
}

/*
  cleanup 🛁
  --------
  - cleans up each instance
  - clears instance
*/
Stickybits.prototype.cleanup = function cleanup () {
  for (let i = 0; i < this.instances.length; i += 1) {
    const instance = this.instances[i]
    instance.props.scrollEl.removeEventListener('scroll', instance.stateContainer)
    this.removeInstance(instance)
  }
  this.manageState = false
  this.instances = []
}

/*
  export
  --------
  exports StickBits to be used 🏁
*/
export default function stickybits (target, o) {
  return new Stickybits(target, o)
}
