const PAGE_MENU = 0; PAGE_SETTINGS = 1;
const GENDER_MALE = 0, GENDER_FEMALE = 1, GENDER_PRIVATE = 2;

let pageAgreement = document.querySelector("#page-agreement");
let pageMenu = document.querySelector("#page-menu");
let pageSettings = document.querySelector("#page-settings");
let pageAlbum = document.querySelector("#page-album");

let radioAcceptAgreement = document.querySelector("#radio-accept");
let btnSetting = document.querySelector("#btn-setting");
let btnAccept = document.querySelector("#btn-accept");
let txtUsername = document.querySelector("#username");
let radioGenderMale = document.querySelector("#gender-male");
let radioGenderFemale = document.querySelector("#gender-female");
let radioGenderPrivate = document.querySelector("#gender-private");
let rangeMaxResult = document.querySelector("#max-result");
let rangeSampleImage = document.querySelector("#sample-image");
let checkReuseSample = document.querySelector("#reuse-sample");
let maxResultDisplay = document.querySelector("#max-result-display");
let sampleImageDisplay = document.querySelector("#sample-image-display");
let credit = document.querySelector("#credit");

let isAgreementAccepted = false;
let currPage = 0;
let userGender;

// load user settings
//  - agreement
chrome.storage.sync.get("agreementAccepted", ({ agreementAccepted }) => {
    // does user accepted the agreement before ?
    if (agreementAccepted) isAgreementAccepted = agreementAccepted;
    // reset pages order - UI
    initUI();
})
//  - username
chrome.storage.sync.get("username", ({ username }) => {if (username) txtUsername.value = username});
//  - gender
chrome.storage.sync.get("gender", ({ gender }) => {
    if (gender) {
        switch (gender) {
            case "male":
                radioGenderMale.checked = true;
                gender = GENDER_MALE;
                break;
            case "female":
                radioGenderFemale.checked = true;
                gender = GENDER_FEMALE;
                break;
            case "private":
                radioGenderPrivate.checked = true;
                gender = GENDER_PRIVATE;
                break;
        }
    }
});
//  - max result
chrome.storage.sync.get("maxResult", ({ maxResult }) => {
    if (maxResult) rangeMaxResult.value = maxResult;
    maxResultDisplay.innerText = rangeMaxResult.value;
});
//  - sample image
chrome.storage.sync.get("sampleImage", ({ sampleImage }) => {
    if (sampleImage) rangeSampleImage.value = sampleImage;
    sampleImageDisplay.innerText = rangeSampleImage.value;
});
//  - reuse-sample
chrome.storage.sync.get("reuseSample", ({ reuseSample }) => {if (reuseSample) checkReuseSample.checked = reuseSample? true:false});

// listen for setting update
//  - agreement
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
//  - username
txtUsername.addEventListener('change', () => {
    let username = txtUsername.value;
    chrome.storage.sync.set({ username });
})
//  - gender
radioGenderMale.addEventListener('click', () => {
    userGender = GENDER_MALE;
    updateGender();
})
radioGenderFemale.addEventListener('click', () => {
    userGender = GENDER_FEMALE;
    updateGender();
})
radioGenderPrivate.addEventListener('click', () => {
    userGender = GENDER_PRIVATE;
    updateGender();
})
let updateGender = () => {
    let gender;
    switch (userGender) {
        case GENDER_MALE:
            gender = "male";
            break;
        case GENDER_FEMALE:
            gender = "female";
            break;
        case GENDER_PRIVATE:
            gender = "private";
            break;
    }
    chrome.storage.sync.set({ gender });
}
//  - max result
rangeMaxResult.addEventListener('change', () => {
    let maxResult = rangeMaxResult.value;
    maxResultDisplay.innerText = rangeMaxResult.value;
    chrome.storage.sync.set({ maxResult });
})
//  - sample image
rangeSampleImage.addEventListener('change', () => {
    let sampleImage = rangeSampleImage.value;
    sampleImageDisplay.innerText = rangeSampleImage.value;
    chrome.storage.sync.set({ sampleImage });
})
//  - reuse-sample
checkReuseSample.addEventListener('change', () => {
    let reuseSample = checkReuseSample.checked? true:false;
    chrome.storage.sync.set({ reuseSample });
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