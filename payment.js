var payButton = document.getElementById("pay-button");
var chooseCard = document.getElementById("choose-card");
var amount = document.getElementById("amount");
var form = document.getElementById("payment-form");

payButton.addEventListener("click", payout)
function payout() {
    fetch('http://localhost:5000/payout', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({id: chooseCard.value, amount: amount.value})
    })
    .then(res => res.json())
    .then(data => {
        alert("Payment success with id: "+data.id)
    })
    .catch(err => console.error(err));
}

form.addEventListener("submit", onSubmit);
function onSubmit(event) {
    event.preventDefault();
}

window.addEventListener("DOMContentLoaded", loadCard )
function loadCard() {
    fetch('http://localhost:5000/customers')
    .then(res => res.json())
    .then(result => {
        result.forEach(instrument => {
            const option = document.createElement("option");
            option.value = instrument.id;

            const displayedContent = `**** **** **** ${instrument.last4} (${instrument.exp_month}/${instrument.exp_year}) | ${instrument.card_type}`;
            option.textContent = displayedContent;
            chooseCard.append(option);
        });
    })
}