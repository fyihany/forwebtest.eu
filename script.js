// Proměnné
const domainContainer = document.querySelector("#domain-container")
const checkboxes = document.querySelectorAll("input[type='checkbox']")
const nextBtn = document.querySelector("#next-btn")
const sendBtn = document.querySelector("#send-btn")
const sendGrantedBtn = document.querySelector("#send-granted-btn")
const step1Btn = document.querySelector("#step1Btn")
const step2Btn = document.querySelector("#step2Btn")
const step3Btn = document.querySelector("#step3Btn")
const step1 = document.querySelector("#step1")
const step2 = document.querySelector("#step2")
const step3 = document.querySelector("#step3")
const newDomainsBox = document.querySelector("#new-domains-box")
const slider = document.querySelector("#slider")
const dnsInfo = document.querySelector(".dns-info")
const goBackText = document.querySelector(".go-back")
const sendVerifiedText = document.querySelector(".send-verified-text")
const newMailBtn = document.querySelector("#new-mail-btn")
const grafContainer = document.querySelector("#graf-container")
const confugirationContainer = document.querySelector("#configuration-container")
const settingContainer = document.querySelector("#setting-container")
const helpContainer = document.querySelector("#help-container")
const grafBox = document.querySelector("#graf-box")
const configurationBox = document.querySelector("#configuration-box")
const settingBox = document.querySelector("#setting-box")
const helpBox = document.querySelector("#help-box")


let stepChecker = 1
let isAllGranted = false
let splitDomains = []
let domainsToControl = []
let verifiedDomains = []
let grantedDomains = []
let receivedObject = {}
let URL_verified = "http://localhost:8080/verify-domain"
let URL_granted = "http://localhost:8080/granted-domain"

// Funkce



/**
 * Změní viditelnost kroků v uživatelském rozhraní, zobrazí zvolený krok a skryje ostatní.
 * @param {Element} visibleStep - Krok, který má být zobrazen.
 * @param {Element} firstHiddenStep - První krok, který má být skryt.
 * @param {Element} secondHiddenStep - Druhý krok, který má být skryt.
 * @returns {void}
 */
function hideStep(visibleStep, ...hiddenSteps) {
    visibleStep.classList.remove("hidden");
    hiddenSteps.forEach(step => step.classList.add("hidden"));
}

function addActive(activeStep, ...otherSteps) {
    activeStep.classList.add("active")

    otherSteps.forEach(step => {
        step.classList.remove("active")
    })
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
    let labels = Array.from(document.querySelectorAll("label"))
    domainsToControl = labels.filter(label => {
        let labelFor = label.getAttribute("for")
        let chckBtn = document.getElementById(labelFor)

        if (chckBtn.checked === true) {
            return label
        }
    })

    domainsToControl = domainsToControl.map(domain => {
        return domain.textContent
    })

    splitDomains = domainsToControl.map(domain => {
        let split = domain.split(".")
        let newDomain

        if (split.length <= 2) {
            split.unshift("apps")
            newDomain = split.join(".")
            return newDomain
        } else if (split.length == 3) {
            let slicedSub = split.slice(-2)
            slicedSub.unshift("apps")
            newDomain = slicedSub.join(".")
            return newDomain
        } else {
            console.log("Nesprávná doména!")
        }

        return newDomain
    })

    splitDomains.forEach(domain => {
        let para = document.createElement("p")
        para.textContent = domain
        parent.appendChild(para)
    })
}

/**
 * Pokračuje do dalšího kroku procesu, pokud je zaškrtnut alespoň jeden checkbox.
 * @param {HTMLButtonElement} clickedBtn - Tlačítko, které aktivuje přechod na další krok.
 * @returns {void}
 */
function nextStep(clickedBtn) {
    clickedBtn.addEventListener("click", () => {
        let isChecked = firstStepCheck(checkboxes)

        if (isChecked && stepChecker !== 2) {
            hideStep(step2, step1, step3)
            createDomains(newDomainsBox)
            slider.style.left = "20vw"
            stepChecker = 2
        }
    })

}

/**
 * Vrátí uživatele na první krok a odstraní všechny záznamy domén přidané během druhého kroku.
 * @param {HTMLButtonElement} clickedBtn - Tlačítko, které aktivuje návrat na první krok.
 * @param {Element} parent - Kontejner, ze kterého budou odstraněny záznamy domén.
 * @returns {void}
 */
function backToFirst(clickedBtn, parent) {
    clickedBtn.addEventListener("click", () => {
        hideStep(step1, step2, step3)

        let domainsToRemove = Array.from(parent.querySelectorAll("p"))

        domainsToRemove.forEach(domain => {
            domain.remove()
        })

        slider.style.left = "0"
        stepChecker = 1
        grantedDomains = []
        verifiedDomains = []
        isAllGranted = false


        sendBtn.classList.remove("hidden")
        sendGrantedBtn.classList.add("hidden")

        goBackText.classList.add("hidden")
        dnsInfo.classList.remove("hidden")
    })
}

async function checkDnsDomain(domains) {
    const url = 'https://app.advisio.cz/dataplus/check_dns_domain/';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(domains),
        credentials: 'include'  // Include cookies if CORS_ALLOW_CREDENTIALS is true
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        console.log('Response:', jsonResponse);
    } else {
        console.error('Error:', response.statusText);
    }
}


/**
 * Odešle požadavky na ověření domén pomocí HTTP POST a aktualizuje uživatelské rozhraní na základě výsledků.
 * @param {HTMLButtonElement} clickedBtn - Tlačítko, které zahajuje proces ověření domén.
 * @returns {void}
 */
function sendForCheck(clickedBtn) {
    clickedBtn.addEventListener("click", () => {
        clickedBtn.setAttribute("disabled", "disabled")
        clickedBtn.classList.remove("btn")
        clickedBtn.classList.add("checking-btn")
        clickedBtn.value = "Ověřování"

        // let domainsReplaceSub = domainsToControl.map(domain => {
        //     let domainNewSub = domain.replace("www", "apps")

        //     return domainNewSub
        // })

        checkDnsDomain(splitDomains)

        fetch(URL_verified, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(splitDomains)
        })
            .then(response => response.json())
            .then(data => {
                clickedBtn.removeAttribute("disabled")
                clickedBtn.classList.add("btn")
                clickedBtn.value = "Ověřit"
                clickedBtn.classList.remove("checking-btn")
                clickedBtn.offsetHeight //čtení offsetHeight z důvodu repaint elementu a změny kurzoru

                addMark(data, newDomainsBox, sendBtn, sendGrantedBtn)


                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key] === 1) {
                            let keyRemovedSub = key.replace("apps.", "")
                            verifiedDomains.push(keyRemovedSub)
                        }
                    }
                }
            })
            .catch(error => `Vyskytkla se chyba: ${error}`)
    })
}

/**
 * Deaktivuje checkboxy pro domény, které již byly ověřeny. Funkce prochází seznam ověřených domén a nastavuje odpovídající checkboxy jako neaktivní.
 * @param {Array<string>} parent - Pole obsahující názvy ověřených domén s příponou "apps", které budou transformovány na "www" formát.
 * @returns {void}
 */
function disableVerified(parent) {
    let modifiedGrantedDomains = parent.map(domain => {
        let domainArrayToSlice = domain.split(".")
        let newDomainWithouSub = domainArrayToSlice.slice(-2).join(".")
        return newDomainWithouSub
    })


    let domainsToDisable = domainContainer.querySelectorAll("input[type='checkbox']")

    domainsToDisable.forEach(domain => {
        let domainLabel = domain.labels[0]
        let labelText = domainLabel.textContent
        let labelTextArray = labelText.split(".")

        if (labelTextArray.length == 3) {
            labelText = labelTextArray.slice(-2).join(".")
        }


        if (modifiedGrantedDomains.includes(labelText)) {
            domain.checked = false
            domain.setAttribute("disabled", "disabled")
            domain.title = "Tato doména již byla ověřena."
            domain.classList.add("verified-chckbox")
            domainLabel.classList.add("verified-label")
            domainLabel.title = "Tato doména již byla ověřena."
        }
    })

    sendGrantedBtn.classList.add("hidden")
    sendBtn.classList.remove("hidden")
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
    let allPara = Array.from(element.querySelectorAll("p"))

    for (let key in receivedData) {
        let nodeIndex = allPara.findIndex(node => node.textContent.includes(key))

        if (receivedData[key] === 0) {
            allPara[nodeIndex].classList.add("denied")
            allPara[nodeIndex].title = "DNS nebyla správně nastavena"
            dnsInfo.classList.add("hidden")
            goBackText.classList.remove("hidden")
            // dnsInfo.textContent = "Vraťte se na krok 1 a zvolte jen ty domény, u kterých máte správně nastaveny DNS záznamy."
        } else if (receivedData[key] === 1) {
            // dnsInfo.textContent = "Vybrané domény mají správně nastaveny DNS záznamy. Pokračujte tlačítkem \"ODESLAT\"."
            allPara[nodeIndex].classList.add("granted")
            grantedDomains.push(key)
            dnsInfo.classList.add("hidden")
        }


    }

    for (let key in receivedData) {
        if (receivedData[key] === 1) {
            isAllGranted = true
        } else {
            isAllGranted = false
            break
        }
    }

    if (isAllGranted) {
        oldBtn.classList.add("hidden")
        newBtn.classList.remove("hidden")
        sendVerifiedText.classList.remove("hidden")
    } else {
        sendVerifiedText.classList.add("hidden")
    }
}

/**
 * Spustí finální krok ověřování, pokud byly všechny domény úspěšně ověřeny.
 * @returns {void}
 */
function sendVerified() {
    if (isAllGranted) {

        let domainsForSend = JSON.stringify(grantedDomains)

        sendGrantedBtn.value = "Odesílám"
        sendGrantedBtn.classList.add("checking-btn")

        fetch(URL_granted, {
            method: "POST",
            body: domainsForSend
        })
            .then(response => response.text())
            .then(data => {
                hideStep(step3, step1, step2)
                slider.style.left = "40vw"

                disableVerified(grantedDomains)

                sendGrantedBtn.value = "Odeslat"
                sendGrantedBtn.classList.remove("checking-btn")

                dnsInfo.classList.remove("hidden")
            })
            .catch(error => {
                sendGrantedBtn.value = "Odeslat"
                sendGrantedBtn.classList.remove("checking-btn")
                console.log(error)
            })
    }
}

/**
 * Zkontroluje, jestli jsou všechny domény deaktivovány, a pokud ano, přejde na finální krok.
 * @returns {void}
 */
function thatsAll() {
    let domainsToCheckDisabled = domainContainer.querySelectorAll("input[type='checkbox']")

    let countDisabled = 0

    domainsToCheckDisabled.forEach(domain => {
        if (domain.hasAttribute("disabled")) {
            countDisabled++
        }
    })

    if (countDisabled === domainsToCheckDisabled.length) {
        hideStep(step3, step1, step2)
        slider.style.left = "40vw"
    }
}

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
            return response.json()

        })
        .then(data => {
            alert("E-mail odeslán!")

        })
        .catch(error => {
            console.error(`ERROR: ${error}`)
            alert("E-mail se nepodařilo odeslat!")
        });

    document.querySelector("#new-mail").value = ""
}


// Spouštění funkcí

nextStep(nextBtn, firstStepCheck(checkboxes))
nextStep(step2Btn, firstStepCheck(checkboxes))

backToFirst(step1Btn, newDomainsBox)

sendForCheck(sendBtn)

sendGrantedBtn.addEventListener("click", sendVerified)
nextBtn.addEventListener("click", thatsAll)
step3Btn.addEventListener("click", thatsAll)

// newMailBtn.addEventListener("click", sendMail) Dočasně vypnuto

grafBox.addEventListener("click", () => {
    hideStep(grafContainer, confugirationContainer, settingContainer, helpContainer)
    addActive(grafBox, configurationBox, settingBox, helpBox)
})

configurationBox.addEventListener("click", () => {
    hideStep(confugirationContainer, settingContainer, grafContainer, helpContainer)
    addActive(configurationBox, grafBox, settingBox, helpBox)
})

settingBox.addEventListener("click", () => {
    hideStep(settingContainer, grafContainer, confugirationContainer, helpContainer)
    addActive(settingBox, grafBox, configurationBox, helpBox)
})

helpBox.addEventListener("click", () => {
    hideStep(helpContainer, grafContainer, confugirationContainer, settingContainer)
    addActive(helpBox, grafBox, configurationBox, settingBox)
})










// Graf a tabulka
const last7Btn = document.querySelector(".last-7");
const last28Btn = document.querySelector(".last-28");

let fromGA4 = [];
let grafLabels = [];
let grafData = [];
let myChart;
let currency = "CZK";

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

    for (let i = 0; i < numOfDays; i++) {
        grafLabels.push(`${endDate.getDate()}.${endDate.getMonth() + 1}.`);
        endDate.setDate(endDate.getDate() - 1);
    }
    grafLabels.reverse();
    return dates;
}

async function getGrafData(numOfDays) {
    let date = new Date();
    grafData = [];

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    let promises = [];

    for (let i = 0; i < numOfDays; i++) {
        date.setDate(date.getDate() - 1);
        let formattedDate = date.toLocaleDateString('cs-CZ', options).split('.').reverse().join('-').replace(/\s/g, '');

        let promise = fetch('https://app.advisio.cz/dataplus/dataset/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedDate,
                end_date: formattedDate,
                property_id: '434148014',
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
                let rows = data.reports[0].rows;
                let value = 0;
                rows.forEach(row => {
                    value += Number(row.metricValues[3].value);
                });
                return value;
            })
            .catch(error => {
                console.error('Error:', error);
                return 0;  // In case of error, we push 0 to maintain the order
            });

        promises.push(promise);
    }

    const results = await Promise.all(promises);
    grafData = results;
    setGraf(); // Aktualizace grafu po získání dat
}

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
                property_id: '434148014',
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        let rows = data.reports[0].rows;
        currency = data.reports[0].metadata.currencyCode;

        fromGA4 = rows.map((row, index) => ({
            sourceMedium: row.dimensionValues[0].value,
            activeUsers: row.metricValues[0].value,
            advertiserAdCost: row.metricValues[1].value,
            transactions: row.metricValues[2].value,
            purchaseRevenue: row.metricValues[3].value,
            conversionRate: row.metricValues[0].value != 0 ? (row.metricValues[2].value / row.metricValues[0].value) * 100 : 0,
            pno: row.metricValues[3].value != 0 ? (row.metricValues[1].value / row.metricValues[3].value) * 100 : 0
        }));

        fromGA4.sort((a, b) => parseFloat(b.purchaseRevenue) - parseFloat(a.purchaseRevenue));
        console.log(fromGA4);
    } catch (error) {
        console.error('Error:', error);
    }
}

function setGraf() {
    last28Btn.classList.remove("checking-btn");
    last7Btn.classList.remove("checking-btn");

    last7Btn.removeAttribute("disabled");
    last28Btn.removeAttribute("disabled");
    grafData.reverse();
    // Kód pro vytvoření grafu
    let ctx = document.getElementById('myChart').getContext('2d');

    if (myChart != null) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line', // typ grafu (např. 'bar', 'line', 'pie')
        data: {
            labels: grafLabels,
            datasets: [{
                label: 'Celkové tržby',
                data: grafData,
                backgroundColor: [
                    "#FBA23C"
                ],
                borderColor: [
                    "#0AB0A4"
                ],
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
                            return value.toLocaleString('cs-CZ') + ' ' + currency;
                        }
                    }
                }
            }
        }
    });
}

function currencyFormatter(cell, formatterParams, onRendered) {
    // Získání hodnoty buňky
    let value = cell.getValue();

    // Převod na číslo, pokud je potřeba
    let floatValue = parseFloat(value);

    // Vrácení formátované hodnoty s oddělovači tisíců a měnovým symbolem napravo
    return floatValue.toLocaleString('cs-CZ') + ` ${currency}`;
}

function numberFormatter(cell, formatterParams, onRendered) {
    // Získání hodnoty buňky
    let value = cell.getValue();

    // Převod na číslo, pokud je potřeba
    let intValue = parseInt(value, 10);

    // Vrácení formátované hodnoty s oddělovači tisíců
    return intValue.toLocaleString('cs-CZ');
}

function percentageFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    return value.toFixed(2) + '%';
}

function customFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    let formattedValue = currencyFormatter(cell, formatterParams, onRendered);

    // Získání řádku a hodnoty sourceMedium
    let row = cell.getRow();
    let sourceMedium = row.getData().sourceMedium;

    // Nastavení stylu na základě hodnoty sourceMedium a hodnoty buňky
    if (sourceMedium === 'google / cpc' && value > 0) {
        cell.getElement().style.color = 'red';
        cell.getElement().style.fontWeight = 'bold';
        cell.getElement().style.textDecoration = 'underline';
    }

    return formattedValue;
}

function setTable() {
    let sumAll = {
        activeUsersSum: 0,
        advertiserAdCostSum: 0,
        transactionsSum: 0,
        purchaseRevenueSum: 0,
        conversionRateSum: 0,
        pnoSum: 0
    }

    for (let i = 0; i < fromGA4.length; i++) {
        sumAll.activeUsersSum += Number(fromGA4[i].activeUsers)
        sumAll.advertiserAdCostSum += Number(fromGA4[i].advertiserAdCost)
        sumAll.transactionsSum += Number(fromGA4[i].transactions)
        sumAll.purchaseRevenueSum += Number(fromGA4[i].purchaseRevenue)
        sumAll.conversionRateSum += Number(fromGA4[i].conversionRate)
        sumAll.pnoSum += Number(fromGA4[i].pno)
    }

    // Kód pro vytvoření tabulky
    let tabledata = fromGA4;

    // Inicializace Tabulatoru
    let table = new Tabulator("#example-table", {
        data: tabledata, // Data k zobrazení
        layout: "fitColumns", // Přizpůsobení šířky sloupců
        height: "40rem", // Nastavení výšky tabulky s možností skrolování
        columns: [ // Definice sloupců
            {
                title: "Zdroj / Medium",
                field: "sourceMedium",
                width: 150
            },
            {
                title: "Aktivní uživatelé",
                field: "activeUsers",
                hozAlign: "right",
                formatter: numberFormatter,
                bottomCalc: "sum",
                bottomCalcFormatter: numberFormatter
            },
            {
                title: "Konverzní poměr",
                field: "conversionRate",
                hozAlign: "right",
                formatter: percentageFormatter,
                bottomCalc: () => (sumAll.transactionsSum / sumAll.activeUsersSum) * 100,
                bottomCalcFormatter: percentageFormatter
            },
            {
                title: "Cena",
                field: "advertiserAdCost",
                hozAlign: "right",
                formatter: customFormatter, // Použití vlastního formátovače pro podmíněné formátování
                bottomCalc: "sum",
                bottomCalcFormatter: currencyFormatter,
                cellClick: function (e, cell) {
                    let row = cell.getRow();
                    let sourceMedium = row.getData().sourceMedium;
                    if (sourceMedium === 'google / cpc' && cell.getValue() !== 0) {
                        hideStep(settingContainer, grafContainer, confugirationContainer, helpContainer)
                        addActive(settingBox, grafBox, configurationBox, helpBox)
                    }
                },
                cellMouseOver: function (e, cell) {
                    cell.getElement().classList.add("clickable-cell");
                },
                cellMouseOut: function (e, cell) {
                    cell.getElement().classList.remove("clickable-cell");
                }
            },
            {
                title: "Konverze",
                field: "transactions",
                hozAlign: "right",
                formatter: numberFormatter,
                bottomCalc: "sum",
                bottomCalcFormatter: numberFormatter
            },
            {
                title: "Hodnota konverze",
                field: "purchaseRevenue",
                hozAlign: "right",
                formatter: currencyFormatter,
                bottomCalc: "sum",
                bottomCalcFormatter: currencyFormatter
            },
            {
                title: "PNO",
                field: "pno",
                hozAlign: "right",
                formatter: percentageFormatter,
                bottomCalc: () => (sumAll.advertiserAdCostSum / sumAll.purchaseRevenueSum) * 100,
                bottomCalcFormatter: percentageFormatter
            }
        ],
    });
}

async function updateData(numOfDays) {
    let dateRange = getDate(numOfDays);
    await getTableData(dateRange.start, dateRange.end);
    await getGrafData(numOfDays); // Synchronizované volání getGrafData
    setTable();
    grafLabels = [];
}

last7Btn.addEventListener("click", () => {
    last7Btn.classList.add("checking-btn");
    last7Btn.setAttribute("disabled", "disabled");
    updateData(7);
});

last28Btn.addEventListener("click", () => {
    last28Btn.classList.add("checking-btn");
    last28Btn.setAttribute("disabled", "disabled");
    updateData(28);
});

document.addEventListener("DOMContentLoaded", () => {
    updateData(7);
});