// onInstalled
chrome.runtime.onInstalled.addListener(() => {
    console.log('Installation successfully completed!\nWeb Portrait extension\n- created by Wong Kai Fung');
});

// let jsn;

// fetch('./manifest.json')
// .then(res => {
//     return res.json();
// })
// .then(jsonData => {
//     jsn = JSON.stringify(jsonData);
//     let blob = new Blob([jsn], { type: 'application/json' });
//     let file = new File([ blob ], 'file.json');
// });

// window.onload = () => {
//     chrome.tabs.captureVisibleTab((dataUrl) => {
//         console.log(dataUrl);
//         chrome.downloads.download({
//             filename: "download.jpg",
//             url: dataUrl
//         })
//     })
// }