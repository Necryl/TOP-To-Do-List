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
const menuContainerElement = document.querySelector('.menu-container');
const menuElement = document.querySelector('.menu');
const listViewElement = document.querySelector('.listView');
const contentViewElement = document.querySelector('.contentView');
const listViewOptionsElement = document.querySelector('.listView .options');


// state variables
let displayState; // possible states: triple, double, single
let timeWindow = false;

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
    
        if (width/menuWidth < 3) {
            console.log('double it is');
            result = 'double';
        } else {
            result = 'triple';
        }
        
        displayState = result;
        updateDisplayMode();
    }
    
    function updateDisplayMode () {
        console.log('hahahahahha', displayState);
        addClasses(displayState, elementsWhoseClassesReflectDisplayState);
        possibleDisplayStates.forEach(className => {
            if (displayState !== className) {
                removeClasses(className, elementsWhoseClassesReflectDisplayState);
            }
        })

        let overflow = false;
        [...getListViewItems(), listViewElement, listViewOptionsElement, contentViewElement].forEach(element => {
            if (checkForScrollBars(element, 'horizontal') === true) {
                overflow = true;
            }
        });
        console.log('overflow = ', overflow);
        if (overflow===true && displayState !== 'single') {
            console.log('there is overflow', 'current displayState: '+displayState);
            displayState = displayState === 'triple' ? 'double':'single';
            setTimeout(()=>{updateDisplayMode();}, 10)
        }
    }
    
    function hideMenu () {
        [menuContainerElement, menuElement].forEach(element => {
            element.classList.remove('visible');
        })
    }

    function getListViewItems () {
        return [...document.querySelectorAll('.listView ul li')];
    }

    function checkForScrollBars (element, check='both') {
        return check==='both' || check==='horizontal' ? element.scrollWidth > element.clientWidth ? true: check==='both' ? element.scrollHeight>element.clientHeight: false :element.scrollHeight > element.clientHeight;
    }

    function addClasses (className, elements=[]) {
        elements.forEach(elem => {elem.classList.add(className);});
    }
    
    function removeClasses (className, elements=[]) {
        elements.forEach(elem => {elem.classList.remove(className);});
    }

    return {
        updateDisplayState, hideMenu, checkForScrollBars,
    }
})()

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

// for testing
// console.log('--------Testing--------');
// console.log('----------End of Testing---------')