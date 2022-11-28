// importing css
import mainStyles from "./../styles/main.css"
import menuStyles from "./../styles/menu.css"
import listViewtyles from "./../styles/listView.css"
import contentViewStyles from "./../styles/contentView.css"
import loadingStyles from "./../styles/loading.css"
import tooltipStyles from "./../styles/tooltips.css"
import alertViewStyles from "./../styles/alertView.css"
import rightClickStyles from "./../styles/rightClickDropDown.css"

// importing modules
import _ from "lodash"

// elements
const rootElement = document.querySelector(':root');
const bodyElement = document.querySelector('body');

const closeMenuBtnElement = document.querySelector('#close-menu');
const openMenuBtnElement = document.querySelector('#open-menu');
const returnBtnElement = document.querySelector('#return');

const loadingContainerElement = document.querySelector('.loading-container');
const toolTipsElement = document.querySelector('.toolTips');

const alertViewElement = document.querySelector('.alertView');
const alertMsgElement = document.querySelector('.alertView .alert-message');
const alertBtnsContainerElement = document.querySelector('.alertView .alertBtns-container');;
const alertTitleElement = document.querySelector('.alertView .alert-title');


const menuContainerElement = document.querySelector('.menu-container');
const menuElement = document.querySelector('.menu');
const listViewContainerElement = document.querySelector('.listView-container');
const listViewElement = document.querySelector('.listView');
const contentViewContainerElement = document.querySelector('.contentView-container');
const contentViewElement = document.querySelector('.contentView');

const rightClickDropdownElement = document.querySelector('.right-click-dropdown');

const allTasksMenuElement = document.querySelector('.menu #allTasks');
const allNotesMenuElement = document.querySelector('.menu #allNotes');
const taskListMenuElement = document.querySelector('.menu #tasks');
const noteListMenuElement = document.querySelector('.menu #notes');
const newBtnMenuInputElements = [...document.querySelectorAll('.menu .newBtn-wrapper input')];
const newBtnMenuElements = [...document.querySelectorAll('.menu .newBtn-wrapper .newBtn')];

const listNameInListViewElement = document.querySelector('.listView #listName');
const newBtnListViewElement = document.querySelector('.listView .listNameWrapper .newBtn');
const listViewOptionsElement = document.querySelector('.listView .options');
const sortPriorityElement = document.querySelector('#sortPriority');
const showPriorityElement = document.querySelector('#showPriority');
const sortDateElement = document.querySelector('#sortDate');
const showDateElement = document.querySelector('#showDate');
const listViewOptionElements = [sortPriorityElement, sortDateElement, showPriorityElement, showDateElement];
const listItemsULElement = document.querySelector('.listView .listItems');
const completedItemsULElement = document.querySelector('.listView .completedItems');
const completedTitleWrapperElement = document.querySelector('.listView .completedTitle-wrapper');
const completedTitleElement = document.querySelector('.listView #completedTitle');
const removeCompletedBtnElement = document.querySelector('.listView #removeCompleted');

const contentViewTitleElement = document.querySelector('.contentView .itemTitle');
const contentViewDescElement = document.querySelector('.contentView textarea.description');
const contentViewPriorityElement = document.querySelector('.contentView .options select');
const contentViewDateElement = document.querySelector(".contentView .options input[type='date']");
const contentViewDeleteBtnElement = document.querySelector(".contentView .options #delete");
const contentViewClearElement = document.querySelector(".contentView .clear");


// state variables
let displayState; // possible states: triple, double, single
let currentView = listViewContainerElement;
let currentList = ['task', 0];
let currentItem;
let loadingStatus = {
    UI: false,
    Data: false,
    Engine: false,
}

// hardcoded data
const elementsWhoseClassesReflectDisplayState = [bodyElement, menuElement, listViewElement, contentViewElement];
const possibleDisplayStates = ['triple', 'double', 'single'];

// modules
function createModule (inputObject) {
    let name = inputObject.name;
    let loadingProcessStatus = {};
    inputObject.processes.forEach(process => {
        loadingProcessStatus[process] = false;
    });
    
    return {loadingProcessStatus, name, ...inputObject.components};
}

const UI = (() => {

    let loadingScreenVisible = false;

    function updateDisplayState () {

        Engine.setLoadingStatus(UI, 'updatingDisplay', true);

        let width = rootElement.clientWidth;
        let menuWidth = menuElement.clientWidth;
    
        let result;
    
        if (width/menuWidth < 3) {
            result = 'double';
        } else {
            result = 'triple';
        }
        if (result !== 'single') {
            currentView = listViewContainerElement;
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
            removeClasses('hide', [listViewContainerElement, contentViewContainerElement]);
        }

        setTimeout(()=>{
            let overflow = false;
            [...getListViewItems(), listViewElement, listViewOptionsElement, contentViewElement].forEach(element => {
                if (checkForScrollBars(element, 'horizontal') === true) {
                    overflow = true;
                }
            });
            if (viewOverflow() && displayState !== 'single') {
                displayState = displayState === 'triple' ? 'double':'single';
                updateDisplayMode();
            } else {
                Engine.setLoadingStatus(UI, 'updatingDisplay', false);
            }
        }, 300);
    }

    function viewOverflow () {
        let overflow = false;
        [
            ...getListViewItems(),
            listViewContainerElement,
            listViewElement,
            listViewOptionsElement,
            contentViewContainerElement,
            contentViewElement,
            menuContainerElement,
            menuElement
        ].forEach(element => {
            if (checkForScrollBars(element, 'horizontal') === true) {
                overflow = true;
            }
        });
        return overflow;
    }

    function updateSingleView () {
        [listViewContainerElement, contentViewContainerElement].forEach(view => {
            if (view !== currentView) {
                view.classList.add('hide');
            } else {
                view.classList.remove('hide');
            }
        });
    }

    function updateDisplay() {
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

    function showLoadingScreen () {
        loadingContainerElement.style.opacity = '100%';
        loadingContainerElement.style.pointerEvents = 'initial';
        loadingScreenVisible = true;
    }

    function hideLoadingScreen () {
        loadingContainerElement.style.opacity = '0%';
        loadingContainerElement.style.pointerEvents = 'none';
        loadingScreenVisible = false;
    }

    function getChildElements (element) {
        return [...element.childNodes].reduce((final, current) => {
            if (current.nodeName !== '#text') {
                final.push(current);
            }
            return final;
        }, []);
    }

    function getOffset(element) {
        const rect = element.getBoundingClientRect();
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
        Engine.setLoadingStatus(UI, 'loadingTooltips', true);
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
        Engine.setLoadingStatus(UI, 'loadingTooltips', false);
    }

    function initiate () {
        updateDisplayState();
        loadToolTips();
    }

    function switchToContentView () {
        if (displayState === 'single') {
            currentView = contentViewContainerElement;
            updateSingleView();
        }
    }

    function alert (title, message) { // expected parameters --> title, message, button <- You can provide as many buttons as you want but each button must be an array with the first item being the label, and the second should be the function to run when the button is clicked
        if (title !== '') {
            alertTitleElement.textContent = title;
        }
        alertMsgElement.textContent = message;

        while(alertBtnsContainerElement.firstChild) {
            alertBtnsContainerElement.removeChild(alertBtnsContainerElement.firstChild);
        }
        for (let i = 2; i < arguments.length; i++) {
            let btnElement = document.createElement('button');
            btnElement.textContent = arguments[i][0];
            btnElement.addEventListener('click', (event) => {
                alertViewElement.style.display = 'none';
                arguments[i][1]();
            });
            alertBtnsContainerElement.appendChild(btnElement);
        }
        alertViewElement.style.display = 'grid';
    }

    function setDataAttribute (element, key, value) {
        element.setAttribute(`data-${key}`, value);
    }

    function getDataAttribute (element, key) {
        if (key === 'index') {
            return Number(element.getAttribute(`data-${key}`));
        }
        return element.getAttribute(`data-${key}`);
    }

    function createMenuListElement (type, index) {
        let name = Data.getListName(type, index);
        let element = document.createElement('li');
        setDataAttribute(element, 'type', type);
        setDataAttribute(element, 'index', index);
        element.textContent = name;
        element.addEventListener('click', event => {
            menuListClickEvent(event, type, index);
        });
        element.addEventListener('contextmenu', (event) => {
            triggerRightClickMenu(event, {
                "Delete this list": ()=>(Engine.deleteList(type, index)),
            });
        });
        element.addEventListener('animationend', event => {
            if (element.classList.contains('removing')) {
                element.remove();
            }
        });
        if (type === 'task') {
            taskListMenuElement.appendChild(element);
        } else {
            noteListMenuElement.appendChild(element);
        }
    }

    function createListItemElement (type, index) {
        let itemData = Data.getItem(type, index);
        let element = document.createElement('li');
        Data.spawnNewItemElem(type, index);
        element.classList.add(type);
        if (type === 'task') {
            let toggleElem = document.createElement('input');
            toggleElem.setAttribute('type', 'checkbox');
            toggleElem.toggleAttribute('checked', itemData.checked);
            if (itemData.checked) {
                element.classList.add('checked');
            }
            toggleElem.addEventListener('click', event => {
                event.stopPropagation();
            });
            toggleElem.addEventListener('input', event => {
                Data.updateItem(type, index, {checked: event.target.checked});
                if (event.target.checked) {
                    element.classList.add('checked');
                } else {
                    element.classList.remove('checked');
                }
            });
            element.addEventListener('animationend', event => {
                if (element.classList.contains('checked') && element.parentElement.classList.contains('listItems')) {
                    completedItemsULElement.appendChild(element);
                } else if (element.classList.contains('checked') === false && element.parentElement.classList.contains('completedItems')) {
                    let itemElements = [...listItemsULElement.children]
                    let itemPos = Data.getItemPosition(type, index);
                    if (itemElements.length !== 0) {
                        for (let i = 0; i < itemElements.length; i++) {
                            let currentPosition = Data.getItemPosition(type, getDataAttribute(itemElements[i], 'index'));
                            if (currentPosition > itemPos) {
                                listItemsULElement.children[i].insertAdjacentElement('beforebegin', element);
                                break;
                            } else if (currentPosition+1 === itemPos || i+1 === itemElements.length) {
                                listItemsULElement.children[i].insertAdjacentElement('afterend', element);
                                break;
                            }
                        }
                    } else {
                        console.log("list is empty");
                        listItemsULElement.appendChild(element);
                    }
                }
            })
            element.appendChild(toggleElem);
        }
        let textElem = document.createElement('input');
        textElem.setAttribute('type', 'text');
        textElem.setAttribute('value', itemData.title);
        textElem.addEventListener('input', event => {
            Engine.updateItemProperty(type, index, 'listView', {title: textElem.value});
        });
        textElem.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.keyCode === 13) {
                if (event.ctrlKey) {
                    Engine.newItem();
                } else {
                    event.target.blur();
                }
            }
        });
        textElem.addEventListener('click', event => {
            loadItem(type, index);
            switchToContentView();
        })
        element.appendChild(textElem);
        Data.updateItemElem(type, index, {titleElem: textElem});
        if (type === 'task') {
            let priorityElem = document.createElement('select');
            priorityElem.classList.add('priority');
            let priorityOptions = ['low', 'normal', 'high', 'urgent'];
            priorityOptions.forEach(option => {
                let elem = document.createElement('option');
                elem.setAttribute('value', option);
                elem.textContent = option[0].toUpperCase() + option.slice(1);
                if (option === itemData.priority) {
                    elem.toggleAttribute('selected', true);
                }
                priorityElem.appendChild(elem);
            });
            element.classList.add(itemData.priority);
            priorityElem.addEventListener('input', event => {
                Engine.updateItemProperty(type, index, 'listView', {priority: priorityElem.value});
                priorityOptions.forEach(option => {
                    element.classList.remove(option);
                });
                element.classList.add(priorityElem.value);
            });
            element.appendChild(priorityElem);
            Data.updateItemElem(type, index, {priorityElem: priorityElem});

            let dateElem = document.createElement('input');
            dateElem.setAttribute('type', 'date');
            dateElem.value = itemData.date === 'No due date' ? '':itemData.date;
            if (dateElem.value === '') {
                dateElem.classList.add('noDate');
            }
            dateElem.addEventListener('input', event => {
                Engine.updateItemProperty(type, index, 'listView', {date: dateElem.value});
            });
            element.appendChild(dateElem);
            Data.updateItemElem(type, index, {dateElem: dateElem});
        }

        element.addEventListener('animationend', event => {
            if (element.classList.contains('removing')) {
                element.remove();
            }
        });
        element.addEventListener('click', event => {
            if (displayState === 'single') {
                loadItem(type, index);
                switchToContentView();
            }
        });

        setDataAttribute(element, 'index', index);
        if (itemData.checked === true) {
            completedItemsULElement.appendChild(element);
        } else {
            listItemsULElement.appendChild(element);
        }

        Data.updateItemElem(type, index, {elem: element});

        return textElem;
    }

    function loadList (type, index) {
        currentList = [type, index];
        let menuListElements = [allTasksMenuElement, ...taskListMenuElement.children, allNotesMenuElement, ...noteListMenuElement.children];
        menuListElements.forEach(elem => {
            if (getDataAttribute(elem, 'index') !== index || getDataAttribute(elem, 'type') !== type) {
                elem.classList.remove('selected');
            } else {
                elem.classList.add('selected');
            }
        });
        if (index === 0) {
            newBtnListViewElement.style.display = 'none';
            listNameInListViewElement.toggleAttribute('disabled', true);
        } else {
            newBtnListViewElement.style.display = 'initial';
            listNameInListViewElement.toggleAttribute('disabled', false);
        }
        if (type === 'note') {
            listViewOptionsElement.style.display = 'none';
            completedTitleWrapperElement.style.display = 'none';
            completedItemsULElement.style.display = 'none';
        } else {
            listViewOptionsElement.style.display = 'grid';
            completedTitleWrapperElement.style.display = 'grid';
            completedItemsULElement.style.display = 'grid';
        }
        let list = Data.getList(type, index);

        listNameInListViewElement.value = Data.getListName(type, index);

        Data.getListOptions(type, index).forEach((value, index) => {
            listViewOptionElements[index].checked = value;
            if (index > 1) {
                let evt = new Event('input');
                listViewOptionElements[index].dispatchEvent(evt);
            }
        });
        let sortType = null;
        if (listViewOptionElements[0].checked) {
            sortType = 'priority';
        }
        if (listViewOptionElements[1].checked) {
            if (sortType !== null) {
                sortType = 'both';
            } else {
                sortType = 'date';
            }
        }
        if (sortType !== null) {
            if (sortType === 'priority') {
                list = Data.sortByPriority(type, list);
            } else if (sortType === 'date') {
                list = Data.sortByDate(type, list);
            } else if (sortType === 'both') {
                list = Data.mixSorted(Data.sortByPriority(type, list), Data.sortByDate(type, list));
            }
        }
        
        [listItemsULElement, completedItemsULElement].forEach(element => {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        });
        
        Data.clearItemElems();
        list.forEach((itemIndex, i) => {
            createListItemElement(type, itemIndex);
        });
        if (listItemsULElement.children.length > 0) {
            loadItem(type, getDataAttribute(listItemsULElement.children[0], 'index'));
        } else {
            clearContentView();
        }
    }

    function loadItem (type, index) {
        currentItem = [type, index];
        let itemElements = [...listItemsULElement.children, ...completedItemsULElement.children];
        itemElements.forEach(elem => {
            if (getDataAttribute(elem, 'index') !== index) {
                elem.classList.remove('selected');
            } else {
                elem.classList.add('selected');
            }
        });
        let itemData = Data.getItem(type, index);    

        contentViewTitleElement.value = itemData.title;
        contentViewDescElement.value = itemData.textBody;
        if (type === 'task') {
            contentViewPriorityElement.value = itemData.priority;
            contentViewDateElement.value = itemData.date === 'No due date'? '':itemData.date;
        }
        contentViewClearElement.style.display = 'none';

        ['clear', 'task', 'note'].forEach(item => {
            contentViewElement.classList.remove(item);
        })
        contentViewElement.classList.add(type);
    }

    function triggerRightClickMenu (event, contentObject) {
        event.preventDefault();
        let content = Object.entries(contentObject);
        while (rightClickDropdownElement.firstChild) {
            rightClickDropdownElement.removeChild(rightClickDropdownElement.firstChild);
        }
        content.forEach(entry => {
            let option = document.createElement('li');
            option.textContent = entry[0];
            option.addEventListener('click', ()=>{
                entry[1]();
                collapseEvent();
            });
            rightClickDropdownElement.appendChild(option);
        })
        rightClickDropdownElement.style.left = event.clientX+'px';
        rightClickDropdownElement.style.top = event.clientY+'px';
        rightClickDropdownElement.classList.remove('collapse');
        let collapseEvent = event => {
            rightClickDropdownElement.classList.add('collapse');
            rightClickDropdownElement.removeEventListener('mouseleave', collapseEvent);
        }
        setTimeout(() => {
            rightClickDropdownElement.addEventListener('mouseleave', collapseEvent)
        }, 50);
        
    }
    
    function loadData () {
        let taskLists = Data.getList('taskLists');
        let noteLists = Data.getList('noteLists');
        [taskLists, noteLists].forEach((listOfLists, index) => {
            let type = index === 0 ? 'task':'note';
            listOfLists.forEach(listIndex => {
                createMenuListElement(type, listIndex);
            })
        })
        loadList(...currentList);
    }

    function getListViewOptionsData () {
        return listViewOptionElements.reduce((final, current) => {
            final.push(current.checked);
            return final;
        }, [])
    }

    function updateItem (type, index, exception, entries) {
        let presentItem = _.isEqual(currentItem, [type, index]);
        let target = exception === 'listView' ? 'contentView':'listView';
        function getElement (target, name) {
            name += 'Elem';
            if (target === 'listView') {
                return Data.getItemElem(type, index, name);
            } else {
                switch (name) {
                    case 'titleElem':
                        return contentViewTitleElement;
                        break;
                    case 'priorityElem':
                        return contentViewPriorityElement;
                        break;
                    case 'dateElem':
                        return contentViewDateElement;
                        break;
                    case 'textBodyElem':
                        return contentViewDescElement;
                        break;
                }
            }
        }
        Object.entries(entries).forEach(entry => {
            let element = getElement(target, entry[0]);
            if (['title', 'priority', 'date'].includes(entry[0])) {
                if (target !== 'contentView' || presentItem === true) {
                    element.value = entry[1];
                }
                if (entry[0] === 'date') {
                    if (entry[1] === '') {
                        if (target === 'contentView') {
                            getElement('listView', 'date').classList.add('noDate');
                        }
                        element.classList.add('noDate');
                    } else {
                        if (target === 'contentView') {
                            getElement('listView', 'date').classList.remove('noDate');
                        }
                        element.classList.remove('noDate');
                    }
                }
            }
        });
    }

    function removeItem (type, index) {
        if (_.isEqual(currentItem, [type, index])) {
            let checked = Data.getItem(type, index).checked;
            let list = checked ? completedItemsULElement.children : listItemsULElement.children;
            if (list.length < 2) {
                if (checked && listItemsULElement.children.length > 0) {
                    loadItem(type, getDataAttribute(listItemsULElement.children[0], 'index'));
                } else {
                    clearContentView();
                }
            } else {
                for (let i = 0; i < list.length; i++) {
                    if (getDataAttribute(list[i], 'index') === index) {
                        if (i === list.length-1) {
                            loadItem(type, getDataAttribute(list[i-1], 'index'));
                        } else {
                            loadItem(type, getDataAttribute(list[i+1], 'index'));
                        }
                    }
                }
            }
        }
        let itemElements = [...listItemsULElement.children, ...completedItemsULElement.children];
        for (let i = 0; i < itemElements.length; i++) {
            if (getDataAttribute(itemElements[i], 'index') === index) {
                itemElements[i].classList.add('removing');
                break;
            }
        }
    }

    function removeList (type, index) {
        if (currentList[0] === type && currentList[1] === 0) {
            let presentListItemElements = [...listItemsULElement.children, ...completedItemsULElement.children];
            presentListItemElements.forEach(elem => {
                let itemIndex = getDataAttribute(elem, 'index');
                if (Data.getItem(type, itemIndex).listIndex === index) {
                    removeItem(type, itemIndex);
                }    
            });
        }
        let list = type === 'task' ? [allTasksMenuElement, ...taskListMenuElement.children] : [allNotesMenuElement, ...noteListMenuElement.children];
        for (let i = 0; i < list.length; i++) {
            if (getDataAttribute(list[i], 'index') === index) {
                if (_.isEqual(currentList, [type, index])) {
                    if (i === list.length-1) {
                        loadList(type, getDataAttribute(list[i-1], 'index'));
                    } else {
                        loadList(type, getDataAttribute(list[i+1], 'index'));
                    }
                }
                list[i].classList.add('removing');
            }
        }
    }

    function clearContentView () {
        currentItem = null;

        contentViewTitleElement.value = '';
        contentViewDescElement.value = '';
        contentViewPriorityElement.value = 'normal';
        contentViewDateElement.value = '';
        contentViewClearElement.style.display = 'grid';

        ['clear', 'task', 'note'].forEach(item => {
            contentViewElement.classList.remove(item);
        })
        contentViewElement.classList.add('clear');
    }

    function updateListName (type, index, name) {
        let list = type === 'task' ? taskListMenuElement.children : noteListMenuElement.children;
        for (let i = 0; i < list.length; i++) {
            if (getDataAttribute(list[i], 'index') === index) {
                list[i].textContent = name;
                break;
            }
        }
    }

    return createModule({
        name: 'UI',
        processes: ['updatingDisplay', 'loadingTooltips'],
        components: {
            updateDisplay,
            initiate,
            hideMenu,
            switchToContentView,
            updateSingleView,
            loadingScreenVisible,
            showLoadingScreen,
            hideLoadingScreen,
            loadData,
            alert,
            createMenuListElement,
            loadList,
            loadItem,
            getListViewOptionsData,
            createListItemElement,
            updateItem,
            removeItem,
            removeList,
            getDataAttribute,
            updateListName,
            viewOverflow,
        }
    });
})()

const Data = (()=>{    
    const defaultListNames = ['taskLists', 'noteLists', 'taskItems', 'noteItems', 'taskList_0', 'noteList_0'];

    let listItemElems = {
        task: {},
        note: {}
    }

    function clearItemElems () {
        listItemElems = {
            task: {},
            note: {}
        }
    }

    function updateItemElem (type, index, entries) {
        Object.entries(entries).forEach(entry => {
            listItemElems[type][index][entry[0]] = entry[1];
        });
    }

    function spawnNewItemElem (type, index) {
        listItemElems[type][index] = {
            elem: undefined,
            titleElem: undefined,
            priorityElem: undefined,
            dateElem: undefined,
        };
    }

    function getItemElem (type, index, elemName) {
        return listItemElems[type][index][elemName];
    }

    function getItemPosition (type, index) {
        return getList(type, currentList[1]).indexOf(index);
    }

    function spawnNewList (type, name) {
        let typeLists = data.get(type+'Lists');
        let index = getNewIndex(typeLists);
        typeLists.push(index);
        data.set(type+'Lists', typeLists);
        let listName = type+'List_'+index;
        data.set(listName+'_name', name);
        data.set(listName+'_options', [false, false, true, true]);
        data.set(listName, []);
        return index;
    }

    function removeList (type, index) {
        let listName = type+'List_'+index;
        if (data.exists(listName)) {
            let listItems = getList(type, index);
            listItems.forEach(itemIndex => removeItem(type, itemIndex));
            let typeLists = data.get(type+'Lists');
            typeLists.splice(typeLists.indexOf(index), 1);
            data.set(type+'Lists', typeLists);
            data.remove(listName+'_name');
            data.remove(listName+'_options');
            data.remove(listName);
        } else {
            console.error(`List doesn't exist: ${listName}`);
        }
    }

    function spawnNewItem (type, listIndex) {
        let item = createItem(type, listIndex);
        let listName = type+'List_'+listIndex;
        let list = data.get(listName);
        let typeList = data.get(type+'Items');
        
        let index = getNewIndex(typeList);

        typeList.push(index);
        data.set(type+'Items', typeList);
        
        list.push(index);
        data.set(listName, list);

        
        let itemName = type+'Item_'+index;
        data.set(itemName, item);

        return index;
    }

    function removeItem (type, index) {
        let itemName = type+'Item_'+index;
        if (data.exists(itemName)) {
            let item = data.get(itemName);
            let listName = type+'List_'+item.listIndex;
            let list = data.get(listName);
            list.splice(list.indexOf(index), 1);
            data.set(listName, list);
            let typeList = data.get(type+'Items');
            typeList.splice(typeList.indexOf(index), 1);
            data.set(type+'Items', typeList);
            data.remove(itemName);
        } else {
            console.error(`Item doesn't exist: ${itemName}`);
        }
    }

    function getNewIndex (arrayOfIndexes) {
        for (let i = 0; i < arrayOfIndexes.length+1; i++) {
            if (!arrayOfIndexes.includes(i)) {
                return i;
                break;
            }
        }
    }
    
    function createItem (type, listIndex) {
        // console.log('createItem');
        // console.log('type:', type)
        // console.log('listIndex:', listIndex)

        let result = {
            type,
            listIndex,
            title: '',
            textBody: '',
        };
        if (type === 'task') {
            result.priority = 'normal';
            result.date = 'No due date';
            result.checked = false;
        }
        // console.log("final result: v");
        // console.dir(result);

        return result;
    }

    function getList (type, index) {
        type = type.trim().toLowerCase();
        let target = type;
        if (type !== 'task' || type !== 'list') {
            type = type.includes('task') ? 'task':'note';
        }
        if (target === 'tasklists' || target === 'notelists') {
            return data.get(type+'Lists').slice(1);
        } else if (target === 'all tasks' || target === 'all notes') {
            index = 0;
        }
        let id = type+'List_'+index;
        if (data.exists(id)) {
            let name = data.get(id+'_name');
            let allList = 'All '+type[0].toUpperCase()+type.slice(1)+'s';
            if (name === allList) {
                return data.get(type+'Items');
            } else {
                return data.get(id);
            }
        } else {
            console.error(`List doesn't exist: ${id}`);
        }
    }
    
    function getListName (type, index) {
        let id = type+'List_'+index;
        if (data.exists(id)) {
            return data.get(id+'_name');
        } else {
            console.error(`List doesn't exist: ${id}`);
        }
    }

    function getItem (type, index) {
        let itemName = type+'Item_'+index;
        if (data.exists(itemName)) {
            return data.get(itemName);
        } else {
            console.error(`Item doesn't exist: ${itemName}`);
        }
    }

    function loadAnew () {
        localStorage.clear();
        data.set('TOP_Project_ToDoList_StorageExists', true);
        defaultListNames.forEach(name => data.set(name, []));
        spawnNewList('task', 'All Tasks');
        spawnNewList('note', 'All Notes');
    }

    function updateListViewOptions () {
        let optionsArray = UI.getListViewOptionsData();
        let id = currentList[0]+'List_'+currentList[1]+'_options';
        data.set(id, optionsArray);
    }

    function verifyData () {
        Engine.setLoadingStatus(Data, 'verifyingData', true);
        console.groupCollapsed("verifyData()");
        let result = true;
        let defaultListsExist = defaultListNames.reduce((final, current) => {
            if (data.exists(current) === false) {
                console.warn("the following defaultList doesn't exist:", current);
                final = false;
            }
            return final;
        }, true);
        if (defaultListsExist) {
            console.groupCollapsed("verifying sublists and items");
            let subListsAndItemsExist = ['taskLists', 'noteLists'].reduce((final, currentListName) => {
                data.get(currentListName).forEach(subListIndex => {
                    let subListName = currentListName.slice(0, currentListName.length-1)+'_'+subListIndex;
                    console.group("checking sublist:", subListName);
                    if (!Number.isInteger(subListIndex)) {
                        console.warn("The sublist index is not an integer:", subListIndex);
                        final = false;
                    } else if (data.exists(subListName) === false || data.exists(subListName+'_name') === false) {
                        console.warn("The sublist doesn't exist or sublist_name doesn't exist");
                        console.warn("Sublist exists?", data.exists(subListName));
                        console.warn("Sublist_name exists?", data.exists(subListName+'_name'));
                        final = false;
                    } else if (data.get(subListName+'_name').trim() === '') {
                        console.warn("subList_name is empty");
                        final = false;
                    }else if (data.exists(subListName+'_options') === false) {
                        console.warn("subList_options doesn't exist");
                        final = false;
                    } else if (!Array.isArray(data.get(subListName+'_options'))) {
                        console.warn("subList_options is invalid. Not an Array")
                        final = false;
                    } else {
                        let optionsValuesValid = data.get(subListName+'_options').reduce((verdict, value, valueIndex) => {
                            if (typeof value !== 'boolean') {
                                console.warn(`subList_options array contains an item with invalid value. Not a boolean. Item index is: ${valueIndex}`);
                                verdict = false;
                            }
                            return final;
                        }, true);
                        if (optionsValuesValid) {
                            console.log("verifying the items of subList", subListName);
                            let itemsExist = data.get(subListName).reduce((itemTestFinal, currentItemIndex) => {
                                let itemName = subListName.slice(0, 4)+'Item_'+currentItemIndex;
                                console.group("checking item:", itemName);
                                if (!Number.isInteger(currentItemIndex)) {
                                    console.warn("item index is not an integer:", currentItemIndex);
                                    itemTestFinal = false;
                                } else if (data.exists(itemName) === false) {
                                    console.warn("this item (", itemName,") doesn't exist");
                                    itemTestFinal = false;
                                } else {
                                    let item = data.get(itemName);
                                    console.log("verifying item's contents");
                                    if (!isOfType(item, "object")) {
                                        console.warn("item isn't an object");
                                        itemTestFinal = false;
                                    } else if (item.type !== 'task' && item.type !== 'note') {
                                        console.warn("item.type is invalid:", item.type);
                                        itemTestFinal = false;
                                    } else if (!Number.isInteger(item.listIndex)) {
                                        console.warn("item's listIndex is not an Integer");
                                        itemTestFinal = false;
                                    } else if (typeof item.title !== 'string' || typeof item.textBody !== 'string') {
                                        console.warn("item's title or textBody is not a string");
                                        console.warn("item's title:", item.title);
                                        console.warn("item's textBody", item.textBody);
                                        itemTestFinal = false;
                                    } else if (item.type === 'task') {
                                        console.log("item is a task, verifying properties unique to task items")
                                        if (typeof item.date !== 'string' || typeof item.checked !== 'boolean') {
                                            console.warn("item.date is not a string or item.checked is not a boolean");
                                            console.warn('typeof item.date:', typeof item.date);
                                            console.warn("typeof item.checked:", typeof item.checked);
                                            itemTestFinal = false;
                                        } else if (item.priority !== 'low' && item.priority !== 'normal' && item.priority !== 'high' && item.priority !== 'urgent') {
                                            console.warn("item.priority contains an invalid value:", item.priority);
                                            itemTestFinal = false;
                                        }
                                    }
                                }
                                console.groupEnd("checking item:", itemName);
                                return itemTestFinal;
                            }, true)
                            if (itemsExist === false) {
                                console.warn("items verification failed for:", subListName);
                                final = false;
                            }
                        } else {
                            console.warn(`sublist_options array's item verification failed`);
                            final = false;
                        }
                    }
                    console.groupEnd("checking sublist:", subListName);
                })
                return final;
            }, true);
            console.groupEnd("verifying sublists and items");
            if (subListsAndItemsExist === false) {
                console.warn("subLists(and/or their items') verification failed");
                result = false;
            }
            console.groupCollapsed("verifying items in taskItems and noteItems");
            ['taskItems', 'noteItems'].forEach(metaItemListName => {
                console.group('verifying items of:', metaItemListName);
                let type = metaItemListName.slice(0, 4);
                data.get(metaItemListName).forEach(itemIndex => {
                    let itemName = type+'Item_'+itemIndex;
                    console.log("verifying that", itemName, "exists in its list");
                    if (!Number.isInteger(itemIndex)) {
                        console.warn("itemIndex is not an integer:", itemIndex);
                        result = false;
                    } else if (data.exists(itemName) === false) {
                        console.warn(itemName, "doesn't exist at all");
                        result = false;
                    } else {
                        let itemListIndex = data.get(itemName).listIndex;
                        let itemListName = type+'List_'+itemListIndex;
                        if (!Number.isInteger(itemListIndex)) {
                            console.warn("item's listIndex is not an integer:", itemListIndex);
                            result = false;
                        } else if (data.exists(itemListName) === false) {
                            console.warn(itemListName, "doesn't exist");
                            result = false;
                        } else {
                            let itemList = data.get(type+'List_'+itemListIndex);
                            if (itemList.includes(itemIndex) === false) {
                                console.warn("item doesn't exist in its list");
                                result = false;
                            }
                        }
                    }
                })
                console.groupEnd('verifying items of:', metaItemListName);
            })
            console.groupEnd("verifying items in taskItems and noteItems");
        } else {
            console.warn("all/some/one of the default lists were/was not found");
            result = false;
        }
        if (result === true || result === false) {
            Engine.setLoadingStatus(Data, 'verifyingData', false);
        }
        console.groupEnd("verifyData()");
        if (result) {
            console.log("verifyData() --> result: PASSED");
        } else {
            console.warn("verifyData() --> result: FAILED");
        }
        return result;
    }

    function initiate () {
        Engine.setLoadingStatus(Data, 'loadingData', true);
        let result;
        if (data.get('TOP_Project_ToDoList_StorageExists') === true) {
            console.log('We have pre-existing data');
            result = verifyData();
        } else {
            console.log('Found no pre-existing data');
            loadAnew();
            result = 'new';
        }
        if (result !== undefined) {
            Engine.setLoadingStatus(Data, 'loadingData', false);
            return result;
        }
    }

    const data = {
        set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
        get: key => JSON.parse(localStorage.getItem(key)),
        remove: key => localStorage.removeItem(key),
        exists: key => localStorage.getItem(key) === null ? false:true, 
    }

    function logLocalStorage () {
        console.table(_.sortBy(Object.entries(localStorage)));
    }

    function getListOptions (type, index) {
        let id = type+'List_'+index+'_options';
        if (data.exists(id)) {
            return data.get(id);
        } else {
            console.warn(`Data entry doesn't exist: ${id}`);
        }
    }

    function updateItem (type, index, entries) {
        entries = Object.entries(entries);
        let itemData = data.get(type+'Item_'+index);
        entries.forEach(entry => {
            itemData[entry[0]] = entry[1];
        });
        data.set(type+'Item_'+index, itemData)
    }

    function updateListName (type, index, name) {
        let id = type+'List_'+index;
        data.set(id+'_name', name);
    }

    function sortByPriority (type, itemList=getList(...currentList)) {
        let options = ['urgent', 'high', 'normal', 'low'];
        return itemList.sort((a, b) => {
            a = options.indexOf(getItem(type, a).priority);
            b = options.indexOf(getItem(type, b).priority);
            return a - b;
        });
    }

    function sortByDate (type, itemList=getList(...currentList)) {
        let result = itemList.slice(0).sort((a, b) => {
            a = getItem(type, a).date;
            b = getItem(type, b).date;
            a = a === 'No due date' ? null : new Date(a);
            b = b === 'No due date' ? null : new Date(b);
            if ([a, b].includes(null)) {
                if (a !== null) {
                    return -1;
                } else if (b !== null) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (a.getTime() === b.getTime()) {
                return 0;
            } else {
                return a.getTime() - b.getTime();
            }
        });
        return result;
    }

    function mixSorted () { // params = list1, list2... with all lists basically containing the same items, just ordered different (sometimes ordered the same)
        let processed = arguments[0].reduce((final, current, index) => {
            final.push([current, index]);
            return final;
        }, []);
        for (let i = 1; i < arguments.length; i++) {
            arguments[i].forEach((item, index) => {
                let processedIndex = arguments[0].indexOf(item);
                processed[processedIndex][1] += index;
            });
        }
        processed.forEach((item, index) => {
            processed[index][1] = item[1]/arguments.length;
        });
        processed = processed.sort((a, b) => {
            return a[1] - b[1];
        });
        
        return processed.reduce((final, current) => {
            final.push(current[0]);
            return final;
        }, []);
    }

    return createModule({
        name: 'Data',
        processes: ['verifyingData', 'loadingData'],
        components: {
            getNewIndex,
            createItem,
            getList,
            getListName,
            getItem,
            initiate,
            loadAnew,
            spawnNewItem,
            spawnNewList,
            removeItem,
            removeList,
            logLocalStorage,
            updateListViewOptions,
            getListOptions,
            updateItem,
            getItemPosition,
            clearItemElems,
            updateItemElem,
            spawnNewItemElem,
            getItemElem,
            updateListName,
            sortByDate,
            sortByPriority,
            mixSorted,
        }
    });
})();

const Engine =(()=>{
    
    function initialise () {
        UI.initiate();
        let dataResult = Data.initiate();
        if (dataResult === false) {
            UI.alert("Alert", "Found old data, but it seems corrupted. Your data is going to be reset.", ["Ok", ()=>{Engine.resetData()}]);
        } else {
            UI.loadData();
        }

    }

    async function resetData () {
        setLoadingStatus(Engine, 'resetingData', true);
        await Data.loadAnew();
        await UI.loadData();
        setLoadingStatus(Engine, 'resetingData', false);
    }

    const loading = {
        start: () => {UI.showLoadingScreen()},
        finish: () => {
            let ready = true;
            Object.values(loadingStatus).forEach(process => {
                if (process === true) {
                    ready = false;
                }
            });
            if (ready) {
                UI.hideLoadingScreen();
            }
        }
    }

    function setLoadingStatus (module, process, status) {
        if (status === true) {
            module.loadingProcessStatus[process] = true;
            loadingStatus[module.name] = true;
            if (UI.loadingScreenVisible === false) {
                loading.start();
            }
        } else if (status === false) {
            module.loadingProcessStatus[process] = false;
            let ready = true;
            Object.values(module.loadingProcessStatus).forEach(process => {
                if (process === true) {
                    ready = false;
                }
            });
            if (ready) {
                loadingStatus[module.name] = false;
                loading.finish();
            }
        }
    }

    function newList (type, name) {
        let newListIndex = Data.spawnNewList(type, name);
        UI.createMenuListElement(type, newListIndex);
        UI.loadList(type, newListIndex);
    }

    function deleteList (type, index) {
        UI.removeList(type, index);
        Data.removeList(type, index);
    }

    function newItem () {
        let type = currentList[0];
        let itemIndex = Data.spawnNewItem(type, currentList[1]);
        UI.createListItemElement(type, itemIndex).focus();
        UI.loadItem(type, itemIndex);
    }

    function updateItemProperty (type, index, source, entries) {
        Object.entries(entries).forEach(entry => {
            let value = entry[1];
            if (entry[0] === 'date' && value === '') {
                value = 'No due date';
            }
            Data.updateItem(type, index, {[entry[0]]: value});
        });
        UI.updateItem(type, index, source, entries);
    }

    function updateListName (type, index, name) {
        UI.updateListName(type, index, name);
        Data.updateListName(type, index, name);
    }

    function deleteItem (type, index) {
        let inPresentList = false;
        let presentList = Data.getList(...currentList);
        if (_.isEqual(currentItem, [type, index])) {
            inPresentList = true;
        } else if (presentList.includes(index)) {
            inPresentList = true;
        }
        if (inPresentList) {
            UI.removeItem(type, index);
        }
        Data.removeItem(type, index);
    }
    
    return createModule({
        name: 'Engine',
        processes: ['resetingData'],
        components: {
            initialise,
            loading,
            setLoadingStatus,
            newList,
            resetData,
            deleteList,
            newItem,
            updateItemProperty,
            deleteItem,
            updateListName,
        }
    });
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
    currentView = listViewContainerElement;
    UI.updateSingleView();
})
newBtnMenuElements.forEach((newBtn, index) => {
    newBtn.addEventListener('click', event => {
        newBtnMenuInputElements[index].style.display = 'initial';
        event.target.style.display = 'none';
        newBtnMenuInputElements[index].focus();
    })
})
newBtnMenuInputElements.forEach((element, index) => {
    element.addEventListener('blur', event => {
        event.target.style.display = 'none';
        newBtnMenuElements[index].style.display = 'initial';
        if (event.target.value.trim() !== '') {
            let type = index === 0 ? 'task':'note';
            Engine.newList(type, event.target.value.trim());
        }
        event.target.value = '';
    })
    element.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.target.blur();
        }
    })
})
allTasksMenuElement.addEventListener('click', event => {
    menuListClickEvent(event, 'task', 0);
})
allNotesMenuElement.addEventListener('click', event => {
    menuListClickEvent(event, 'note', 0);
})
function menuListClickEvent (event, type, index) {
    UI.loadList(type, index);
    closeMenuBtnElement.click();
    if (UI.viewOverflow()) {
        UI.updateDisplay();
    }
}
showPriorityElement.addEventListener('input', event => {
    if (event.target.checked === false) {
        listViewElement.classList.add('hidePriority');
    } else {
        listViewElement.classList.remove('hidePriority');
    }
})
showDateElement.addEventListener('input', event => {
    if (event.target.checked === false) {
        listViewElement.classList.add('hideDate');
    } else {
        listViewElement.classList.remove('hideDate');
    }
})
sortPriorityElement.addEventListener('input', event => {
    Data.updateListViewOptions();
    UI.loadList(...currentList);
});
sortDateElement.addEventListener('input', event => {
    Data.updateListViewOptions();
    UI.loadList(...currentList);
});
listViewOptionElements.forEach(element => {
    element.addEventListener('input', event => {
        Data.updateListViewOptions();
    });
})
newBtnListViewElement.addEventListener('click', event => {
    Engine.newItem();
});
completedTitleElement.addEventListener('click', event => {
    if (completedItemsULElement.classList.contains('collapse')) {
        completedItemsULElement.classList.remove('collapse');
        completedTitleElement.classList.remove('collapse');
    } else {
        completedItemsULElement.classList.add('collapse');
        completedTitleElement.classList.add('collapse');
    }
})
contentViewTitleElement.addEventListener('input', event => {
    Engine.updateItemProperty(currentItem[0], currentItem[1], 'contentView', {title: contentViewTitleElement.value});
});
contentViewDescElement.addEventListener('input', event => {
    Engine.updateItemProperty(currentItem[0], currentItem[1], 'contentView', {textBody: contentViewDescElement.value});
});
contentViewPriorityElement.addEventListener('input', event => {
    Engine.updateItemProperty(currentItem[0], currentItem[1], 'contentView', {priority: contentViewPriorityElement.value});
});
contentViewDateElement.addEventListener('input', event => {
    Engine.updateItemProperty(currentItem[0], currentItem[1], 'contentView', {date: contentViewDateElement.value});
});
contentViewDeleteBtnElement.addEventListener('click', event => {
    Engine.deleteItem(...currentItem);
});
removeCompletedBtnElement.addEventListener('click', event => {
    [...completedItemsULElement.children].forEach(itemElem => {
        Engine.deleteItem(currentList[0], UI.getDataAttribute(itemElem, 'index'));
    });
});
listNameInListViewElement.addEventListener('input', event => {
    Engine.updateListName(...currentList, event.target.value);
});
listNameInListViewElement.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        listNameInListViewElement.blur();
    }
});


// tool functions
function isOfType(subject, type=undefined) {
    if (typeof type !== 'string') {
        type = undefined;
    }
    let subjectType = Object.prototype.toString.call(subject);
    subjectType = subjectType.slice(8, subjectType.length-1).toLowerCase();
    if (type === undefined) {
        return subjectType;
    } else {
        return subjectType === type;
    }
}

function compareMultipleItemsAsEqual () {
    let verdict = true;
    for (let i = 0; i < arguments.length-1; i++) {
        let item1 = arguments[i];
        let item2 = arguments[i+1];
        if (_.isEqual(item1, item2) === false) {
            verdict = false;
            break;
        }
    }
    return verdict;
}

// on start
Engine.initialise();
// for testing
// console.log('--------Testing--------');
// Data.logLocalStorage();
// console.log('----------End of Testing---------')
