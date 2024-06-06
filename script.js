// Proměnné
const domainContainer = document.querySelector("#domain-container");
const checkboxes = document.querySelectorAll("input[type='checkbox']");
const nextBtn = document.querySelector("#next-btn");
const sendBtn = document.querySelector("#send-btn");
const sendGrantedBtn = document.querySelector("#send-granted-btn");
const step1Btn = document.querySelector("#step1Btn");
const step2Btn = document.querySelector("#step2Btn");
const step3Btn = document.querySelector("#step3Btn");
const step1 = document.querySelector("#step1");
const step2 = document.querySelector("#step2");
const step3 = document.querySelector("#step3");
const newDomainsBox = document.querySelector("#new-domains-box");
const slider = document.querySelector("#slider");
const dnsInfo = document.querySelector(".dns-info");
const goBackText = document.querySelector(".go-back");
const sendVerifiedText = document.querySelector(".send-verified-text");
const newMailBtn = document.querySelector("#new-mail-btn");
const homeContainer = document.querySelector("#home-container");
const grafContainer = document.querySelector("#graf-container");
const confugirationContainer = document.querySelector("#configuration-container");
const settingContainer = document.querySelector("#setting-container");
const helpContainer = document.querySelector("#help-container");
const homeBox = document.querySelector("#home-box");
const grafBox = document.querySelector("#graf-box");
const configurationBox = document.querySelector("#configuration-box");
const settingBox = document.querySelector("#setting-box");
const helpBox = document.querySelector("#help-box");
const contact = document.querySelector("#contact");
const barChart = document.querySelector(".bar-chart");
const last7Btn = document.querySelector(".last-7");
const last28Btn = document.querySelector(".last-28");
const graf = document.querySelector("#graf-wrappper");
const table = document.querySelector("#example-table");
const missingData = document.querySelector(".missing-data")
const dateBox = document.querySelector(".date-box")
const grafWrapper = document.querySelector("#graf-wrapper")

let stepChecker = 1;
let isAllGranted = false;
let splitDomains = [];
let domainsToControl = [];
let verifiedDomains = [];
let grantedDomains = [];
let receivedObject = {};
const URL_verified = "https://app.advisio.cz/dataplus/check_dns_domain/";
const URL_granted = "https://app.advisio.cz/dataplus/allow_domain/";
const property_id = "434148014";

// Funkce

/**
 * Změní viditelnost kroků v uživatelském rozhraní, zobrazí zvolený krok a skryje ostatní.
 * @param {Element} visibleStep - Krok, který má být zobrazen.
 * @param {...Element} hiddenSteps - Kroky, které mají být skryty.
 * @returns {void}
 */
function hideStep(visibleStep, ...hiddenSteps) {
    visibleStep.classList.remove("hidden");
    hiddenSteps.forEach(step => step.classList.add("hidden"));
}

/**
 * Přidá aktivní třídu zvolenému kroku a odstraní ji z ostatních kroků.
 * @param {Element} activeStep - Krok, který má být aktivní.
 * @param {...Element} otherSteps - Kroky, které mají být neaktivní.
 * @returns {void}
 */
function addActive(activeStep, ...otherSteps) {
    activeStep.classList.add("active");
    otherSteps.forEach(step => {
        step.classList.remove("active");
    });
}

/**
 * Kontroluje, zda je zaškrtnut alespoň jeden checkbox v daném NodeList.
 * @param {NodeList} elementsForCheck - Checkboxy k ověření.
 * @returns {boolean} Vrací true, pokud je alespoň jeden checkbox zaškrtnut, jinak false.
 */
function firstStepCheck(elementsForCheck) {
    return Array.from(elementsForCheck).some(element => element.checked);
}

/**
 * Vytvoří záznamy domén pro ověření a aktualizuje uživatelské rozhraní pro další krok.
 * @param {Element} parent - Kontejner, do kterého budou přidány záznamy domén.
 * @returns {void}
 */
function createDomains(parent) {
    let labels = Array.from(document.querySelectorAll("label"));
    domainsToControl = labels.filter(label => {
        let labelFor = label.getAttribute("for");
        let chckBtn = document.getElementById(labelFor);

        if (chckBtn.checked === true) {
            return label;
        }
    });

    domainsToControl = domainsToControl.map(domain => {
        return domain.textContent;
    });

    splitDomains = domainsToControl.map(domain => {
        let split = domain.split(".");
        let newDomain;

        if (split.length <= 2) {
            split.unshift("apps");
            newDomain = split.join(".");
            return newDomain;
        } else if (split.length == 3) {
            let slicedSub = split.slice(-2);
            slicedSub.unshift("apps");
            newDomain = slicedSub.join(".");
            return newDomain;
        } else {
            console.log("Nesprávná doména!");
        }

        return newDomain;
    });

    splitDomains.forEach(domain => {
        let para = document.createElement("p");
        para.textContent = domain;
        parent.appendChild(para);
    });
}

/**
 * Pokračuje do dalšího kroku procesu, pokud je zaškrtnut alespoň jeden checkbox.
 * @param {HTMLButtonElement} clickedBtn - Tlačítko, které aktivuje přechod na další krok.
 * @returns {void}
 */
function nextStep(clickedBtn) {
    clickedBtn.addEventListener("click", () => {
        let isChecked = firstStepCheck(checkboxes);

        if (isChecked && stepChecker !== 2) {
            hideStep(step2, step1, step3);
            createDomains(newDomainsBox);
            slider.style.left = "20vw";
            stepChecker = 2;
        }
    });
}

/**
 * Vrátí uživatele na první krok a odstraní všechny záznamy domén přidané během druhého kroku.
 * @param {HTMLButtonElement} clickedBtn - Tlačítko, které aktivuje návrat na první krok.
 * @param {Element} parent - Kontejner, ze kterého budou odstraněny záznamy domén.
 * @returns {void}
 */
function backToFirst(clickedBtn, parent) {
    clickedBtn.addEventListener("click", () => {
        hideStep(step1, step2, step3);

        let domainsToRemove = Array.from(parent.querySelectorAll("p"));

        domainsToRemove.forEach(domain => {
            domain.remove();
        });

        slider.style.left = "0";
        stepChecker = 1;
        grantedDomains = [];
        verifiedDomains = [];
        isAllGranted = false;

        sendBtn.classList.remove("hidden");
        sendGrantedBtn.classList.add("hidden");

        goBackText.classList.add("hidden");
        dnsInfo.classList.remove("hidden");
    });
}

/**
 * Odešle požadavky na ověření domén pomocí HTTP POST a aktualizuje uživatelské rozhraní na základě výsledků.
 * @param {HTMLButtonElement} clickedBtn - Tlačítko, které zahajuje proces ověření domén.
 * @returns {void}
 */
function sendForCheck(clickedBtn) {
    clickedBtn.addEventListener("click", () => {
        clickedBtn.setAttribute("disabled", "disabled");
        clickedBtn.classList.remove("btn");
        clickedBtn.classList.add("checking-btn");
        clickedBtn.value = "Ověřování";

        fetch(URL_verified, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(splitDomains)
        })
            .then(response => response.json())
            .then(data => {
                clickedBtn.removeAttribute("disabled");
                clickedBtn.classList.add("btn");
                clickedBtn.value = "Ověřit";
                clickedBtn.classList.remove("checking-btn");
                clickedBtn.offsetHeight; // Čtení offsetHeight z důvodu repaint elementu a změny kurzoru

                addMark(data, newDomainsBox, sendBtn, sendGrantedBtn);

                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key] === 1) {
                            let keyRemovedSub = key.replace("apps.", "");
                            verifiedDomains.push(keyRemovedSub);
                        }
                    }
                }
            })
            .catch(error => `Vyskytla se chyba: ${error}`);
    });
}

/**
 * Deaktivuje checkboxy pro domény, které již byly ověřeny.
 * @param {Array<string>} parent - Pole obsahující názvy ověřených domén s příponou "apps".
 * @returns {void}
 */
function disableVerified(parent) {
    let modifiedGrantedDomains = parent.map(domain => {
        let domainArrayToSlice = domain.split(".");
        let newDomainWithoutSub = domainArrayToSlice.slice(-2).join(".");
        return newDomainWithoutSub;
    });

    let domainsToDisable = domainContainer.querySelectorAll("input[type='checkbox']");

    domainsToDisable.forEach(domain => {
        let domainLabel = domain.labels[0];
        let labelText = domainLabel.textContent;
        let labelTextArray = labelText.split(".");

        if (labelTextArray.length == 3) {
            labelText = labelTextArray.slice(-2).join(".");
        }

        if (modifiedGrantedDomains.includes(labelText)) {
            domain.checked = false;
            domain.setAttribute("disabled", "disabled");
            domain.title = "Tato doména již byla ověřena.";
            domain.classList.add("verified-chckbox");
            domainLabel.classList.add("verified-label");
            domainLabel.title = "Tato doména již byla ověřena.";
        }
    });

    sendGrantedBtn.classList.add("hidden");
    sendBtn.classList.remove("hidden");
}

/**
 * Aktualizuje uživatelské rozhraní na základě ověřených domén, deaktivuje ověřené domény a mění tlačítka.
 * @param {Object} receivedData - Data obdržená z ověření.
 * @param {Element} element - Element, který obsahuje seznam domén.
 * @param {HTMLButtonElement} oldBtn - Tlačítko, které se má skrýt.
 * @param {HTMLButtonElement} newBtn - Tlačítko, které se má zobrazit.
 * @returns {void}
 */
function addMark(receivedData, element, oldBtn, newBtn) {
    let allPara = Array.from(element.querySelectorAll("p"));

    for (let key in receivedData) {
        let nodeIndex = allPara.findIndex(node => node.textContent.includes(key));

        if (receivedData[key] === 0) {
            allPara[nodeIndex].classList.add("denied");
            allPara[nodeIndex].title = "DNS nebyla správně nastavena";
            dnsInfo.classList.add("hidden");
            goBackText.classList.remove("hidden");
        } else if (receivedData[key] === 1) {
            allPara[nodeIndex].classList.add("granted");
            grantedDomains.push(key);
            dnsInfo.classList.add("hidden");
        }
    }

    for (let key in receivedData) {
        if (receivedData[key] === 1) {
            isAllGranted = true;
        } else {
            isAllGranted = false;
            break;
        }
    }

    if (isAllGranted) {
        oldBtn.classList.add("hidden");
        newBtn.classList.remove("hidden");
        sendVerifiedText.classList.remove("hidden");
    } else {
        sendVerifiedText.classList.add("hidden");
    }
}

/**
 * Spustí finální krok ověřování, pokud byly všechny domény úspěšně ověřeny.
 * @returns {void}
 */
function sendVerified() {
    if (isAllGranted) {
        let domainsForSend = JSON.stringify(grantedDomains);

        sendGrantedBtn.value = "Odesílám";
        sendGrantedBtn.classList.add("checking-btn");

        fetch(URL_granted, {
            method: "POST",
            body: domainsForSend
        })
            .then(response => response.text())
            .then(data => {
                hideStep(step3, step1, step2);
                slider.style.left = "40vw";

                disableVerified(grantedDomains);

                sendGrantedBtn.value = "Odeslat";
                sendGrantedBtn.classList.remove("checking-btn");

                dnsInfo.classList.remove("hidden");
            })
            .catch(error => {
                sendGrantedBtn.value = "Odeslat";
                sendGrantedBtn.classList.remove("checking-btn");
                console.log(error);
            });
    }
}

/**
 * Zkontroluje, jestli jsou všechny domény deaktivovány, a pokud ano, přejde na finální krok.
 * @returns {void}
 */
function thatsAll() {
    let domainsToCheckDisabled = domainContainer.querySelectorAll("input[type='checkbox']");

    let countDisabled = 0;

    domainsToCheckDisabled.forEach(domain => {
        if (domain.hasAttribute("disabled")) {
            countDisabled++;
        }
    });

    if (countDisabled === domainsToCheckDisabled.length) {
        hideStep(step3, step1, step2);
        slider.style.left = "40vw";
    }
}

/**
 * Odesílá e-mailovou adresu na server.
 * @returns {void}
 */
const sendMail = () => {
    let newMail = document.querySelector("#new-mail").value;
    console.log(newMail);

    // Regulární výraz pro ověření e-mailové adresy
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Kontrola, zda e-mailová adresa je platná
    if (!emailRegex.test(newMail)) {
        console.error("Neplatná e-mailová adresa");
        alert("Prosím, zadejte platnou e-mailovou adresu.");
        return;
    }

    let newMailJSON = JSON.stringify({ email: newMail });

    fetch("http://localhost:8080", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: newMailJSON
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            alert("E-mail odeslán!");
        })
        .catch(error => {
            console.error(`ERROR: ${error}`);
            alert("E-mail se nepodařilo odeslat!");
        });

    document.querySelector("#new-mail").value = "";
}

// Spouštění funkcí

nextStep(nextBtn, firstStepCheck(checkboxes));
nextStep(step2Btn, firstStepCheck(checkboxes));
backToFirst(step1Btn, newDomainsBox);
sendForCheck(sendBtn);
sendGrantedBtn.addEventListener("click", sendVerified);
nextBtn.addEventListener("click", thatsAll);
step3Btn.addEventListener("click", thatsAll);

// newMailBtn.addEventListener("click", sendMail); // Dočasně vypnuto

homeBox.addEventListener("click", () => {
    hideStep(homeContainer, grafContainer, confugirationContainer, settingContainer);
    addActive(homeBox, grafBox, configurationBox, settingBox);
});

grafBox.addEventListener("click", () => {
    hideStep(grafContainer, homeContainer, confugirationContainer, settingContainer);
    addActive(grafBox, homeBox, configurationBox, settingBox);

    barChart.classList.remove("hidden");
    table.classList.add("hidden");
    graf.style.opacity = "0";

    last7Btn.classList.add("checking-btn");
    last28Btn.classList.add("checking-btn");
    last7Btn.setAttribute("disabled", "disabled");
    updateData(7);
});

configurationBox.addEventListener("click", () => {
    hideStep(confugirationContainer, homeContainer, settingContainer, grafContainer);
    addActive(configurationBox, homeBox, grafBox, settingBox);
});

settingBox.addEventListener("click", () => {
    hideStep(settingContainer, homeContainer, grafContainer, confugirationContainer);
    addActive(settingBox, homeBox, grafBox, configurationBox);
});

// helpBox.addEventListener("click", () => {
//     hideStep(helpContainer, grafContainer, confugirationContainer, settingContainer);
//     addActive(helpBox, grafBox, configurationBox, settingBox);
// });

// Graf a tabulka

// const loading = document.querySelector("#loading");

let fromGA4 = [];
let grafLabels = [];
let grafData = [];
let myChart;
let currency = "CZK";

/**
 * Získá formátované datum pro graf.
 * @param {number} numOfDays - Počet dní pro datumové rozmezí.
 * @returns {Object} Vrací objekt obsahující začátek a konec datumového rozmezí.
 */
function getDate(numOfDays) {
    let dates = {};

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Odečteme jeden den

    const startDate = new Date(endDate); // Vytvoříme nový objekt Date na základě endDate
    startDate.setDate(startDate.getDate() - numOfDays + 1); // Odečteme numOfDays-1 dní

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    const formattedEndDate = endDate.toLocaleDateString('cs-CZ', options).split('.').reverse().join('-').replace(/\s/g, '');
    const formattedStartDate = startDate.toLocaleDateString('cs-CZ', options).split('.').reverse().join('-').replace(/\s/g, '');

    dates.start = formattedStartDate;
    dates.end = formattedEndDate;

    return dates;
}

/**
 * Získá data pro graf z API.
 * @param {string} startDate - Počáteční datum.
 * @param {string} endDate - Konečné datum.
 * @returns {Promise<void>} Vrací Promise.
 */
function getGrafData(startDate, endDate) {
    fetch('https://app.advisio.cz/dataplus/dataset/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
            property_id: property_id,
        }),
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.reports[0].rows) {
                let rows = data.reports[0].rows;

                rows.forEach(row => {
                    let date = row.dimensionValues[0].value;
                    let value = Number(row.metricValues[3].value);

                    let grafObj = {
                        date,
                        value
                    };

                    let existingItem = grafData.find(item => item.date === grafObj.date);

                    if (existingItem) {
                        existingItem.value += grafObj.value;
                    } else {
                        grafData.push(grafObj);
                    }
                });

                // Seřazení grafData podle datumu sestupně po zpracování všech řádků
                grafData.sort((a, b) => {
                    let dateA = new Date(a.date.slice(0, 4), a.date.slice(4, 6) - 1, a.date.slice(6, 8));
                    let dateB = new Date(b.date.slice(0, 4), b.date.slice(4, 6) - 1, a.date.slice(6, 8));
                    return dateB - dateA;
                });

                // Aktualizace grafLabels podle seřazených dat
                grafLabels = grafData.map(item => {
                    const date = new Date(item.date.slice(0, 4), item.date.slice(4, 6) - 1, item.date.slice(6, 8));
                    return `${date.getDate()}.${date.getMonth() + 1}.`;
                });

                // Aktualizace grafu po získání dat
                table.classList.remove("hidden");
                graf.style.opacity = "1";
                barChart.classList.add("hidden");
                setGraf();
            } else {
                console.log("Chybí graf data");

                dateBox.classList.add("hidden");
                table.classList.add("hidden");
                graf.style.opacity = "0";
                barChart.classList.add("hidden");

                if (barChart.classList.contains("hidden")) {
                    missingData.classList.remove("hidden");
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
 * Získá data pro tabulku z API.
 * @param {string} startDate - Počáteční datum.
 * @param {string} endDate - Konečné datum.
 * @returns {Promise<void>} Vrací Promise.
 */
async function getTableData(startDate, endDate) {
    try {
        const response = await fetch('https://app.advisio.cz/dataplus/dataset/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: startDate,
                end_date: endDate,
                property_id: property_id,
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();

        if (data.reports[0].rows) {
            let rows = data.reports[0].rows;
            currency = data.reports[0].metadata.currencyCode; // Aktualizace měny

            fromGA4 = rows.map((row, index) => ({
                sourceMedium: row.dimensionValues[1].value,
                activeUsers: row.metricValues[0].value,
                advertiserAdCost: row.metricValues[1].value,
                transactions: row.metricValues[2].value,
                purchaseRevenue: row.metricValues[3].value,
                conversionRate: row.metricValues[0].value != 0 ? (row.metricValues[2].value / row.metricValues[0].value) * 100 : 0,
                pno: row.metricValues[3].value != 0 ? (row.metricValues[1].value / row.metricValues[3].value) * 100 : 0
            }));

            fromGA4.sort((a, b) => parseFloat(b.purchaseRevenue) - parseFloat(a.purchaseRevenue));
        } else {
            console.log("Chybí table data");

            dateBox.classList.add("hidden");
            table.classList.add("hidden");
            graf.style.opacity = "0";
            barChart.classList.add("hidden");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Formátuje hodnotu buňky jako měnu.
 * @param {Object} cell - Buňka Tabulatoru.
 * @param {Object} formatterParams - Parametry formátovače.
 * @param {function} onRendered - Callback funkce po vykreslení.
 * @returns {string} Vrací formátovanou hodnotu buňky.
 */
function currencyFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    let floatValue = parseFloat(value);
    let formattedValue = floatValue.toLocaleString('cs-CZ');
    let currencySymbol = '';

    switch (currency) {
        case 'CZK':
            currencySymbol = 'Kč';
            break;
        case 'EUR':
            currencySymbol = '€';
            break;
        case 'USD':
            currencySymbol = '$';
            break;
        case 'PLN':
            currencySymbol = 'zł';
            break;
        case 'HUF':
            currencySymbol = 'Ft';
            break;
        default:
            currencySymbol = currency;
    }

    return formattedValue + ` ${currencySymbol}`;
}

/**
 * Nastaví a vykreslí graf.
 * @returns {void}
 */
function setGraf() {
    grafData.reverse();
    grafLabels.reverse();

    last28Btn.classList.remove("checking-btn");
    last7Btn.classList.remove("checking-btn");

    last7Btn.removeAttribute("disabled");
    last28Btn.removeAttribute("disabled");
    let ctx = document.getElementById('myChart').getContext('2d');

    if (myChart != null) {
        myChart.destroy();
    }

    const chartData = grafData.map(item => item.value);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: grafLabels,
            datasets: [{
                label: 'Celkové tržby',
                data: chartData,
                backgroundColor: ["#FBA23C"],
                borderColor: ["#0AB0A4"],
                borderWidth: 5,
                borderDash: [5, 1],
                tension: 0.3,
                fill: false,
                hoverBackgroundColor: "0AB0A4",
                pointRadius: 7,
                pointHoverRadius: 10,
                pointBackgroundColor: "#0AB0A4",
                pointStyle: 'rectRounded',
                pointBorderWidth: 2,
                pointBorderColor: "#FBA23C"
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function (value) {
                            let currencySymbol = '';

                            switch (currency) {
                                case 'CZK':
                                    currencySymbol = 'Kč';
                                    break;
                                case 'EUR':
                                    currencySymbol = '€';
                                    break;
                                case 'USD':
                                    currencySymbol = '$';
                                    break;
                                case 'PLN':
                                    currencySymbol = 'zł';
                                    break;
                                case 'HUF':
                                    currencySymbol = 'Ft';
                                    break;
                                default:
                                    currencySymbol = currency;
                            }

                            return value.toLocaleString('cs-CZ') + ' ' + currencySymbol;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            let currencySymbol = '';

                            switch (currency) {
                                case 'CZK':
                                    currencySymbol = 'Kč';
                                    break;
                                case 'EUR':
                                    currencySymbol = '€';
                                    break;
                                case 'USD':
                                    currencySymbol = '$';
                                    break;
                                case 'PLN':
                                    currencySymbol = 'zł';
                                    break;
                                case 'HUF':
                                    currencySymbol = 'Ft';
                                    break;
                                default:
                                    currencySymbol = currency;
                            }

                            return `${label}: ${value.toLocaleString('cs-CZ')} ${currencySymbol}`;
                        }
                    }
                }
            }
        }
    });

    // loading.style.display = "none";
}

/**
 * Formátuje hodnotu buňky jako číslo.
 * @param {Object} cell - Buňka Tabulatoru.
 * @param {Object} formatterParams - Parametry formátovače.
 * @param {function} onRendered - Callback funkce po vykreslení.
 * @returns {string} Vrací formátovanou hodnotu buňky.
 */
function numberFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    let intValue = parseInt(value, 10);
    return intValue.toLocaleString('cs-CZ');
}

/**
 * Formátuje hodnotu buňky jako procento.
 * @param {Object} cell - Buňka Tabulatoru.
 * @param {Object} formatterParams - Parametry formátovače.
 * @param {function} onRendered - Callback funkce po vykreslení.
 * @returns {string} Vrací formátovanou hodnotu buňky.
 */
function percentageFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    return value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

/**
 * Vlastní formátovač pro podmíněné formátování buňky.
 * @param {Object} cell - Buňka Tabulatoru.
 * @param {Object} formatterParams - Parametry formátovače.
 * @param {function} onRendered - Callback funkce po vykreslení.
 * @returns {string} Vrací formátovanou hodnotu buňky.
 */
function customFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    let formattedValue = currencyFormatter(cell, formatterParams, onRendered);

    let row = cell.getRow();
    let sourceMedium = row.getData().sourceMedium;

    if (sourceMedium === 'google / cpc' && value == 0) {
        cell.getElement().style.color = 'red';
        cell.getElement().style.fontWeight = 'bold';
        cell.getElement().style.textDecoration = 'underline';
    }

    return formattedValue;
}

/**
 * Nastaví a vykreslí tabulku.
 * @returns {void}
 */
function setTable() {
    // Agregace dat podle sourceMedium
    let aggregatedData = {};

    fromGA4.forEach(row => {
        if (!aggregatedData[row.sourceMedium]) {
            aggregatedData[row.sourceMedium] = {
                sourceMedium: row.sourceMedium,
                activeUsers: 0,
                advertiserAdCost: 0,
                transactions: 0,
                purchaseRevenue: 0
            };
        }
        aggregatedData[row.sourceMedium].activeUsers += Number(row.activeUsers);
        aggregatedData[row.sourceMedium].advertiserAdCost += Number(row.advertiserAdCost);
        aggregatedData[row.sourceMedium].transactions += Number(row.transactions);
        aggregatedData[row.sourceMedium].purchaseRevenue += Number(row.purchaseRevenue);
    });

    // Převod agregovaných dat na pole
    let aggregatedArray = Object.values(aggregatedData);

    // Výpočet konverzního poměru a PNO
    aggregatedArray.forEach(row => {
        row.conversionRate = row.activeUsers != 0 ? (row.transactions / row.activeUsers) * 100 : 0;
        row.pno = row.purchaseRevenue != 0 ? (row.advertiserAdCost / row.purchaseRevenue) * 100 : 0;
    });

    // Výpočet souhrnných hodnot pro spodní kalkulaci
    let sumAll = {
        activeUsersSum: aggregatedArray.reduce((sum, row) => sum + row.activeUsers, 0),
        advertiserAdCostSum: aggregatedArray.reduce((sum, row) => sum + row.advertiserAdCost, 0),
        transactionsSum: aggregatedArray.reduce((sum, row) => sum + row.transactions, 0),
        purchaseRevenueSum: aggregatedArray.reduce((sum, row) => sum + row.purchaseRevenue, 0)
    };

    // Konfigurace a vykreslení tabulky pomocí Tabulator
    let table = new Tabulator("#example-table", {
        data: aggregatedArray,
        layout: "fitData",
        height: "40rem",
        initialSort: [
            { column: "purchaseRevenue", dir: "desc" } // Počáteční řazení podle sloupce "Hodnota konverze" sestupně
        ],
        columns: [
            { title: "Zdroj / Medium", field: "sourceMedium", width: 150, headerWordWrap: true },
            { title: "Aktivní uživatelé", field: "activeUsers", hozAlign: "right", headerWordWrap: true, formatter: numberFormatter, bottomCalc: "sum", bottomCalcFormatter: numberFormatter },
            { title: "Konverzní poměr", field: "conversionRate", hozAlign: "right", headerWordWrap: true, formatter: percentageFormatter, bottomCalc: () => (sumAll.transactionsSum / sumAll.activeUsersSum) * 100, bottomCalcFormatter: percentageFormatter },
            {
                title: "Cena", field: "advertiserAdCost", hozAlign: "right", headerWordWrap: true, formatter: customFormatter, bottomCalc: "sum", bottomCalcFormatter: currencyFormatter, cellClick: (e, cell) => {
                    let row = cell.getRow();
                    let sourceMedium = row.getData().sourceMedium;
                    if (sourceMedium === 'google / cpc' && cell.getValue() == 0) {
                        addActive(settingBox, homeBox, grafBox, configurationBox);
                        hideStep(settingContainer, grafContainer, confugirationContainer, helpContainer);
                    }
                },
                cellMouseOver: (e, cell) => {
                    let row = cell.getRow();
                    let sourceMedium = row.getData().sourceMedium;
                    if (sourceMedium === 'google / cpc' && cell.getValue() == 0) {
                        cell.getElement().classList.add("clickable-cell");
                    }
                },
                cellMouseOut: (e, cell) => {
                    let row = cell.getRow();
                    let sourceMedium = row.getData().sourceMedium;
                    if (sourceMedium === 'google / cpc' && cell.getValue() == 0) {
                        cell.getElement().classList.remove("clickable-cell");
                    }
                }
            },
            { title: "Konverze", field: "transactions", hozAlign: "right", headerWordWrap: true, formatter: numberFormatter, bottomCalc: "sum", bottomCalcFormatter: numberFormatter },
            {
                title: "Hodnota konverze",
                field: "purchaseRevenue",
                hozAlign: "right",
                headerWordWrap: true,
                formatter: currencyFormatter,
                bottomCalc: "sum",
                bottomCalcFormatter: currencyFormatter,
                sorter: "number" // Řazení podle číselné hodnoty
            },
            { title: "PNO", field: "pno", hozAlign: "right", headerWordWrap: true, formatter: percentageFormatter, bottomCalc: () => (sumAll.advertiserAdCostSum / sumAll.purchaseRevenueSum) * 100, bottomCalcFormatter: percentageFormatter }
        ]
    });
}

/**
 * Aktualizuje data pro graf a tabulku.
 * @param {number} numOfDays - Počet dní pro datumové rozmezí.
 * @returns {Promise<void>} Vrací Promise.
 */
async function updateData(numOfDays) {
    missingData.classList.add("hidden");
    grafLabels = [];
    grafData = [];
    let dateRange = getDate(numOfDays);
    await getTableData(dateRange.start, dateRange.end);
    await getGrafData(dateRange.start, dateRange.end);
    setTable();
}

last7Btn.addEventListener("click", () => {
    barChart.classList.remove("hidden");
    table.classList.add("hidden");
    graf.style.opacity = "0";

    last7Btn.classList.add("checking-btn");
    last7Btn.setAttribute("disabled", "disabled");

    last28Btn.classList.add("checking-btn");
    last28Btn.setAttribute("disabled", "disabled");
    updateData(7);
});

last28Btn.addEventListener("click", () => {
    barChart.classList.remove("hidden");
    table.classList.add("hidden");
    graf.style.opacity = "0";

    last28Btn.classList.add("checking-btn");
    last28Btn.setAttribute("disabled", "disabled");

    last7Btn.classList.add("checking-btn");
    last7Btn.setAttribute("disabled", "disabled");
    updateData(28);
});

document.addEventListener("DOMContentLoaded", () => {
    barChart.classList.remove("hidden");
    updateData(7);
});

