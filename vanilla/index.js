let render_mode = 'free-motion'
let hold_offset = { then : 0, now : 0, speed : 0, touch : [] }
let list_offset = { then : 1, now : 0 }
let tray_offset = { then : 0, now : 0 }
let data_inputs = null

const getEventData = event => {
    // calculate event data
    let position = event.changedTouches
        ? event.changedTouches[0].clientX
        : event.clientX
    let speed = event.changedTouches
        ? null
        : event.movementX
    // store touchstart 
    if(event.type === 'touchstart') {
        hold_offset.touch = []
    } else if(event.type === 'touchmove') {
        hold_offset.touch.push(event.changedTouches[0].pageX)
    } else if(event.type === 'touchend') {
        speed = ((hold_offset.touch.pop() - hold_offset.touch.pop()) / 2) || 0
    } else if(event.type === 'mouseup' || event.type === 'mouseleave') {
        speed = hold_offset.speed
    }
    // return event data
    return { position, speed }
}

const getItems = root => {
    return Array.from(root.querySelectorAll('*'))
}

const getItemRect = (root, index = 0) => {
    return root.children[index].getBoundingClientRect()
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
        const eventData = getEventData(event)
        hold_offset.now = eventData.position
        hold_offset.speed = eventData.speed * 0.5
        // store new tray position
        const hold_gap = hold_offset.now - hold_offset.then
        tray_offset.now = tray_offset.then + hold_gap
    }
}

const dragEnd = event => {
    if(render_mode !== 'free-motion') {
        // store speed
        let speed = getEventData(event).speed
        // set max speed
        const max = 14
        if(speed > max * +1 && speed > 0) { speed = max * +1 }
        if(speed < max * -1 && speed < 0) { speed = max * -1 }
        // speed to value
        hold_offset.speed = speed
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
    Scroller.generate(root)
    // start render
    Scroller.render(root)
}

Scroller.generate = root => {
    data_inputs.array.forEach(item => {
        root.appendChild(data_inputs.generator(item))
    })
}

Scroller.render = root => {
    requestAnimationFrame(() => Scroller.render(root))
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

    getItems(root).forEach((child, index, array) => {
        let item_width = getItemRect(root, index).width
        let item_coord = (index * item_width) + tray_offset.now
        let list_width = array.length * item_width

        if(item_coord < -item_width) {
            let remain = item_coord % item_width
            let offset = Math.floor(Math.abs(item_coord) / item_width)
            let value = (array.length - (offset % array.length)) * item_width
            if(value === array.length * item_width) { value = 0 }
            item_coord = remain + value
        } else if(item_coord > list_width - item_width) {
            let remain = item_coord % item_width
            let offset = Math.floor(Math.abs(item_coord - (list_width - item_width)) / item_width)
            let value = ((offset % array.length)) * item_width
            item_coord = remain + value - item_width
        }

        child.style.left = item_coord + 'px'
    })

}