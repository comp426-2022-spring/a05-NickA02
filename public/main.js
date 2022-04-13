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
// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button
