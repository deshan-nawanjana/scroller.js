# ScrollerJS: Vanilla / React Component

ScrollerJS is a lightweight web application component that create horizontal infinite loop scrolling item list using any kind of object array. Appearance of the component should designed using your own CSS rules while ScrollerJS is only provide the mechanism of the scrolling environment.

## Import Component

In vanilla, include the script file and define the element using id ```Scroller```. This element should be inside another element that defined the size and the position of the component.

```HTML
<!-- include script file -->
<script src="./index.js"></script>

<!-- component element with container -->
<div id="ScrollerOuter">
    <div id="Scroller"></div>
</div>
```

For React developments, you can import the ```Scroller``` class. Same as before, use a container element to defined the size and the position.

```JavaScript
// import class
import Scroller from './Scroller'

// main app component
class App extends Component {
    render() {
        return(
            <div id="ScrollerOuter">
                <Scroller />
            </div>
        )
    }
}
```

Check out the following example for container CSS rules. Root element will take these position and the dimensions to locate in the web view.

```CSS
#ScrollerOuter {
    width: 100vw;
    height: 200px;
    position: fixed;
    left: 0px;
    top: 0;
}
```

## Preparing Inputs

To create the item list, you need to input some sort of object array. This each object of array should contain designing and callback informaton to use while running the app. You can use JSON file or any API response as this object array to initiate to component.

```JSON
[
    { "color" : "#4071d9", "title" : "Browser" },
    { "color" : "#71ab50", "title" : "Gallery" },
    { "color" : "#d79940", "title" : "House" },
    { "color" : "#6a4ea5", "title" : "Instagram" },
    { "color" : "#db4a35", "title" : "LinkedIn" },
]
```

Then you have to define a generate function for any object of the array. Consider the parameter ```item``` as an object item from array above. While initiating the component this generator will be using to create item from each object in the array.

```JavaScript
const generator = item => {
    const e = document.createElement('div')
    e.className = 'ScrollerItem'
    e.innerHTML = item.title
    e.style.backgroundColor = item.color
    return e
}
```

Also you have to define some CSS rules for these item elements as well. Minimum requirement is to define the width of an item. Use ```[focused]``` selector to change the styles for current item which will be conted in the component while scrolling.

```CSS
.ScrollerItem {
    width: 40vw;
    line-height: 200px;
    text-align: center;
    transition: opacity 0.2s;
    opacity: 0.85;
}

.ScrollerItem[focused] { opacity: 1; }
```

Then you have to define the callback event. Once an item is selected of located to the middle of the scrolling view, callback will be executed by providing that specific object item of the array. Therefore you can do any kind of process using that object data.

```JavaScript
const callback = item => {
    console.log(item.title, "Selected!")
}
```

## Initiate The Component

Finally, you can use those inputs to initate the component by ```Scroller.init``` method.


```JavaScript
// request response
fetch('api.webb.app').then(text => text.json()).then(array => {
    // initate the component
    Scroller.init(array, generator, callback)
})
```

## User Experience

Scrolling view works with boath left and right direction displaying as an endless loop of items. Rescaling is possible if you have provide the dimensions using CSS Viewport units ```(vw / vh)```. Items will be always jump between fixed positions by locating an specific item displaying in the middle of the container.

#### Developed by Deshan Nawanjana

[https://dnjs.info/](https://dnjs.info/)

[LinkedIn](https://www.linkedin.com/in/deshan-nawanjana/)
&ensp;|&ensp;
[GitHub](https://github.com/deshan-nawanjana)
&ensp;|&ensp;
[YouTube](https://www.youtube.com/channel/UCfqOF8_UTa6LhaujoFETqlQ)
&ensp;|&ensp;
[Blogger](https://dn-w.blogspot.com/)
&ensp;|&ensp;
[Facebook](https://www.facebook.com/nawanjana.wickramasinhe/)
&ensp;|&ensp;
[Gmail](mailto:deshan.uok@gmail.com)