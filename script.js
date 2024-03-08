document.addEventListener('DOMContentLoaded', function () {

    // Load all the base64 images
    function updateImage(className, image) {
        const elements = document.querySelectorAll(className);
        elements.forEach(element => {
            element.innerHTML = `<img height='29' width='140' src='${image}'>`;
        });
    }

    updateImage('.GSRImage1', GSRImage);
    updateImage('.GSRImage2', GSRImage);
    updateImage('.AUDUSDImage1', AUDUSDImage);
    updateImage('.AUDUSDImage2', AUDUSDImage);
    updateImage('.GOLDImage1', GOLDImage);
    updateImage('.GOLDImage2', GOLDImage);
    updateImage('.SILVERImage1', SILVERImage);
    updateImage('.SILVERImage2', SILVERImage);

    // Hide/show containers based on cookie
    const token = getCookie('apiToken');
    const inputGroup = document.querySelector('.input-group');
    const fetchContainer = document.querySelector('.fetch-container');
    const helpContainer = document.querySelector('.helpContainer');
    const assetContainer = document.querySelector('.asset-container');

    let dev = 1;
    if (dev === 1) {
        inputGroup.style.display = 'flex';
        helpContainer.style.display = 'flex';
        fetchContainer.style.display = 'flex';
        assetContainer.style.display = 'flex';
    } else {
        if (!token) {
            fetchContainer.style.display = 'none';
            assetContainer.style.display = 'none';
            inputGroup.style.display = 'flex';
            helpContainer.style.display = 'flex';
        } else {
            inputGroup.style.display = 'none';
            helpContainer.style.display = 'none';
            fetchContainer.style.display = 'flex';
            assetContainer.style.display = 'flex';
        }
    }


    // function checkWindowSize() {
    //     if (window.innerWidth < 1000) {
    //         document.getElementById("warningMessage").style.display = "inline";
    //     } else {
    //         document.getElementById("warningMessage").style.display = "none";
    //     }
    // }

    // checkWindowSize();
    // window.onresize = checkWindowSize;
});

function setdev() {
    const inputGroup = document.querySelector('.input-group');
    const fetchContainer = document.querySelector('.fetch-container');
    const helpContainer = document.querySelector('.helpContainer');
    const assetContainer = document.querySelector('.asset-container');
    inputGroup.style.display = 'flex';
    helpContainer.style.display = 'flex';
    fetchContainer.style.display = 'flex';
    assetContainer.style.display = 'flex';
}

function fadeIn(element, callback = () => { }) {
    element.style.opacity = 0;
    element.style.display = 'flex';
    setTimeout(() => {
        element.style.transition = 'opacity 1s';
        element.style.opacity = 1;
        setTimeout(callback, 1000);
    }, 10);
}

function fadeOut(element, callback = () => { }) {
    element.style.transition = 'opacity 1s';
    element.style.opacity = 0;
    setTimeout(() => {
        element.style.display = 'none';
        callback();
    }, 1000);
}

function saveToken() {
    const tokenInput = document.getElementById('tokenInput');
    const token = tokenInput.value;
    const fetchContainer = document.querySelector('.fetch-container');
    const helpContainer = document.querySelector('.helpContainer');
    const inputGroup = document.querySelector('.input-group');
    const successMessage = document.getElementById('successMessage');
    const assetContainer = document.querySelector('.asset-container');

    if (!token) return;
    if (token.length < 2) {
        tokenInput.value = "";
        tokenInput.placeholder = "Token too short, please enter a valid token";
        return;
    }

    document.cookie = `apiToken=${token};path=/`;

    fadeOut(inputGroup, () => {
        tokenInput.value = '';
        successMessage.style.display = 'block';
        fadeIn(successMessage, () => {
            setTimeout(() => {
                fadeOut(successMessage, () => {
                    fetchContainer.style.opacity = 0;

                    fadeIn(fetchContainer);
                    fadeIn(assetContainer);
                });
                fadeOut(helpContainer);
            }, 2000);
        });
    });

    fetchContainer.style.display = 'none';
}


function fetchCombinedData() {
    const token = getCookie('apiToken');

    return Promise.all([
        fetch('https://dev-api.ainsliebullion.com.au/assets/pricelist', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        }),
        fetch('https://dev-api.ainsliebullion.com.au/spot/GetClosestTimestamp', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        }),
    ])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(([priceListData, historicalData]) => {
            priceSheetCalcs(priceListData, historicalData);
            console.log(priceListData, historicalData);
            fadeIn(refreshedMessage, () => {
                setTimeout(() => {
                    fadeOut(refreshedMessage);
                }, 2000);
            });
            console.log(priceListData, historicalData);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function priceSheetCalcs(priceListData, historicalData) {
    let goldSpotAU = 0;
    let silverSpotAU = 0;
    let goldSpotUS = 0;
    let silverSpotUS = 0;
    let audPrice = 0;
    let goldOldSpotAU = 0;
    let silverOldSpotAU = 0;
    
    let AUSSpotUS = 0;
    let AUSSpotAU = 0;
    let AUSOldSpotAU = 0;
    let AGSSpotUS = 0;
    let AGSSpotAU = 0;
    let AGSOldSpotAU = 0;
    let BTCSpotUS = 0;
    let BTCSpotAU = 0;
    let BTCOldSpotAU = 0;
    let ETHSpotUS = 0;
    let ETHSpotAU = 0;
    let ETHOldSpotAU = 0;
    

    if (priceListData && Array.isArray(priceListData)) {
        priceListData.forEach(item => {
            if (item.assetCode === "XAU") {
                audPrice = item.audusd;
                goldSpotAU = item.spot;
                goldSpotUS = item.spot / item.audusd;
            } else if (item.assetCode === "XAG") {
                silverSpotAU = item.spot;
                silverSpotUS = item.spot / item.audusd;
            } else if (item.assetCode === "AUS") {
                AUSSpotAU = item.spot;
                AUSSpotUS = item.spot / item.audusd;
            } else if (item.assetCode === "AGS") {
                AGSSpotAU = item.spot;
                AGSSpotUS = item.spot / item.audusd;
            } else if (item.assetCode === "BTC") {
                BTCSpotAU = item.spot;
                BTCSpotUS = item.spot / item.audusd;
            } else if (item.assetCode === "ETH") {
                ETHSpotAU = item.spot;
                ETHSpotUS = item.spot / item.audusd;
            }
        });
    }

    if (historicalData && Array.isArray(historicalData)) {
        historicalData.forEach(item => {
            if (item.assetCode === "XAU") {
                goldOldSpotAU = item.spot;
            } else if (item.assetCode === "XAG") {
                silverOldSpotAU = item.spot;
            } else if (item.assetCode === "AUS") {
                AUSOldSpotAU = item.spot;
            } else if (item.assetCode === "AGS") {
                AGSOldSpotAU = item.spot;
            } else if (item.assetCode === "BTC") {
                BTCOldSpotAU = item.spot;
            } else if (item.assetCode === "ETH") {
                ETHOldSpotAU =item.spot;
            }
        })
    }

    console.log(AUSSpotUS);
    console.log(AUSSpotAU);
    console.log(AUSOldSpotAU);
    console.log(AGSSpotUS);
    console.log(AGSSpotAU);
    console.log(AGSOldSpotAU);
    console.log(BTCSpotUS);
    console.log(BTCSpotAU);
    console.log(BTCOldSpotAU);
    console.log(ETHSpotUS);
    console.log(ETHSpotAU);
    console.log(ETHOldSpotAU);

    const goldChangeAU = goldSpotAU - goldOldSpotAU;
    const silverChangeAU = silverSpotAU - silverOldSpotAU;
    const goldChangeUS = (goldSpotUS * audPrice) - goldOldSpotAU;
    const silverChangeUS = (silverSpotUS * audPrice) - silverOldSpotAU;
    const goldChangeAUpc = (goldChangeAU / goldOldSpotAU) * 100;
    const silverChangeAUpc = (silverChangeAU / silverOldSpotAU) * 100;
    const goldChangeUSpc = (goldChangeUS / (goldOldSpotAU / audPrice)) * 100;
    const silverChangeUSpc = (silverChangeUS / (silverOldSpotAU / audPrice)) * 100;
    const GSR = goldSpotAU / silverSpotAU;

    console.log("goldChangeAU ", goldChangeAU);
    console.log("silverChangeAU ", silverChangeAU);
    console.log("goldChangeUS ", goldChangeUS);
    console.log("silverChangeUS ", silverChangeUS);
    console.log("goldChangeAUpc ", goldChangeAUpc);
    console.log("silverChangeAUpc ", silverChangeAUpc);
    console.log("goldChangeUSpc ", goldChangeUSpc);
    console.log("silverChangeUSpc ", silverChangeUSpc);

    document.querySelector(".gold-silver-ratio-b").textContent = `${GSR.toFixed(2)}`;
    document.querySelector(".aud-usd-rate-b").textContent = `${audPrice.toFixed(4)}`;

    updatePrices('gold', 'b', goldSpotUS, goldChangeUS, goldChangeUSpc, goldSpotAU, goldChangeAU, goldChangeAUpc);
    updatePrices('silver', 'b', silverSpotUS, silverChangeUS, silverChangeUSpc, silverSpotAU, silverChangeAU, silverChangeAUpc);
    updatePrices('aus', 'd', AUSSpotUS, silverChangeUS, silverChangeUSpc, AUSSpotAU, silverChangeAU, silverChangeAUpc);


    function updatePrices(metalType, suffix, spotPriceUS, changeUS, changeUSpc, spotPriceAU, changeAU, changeAUpc) {
        const directionUS = changeUS > 0 ? upArrow : changeUS < 0 ? dnArrow : "No Change";
        const directionAU = changeAU > 0 ? upArrow : changeAU < 0 ? dnArrow : "No Change";
    
        // Update US Price
        document.querySelector(`.${metalType}-price-us-${suffix}`).textContent = `US$${spotPriceUS.toFixed(2)}`;
        // Update US Change Direction and Percentage
        document.querySelector(`.${metalType}-dir-us-${suffix}`).innerHTML = `<img height="20" width="20" src="${directionUS}">`;
        document.querySelector(`.${metalType}-change-us-${suffix}`).textContent = `US$${Math.abs(changeUS.toFixed(2))} / ${Math.abs(changeUSpc.toFixed(2))}%`;
        // Update AU Price
        document.querySelector(`.${metalType}-price-au-${suffix}`).textContent = `AU$${spotPriceAU.toFixed(2)}`;
        // Update AU Change Direction and Percentage
        document.querySelector(`.${metalType}-dir-au-${suffix}`).innerHTML = `<img height="20" width="20" src="${directionAU}">`;
        document.querySelector(`.${metalType}-change-au-${suffix}`).textContent = `AU$${Math.abs(changeAU.toFixed(2))} / ${Math.abs(changeAUpc.toFixed(2))}%`;
    }
}

function displayPriceList(data) {
    const priceListDiv = document.getElementById('price-list');
    let html = '<ul>';

    if (data && Array.isArray(data)) {
        data.forEach(item => {
            html += `<li>${item.assetName}: $${item.spot}</li>`;
        });
    } else {
        html += '<li>No data found</li>';
    }

    html += '</ul>';
    priceListDiv.innerHTML = html;
}


function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function CopyFunction(sectionId) {
    const contentToCopy = document.getElementById(sectionId);
    const copyMessage = document.getElementById('copyMessage');

    if (window.getSelection && document.createRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();

        const range = document.createRange();
        range.selectNodeContents(contentToCopy);
        selection.addRange(range);

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Content copied successfully!');
                fadeIn(copyMessage, () => {
                    setTimeout(() => {
                        fadeOut(copyMessage);
                    }, 2000);
                });
            } else {
                console.error('Copy command was unsuccessful');
            }
        } catch (err) {
            console.error('Failed to copy content: ', err);
        }

        selection.removeAllRanges();
    } else {
        console.error('Your browser does not support this copy method.');
    }
}
