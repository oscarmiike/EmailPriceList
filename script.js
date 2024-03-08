document.addEventListener('DOMContentLoaded', function () {
    const token = getCookie('apiToken');
    const inputGroup = document.querySelector('.input-group');
    const fetchContainer = document.querySelector('.fetch-container');
    const helpContainer = document.querySelector('.helpContainer');
    const assetContainer = document.querySelector('.asset-container');

    fetchHistoricalData()

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

    function checkWindowSize() {
        if (window.innerWidth < 1000) {
            document.getElementById("warningMessage").style.display = "inline";
        } else {
            document.getElementById("warningMessage").style.display = "none";
        }
    }

    checkWindowSize();
    window.onresize = checkWindowSize;
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


function fetchPriceList() {
    const token = getCookie('apiToken');
    fetch('https://dev-api.ainsliebullion.com.au/assets/pricelist', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            priceSheetCalcs(data);
            fadeIn(refreshedMessage, () => {
                setTimeout(() => {
                    fadeOut(refreshedMessage);
                }, 2000);
            });
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('price-list').innerHTML = '<p style="margin-left: 20px;">Error loading price list.</p>';
        });
}

function fetchHistoricalData() {
    const token = getCookie('apiToken');
    fetch('https://dev-api.ainsliebullion.com.au/spot/GetClosestTimestamp', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            fadeIn(refreshedMessage, () => {
                setTimeout(() => {
                    fadeOut(refreshedMessage);
                }, 2000);
            });
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('price-list').innerHTML = '<p style="margin-left: 20px;">Error loading price list.</p>';
        });
}

function priceSheetCalcs(data) {
    let goldSpotPriceAU = 0;
    let silverSpotPriceAU = 0;
    let goldSpotPriceUS = 0;
    let silverSpotPriceUS = 0;
    let audPrice = 0;

    if (data && Array.isArray(data)) {
        data.forEach(item => {
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

    const GSR = goldSpotPriceAU / silverSpotPriceAU;

    // Update individual elements by class name
    document.querySelector(".gold-silver-ratio").textContent = `Gold:Silver Ratio - ${GSR.toFixed(2)}`;
    document.querySelector(".aud-usd-rate").textContent = `AUD/USD - ${audPrice.toFixed(4)}`;
    document.querySelector(".gold-price").textContent = `Gold - US$${goldSpotPriceUS.toFixed(2)} (Up US$21 / 0.98%) AU$${goldSpotPriceAU.toFixed(2)} (Up AU$4 / 0.12%)`;
    document.querySelector(".silver-price").textContent = `Silver - US$${silverSpotPriceUS.toFixed(2)} (Up US$21 / 0.98%) AU$${silverSpotPriceAU.toFixed(2)} (Up AU$4 / 0.12%)`;
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
