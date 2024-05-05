// const orderForm = document.getElementById("order-form");

// orderForm.onsubmit = function(e) {
//     e.preventDefault()

//     let formData = new FormData(orderForm)
//     for (let pair of formData.entries()) {
//         console.log(pair[0]+ ', ' + pair[1]); 
//     }

//     let appScriptURL = "https://script.google.com/macros/s/AKfycbxkRDt0KL4b0_Fqt885bcjWQj8AFoRD-jVwdT1qecHeZMSzs4E1Dz00KgbjIpTg-Qg6/exec"

//     fetch(appScriptURL, {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.text())
//     .then(data => {
//         console.log("Succes: ", data)
//     })
//     .catch("Error: ", error)
// }