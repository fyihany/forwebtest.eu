const orderForm = document.getElementById("order-form");

orderForm.addEventListener("submit", function(event) {
    event.preventDefault();  // Zabránění standardního odeslání formuláře
    console.log("test")
    const formData = new FormData(orderForm);  // Vytvoření FormData objektu z formuláře
    const appScriptURL = "https://script.google.com/macros/s/AKfycbxRftk6Ngdt2MWxDeasP527NMYxd5HNwpPniubd5_E7JmWbP50BYjv2oOAGvOIXMeE0/exec"
    console.log(formData)
    fetch(appScriptURL, {  // Nahraďte URL vaším cílovým endpointem
        method: 'POST',  // Metoda odeslání dat
        body: formData  // Data formuláře, která budou odeslána
    })
    .then(response => {
        console.log(response)
        if (response.ok) {
            return response.json();  // Při úspěchu zpracování odpovědi
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => console.log("Data were successfully sent:", data))  // Zobrazení úspěchu
    .catch(error => console.error('Error during data sending:', error));  // Zpracování možné chyby
});
