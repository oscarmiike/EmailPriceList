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
    document.querySelector(".gold-price-bullion").textContent = `$${goldSpotPriceUS.toFixed(2)} (Up US$${goldChangeUS.toFixed(2)} / ${goldChangeUSpc.toFixed(2)}%) AU$${goldSpotPriceAU.toFixed(2)} (Up AU$${goldChangeAU.toFixed(2)} / ${goldChangeAUpc.toFixed(2)}%)`;
    document.querySelector(".silver-price-bullion").textContent = `$${silverSpotPriceUS.toFixed(2)} (Up US$${silverChangeUS.toFixed(2)} / ${silverChangeUSpc.toFixed(2)}%) AU$${silverSpotPriceAU.toFixed(2)} (Up AU$${silverChangeAU.toFixed(2)} / ${silverChangeAUpc.toFixed(2)}%)`;


    updatePriceChangeElement(".gold-price-bullion", goldSpotPriceUS, goldChangeUS, goldChangeUSpc, goldSpotPriceAU, goldChangeAU, goldChangeAUpc);
    updatePriceChangeElement(".silver-price-bullion", silverSpotPriceUS, silverChangeUS, silverChangeUSpc, silverSpotPriceAU, silverChangeAU, silverChangeAUpc);

    function updatePriceChangeElement(selector, spotPriceUS, changeUS, changeUSpc, spotPriceAU, changeAU, changeAUpc) {
        const element = document.querySelector(selector);
        // base64 images up/down arrow
        const base64ImageUp = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAYAAADj79JYAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTAzLTA4VDE0OjUyOjE5KzEwOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wMy0wOFQxNToxNDozNCsxMDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wMy0wOFQxNToxNDozNCsxMDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4OTZjNTYzYi0wZjdjLTlmNDQtOGI1Mi0wMzc1NDU4YmNlMGIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDphNzJjZGM1Ny05Yzc1LTAxNDktYTM0Ny0yMmEwYWFhYjY1MjYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjMzc3MDRkMS01NzM1LWQ2NDktYmNjYi0xOWVkZGNhMGQ4NTciPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMzNzcwNGQxLTU3MzUtZDY0OS1iY2NiLTE5ZWRkY2EwZDg1NyIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0wOFQxNDo1MjoxOSsxMDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg5NmM1NjNiLTBmN2MtOWY0NC04YjUyLTAzNzU0NThiY2UwYiIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0wOFQxNToxNDozNCsxMDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pox8LwAAAANWSURBVHic7d09ctpAGIDhF5IipcqUHAF6zzC5QdIllWWdIKnUKQkdVewLYB8hbSpD4RodgXQpyQmcAmlGxhbSSrvfLtH3Np4BxC7PeORFP+PR4+Mjmlxj3xMYWgounIILp+DCKbhwCi6cggun4MIpuHAKLpyCC6fgwim4cAounIILp+DCKbhwCi7cyPcEfJRk6QSYCA65Xy2WOQwQPMnSWyD2MPQa+PDKw8DeSrL0G/DZ0/AT4O3Q9uFzz+PHQwP33tDAN74nMKh9+HbzsJ7NLybA1NccBrdKAevLwksMVj2DBLdVkqUxcGuyjYJ3rAs2KHinumKDghvXBxuGtyzsVUvsHLiue1LBW2aA/Q74W/cCBW+RCfZqsdyfepGCN2QTGxT8ZLaxQcFrc4ENCv5irrBBwZ/lEhsU/EmusQFed9moT0mWRhwOj+5Wi+VOevy6JLBBELw4n3hJ5bBokqV74Aa47vMh+iaFDQK7lCRLoyRLt8BXnh+DjorH75Msnbqey0tJYoNj8GL3cU/zGZYpHtClscEhuAF2WYQgug9scATeAbssQgDdFzY4AO+BXRbhEN0nNlgGN8C+a3g+wgG6b2ywCG6AfbVaLK+Aq4bXRVhEDwEbLIEbYt8BFD9F0EPBBgvgXbDLJNA9Ye9qHl/3uvKqD3bZdvOQz+YXv4H3J7Z/A3yczS9+bTcPfwzmF+PhN7v4TBOeuuyBT53P2tvAPnq/mGacPQec3NL75TjcjRRzmHCY98/VYrnrBG4b+2iCvdFDwK7LGNwVduX9Y3qgh4wNhuCusSvjxHRADx0bDMClsCvjxRignwM2tASXxq6MG9MO/YbDYd5T5XjGhhbgvrAr48f0uJavKCcAbGi4A8I3NrRep58qJxBsOAEeAnZZD/ScgLChBjwk7LIO6DmBYcML4CFilxmg5wSIDUcHr0LGLivGnXG4lfq4PfCdQLGhsko5B+zjju9GWy2Wa19zadsIzhP7XBsptmxj4AeKLdaY5r/4im2xMYdTWHUptuXG1F+yoNgOGgNfeL6mVWxHVdfhUw67lzzULw3/QyP9x0my6S0nwim4cAounIILp+DCKbhwCi6cggun4MIpuHAKLpyCC6fgwim4cAounIILp+DCKbhw/wC4XNk9YysbowAAAABJRU5ErkJggg==';
        const base64ImageDown = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAYAAADj79JYAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTAzLTA4VDE0OjUyOjMzKzEwOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wMy0wOFQxNToxNDoxNSsxMDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wMy0wOFQxNToxNDoxNSsxMDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiMTJhZjVmZC0xNzZmLTJkNDItODYzNi02Y2EyZjI1Y2IyZGMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpjMzc0NmJkMi02NzNmLWVkNGEtYmJmNy1mNmI5NjhlYjk5MGUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDphZTI5NjZmMC1lNTg5LTA3NDAtYjBmZi0yMzg4MjYxNGUwMzAiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFlMjk2NmYwLWU1ODktMDc0MC1iMGZmLTIzODgyNjE0ZTAzMCIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0wOFQxNDo1MjozMysxMDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmIxMmFmNWZkLTE3NmYtMmQ0Mi04NjM2LTZjYTJmMjVjYjJkYyIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0wOFQxNToxNDoxNSsxMDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjkFEhIAAAM8SURBVHic7d3BddowGMDxv1mgjMAI9OZbwwbtBCU3H9sJmk7Q9qYbbNBskOTGUSMwgjdID7H6XIoxsqRPSvz9T8EYo/d7PCODeKmen5/R5FrkHsDcUnDhFFw4BRdOwYVTcOEUXDgFF07BhVNw4RRcOAUXTsGFU3DhFFw4BRdOwYVTcOEq98ehadbAErC1MW2m8bz5qkPTLIHfwE1v+21tzD7HgN56C+AH/2ID7A5NsxUfzQxaAB8H7lP0BC14OW8PpeiRWwD7kX0UPWIL4CtgR/ZT9EhVAN1M5QFYj+yvs5fA+vPwJa8M/dA0K2DlbtfGPOYay7VV/RuvBb27SDs3nW2BX8DPUi/eqtMNpaN37yW7kd0ssCkR/T9wKBf9SmyXpUD0s+BQHrontstSGPogOJSDPhHbZSkI/SI45EcPxHZZCkEf/Ty8G+SGDBdHV2K3wPeRfdbAQ/fiydpVX0DkQPfA3tTG3AG3I/uuKQB99JTST+r04oltPR9nyXh68QKH9OhTsT0fb8mE7g0O6dBDsT2PY8mAPgkc4qPHwvY8niUhejeGFS/jvq+NOU4G7w64JAJ6bGzP41oSoB+aZgdse5taYBME3h14SQB6KmzP41siol94zsfgdSkhU8bU2N349shPGVcD22+iLASagi6B3RvfnkLm6dFWXnmi7xDCdpWCHnWpmwf6duT+lojYrhLQo68t9EAfqiUBtis3epLFnAHoLQmxXTnRk62enYDeIoDtyoWedLmyB7pFENuVAz35+vDamLY25j0vn1kfT+5uu+3i2C5p9OArTd+6Qa+BY23MUfr5h4p5RXpomjvg27n7xMFLLhb6JXD9yUkvidOLgp+UGl3Bz5QSXcEHSoWu4BdKga7gI8VG12nhlflMGYEv6LQwLJ9XOvBuaAd9hXsWutZRwScUgq7gE5uKruABTUGfJfjpr98C+8z4d7R/mx34mRVRos1qWth9bLrNOYZZgQMfcg9gbuC5a+cG/pT5+e/1TVOuR+DT7MAh+rTwmlq3KqHSf5wk29zO4dlTcOEUXDgFF07BhVNw4RRcOAUXTsGFU3DhFFw4BRdOwYVTcOEUXDgFF07BhVNw4f4AviXUwYoNivgAAAAASUVORK5CYII=';

        // Round changes to two decimals
        const roundedChangeUS = parseFloat(changeUS.toFixed(2));
        const roundedChangeAU = parseFloat(changeAU.toFixed(2));
        const roundedChangeUSpc = parseFloat(changeUSpc.toFixed(2));
        const roundedChangeAUpc = parseFloat(changeAUpc.toFixed(2));

        const directionUS = roundedChangeUS > 0 ? base64ImageUp : roundedChangeUS < 0 ? base64ImageDown : "-";
        const directionAU = roundedChangeAU > 0 ? base64ImageUp : roundedChangeAU < 0 ? base64ImageDown : "-";
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
