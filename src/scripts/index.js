// importing css
import mainStyles from "./../styles/main.css"
import menuStyles from "./../styles/menu.css"
import listViewtyles from "./../styles/listView.css"
import contentViewStyles from "./../styles/contentView.css"
import loadingStyles from "./../styles/loading.css"
import tooltipStyles from "./../styles/tooltips.css"

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
const loadingContainerElement = document.querySelector('.loading-container');
const toolTipsElement = document.querySelector('.toolTips');


// state variables
let displayState; // possible states: triple, double, single
let currentView = listViewElement;

// hardcoded data
const elementsWhoseClassesReflectDisplayState = [bodyElement, menuElement, listViewElement, contentViewElement];
const possibleDisplayStates = ['triple', 'double', 'single'];

// modules
const UI = (() => {
    let loadingProcessStatus = {
        updatingDisplay: false,
        loadingTooltips: false,
    };

    function updateDisplayState () {

        loadingProcessStatus.updatingDisplay = true;

        let width = rootElement.clientWidth;
        let menuWidth = menuElement.clientWidth;
    
        let result;
    
        if (width/menuWidth < 3) {
            result = 'double';
        } else {
            result = 'triple';
        }
        if (result !== 'single') {
            currentView = listViewElement;
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

        if (displayState === 'single') {
            updateSingleView();
        } else {
            removeClasses('hide', [listViewElement, contentViewElement]);
        }

        setTimeout(()=>{
            let overflow = false;
            [...getListViewItems(), listViewElement, listViewOptionsElement, contentViewElement].forEach(element => {
                if (checkForScrollBars(element, 'horizontal') === true) {
                    overflow = true;
                }
            });
            if (overflow===true && displayState !== 'single') {
                displayState = displayState === 'triple' ? 'double':'single';
                updateDisplayMode();
            } else {
                loadingProcessStatus.updatingDisplay = false;
                finishLoading();
            }
        }, 300);
    }

    function updateSingleView () {
        [listViewElement, contentViewElement].forEach(view => {
            if (view !== currentView) {
                view.classList.add('hide');
            } else {
                view.classList.remove('hide');
            }
        });
    }

    function updateDisplay() {
        startLoading();
        updateDisplayState();
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

    function startLoading () {
        loadingContainerElement.style.opacity = '100%';
        loadingContainerElement.style.pointerEvents = 'initial';
    }

    function finishLoading () {
        let ready = true;
        Object.values(loadingProcessStatus).forEach(process => {
            if (process === true) {
                ready = false;
            }
        });
        if (ready) {
            loadingContainerElement.style.opacity = '0%';
            loadingContainerElement.style.pointerEvents = 'none';
        }
    }

    function getChildElements (element) {
        return [...element.childNodes].reduce((final, current) => {
            if (current.nodeName !== '#text') {
                final.push(current);
            }
            return final;
        }, []);
    }

    function getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
          left: Math.round(rect.left + window.scrollX),
          right: Math.round(rect.right + window.scrollX),
          top: Math.round(rect.top + window.scrollY),
          bottom: Math.round(rect.bottom + window.scrollY),
          x: Math.round(rect.x + window.scrollX),
          y: Math.round(rect.y + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
    }

    async function loadToolTips () {
        loadingProcessStatus.loadingTooltips = true;
        let tooltips = getChildElements(toolTipsElement);
        await tooltips.forEach(element => {
            let childElement = getChildElements(element)[0];
            let alignment = element.getAttribute('place');
            childElement.classList.add(alignment);
            
            let getCoordX;
            if (alignment === 'center') {
                getCoordX = (spatialData) => {
                    return spatialData.x + (Math.round(spatialData.width/2));
                }
            } else if (alignment === 'left') {
                getCoordX = (spatialData) => {
                    return spatialData.x;
                }
            } else if(alignment === 'right') {
                getCoordX = (spatialData) => {
                    return spatialData.x + (Math.round(spatialData.width));
                }
            }
            
            let targetElements = [...document.querySelectorAll(element.getAttribute('for'))];

            targetElements.forEach(targetElem => {
                targetElem.addEventListener('mouseover', (event) => {
                    element.classList.add('show');
                    let spatialData = getOffset(targetElem);
                    let coordX = getCoordX(spatialData);
                    let coordY = spatialData.y;
                    element.style = `--positionX: ${coordX}px; --positionY: ${coordY}px;`;
                });
                targetElem.addEventListener('mouseout', (event) => {
                    element.classList.remove('show');
                });
            })
        });
        loadingProcessStatus.loadingTooltips = false;
        finishLoading();
    }

    function initiate () {
        startLoading();
        updateDisplayState();
        loadToolTips();
    }

    function switchToContentView () {
        if (displayState === 'single') {
            currentView = contentViewElement;
            updateSingleView();
        }
    }

    return {
        updateDisplay,
        initiate,
        startLoading,
        hideMenu,
        switchToContentView,
        updateSingleView,
    }
})()

// events
window.onresize = () => {
    UI.updateDisplay();
};

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
returnBtnElement.addEventListener('click', event => {
    currentView = listViewElement;
    UI.updateSingleView();
})

// on start
UI.initiate();
[...document.querySelectorAll('.listView li')].forEach(item => {
    item.addEventListener('click', event => {
        UI.switchToContentView();
    })
})
// for testing
// console.log('--------Testing--------');
// console.log('----------End of Testing---------')