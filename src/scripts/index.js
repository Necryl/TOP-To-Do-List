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

    async function loadToolTips (tooltips=getChildElements(toolTipsElement)) { // expects paramater <toolTips> to contain an array of toolTip elements
        loadingProcessStatus.loadingTooltips = true;
        await tooltips.forEach(element => {
            let childElement = getChildElements(element)[0];
            let alignment = element.getAttribute('place'); // examples to demonstrate format for 'place' (HTML attribute) (<-> seperates different examples) ---> center <-> triple: center <-> double: right; triple: left bottom; <-> left; single: center top; <-> left bottom; double: center;
            let defaultAlignment = '; center';
            alignment = alignment === null ? defaultAlignment:alignment+defaultAlignment; // takes care of it if there is no place attribute in the html or if the place attribute contains an empty or invalid string
            alignment = alignment.split(';').reduce((final, current) => {
                if (current.trim().length > 0) {
                    let result;
                    if (current.includes(':')) {
                        result = current.trim().split(':');
                        result.unshift(result.shift());
                        result[1] = result[1].trim().split(' ');
                    } else {
                        result = ['rest', current.trim().split(' ')];
                    }
                    if (result[1].length === 1) {
                        if (['center', 'right', 'left'].includes(result[1][0])) {
                            result[1].push('top');
                        } else if (['top', 'bottom'].includes(result[1][0])) {
                            result[1].unshift('center');
                        }
                    }
                    let switchAlignX = false;
                    let switchAlignY = false;
                    if (['top', 'bottom'].includes(result[1][0])) {
                        switchAlignX = result[1][0];
                    }
                    if (['right', 'left', 'center'].includes(result[1][1])) {
                        switchAlignY = result[1][1];
                    }
                    if (switchAlignX !== false) {
                        result[1][1] = switchAlignX;
                    }
                    if (switchAlignY !== false) {
                        result[1][0] = switchAlignY;
                    }

                    let correctFormat = true; // only push to final if result is in the correct format
                    if (!possibleDisplayStates.includes(result[0]) && 'rest' !== result[0]) {
                        correctFormat = false;
                    }
                    result[1].forEach(item => {
                        if (!['center', 'right', 'left', 'top', 'bottom'].includes(item)) {
                            correctFormat = false;
                        }
                    });
                    if (correctFormat) {
                        final.push(result);
                    }
                }
                return final;
            }, []); // returns in the following format ---> ['<viewMode ('rest' means all unspecified viewmodes)>', ['<horzontal alignment>', '<vertical alignment>']]
            alignment = (() => {
                let viewModes = [[], [], [], []] // [triple, double, single, rest]
                alignment.forEach((item) => {
                    if (item[0] === 'rest') {
                        viewModes[3].push(item);
                    } else if (item[0] === 'triple') {
                        viewModes[0].push(item);
                    } else if (item[0] === 'double') {
                        viewModes[1].push(item);
                    } else if (item[0] === 'single') {
                        viewModes[2].push(item);
                    }
                });
                return viewModes.reduce((final, current) => {
                    if (current.length > 0) {
                        final.push(current[0]);
                    }
                    return final;
                }, []);
            })() // making sure that there is only one instance of each viewmode or of type 'rest'
            
            // an array of classes to be applied to the child span of the toolTip div element
            let alignmentClasses = (()=>{
                let viewmodes = possibleDisplayStates.slice(0);
                return alignment.reduce((final, current) => {
                    if (current[0] !== 'rest') {
                        viewmodes.splice(viewmodes.indexOf(current[0]), 1);
                        current[1].forEach(item => {
                            final.push(current[0]+'-'+item);
                        });
                    } else {
                        current[1].forEach(item => {
                            viewmodes.forEach(view => {
                                final.push(view+'-'+item);
                            });
                        })
                    }
                    return final;
                }, [])
            })(); // these classes are in the format of ---> '<viewmode>-<alignment>' | Examples: ---> 'double-right', 'triple-center', 'single-top', 'double-bottom', 'single-left'

            alignmentClasses.forEach(className => {
                childElement.classList.add(className);
            });
            
            let getCoords = {
                'triple': {
                    x: undefined,
                    y: undefined
                },
                'double': {
                    x: undefined,
                    y: undefined
                },
                'single': {
                    X: undefined,
                    y: undefined
                },
            };
            (()=>{
                let viewmodes = possibleDisplayStates.slice(0);
                alignment.forEach(instruction => {
                    let view = instruction[0];
                    let alignX = instruction[1][0];
                    let alignY = instruction[1][1];
                    if (view !== 'rest') {
                        viewmodes.splice(viewmodes.indexOf(view), 1);
                    } else {
                        view = viewmodes;
                    }
                    if (!Array.isArray(view)) {
                        view = [view];
                    }
                    view.forEach(viewMode => {
                        if (alignX === 'center') {
                            getCoords[viewMode].x = (spatialData) => {
                                return spatialData.x + (Math.round(spatialData.width/2));
                            }
                        } else if (alignX === 'left') {
                            getCoords[viewMode].x = (spatialData) => {
                                return spatialData.left;
                            }
                        } else if(alignX === 'right') {
                            getCoords[viewMode].x = (spatialData) => {
                                return spatialData.right;
                            }
                        }
                        if (alignY === 'top') {
                            getCoords[viewMode].y = (spatialData) => {
                                return spatialData.top;
                            }
                        } else if (alignY === 'bottom') {
                            getCoords[viewMode].y = (spatialData) => {
                                return spatialData.bottom;
                            }
                        }
                    })
                })
            })() // create and adds the functions for getCoords object that is specialised for the given alignment
            
            let targetElements = [...document.querySelectorAll(element.getAttribute('for'))];


            let showEvent = (event, targetElem) => {
                element.classList.add('show');
                    let spatialData = getOffset(targetElem);
                    let coordX = getCoords[displayState].x(spatialData);
                    let coordY = getCoords[displayState].y(spatialData);
                    element.style = `--positionX: ${coordX}px; --positionY: ${coordY}px;`;
            }
            let hideEvent = (event) => {
                element.classList.remove('show');
            }

            targetElements.forEach(targetElem => {
                let tooltipStatus = false;
                targetElem.addEventListener('mouseover', (event) => {
                    if (tooltipStatus === false) {
                        tooltipStatus = true;
                        showEvent(event, targetElem);
                    }
                });
                targetElem.addEventListener('focus', (event) => {
                    if (tooltipStatus === false) {
                        tooltipStatus = true;
                        showEvent(event, targetElem);
                    }
                });
                targetElem.addEventListener('mouseout', event => {
                    tooltipStatus = false;
                    hideEvent(event);
                });
                targetElem.addEventListener('blur', event => {
                    tooltipStatus = false;
                    hideEvent(event);
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