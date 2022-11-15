// importing css
import mainStyles from "./../styles/main.css"
import menuStyles from "./../styles/menu.css"
import listViewtyles from "./../styles/listView.css"
import contentViewStyles from "./../styles/contentView.css"

// elements
const rootElement = document.querySelector(':root');
const closeMenuBtnElement = document.querySelector('#close-menu');
const openMenuBtnElement = document.querySelector('#open-menu');
const returnBtnElement = document.querySelector('#return');
const navBtns = [closeMenuBtnElement, openMenuBtnElement, returnBtnElement];


// state variables
let displayState; // possible states: triple, double, single


// events
window.onresize = updateDisplayState;


// functions
function updateDisplayState () {
    let height = rootElement.clientHeight;
    let width = rootElement.clientWidth;
    let ratio = width/height;

    let result;

    if (ratio < 0.72) {
        result = 'single';
    } else if (ratio < 1.178) {
        result = 'double';
    } else {
        result = 'triple';
    }
    
    displayState = result;
    updateUiMode();
}

function updateUiMode () {
    if (displayState === 'triple') {
        navBtns.forEach((button) => {button.style.display = 'none'});
    } else if (displayState === 'double') {
        closeMenuBtnElement.style.display = 'initial';
        openMenuBtnElement.style.display = 'initial';
        returnBtnElement.style.display = 'none';
    } else {
        navBtns.forEach(button => {
            button.style.display = 'initial';
        })
    }
}

// on start
updateDisplayState();

