// importing css
import mainStyles from "./../styles/main.css"
import menuStyles from "./../styles/menu.css"
import listViewtyles from "./../styles/listView.css"
import contentViewStyles from "./../styles/contentView.css"

// elements
const rootElement = document.querySelector(':root');
const bodyElement = document.querySelector('body');
const closeMenuBtnElement = document.querySelector('#close-menu');
const openMenuBtnElement = document.querySelector('#open-menu');
const returnBtnElement = document.querySelector('#return');
const navBtnElements = [closeMenuBtnElement, openMenuBtnElement, returnBtnElement];
const menuContainerElement = document.querySelector('.menu-container');
const menuElement = document.querySelector('.menu');
const listViewElement = document.querySelector('.listView');
const contentViewElement = document.querySelector('.contentView');
const menuTitleElement = document.querySelector('.menu .title');
const listViewTitleElement = document.querySelector('.listView .title');


// state variables
let displayState; // possible states: triple, double, single

// hardcoded data
const elementsWhoseClassesReflectDisplayState = [bodyElement, menuElement, listViewElement, contentViewElement];
const possibleDisplayStates = ['triple', 'double', 'single'];

// modules
const UI = (() => {
    function updateDisplayState () {
        let height = rootElement.clientHeight;
        let width = rootElement.clientWidth;
        let ratio = width/height;
        let menuWidth = menuElement.clientWidth;
    
        let result;
    
        if (ratio < 0.72) {
            result = 'single';
        } else if (ratio < 1.178 || width/menuWidth < 3) {
            result = 'double';
        } else {
            result = 'triple';
        }
        
        displayState = result;
        updateDisplayMode();
    }
    
    function updateDisplayMode () {
        addClasses(displayState, elementsWhoseClassesReflectDisplayState);
        possibleDisplayStates.forEach(className => {
            if (displayState !== className) {
                removeClasses(className, elementsWhoseClassesReflectDisplayState);
            }
        })
    }
    
    function hideMenu () {
        [menuContainerElement, menuElement].forEach(element => {
            element.classList.remove('visible');
        })
    }

    return {
        updateDisplayState, hideMenu,
    }
})()

// tool functions
function addClasses (className, elements=[]) {
    elements.forEach(elem => {elem.classList.add(className);});
}

function removeClasses (className, elements=[]) {
    elements.forEach(elem => {elem.classList.remove(className);});
}

// events
window.onresize = () => {UI.updateDisplayState();};

openMenuBtnElement.addEventListener('click', (event) => {
    if (displayState != 'triple') {
        [menuContainerElement, menuElement].forEach(element => {
            element.classList.add('visible');
        })
    }
})
closeMenuBtnElement.addEventListener('click', (event) => {
    UI.hideMenu();
})
menuElement.addEventListener('click', (event) => {
    event.stopPropagation();
})
menuContainerElement.addEventListener('click', (event) => {
    UI.hideMenu();
})

// on start
UI.updateDisplayState();