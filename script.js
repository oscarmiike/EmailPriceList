document.addEventListener('DOMContentLoaded', function () {
    const token = getCookie('apiToken');
    const inputGroup = document.querySelector('.input-group');
    const fetchContainer = document.querySelector('.fetch-container');
    const helpContainer = document.querySelector('.helpContainer');
    const assetContainer = document.querySelector('.asset-container');

    const dev = 1;

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
    document.querySelector(".gold-price-bullion").textContent = `$${goldSpotPriceUS.toFixed(2)} (Up US$${goldChangeUS.toFixed(2)} / ${goldChangeUSpc.toFixed(2)}%) AU$${goldSpotPriceAU.toFixed(2)} (Up AU$${goldChangeAU.toFixed(2)} / ${goldChangeAUpc.toFixed(2)}%)`;
    document.querySelector(".silver-price-bullion").textContent = `$${silverSpotPriceUS.toFixed(2)} (Up US$${silverChangeUS.toFixed(2)} / ${silverChangeUSpc.toFixed(2)}%) AU$${silverSpotPriceAU.toFixed(2)} (Up AU$${silverChangeAU.toFixed(2)} / ${silverChangeAUpc.toFixed(2)}%)`;


    updatePriceChangeElement(".gold-price-bullion", goldSpotPriceUS, goldChangeUS, goldChangeUSpc, goldSpotPriceAU, goldChangeAU, goldChangeAUpc);
    updatePriceChangeElement(".silver-price-bullion", silverSpotPriceUS, silverChangeUS, silverChangeUSpc, silverSpotPriceAU, silverChangeAU, silverChangeAUpc);

    function updatePriceChangeElement(selector, spotPriceUS, changeUS, changeUSpc, spotPriceAU, changeAU, changeAUpc) {
        const element = document.querySelector(selector);
        // base64 images up/down arrow
        const base64ImageUp = 'data:image/svg+xml;base64,77u/PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8cGF0aCBkPSJNMTQuOTI4NSA1LjVIMjEuMjE0MlYxMS43ODU3IiBzdHJva2U9IiM2MjdFNzciIHN0cm9rZS13aWR0aD0iMS41NzE0MyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPg0KCTxwYXRoIGQ9Ik0yMS4yMTQyIDUuNUwxMi4zMzU2IDE0LjM3ODZDMTIuMTg4OCAxNC41MjI1IDExLjk5MTMgMTQuNjAzMiAxMS43ODU2IDE0LjYwMzJDMTEuNTggMTQuNjAzMiAxMS4zODI1IDE0LjUyMjUgMTEuMjM1NiAxNC4zNzg2TDcuNjIxMzYgMTAuNzY0M0M3LjQ3NDQ5IDEwLjYyMDMgNy4yNzcwMiAxMC41Mzk3IDcuMDcxMzYgMTAuNTM5N0M2Ljg2NTcgMTAuNTM5NyA2LjY2ODIzIDEwLjYyMDMgNi41MjEzNiAxMC43NjQzTDAuNzg1NjQ1IDE2LjUiIHN0cm9rZT0iIzYyN0U3NyIgc3Ryb2tlLXdpZHRoPSIxLjU3MTQzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIC8+DQo8L3N2Zz4=';
        const base64ImageDown = 'data:image/svg+xml;base64,77u/PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8cGF0aCBkPSJNMTQuOTI4NSAxNi41MDAxSDIxLjIxNDJWMTAuMjE0NCIgc3Ryb2tlPSIjQzg2ODY4IiBzdHJva2Utd2lkdGg9IjEuNTcxNDMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KCTxwYXRoIGQ9Ik0yMS4yMTQyIDE2LjVMMTIuMzM1NiA3LjYyMTQzQzEyLjE4ODggNy40Nzc0NiAxMS45OTEzIDcuMzk2ODMgMTEuNzg1NiA3LjM5NjgzQzExLjU4IDcuMzk2ODMgMTEuMzgyNSA3LjQ3NzQ2IDExLjIzNTYgNy42MjE0M0w3LjYyMTM2IDExLjIzNTdDNy40NzQ0OSAxMS4zNzk3IDcuMjc3MDIgMTEuNDYwMyA3LjA3MTM2IDExLjQ2MDNDNi44NjU3IDExLjQ2MDMgNi42NjgyMyAxMS4zNzk3IDYuNTIxMzYgMTEuMjM1N0wwLjc4NTY0NSA1LjUiIHN0cm9rZT0iI0M4Njg2OCIgc3Ryb2tlLXdpZHRoPSIxLjU3MTQzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCjwvc3ZnPg==';

        // Round changes to two decimals
        const roundedChangeUS = parseFloat(changeUS.toFixed(8));
        const roundedChangeAU = parseFloat(changeAU.toFixed(8));
        const roundedChangeUSpc = parseFloat(changeUSpc.toFixed(8));
        const roundedChangeAUpc = parseFloat(changeAUpc.toFixed(8));

        const directionUS = roundedChangeUS > 0 ? "Up" : roundedChangeUS < 0 ? "Down" : "No change";
        const directionAU = roundedChangeAU > 0 ? "Up" : roundedChangeAU < 0 ? "Down" : "No change";
        const classToAdd = roundedChangeUS === 0 && roundedChangeAU === 0 ? "no-change" : roundedChangeUS > 0 || roundedChangeAU > 0 ? "positive-change" : "negative-change";

        element.classList.remove("positive-change", "negative-change", "no-change");

        element.classList.add(classToAdd);

        const changeTextUS = directionUS === "No change" ? " (No change)" : ` (${directionUS} <img src="${base64ImageUp}" /> US$${Math.abs(roundedChangeUS)} / ${Math.abs(roundedChangeUSpc)}%)`;
        const changeTextAU = directionAU === "No change" ? " (No change)" : ` (${directionAU} <img src="${base64ImageDown}" /> AU$${Math.abs(roundedChangeAU)} / ${Math.abs(roundedChangeAUpc)}%)`;

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
