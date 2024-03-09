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
    let audPrice = 0;
    let audOldPrice = 0;
    let usdPrice = 0;
    let usdOldPrice = 0;
    let xauSpotAU = 0;
    let xagSpotAU = 0;
    let xauSpotUS = 0;
    let xagSpotUS = 0;
    let xauOldSpotAU = 0;
    let xagOldSpotAU = 0;
    let xauOldSpotUS = 0;
    let xagOldSpotUS = 0;
    let ausSpotUS = 0;
    let ausSpotAU = 0;
    let ausOldSpotAU = 0;
    let ausOldSpotUS = 0;
    let agsSpotUS = 0;
    let agsSpotAU = 0;
    let agsOldSpotAU = 0;
    let agsOldSpotUS = 0;
    let btcSpotUS = 0;
    let btcSpotAU = 0;
    let btcOldSpotAU = 0;
    let btcOldSpotUS = 0;
    let ethSpotUS = 0;
    let ethSpotAU = 0;
    let ethOldSpotAU = 0;
    let ethOldSpotUS = 0;

    if (priceListData && Array.isArray(priceListData)) {
        priceListData.forEach(item => {
            if (item.assetCode === "USDT") {
                usdPrice = item.spot;
            } else if (item.assetCode === "XAU") {
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

    if (historicalData && Array.isArray(historicalData)) {
        historicalData.forEach(item => {
            if (item.assetCode === "USDT") {
                usdOldPrice = item.spot;
            } else if (item.assetCode === "AUD") {
                audOldPrice = item.spot;
            } else if (item.assetCode === "XAU") {
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
                agsOldSpotAU = item.spot;
                btcOldSpotUS = item.spot / usdOldPrice;
            } else if (item.assetCode === "ETH") {
                ethOldSpotAU = item.spot;
                ethOldSpotUS = item.spot / usdOldPrice;
            }
        })
    }

    console.log("audPrice: ", audPrice);
    console.log("audOldPrice: ", audOldPrice);
    console.log("usdPrice: ", usdPrice);
    console.log("oldUsdPrice: ", usdOldPrice);
    console.log("xauSpotAU: ", xauSpotAU);
    console.log("xagSpotAU: ", xagSpotAU);
    console.log("xauSpotUS: ", xauSpotUS);
    console.log("xagSpotUS: ", xagSpotUS);
    console.log("xauOldSpotAU: ", xauOldSpotAU);
    console.log("xagOldSpotAU: ", xagOldSpotAU);
    console.log("ausSpotUS: ", ausSpotUS);
    console.log("ausSpotAU: ", ausSpotAU);
    console.log("ausOldSpotAU: ", ausOldSpotAU);
    console.log("agsSpotUS: ", agsSpotUS);
    console.log("agsSpotAU: ", agsSpotAU);
    console.log("agsOldSpotAU: ", agsOldSpotAU);
    console.log("btcSpotUS: ", btcSpotUS);
    console.log("btcSpotAU: ", btcSpotAU);
    console.log("btcOldSpotAU: ", btcOldSpotAU);
    console.log("ethSpotUS: ", ethSpotUS);
    console.log("ethSpotAU: ", ethSpotAU);
    console.log("ethOldSpotAU: ", ethOldSpotAU);

    function calculateChanges(spotPriceAU, oldSpotPriceAU, spotPriceUS, oldSpotPriceUS, audPrice, usdPrice, audOldPrice, usdOldPrice) {
        const changeAU = spotPriceAU - oldSpotPriceAU;
        const changeUS = spotPriceUS - oldSpotPriceUS;
        const changeAUpc = (changeAU / oldSpotPriceAU) * 100;
        const changeUSpc = (changeUS / oldSpotPriceUS) * 100;

        return { changeAU, changeUS, changeAUpc, changeUSpc };
    }

    const GSR = xauSpotAU / xagSpotAU;
    const xauDelta = calculateChanges(xauSpotAU, xauOldSpotAU, xauSpotUS, audPrice, usdPrice, audOldPrice, usdOldPrice);
    const xagDelta = calculateChanges(xagSpotAU, xagOldSpotAU, xagSpotUS, audPrice, usdPrice, audOldPrice, usdOldPrice);
    const ausDelta = calculateChanges(ausSpotAU, ausOldSpotAU, ausSpotUS, audPrice, usdPrice, audOldPrice, usdOldPrice);
    const agsDelta = calculateChanges(agsSpotAU, agsOldSpotAU, agsSpotUS, audPrice, usdPrice, audOldPrice, usdOldPrice);
    const btcDelta = calculateChanges(btcSpotAU, btcOldSpotAU, btcSpotUS, audPrice, usdPrice, audOldPrice, usdOldPrice);
    const ethDelta = calculateChanges(ethSpotAU, ethOldSpotAU, ethSpotUS, audPrice, usdPrice, audOldPrice, usdOldPrice);

    console.log("xauDelta: ", xauDelta);
    console.log("xagDelta: ", xagDelta);
    console.log("ausDelta: ", ausDelta);
    console.log("agsDelta: ", agsDelta);
    console.log("btcDelta: ", btcDelta);
    console.log("ethDelta: ", ethDelta);

    document.querySelector(".gold-silver-ratio-b").textContent = `${GSR.toFixed(2)}`;
    document.querySelector(".aud-usd-rate-b").textContent = `${audPrice.toFixed(4)}`;

    updatePrices('gold', 'b', xauSpotUS, xauDelta.changeUS, xauDelta.changeUSpc, xauSpotAU, xauDelta.changeAU, xauDelta.changeAUpc);
    updatePrices('silver', 'b', xagSpotUS, xagDelta.changeUS, xagDelta.changeUSpc, xagSpotAU, xagDelta.changeAU, xagDelta.changeAUpc);
    updatePrices('aus', 'd', ausSpotUS, ausDelta.changeUS, ausDelta.changeUSpc, ausSpotAU, ausDelta.changeAU, ausDelta.changeAUpc);
    updatePrices('ags', 'd', agsSpotUS, agsDelta.changeUS, agsDelta.changeUSpc, agsSpotAU, agsDelta.changeAU, agsDelta.changeAUpc);
    updatePrices('btc', 'd', btcSpotUS, btcDelta.changeUS, btcDelta.changeUSpc, btcSpotAU, btcDelta.changeAU, btcDelta.changeAUpc);
    updatePrices('eth', 'd', ethSpotUS, ethDelta.changeUS, ethDelta.changeUSpc, ethSpotAU, ethDelta.changeAU, ethDelta.changeAUpc);

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
        document.querySelector(`.${metalType}-change-us-${suffix}`).textContent = `US ${currency.format(changeUS.toFixed(2))} / ${(changeUSpc.toFixed(2))}%`;
        // Update AU Price
        document.querySelector(`.${metalType}-price-au-${suffix}`).textContent = `AU ${currency.format(spotPriceAU.toFixed(2))}`;
        // Update AU Change Direction and Percentage
        document.querySelector(`.${metalType}-dir-au-${suffix}`).innerHTML = `<img height="20" width="20" src="${directionAU}">`;
        document.querySelector(`.${metalType}-change-au-${suffix}`).textContent = `AU ${currency.format(changeAU.toFixed(2))} / ${(changeAUpc.toFixed(2))}%`;
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
