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
function hideStep(visibleStep, firstHiddenStep, secondHiddenStep) {
    visibleStep.classList.remove("hidden")
    firstHiddenStep.classList.add("hidden")
    secondHiddenStep.classList.add("hidden")
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
            slider.style.left = "30vw"
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

    console.log(modifiedGrantedDomains)

    let domainsToDisable = domainContainer.querySelectorAll("input[type='checkbox']")

    domainsToDisable.forEach(domain => {
        let domainLabel = domain.labels[0]
        let labelText = domainLabel.textContent
        let labelTextArray = labelText.split(".")

        if (labelTextArray.length == 3) {
            labelText = labelTextArray.slice(-2).join(".")
        }

        console.log(labelText)

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
                slider.style.left = "60vw"

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
        slider.style.left = "60vw"
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