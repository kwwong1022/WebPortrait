//let btnSetting = document.querySelector("#btn-setting");

let isAgreementAccepted = false;

// load user settings - chrome.storage.sync
chrome.storage.sync.get("agreementAccepted", ({ agreementAccepted }) => {
    // does user accepted the agreement before ?
    if (agreementAccepted) isAgreementAccepted = agreementAccepted;
})

// reset pages order - UI
initUI();

btnSetting.addEventListener('click', () => {
    // switch to menu
})

let initUI = () => {
    // is agreement accepted ?
    if (!isAgreementAccepted) {
        // show agreement page
    } else {
        // show menu
    }
}

// tutorial content
const changeColor = document.querySelector("#colorChange");
chrome.storage.sync.get("color", ({ color }) => {
    changeColor.style.background = color;
})