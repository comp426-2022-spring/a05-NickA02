
// Focus div based on nav button click
prevDIV = document.getElementById("home")

function showhome(id) {
    if (prevDIV != null) {
        prevDIV.className = "hidden"
    }
    var div = document.getElementById(id)
    div.className = "active"
    prevDIV = div
}
// Flip one coin and show coin image to match result when button clicked
// Button coin flip element
const coin = document.getElementById("quarter")
coin.className = "smallcoin"
// Add event listener for coin button
coin.addEventListener("click", flipCoin)
function flipCoin() {
    fetch('http://localhost:5555/app/flip/', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        console.log(result);
        document.getElementById("result").innerHTML = result.flip;
        document.getElementById("quarter").setAttribute("src", "./assets/img/" + result.flip+".png");
        coin.disabled = true
    })
}
coins = document.getElementById("coins")
coins.addEventListener("submit", flip_many_coins)

async function flip_many_coins(event) {
    event.preventDefault();

    const formEvent = event.currentTarget

    const formData = new FormData(formEvent)

    const plainFormData = Object.fromEntries(formData.entries());

    fetch('http://localhost:5555/app/flips/', {mode: 'cors', method: 'POST', headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }, body: JSON.stringify(plainFormData)})
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        console.log(result.summary)
        document.getElementById("summary_result").innerHTML = "heads: " +result.summary.heads + " tails: " + result.summary.tails;
        document.getElementById("coinspics").innerHTML = "";
        for (var i = 0; i < result.raw.length; i++) {
            img = document.createElement('img')
            img.setAttribute("src", "./assets/img/" + result.raw[i]+".png")
            img.className = "smallcoin"
            document.getElementById("coinspics").appendChild(img)
        }
    })
}

function guessflip(guess) {
    fetch('http://localhost:5555/app/flip/call', {mode: 'cors', method: 'POST', headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }, body: JSON.stringify({guess: guess})})
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        console.log(result);
        document.getElementById("call_div").className = "active"
        document.getElementById("call").setAttribute("src", "./assets/img/" + result.call.call+".png");
        document.getElementById("call_res").setAttribute("src", "./assets/img/" + result.call.flip+".png");
        document.getElementById("game_res").innerHTML = result.call.result
    })
}

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button
