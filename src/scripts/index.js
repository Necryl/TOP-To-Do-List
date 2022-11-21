// importing css
import mainStyles from "./../styles/main.css"
import menuStyles from "./../styles/menu.css"
import listViewtyles from "./../styles/listView.css"
import contentViewStyles from "./../styles/contentView.css"
import loadingStyles from "./../styles/loading.css"
import tooltipStyles from "./../styles/tooltips.css"
import alertViewStyles from "./../styles/alertView.css"

// importing modules
import _ from "lodash"

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
const alertViewElement = document.querySelector('.alertView');
const alertMsgElement = document.querySelector('.alertView .alert-message');
const alertBtnsContainer = document.querySelector('.alertView .alertBtns-container');;
const alertTitleElement = document.querySelector('.alertView .alert-title');
const allTasksMenuElement = document.querySelector('.menu #allTasks');
const allNotesMenuElement = document.querySelector('.menu #allNotes');
const taskListMenuElement = document.querySelector('.menu #tasks');
const noteListMenuElement = document.querySelector('.menu #notes');


// state variables
let displayState; // possible states: triple, double, single
let currentView = listViewElement;
let currentList = 'All Tasks';
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
                Engine.setLoadingStatus(UI, 'updatingDisplay', false);
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
            currentView = contentViewElement;
            updateSingleView();
        }
    }

    function alert (title, message) { // expected parameters --> title, message, button <- You can provide as many buttons as you want but each button must be an array with the first item being the label, and the second should be the function to run when the button is clicked
        if (title !== '') {
            alertTitleElement.textContent = title;
        }
        alertMsgElement.textContent = message;

        while(alertBtnsContainer.firstChild) {
            alertBtnsContainer.removeChild(alertBtnsContainer.firstChild);
        }
        for (let i = 2; i < arguments.length; i++) {
            let btnElement = document.createElement('button');
            btnElement.textContent = arguments[i][0];
            btnElement.addEventListener('click', (event) => {
                alertViewElement.style.display = 'none';
                arguments[i][1]();
            });
            alertBtnsContainer.appendChild(btnElement);
        }
        alertViewElement.style.display = 'grid';
    }

    function createMenuListElement (type, index) {
        let name = Data.getListName(type, index);
    }
    
    function loadData () {}

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
        }
    });
})()

const Data = (()=>{    
    const defaultListNames = ['taskLists', 'noteLists', 'taskItems', 'noteItems', 'taskList_0', 'noteList_0'];
        
    function spawnNewList (type, name) {
        let typeLists = data.get(type+'Lists');
        let index = getNewIndex(typeLists);
        typeLists.push(index);
        data.set(type+'Lists', typeLists);
        let listName = type+'List_'+index;
        data.set(listName+'_name', name);
        data.set(listName, []);
    }

    function removeList (type, index) {
        let listName = type+'List_'+index;
        if (data.exists(listName)) {
            let listItems = data.get(listName);
            listItems.forEach(itemIndex => removeItem(itemIndex, type));
            let typeLists = data.get(type+'Lists');
            typeLists.splice(typeLists.indexOf(index), 1);
            data.set(type+'Lists', typeLists);
            data.remove(listName+'_name');
            data.remove(listName);
        } else {
            console.error(`List doesn't exist: ${listName}`);
        }
    }

    function spawnNewItem (type, listIndex) {
        let item = createItem(type, listIndex);
        let listName = type+'List_'+listIndex;
        let list = data.get(listName);
        let index = getNewIndex(list);
        list.push(index);
        data.set(listName, list);
        let typeList = data.get(type+'Items');
        typeList.push(index);
        data.set(type+'Items', typeList);
        let itemName = type+'Item_'+index;
        data.set(itemName, item);
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

        return result;
    }

    function getList (type, index) {
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

    // localStorageExample = {
    //     TOP_Project_ToDoList_StorageExists: true,
    //     taskLists: [1, 3, 4, 5, 6],
    //     noteLists: [1, 2, 3, 4, 7, 8],
    //     taskItems: [1, 2, 3, 4, 5, 6, 12, 8],
    //     noteItems: [1, 2, 3, 5],
    //     taskList_1_name: "Daily",
    //     taskList_1: [4, 5, 6, 12, 8],
    //     taskList_3_name: "Daily",
    //     taskList_3: [1, 2, 3],
    //     taskItem_1: {checked, title, textbody, priority, date},
    //     noteItem_1: {title, textBody}
    // }

    function loadAnew () {
        localStorage.clear();
        data.set('TOP_Project_ToDoList_StorageExists', true);
        defaultListNames.forEach(name => data.set(name, []));
        spawnNewList('task', 'All Tasks');
        spawnNewList('note', 'All Notes');
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
                    } else {
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

    function newList () {}
    
    return createModule({
        name: 'Engine',
        processes: ['resetingData'],
        components: {
            initialise,
            loading,
            setLoadingStatus,
            newList,
            resetData,
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
    currentView = listViewElement;
    UI.updateSingleView();
})

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
};

// on start

Engine.initialise();
[...document.querySelectorAll('.listView li')].forEach(item => {
    item.addEventListener('click', event => {
        UI.switchToContentView();
    })
});
// for testing
// console.log('--------Testing--------');
Data.logLocalStorage();
console.log(Data.getListName('task', 0));
// console.log('----------End of Testing---------')
