const PAGE_MENU = 0; PAGE_SETTINGS = 1;

let pageAgreement = document.querySelector("#page-agreement");
let pageMenu = document.querySelector("#page-menu");
let pageSettings = document.querySelector("#page-settings");
let pageAlbum = document.querySelector("#page-album");
let btnSetting = document.querySelector("#btn-setting");
let radioAcceptAgreement = document.querySelector("#radio-accept");
let btnAccept = document.querySelector("#btn-accept");
let credit = document.querySelector("#credit");

let isAgreementAccepted = false;
let currPage = 0;

// load user settings - chrome.storage.sync
chrome.storage.sync.get("agreementAccepted", ({ agreementAccepted }) => {
    // does user accepted the agreement before ?
    if (agreementAccepted) isAgreementAccepted = agreementAccepted;
    // reset pages order - UI
    initUI();
})

btnSetting.addEventListener('click', () => {
    // switch to menu
    switch (currPage) {
        case PAGE_MENU:
            pageMenu.style.transform = "translateX(-100%)";
            pageSettings.style.transform = "translateX(0%)";
            currPage = PAGE_SETTINGS;
            break;
        case PAGE_SETTINGS:
            pageMenu.style.transform = "translateX(0%)";
            pageSettings.style.transform = "translateX(100%)";
            currPage = PAGE_MENU;
            break;
    }
})

// window.onload = () => {
//     chrome.tabs.captureVisibleTab((dataUrl) => {
//         alert(dataUrl);
//         // chrome.downloads.download({
//         //     filename: "download.jpg",
//         //     url: dataUrl
//         // })
//     })
//     chrome.tabs.getCapturedTabs((tabs) => {
//         alert(tabs);
//     })
// }

btnAccept.addEventListener('click', () => {
    // save user option
    if (radioAcceptAgreement.checked) {
        isAgreementAccepted = true;
        let agreementAccepted = isAgreementAccepted;
        chrome.storage.sync.set({ agreementAccepted });
        // update UI
        pageMenu.style.display = "flex";
        pageSettings.style.display = "flex";
        pageAgreement.style.transform = "translateX(-100%)";
        pageMenu.style.transform = "translateX(0%)";
        pageSettings.style.transform = "translateX(100%)";
        pageAgreement.style.opacity = "0";
        credit.style.opacity = "100";
        btnSetting.style.opacity = "100";

    } else {
        alert('Please accept the agreement to continue.');
    }

})

let initUI = () => {
    // is agreement accepted ?
    if (!isAgreementAccepted) {
        // show agreement page
        pageMenu.style.display = "none";
        pageSettings.style.display = "none";
        pageAgreement.style.transform = "translateX(0)";
        pageMenu.style.transform = "translateX(100%)";
        pageSettings.style.transform = "translateX(200%)";

    } else {
        // show menu
        pageAgreement.style.display = "none";
        pageMenu.style.display = "flex";
        pageSettings.style.display = "flex";
        pageAgreement.style.transform = "translateX(-100%)";
        pageMenu.style.transform = "translateX(0%)";
        pageSettings.style.transform = "translateX(100%)";
        pageAgreement.style.opacity = "0";
        credit.style.opacity = "100";
        btnSetting.style.opacity = "100";
    }
}

// tutorial content
// const changeColor = document.querySelector("#colorChange");
// chrome.storage.sync.get("color", ({ color }) => {
//     changeColor.style.background = color;
// })