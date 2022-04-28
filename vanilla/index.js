let render_mode = 'free-motion'
let hold_offset = { then : 0, now : 0, speed : 0, touch : 0 }
let list_offset = { then : 1, now : 0 }
let tray_offset = { then : 0, now : 100 }
let data_inputs = null

const getEventData = event => {
    // calculate event data
    const position = event.changedTouches
        ? event.changedTouches[0].clientX
        : event.clientX
    const speed = event.changedTouches
        ? event.changedTouches[0].pageX - hold_offset.touch
        : event.movementX
    // store touchstart 
    if(event.type === 'touchstart') {
        hold_offset.touch = event.changedTouches[0].pageX
    }
    // return event data
    return { position, speed }
}

const getItemRect = (tray, index = 0) => {
    return tray.children[index].getBoundingClientRect()
}

const dragDown = event => {
    // change render mode
    render_mode = 'user-hold'
    // init drag speed
    hold_offset.speed = 0
    // set origin drag position
    hold_offset.then = getEventData(event).position
}

const dragMove = event => {
    if(render_mode === 'user-hold') {
        // store event data
        hold_offset.now = getEventData(event).position
        hold_offset.speed = getEventData(event).speed * 0.5
        // store new tray position
        const hold_gap = hold_offset.now - hold_offset.then
        tray_offset.now = tray_offset.then + hold_gap
    }
}

const dragEnd = event => {
    if(render_mode !== 'free-motion') {
        // set max speed
        const speed = event.type === 'touchend' ? 14 : 14
        if(hold_offset.speed > speed && hold_offset.speed > 0) { hold_offset.speed = +speed }
        if(hold_offset.speed < speed && hold_offset.speed < 0) { hold_offset.speed = -speed }
        // change render mode
        render_mode = 'free-motion'
        // save current tray position
        tray_offset.then = tray_offset.now
        hold_offset.now = 0
    }
}

class Scroller {}

Scroller.init = (array, generator, callback) => {
    // store input data
    data_inputs = { array, generator, callback }
    // scroller element
    const root = document.querySelector('#Scroller')
    const tray = root.querySelector('#ScrollerInner')
    // mouse events
    root.addEventListener('mousedown', dragDown)
    root.addEventListener('mousemove', dragMove)
    root.addEventListener('mouseup', dragEnd)
    root.addEventListener('mouseleave', dragEnd)
    // touch events
    root.addEventListener('touchstart', dragDown)
    root.addEventListener('touchmove', dragMove)
    root.addEventListener('touchend', dragEnd)
    // generate items
    Scroller.generate(tray)
    // start render
    Scroller.render(tray)
}

Scroller.generate = tray => {
    data_inputs.array.forEach(item => {
        tray.appendChild(data_inputs.generator(item))
    })
}

Scroller.render = tray => {
    requestAnimationFrame(() => Scroller.render(tray))
    // select render mode
    if(render_mode === 'user-hold') {
        // manual position from events
    } else {
        // animate position from speed
        tray_offset.now += hold_offset.speed
        if(hold_offset.speed > 0) { hold_offset.speed -= 0.1 }
        if(hold_offset.speed < 0) { hold_offset.speed += 0.1 }
        tray_offset.then = tray_offset.now
    }

    // adjust floating values
    hold_offset.speed = parseFloat(hold_offset.speed.toFixed(1))
    tray_offset.then = parseFloat(tray_offset.then.toFixed(1))
    tray_offset.now = parseInt(tray_offset.now.toFixed(1))

    // margin and item client rect
    let margin = tray_offset.now
    let width = getItemRect(tray).width

    // calculate margin for overflow
    if(margin < 0) {
        list_offset.now = Math.floor(margin / width)
        margin = -(Math.abs(margin) % width)
    } else if(margin > 0) {
        list_offset.now = Math.floor(margin / width)
        margin = (Math.abs(margin) % width) - width
    }

    // update tray position
    tray.style.marginLeft = margin + 'px'

    // update list offset
    if(list_offset.now === list_offset.then) { return }

    // append or prepend clone elements
    if(list_offset.now < list_offset.then) {
        const first = tray.firstElementChild
        const clone = first.cloneNode(true)
        first.outerHTML = ''
        tray.appendChild(clone)
    } else {
        const final = tray.lastElementChild
        const clone = final.cloneNode(true)
        final.outerHTML = ''
        tray.prepend(clone)
    }

    // store list offset history
    list_offset.then = list_offset.now
}