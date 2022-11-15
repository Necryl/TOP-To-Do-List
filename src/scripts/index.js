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
const menuElement = document.querySelector('.menu');
const listViewElement = document.querySelector('.listView');
const contentViewElement = document.querySelector('.contentView');


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
        
        menuElement.style.display = 'grid';
        listViewElement.style.display = 'grid';
        contentViewElement.style.display = 'grid';
        contentViewElement.style.display = 'grid';
    } else if (displayState === 'double') {
        closeMenuBtnElement.style.display = 'initial';
        openMenuBtnElement.style.display = 'initial';
        returnBtnElement.style.display = 'none';

        menuElement.style.display = 'none';
        listViewElement.style.display = 'grid';
        contentViewElement.style.display = 'grid';
    } else {
        navBtns.forEach(button => {
            button.style.display = 'initial';
        })
        menuElement.style.display = 'none';
        listViewElement.style.display = 'grid';
        contentViewElement.style.display = 'none';

    }
}

// on start
updateDisplayState();

