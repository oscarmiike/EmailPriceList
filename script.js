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
            document.getElementById('price-list').innerHTML = '<p style="margin-left: 20px;">Error loading price list.</p>';
        });
}

function priceSheetCalcs(priceListData, historicalData) {
    let goldSpotPriceAU = 0;
    let silverSpotPriceAU = 0;
    let goldSpotPriceUS = 0;
    let silverSpotPriceUS = 0;
    let audPrice = 0;
    let goldOldSpotAU = 0;
    let silverOldSpotAU = 0;

    if (priceListData && Array.isArray(priceListData)) {
        priceListData.forEach(item => {
            if (item.assetName === "Gold") {
                audPrice = item.audusd;
                goldSpotPriceAU = item.spot;
                goldSpotPriceUS = item.spot / item.audusd;
            } else if (item.assetName === "Silver") {
                silverSpotPriceAU = item.spot;
                silverSpotPriceUS = item.spot / item.audusd;
            }
        });
    }

    if (historicalData && Array.isArray(historicalData)) {
        historicalData.forEach(item => {
            if (item.assetCode === "XAU") {
                goldOldSpotAU = item.spot;
            } else if (item.assetCode === "XAG") {
                silverOldSpotAU = item.spot;
            }
        })
    }

    const goldChangeAU = goldSpotPriceAU - goldOldSpotAU;
    const silverChangeAU = silverSpotPriceAU - silverOldSpotAU;
    const goldChangeUS = (goldSpotPriceUS * audPrice) - goldOldSpotAU;
    const silverChangeUS = (silverSpotPriceUS * audPrice) - silverOldSpotAU;
    const goldChangeAUpc = (goldChangeAU / goldOldSpotAU) * 100;
    const silverChangeAUpc = (silverChangeAU / silverOldSpotAU) * 100;
    const goldChangeUSpc = (goldChangeUS / (goldOldSpotAU / audPrice)) * 100;
    const silverChangeUSpc = (silverChangeUS / (silverOldSpotAU / audPrice)) * 100;

    console.log("goldChangeAU ", goldChangeAU);
    console.log("silverChangeAU ", silverChangeAU);
    console.log("goldChangeUS ", goldChangeUS);
    console.log("silverChangeUS ", silverChangeUS);
    console.log("goldChangeAUpc ", goldChangeAUpc);
    console.log("silverChangeAUpc ", silverChangeAUpc);
    console.log("goldChangeUSpc ", goldChangeUSpc);
    console.log("silverChangeUSpc ", silverChangeUSpc);

    const GSR = goldSpotPriceAU / silverSpotPriceAU;

    document.querySelector(".gold-silver-ratio-bullion").textContent = `${GSR.toFixed(2)}`;
    document.querySelector(".aud-usd-rate-bullion").textContent = `${audPrice.toFixed(4)}`;
    document.querySelector(".gold-price-bullion").textContent = `$${goldSpotPriceUS.toFixed(2)}`;
    document.querySelector(".silver-price-bullion").textContent = `$${silverSpotPriceUS.toFixed(2)}`;


    updatePriceChangeElement(".gold-change-bullion", goldSpotPriceUS, goldChangeUS, goldChangeUSpc, goldSpotPriceAU, goldChangeAU, goldChangeAUpc);
    updatePriceChangeElement(".silver-change-bullion", silverSpotPriceUS, silverChangeUS, silverChangeUSpc, silverSpotPriceAU, silverChangeAU, silverChangeAUpc);

    function updatePriceChangeElement(selector, spotPriceUS, changeUS, changeUSpc, spotPriceAU, changeAU, changeAUpc) {
        const element = document.querySelector(selector);

        // Round changes to two decimals
        const roundedChangeUS = parseFloat(changeUS.toFixed(2));
        const roundedChangeAU = parseFloat(changeAU.toFixed(2));
        const roundedChangeUSpc = parseFloat(changeUSpc.toFixed(2));
        const roundedChangeAUpc = parseFloat(changeAUpc.toFixed(2));

        const directionUS = roundedChangeUS > 0 ? upArrow : roundedChangeUS < 0 ? dnArrow : "-";
        const directionAU = roundedChangeAU > 0 ? upArrow : roundedChangeAU < 0 ? dnArrow : "-";
        const classToAdd = roundedChangeUS === 0 && roundedChangeAU === 0 ? "no-change" : roundedChangeUS > 0 || roundedChangeAU > 0 ? "positive-change" : "negative-change";

        element.classList.remove("positive-change", "negative-change", "no-change");

        element.classList.add(classToAdd);

        const changeTextUS = directionUS === "-" ? " (-)" : `   <img height="20" width="20" src="${directionUS}" /> US$${Math.abs(roundedChangeUS)} / ${Math.abs(roundedChangeUSpc)}%`;
        const changeTextAU = directionAU === "-" ? " (-)" : `   <img height="20" width="20" src="${directionAU}" /> AU$${Math.abs(roundedChangeAU)} / ${Math.abs(roundedChangeAUpc)}%`;

        element.innerHTML = `$${spotPriceUS.toFixed(2)}${changeTextUS} AU$${spotPriceAU.toFixed(2)}${changeTextAU}`;
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
