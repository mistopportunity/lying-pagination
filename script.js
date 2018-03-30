"use strict";
const pages = document.getElementById("pages");
let light = true;
function togglelight() {
    light = !light;
    if(light) {
        document.body.className = "light";
    } else {
        document.body.className = "dark";
    }
}
let nav2shown = false;
function togglenavigation2() {
    const navbar = document.getElementById("navbar2");
    nav2shown = !nav2shown;
    if(nav2shown) {
        navbar.style.display = "initial";
    } else {
        navbar.style.display = "none";
    }
    pages.classList.toggle("doubletop");
}
let bookmarking = false;
function bookmarklocation() {
    if(navigating || bookmarking || historyIndex < 1) {
        return;
    }
    bookmarking = true;
    const bookmark = document.getElementById("bookmarkbutton");
    bookmark.classList.toggle("disabled");
    if(bookmarkexists(history[historyIndex])) {
        removebookmark(history[historyIndex]);
        bookmark.textContent = "removed!";
    } else {
        addbookmark(history[historyIndex]);
        bookmark.textContent = "added!";
    }
    setTimeout(function() {
        setbookmarktext();
        bookmark.classList.toggle("disabled");
        bookmarking = false;
    },200);
}
function removebookmark(name) {
    let data = localStorage.getItem("bookmarks");
    if(data === null) {
        return;
    }
    data = JSON.parse(data);
    data.splice(data.indexOf(name),1);
    localStorage.setItem("bookmarks",JSON.stringify(data));
}
function addbookmark(name) {
    let data = localStorage.getItem("bookmarks");
    if(data === null) {
        data = [];
    } else {
        data = JSON.parse(data);
    }
    data.push(name);
    localStorage.setItem("bookmarks",JSON.stringify(data));
}
function bookmarkexists(name) {
    const data = localStorage.getItem("bookmarks");
    if(data === null) {
        return false;
    }
    return JSON.parse(data).includes(name);

}
function getbookmarks() {
    const data = localStorage.getItem("bookmarks");
    if(data === null) {
        return null;
    } else {
        return JSON.parse(data);
    }

}
let backButtonEnabled = false;
let forwardButtonEnabled = false;
function enableBackButton() {
    document.getElementById("backbutton").classList.remove("disabled");
    backButtonEnabled = true;
}
function disableBackButton() {
    document.getElementById("backbutton").classList.add("disabled");
    backButtonEnabled = false;
}
function enableForwardButton() {
    document.getElementById("forwardbutton").classList.remove("disabled");
    forwardButtonEnabled = true;
}
function disableForwardButton() {
    document.getElementById("forwardbutton").classList.add("disabled");
    forwardButtonEnabled = false;
}
function setbookmarktext() {
    if(bookmarkexists(history[historyIndex])) {
        bookmarkbutton.textContent = "unsave";
    } else {
        bookmarkbutton.textContent = "save";
    }
}
function enablepostindexbuttons() {
    const bookmarkbutton = document.getElementById("bookmarkbutton");
    const indexbutton = document.getElementById("indexreturn");
    bookmarkbutton.classList.remove("disabled");
    indexbutton.classList.remove("disabled");
    setbookmarktext();
    indexbutton.textContent = "return to index";
}

function disablepostindexbuttons() {
    const bookmarkbutton = document.getElementById("bookmarkbutton");
    const indexbutton = document.getElementById("indexreturn");
    bookmarkbutton.classList.add("disabled");
    indexbutton.classList.add("disabled");
    bookmarkbutton.textContent = "";
    indexbutton.textContent = "";
}

function settitle(title) {
    document.title = title;
    document.getElementById("title").textContent = title;
}


let historyIndex = 0;
let history = ["pages/index"];

function getpage(pagefile,callback) {
    const client = new XMLHttpRequest();
    client.open("GET", pagefile);
    client.onload = function() {
        if(client.status === 200 || client.status === 0) {
            callback(client.responseText);
        } else {
            callback(`${pagefile} is missing.`);
        }

    }
    client.onerror = function() {
        callback(`${pagefile} is missing.`);
    }
    client.send();
}
let navigating = true;
function navigate(newlocation) {
    if(navigating) {
        return;
    }
    navigating = true;
    disableBackButton();
    disableForwardButton();
    getpage(newlocation,function(page) {

        const historyStartLength = history.length-1;
        for(var i = historyIndex;i<historyStartLength;i++) {
            history.pop();
        }
        historyIndex = history.length;

        settitle(newlocation);
        history.push(newlocation);

        clearpages();
        addpages(page.split("[end-page]"));

        if(nav2shown) {
            togglenavigation2()
        }

        logicalbuttonset();

        window.scrollTo(0,0);

        navigating = false;

    });

}

function logicalbuttonset() {
    if(historyIndex === 0) {
        disableBackButton();
        if(history.length > 1) {
            enableForwardButton();
        } else {
            disableForwardButton();
        }
        disablepostindexbuttons();
        return;
    } else if(historyIndex === history.length-1) {
        enableBackButton();
        disableForwardButton();
    }
    enablepostindexbuttons();
}

function buttonnavigate() {
    disableBackButton();
    disableForwardButton();

    getpage(history[historyIndex],function(page) {

        settitle(history[historyIndex]);

        clearpages();
        addpages(page.split("[end-page]"));

        logicalbuttonset();

        window.scrollTo(0,0);

        navigating = false;


    });
}

function goback() {
    if(navigating || !backButtonEnabled) {
        return;
    }
    navigating = true;
    historyIndex--;
    if(nav2shown) {
        togglenavigation2()
    }
    if(historyIndex === 0) {
        loadIndex();
    } else {
        buttonnavigate();
    }
}

function goforward() {
    if(navigating || !forwardButtonEnabled) {
        return;
    }
    navigating = true;
    historyIndex++;
    if(nav2shown) {
        togglenavigation2()
    }
    buttonnavigate();
}

function returntoindex() {
    if(navigating) {
        return;
    }
    navigating = true;

    historyIndex = 0;

    togglenavigation2()

    loadIndex();
    
}


function loadIndex() {
    logicalbuttonset();
    const client = new XMLHttpRequest();
    client.open("GET", "pages/index");
    const bookmarks = getbookmarks();
    const bookmarkPages = [];
    if(bookmarks !== null && bookmarks.length !== 0) {

        let runningPage = '<span class="bold underline">your bookmarks</span><br><br>';
        let runningCount = 1;
    
        for(let i = 0;i<bookmarks.length;i++) {
            if(runningCount == 14) { //change to 13 or something with testing
                runningCount = 0;
                bookmarkPages.push(runningPage);
                runningPage = "";
            }
            runningCount++;
            runningPage += `<span class="link" onclick="navigate('${bookmarks[i]}')">${i+1}. ${bookmarks[i]}</span><br><br>`;
        }
        if(runningPage !== "") {
            bookmarkPages.push(runningPage);
        }
    }

    client.onload = function() {
        clearpages();

        if(client.status === 200 || client.status === 0) {
            addpages([client.responseText]);
            settitle("index");
        } else {
            addpages(["Error loading index file. Sorry :("])
            settitle("whoops");
        }

        if(bookmarkPages.length > 0) {
            addpages(bookmarkPages);
        }
        window.scrollTo(0,0);
        navigating = false;
    }
    client.onerror = function() {
        clearpages();
        addpages(["Error loading index file. Sorry :("])
        settitle("whoops");
        if(bookmarkPages.length > 0) {
            addpages(bookmarkPages);
        }
        window.scrollTo(0,0);
        navigating = false;
    }
    client.send();
}


function clearpages() {
    while(pages.firstChild) {
        pages.removeChild(pages.firstChild);
    }
}
function addpages(textwithhtml) {
    for(let i  = 0; i <textwithhtml.length;i++) {
        const div = document.createElement("div");
        const p = document.createElement("p");
        p.innerHTML = textwithhtml[i];
        div.appendChild(p);
        pages.appendChild(div);
    }
}

loadIndex();
