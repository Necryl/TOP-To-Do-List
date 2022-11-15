// importing css
import mainStyles from "./../styles/main.css"
import menuStyles from "./../styles/menu.css"
import listViewtyles from "./../styles/listView.css"
import contentViewStyles from "./../styles/contentView.css"

// elements
const rootElement = document.querySelector(':root');

// state variables
let displayState; // possible states: landscape, square, portrait


// events
window.onresize = updateDisplayState;

function updateDisplayState () {
    let height = rootElement.clientHeight;
    let width = rootElement.clientWidth;
    console.log(`Height: ${height}, Width: ${width}, Aspect ratio: ${width/height}`);
}

// on start
updateDisplayState();

