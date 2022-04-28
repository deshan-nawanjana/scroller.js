import { Component } from 'react'
import './Scroller.css'

let render_mode = 'free-motion'
let hold_offset = { then : 0, now : 0, speed : 0, touch : [], up : 0, down : 0 }
let tray_offset = { then : 0, now : 0 }
let list_target = { element : null, direction : null }
let last_caller = null
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
    // store up down
    if(event.type === 'mousedown' || event.type === 'touchstart') {
        hold_offset.down = position
    } else {
        hold_offset.up = position
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
    // init drag speed and target
    hold_offset.speed = 0
    list_target.element = null
    // set origin drag position
    hold_offset.then = getEventData(event).position
}

const dragMove = event => {
    if(render_mode === 'user-hold') {
        // store event data
        const eventData = getEventData(event)
        hold_offset.now = eventData.position
        hold_offset.speed = eventData.speed * 0.3
        // store new tray position
        const hold_gap = hold_offset.now - hold_offset.then
        tray_offset.now = tray_offset.then + hold_gap
    }
}

const dragEnd = (event, root) => {
    if(render_mode !== 'free-motion') {
        // store speed
        let speed = getEventData(event).speed
        // set max speed
        const max = 14
        if(speed > max * +1 && speed > 0) { speed = max * +1 }
        if(speed < max * -1 && speed < 0) { speed = max * -1 }
        // speed to value
        if(speed > 0) { setLastItem(root) }
        if(speed < 0) { setNextItem(root) }
        // change render mode
        render_mode = 'free-motion'
        // save current tray position
        tray_offset.then = tray_offset.now
        hold_offset.now = 0
    }
}

const setNextItem = root => {
    let array = getItems(root).map(item => getItemSelectData(root, item))
    let middx = array.findIndex(x => x.centered)
    let index = middx === array.length - 1 ? 0 : middx + 1
    setItemSelect(root, getItems(root)[index])
}

const setLastItem = root => {
    let array = getItems(root).map(item => getItemSelectData(root, item))
    let middx = array.findIndex(x => x.centered)
    let index = middx === 0 ? array.length - 1 : middx - 1
    setItemSelect(root, getItems(root)[index])
}

const setItemSelect = (root, item) => {
    const data = getItemSelectData(root, item)
    list_target.element = item
    list_target.direction = data.direction
}

const getItemSelectData = (root, item) => {
    const root_crect = root.getBoundingClientRect()
    const item_crect = item.getBoundingClientRect()
    const root_axis = (root_crect.right - root_crect.left) / 2
    const item_axis = item_crect.left + item_crect.width / 2
    const offset = tray_offset.now + (root_axis - item_axis)
    const centered = item_crect.left < root_axis && item_crect.right > root_axis
    return {
        element : item,
        centered : centered,
        root_axis : root_axis,
        item_axis : item_axis,
        direction : item_axis < root_axis ? 'left' : 'right',
        offset : offset
    }
}

const getCloseItem = root => {
    let item = null
    getItems(root).forEach(child => {
        if(getItemSelectData(root, child).centered) { item = child }
    })
    return item
}

const callbackItem = (root, item) => {
    const index = getItems(root).indexOf(item)
    if(index === last_caller) { return }
    data_inputs.callback(data_inputs.array[index])
    last_caller = index
}

const speedForce = root => {
    if(list_target.element) {
        // select handling
        const data = getItemSelectData(root, list_target.element)
        // speed setup
        if(data.item_axis < data.root_axis && list_target.direction === 'left') {
            hold_offset.speed = +15
        } else if(data.item_axis > data.root_axis && list_target.direction === 'right') {
            hold_offset.speed = -15
        }
        // motion setup
        if(data.direction === 'right' && tray_offset.now + hold_offset.speed > data.offset) {
            tray_offset.now += hold_offset.speed
        } else if(data.direction === 'left' && tray_offset.now + hold_offset.speed < data.offset) {
            tray_offset.now += hold_offset.speed
        } else {
            hold_offset.speed = 0
            tray_offset.now = data.offset
            callbackItem(root, list_target.element)
            list_target.element = null
        }
    } else {
        // auto handling
        tray_offset.now += hold_offset.speed
        if(hold_offset.speed > 0) { hold_offset.speed -= 0.1 }
        if(hold_offset.speed < 0) { hold_offset.speed += 0.1 }
        if(Math.abs(hold_offset.speed) < 3) {
            const item = getCloseItem(root)
            if(item) { setItemSelect(root, item) }
        }
    }
}

class Scroller extends Component {
    render() {
        return <div id="Scroller"></div>
    }
}

Scroller.init = (array, generator, callback) => {
    if(Scroller.init.running) { return }
    // init memory
    Scroller.init.running = true
    // store input data
    data_inputs = { array, generator, callback }
    // scroller element
    const root = document.querySelector('#Scroller')
    // mouse events
    root.addEventListener('mousedown', dragDown)
    root.addEventListener('mousemove', dragMove)
    root.addEventListener('mouseup', event => dragEnd(event, root))
    root.addEventListener('mouseleave', event => dragEnd(event, root))
    // touch events
    root.addEventListener('touchstart', dragDown)
    root.addEventListener('touchmove', dragMove)
    root.addEventListener('touchend', event => dragEnd(event, root))
    // generate items
    Scroller.generate(root)
    // start render
    Scroller.render(root)
}

Scroller.generate = root => {
    // container axis
    let root_crect = root.getBoundingClientRect()
    const axis = (root_crect.right - root_crect.left) / 2
    // generate item list
    data_inputs.array.forEach((item, index) => {
        const child = data_inputs.generator(item)
        child.setAttribute('index', index)
        root.appendChild(child)
        child.addEventListener('click', () => {
            if(hold_offset.down === hold_offset.up) {
                setItemSelect(root, child)
            }
        })
    })
    // set initial position
    let item_crect = getItemRect(root, 0)
    tray_offset.now = axis - item_crect.width / 2
    // call first item callback
    callbackItem(root, getItems(root)[0])
}

Scroller.render = root => {
    requestAnimationFrame(() => Scroller.render(root))

    // animate position from speed
    if(render_mode === 'free-motion') {
        speedForce(root)
        tray_offset.then = tray_offset.now
    }

    // adjust floating values
    hold_offset.speed = parseFloat(hold_offset.speed.toFixed(1))
    tray_offset.then = parseFloat(tray_offset.then.toFixed(1))
    tray_offset.now = parseInt(tray_offset.now.toFixed(1))

    getItems(root).forEach((child, index, array) => {
        let item_crect = getItemRect(root, index)
        let item_width = item_crect.width
        let item_coord = (index * item_width) + tray_offset.now
        let list_width = array.length * item_width

        // relocate overflow items
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

        // set calculated position
        child.style.left = item_coord + 'px'

        // set current item
        if(getItemSelectData(root, child).centered) {
            child.setAttribute('focused', '')
        } else {
            child.removeAttribute('focused')
        }
    })
}

export default Scroller