// global variables for price calcs
let audPrice = 0, audOldPrice = 0, usdPrice = 0, usdOldPrice = 0, xauSpotAU = 0, xagSpotAU = 0, ausSpotAU = 0, agsSpotAU = 0, btcSpotAU = 0, ethSpotAU = 0, xauSpotUS = 0, xagSpotUS = 0, ausSpotUS = 0, agsSpotUS = 0, btcSpotUS = 0, ethSpotUS = 0, xauOldSpotAU = 0, xagOldSpotAU = 0, ausOldSpotAU = 0, agsOldSpotAU = 0, btcOldSpotAU = 0, ethOldSpotAU = 0, xauOldSpotUS = 0, xagOldSpotUS = 0, ausOldSpotUS = 0, agsOldSpotUS = 0, btcOldSpotUS = 0, ethOldSpotUS = 0;

document.addEventListener('DOMContentLoaded', function () {

    // Load all the base64 images
    function addImage(className, image, h, w) {
        const elements = document.querySelectorAll(className);
        elements.forEach(element => {
            element.innerHTML = `<img height='${h}' width='${w}' src='${image}'>`;
        });
    }

    addImage('.GSRImage', GSRImage, '29', '140');
    addImage('.AUDUSDImage', AUDUSDImage, '29', '140');
    addImage('.GOLDImage', GOLDImage, '29', '140');
    addImage('.SILVERImage', SILVERImage, '29', '140');
    addImage('.AUImage', AUImage, '30', '30');
    addImage('.AGImage', AGImage, '30', '30');
    addImage('.BTCImage', BTCImage, '30', '30');
    addImage('.ETHImage', ETHImage, '30', '30');



    // Hide/show containers based on cookie
    const token = getCookie('apiToken');
    const inputGroup = document.querySelector('.input-group');
    const fetchContainer = document.querySelector('.fetch-container');
    const helpContainer = document.querySelector('.helpContainer');
    const assetContainer = document.querySelector('.asset-container');

    let dev = 0;
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function fetchCombinedData() {
    const token = getCookie('apiToken');
    const loader = document.querySelector('.lds-grid');
    let loaderTimeout = setTimeout(() => {
        loader.classList.add('fade-in');
        loader.classList.remove('fade-out');
        loader.style.display = 'inline-block';
    }, 1000); // Delay loader display

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
        delay(3000)
    ])
        //.then(responses => Promise.all(responses.map(response => response.json())))
        .then(responses => Promise.all(responses.slice(0, -1).map(response => response.json())))
        .then(([priceListData, historicalData]) => {
            clearTimeout(loaderTimeout); // Prevent loader from showing if data is returned within 50ms
            priceSheetCalcs(priceListData, historicalData);
            // Ensure loader fades out if it was displayed
            if (loader.style.display !== 'none') {
                loader.classList.add('fade-out');
                loader.classList.remove('fade-in');
                setTimeout(() => {
                    loader.style.display = 'none';
                    // Show refreshMessage after loader has disappeared
                    fadeIn(refreshedMessage, () => {
                        setTimeout(() => {
                            fadeOut(refreshedMessage);
                        }, 2000);
                    });
                }, 500); // Match the fade-out duration
            } else {
                // Show refreshMessage immediately if loader was never displayed
                fadeIn(refreshedMessage, () => {
                    setTimeout(() => {
                        fadeOut(refreshedMessage);
                    }, 2000);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            clearTimeout(loaderTimeout); // Clear loader display timeout on error
        });
}


function priceSheetCalcs(priceListData, historicalData) {

    // get current USDT price
    if (priceListData && Array.isArray(priceListData)) {
        priceListData.forEach(item => {
            if (item.assetCode === "USDT") {
                usdPrice = item.spot;
            }
        });
    }

    // get current price for other assets
    if (priceListData && Array.isArray(priceListData)) {
        priceListData.forEach(item => {
            if (item.assetCode === "XAU") {
                audPrice = item.audusd;
                xauSpotAU = item.spot;
                xauSpotUS = item.spot / usdPrice;
            } else if (item.assetCode === "XAG") {
                xagSpotAU = item.spot;
                xagSpotUS = item.spot / usdPrice;
            } else if (item.assetCode === "AUS") {
                ausSpotAU = item.spot;
                ausSpotUS = item.spot / usdPrice;
            } else if (item.assetCode === "AGS") {
                agsSpotAU = item.spot;
                agsSpotUS = item.spot / usdPrice;
            } else if (item.assetCode === "BTC") {
                btcSpotAU = item.spot;
                btcSpotUS = item.spot / usdPrice;
            } else if (item.assetCode === "ETH") {
                ethSpotAU = item.spot;
                ethSpotUS = item.spot / usdPrice;
            }
        });
    }

    // get historical USDT and AUD price
    if (historicalData && Array.isArray(historicalData)) {
        historicalData.forEach(item => {
            if (item.assetCode === "USDT") {
                usdOldPrice = item.spot;
            } else if (item.assetCode === "AUD") {
                audOldPrice = item.spot;
            }
        })
    }

    // get historical price for other assets
    if (historicalData && Array.isArray(historicalData)) {
        historicalData.forEach(item => {
            if (item.assetCode === "XAU") {
                xauOldSpotAU = item.spot;
                xauOldSpotUS = item.spot / usdOldPrice;
            } else if (item.assetCode === "XAG") {
                xagOldSpotAU = item.spot;
                xagOldSpotUS = item.spot / usdOldPrice;
            } else if (item.assetCode === "AUS") {
                ausOldSpotAU = item.spot;
                ausOldSpotUS = item.spot / usdOldPrice;
            } else if (item.assetCode === "AGS") {
                agsOldSpotAU = item.spot;
                agsOldSpotUS = item.spot / usdOldPrice;
            } else if (item.assetCode === "BTC") {
                btcOldSpotAU = item.spot * usdOldPrice;
                btcOldSpotUS = item.spot;
            } else if (item.assetCode === "ETH") {
                ethOldSpotAU = item.spot * usdOldPrice;
                ethOldSpotUS = item.spot;
            }
        })
    }

    console.log("audPrice: ", audPrice);
    console.log("audOldPrice: ", audOldPrice);
    console.log("usdPrice: ", usdPrice);
    console.log("usdOldPrice: ", usdOldPrice);
    console.log("xauSpotAU: ", xauSpotAU);
    console.log("xagSpotAU: ", xagSpotAU);
    console.log("xauSpotUS: ", xauSpotUS);
    console.log("xagSpotUS: ", xagSpotUS);
    console.log("xauOldSpotAU: ", xauOldSpotAU);
    console.log("xagOldSpotAU: ", xagOldSpotAU);
    console.log("xauOldSpotUS: ", xauOldSpotUS);
    console.log("xagOldSpotUS: ", xagOldSpotUS);
    console.log("ausSpotUS: ", ausSpotUS);
    console.log("ausSpotAU: ", ausSpotAU);
    console.log("ausOldSpotAU: ", ausOldSpotAU);
    console.log("ausOldSpotUS: ", ausOldSpotUS);
    console.log("agsSpotUS: ", agsSpotUS);
    console.log("agsSpotAU: ", agsSpotAU);
    console.log("agsOldSpotAU: ", agsOldSpotAU);
    console.log("agsOldSpotUS: ", agsOldSpotUS);
    console.log("btcSpotUS: ", btcSpotUS);
    console.log("btcSpotAU: ", btcSpotAU);
    console.log("btcOldSpotAU: ", btcOldSpotAU);
    console.log("btcOldSpotUS: ", btcOldSpotUS);
    console.log("ethSpotUS: ", ethSpotUS);
    console.log("ethSpotAU: ", ethSpotAU);
    console.log("ethOldSpotAU: ", ethOldSpotAU);
    console.log("ethOldSpotUS: ", ethOldSpotUS);

    // helper function to calculate $ and % change
    function calculateChanges(spotPriceAU, oldSpotPriceAU, spotPriceUS, oldSpotPriceUS) {
        const changeAU = spotPriceAU - oldSpotPriceAU;
        const changeUS = spotPriceUS - oldSpotPriceUS;
        const changeAUpc = (changeAU / oldSpotPriceAU) * 100;
        const changeUSpc = (changeUS / oldSpotPriceUS) * 100;

        return { changeAU, changeUS, changeAUpc, changeUSpc };
    }

    // get $ and % change
    const GSR = xauSpotAU / xagSpotAU;
    const xauDeltas = calculateChanges(xauSpotAU, xauOldSpotAU, xauSpotUS, xauOldSpotUS);
    const xagDeltas = calculateChanges(xagSpotAU, xagOldSpotAU, xagSpotUS, xagOldSpotUS);
    const ausDeltas = calculateChanges(ausSpotAU, ausOldSpotAU, ausSpotUS, ausOldSpotUS);
    const agsDeltas = calculateChanges(agsSpotAU, agsOldSpotAU, agsSpotUS, agsOldSpotUS);
    const btcDeltas = calculateChanges(btcSpotAU, btcOldSpotAU, btcSpotUS, btcOldSpotUS);
    const ethDeltas = calculateChanges(ethSpotAU, ethOldSpotAU, ethSpotUS, ethOldSpotUS);

    console.log("xauDeltas: ", xauDeltas);
    console.log("xagDeltas: ", xagDeltas);
    console.log("ausDeltas: ", ausDeltas);
    console.log("agsDeltas: ", agsDeltas);
    console.log("btcDeltas: ", btcDeltas);
    console.log("ethDeltas: ", ethDeltas);

    // set gsr and aud rate
    document.querySelector(".gold-silver-ratio-b").textContent = `${GSR.toFixed(2)}`;
    document.querySelector(".aud-usd-rate-b").textContent = `${audPrice.toFixed(4)}`;

    // update all the table classes with prices
    updatePrices('gold', 'b', xauSpotUS, xauDeltas.changeUS, xauDeltas.changeUSpc, xauSpotAU, xauDeltas.changeAU, xauDeltas.changeAUpc);
    updatePrices('silver', 'b', xagSpotUS, xagDeltas.changeUS, xagDeltas.changeUSpc, xagSpotAU, xagDeltas.changeAU, xagDeltas.changeAUpc);
    updatePrices('aus', 'd', ausSpotUS, ausDeltas.changeUS, ausDeltas.changeUSpc, ausSpotAU, ausDeltas.changeAU, ausDeltas.changeAUpc);
    updatePrices('ags', 'd', agsSpotUS, agsDeltas.changeUS, agsDeltas.changeUSpc, agsSpotAU, agsDeltas.changeAU, agsDeltas.changeAUpc);
    updatePrices('btc', 'd', btcSpotUS, btcDeltas.changeUS, btcDeltas.changeUSpc, btcSpotAU, btcDeltas.changeAU, btcDeltas.changeAUpc);
    updatePrices('eth', 'd', ethSpotUS, ethDeltas.changeUS, ethDeltas.changeUSpc, ethSpotAU, ethDeltas.changeAU, ethDeltas.changeAUpc);

    // helper function to update correct classes based on asset type
    function updatePrices(metalType, suffix, spotPriceUS, changeUS, changeUSpc, spotPriceAU, changeAU, changeAUpc) {

        let currency = new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
        });

        const directionUS = changeUS > 0 ? upArrow : changeUS < 0 ? dnArrow : "No Change";
        const directionAU = changeAU > 0 ? upArrow : changeAU < 0 ? dnArrow : "No Change";

        // Update US Price
        document.querySelector(`.${metalType}-price-us-${suffix}`).textContent = `US ${currency.format(spotPriceUS.toFixed(2))}`;
        // Update US Change Direction and Percentage
        document.querySelector(`.${metalType}-dir-us-${suffix}`).innerHTML = `<img height="20" width="20" src="${directionUS}">`;
        document.querySelector(`.${metalType}-change-us-${suffix}`).textContent = `US ${currency.format(changeUS.toFixed(2))} | ${(changeUSpc.toFixed(2))}%`;
        // Update AU Price
        document.querySelector(`.${metalType}-price-au-${suffix}`).textContent = `AU ${currency.format(spotPriceAU.toFixed(2))}`;
        // Update AU Change Direction and Percentage
        document.querySelector(`.${metalType}-dir-au-${suffix}`).innerHTML = `<img height="20" width="20" src="${directionAU}">`;
        document.querySelector(`.${metalType}-change-au-${suffix}`).textContent = `AU ${currency.format(changeAU.toFixed(2))} | ${(changeAUpc.toFixed(2))}%`;
    }
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
