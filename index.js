$(document).ready(() => {
    let matchesFound = 0;
    let timerInterval;
    let totalMatches = 3;
    let cardsCount = 6;
    let timeLimitSeconds = 60;
    let powerUpActive = true; // Track power-up state
    let powerUpDuration = 1000; // Duration of power-up in milliseconds

    $("#start").click(() => {
        const difficulty = $("#difficulty").val();

        if (difficulty === "easy") {
            totalMatches = 3;
            cardsCount = 6;
            timeLimitSeconds = 60;
        } else if (difficulty === "medium") {
            totalMatches = 6;
            cardsCount = 12;
            timeLimitSeconds = 90;
        } else if (difficulty === "hard") {
            totalMatches = 9;
            cardsCount = 18;
            timeLimitSeconds = 120;
        }

        $("#game-grid").empty();
        $("#game-grid").removeClass("hidden");
        startTimer(timeLimitSeconds);
        totalPairs(totalMatches);
        pairsLeft(totalMatches - matchesFound);

        $.ajax({
            url: "https://pokeapi.co/api/v2/pokemon?limit=151",
            success: (response) => {
                const pokemon = response.results;
                const randomPokemon = [];
                while (randomPokemon.length < totalMatches) {
                    const index = Math.floor(Math.random() * pokemon.length);
                    const poke = pokemon[index];
                    if (!randomPokemon.some((p) => p.name === poke.name)) {
                        randomPokemon.push(poke);
                    }
                }
                const cardPokemon = [];
                for (let i = 0; i < cardsCount; i++) {
                    cardPokemon.push(randomPokemon[i % totalMatches]);
                }
                for (let i = 0; i < cardsCount; i++) {
                    const cardElement = $("<div>").addClass("card");
                    const frontFace = $("<img>").addClass("front-face");
                    const backFace = $("<img>").addClass("back-face");
                    const name = cardPokemon[i].name;
                    const id = cardPokemon[i].url.split("/")[6];
                    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
                    frontFace.attr("src", imgUrl);
                    backFace.attr("src", "back.webp");
                    if (difficulty === "medium") {
                        frontFace.css("height", "100px");
                        frontFace.css("width", "auto");
                        backFace.css("height", "100px");
                        backFace.css("width", "auto");
                    } else if (difficulty === "hard") {
                        frontFace.css("height", "50px");
                        frontFace.css("width", "auto");
                        backFace.css("height", "50px");
                        backFace.css("width", "auto");
                    }
                    cardElement.append(frontFace, backFace);
                    $("#game-grid").append(cardElement);
                }
                let firstCard = undefined;
                let secondCard = undefined;
                let cardFlippedCount = 0; // Counter for flipped cards

                numOfMatches(0);
                let clickCount = 0;

                let isFlipping = false; // Track flipping animation state

                $(".card").on("click", function () {
                    // If power-up is active, activate it 10% of the time
                    if (powerUpActive && Math.random() < 0.1) {
                        activatePowerUp();
                    }
                    if ($(this).hasClass("flip") || isFlipping) return;

                    $(this).toggleClass("flip");

                    if (!firstCard) {
                        firstCard = $(this).find(".front-face");
                    } else {
                        secondCard = $(this).find(".front-face");

                        if (firstCard.attr("src") === secondCard.attr("src")) {
                            console.log("match");
                            $(this).off("click");
                            firstCard.parent().off("click");
                            firstCard = undefined;
                            secondCard = undefined;
                            matchesFound++;
                            numOfMatches(matchesFound);
                            pairsLeft(totalMatches - matchesFound);
                            if (matchesFound === totalMatches) {
                                setTimeout(() => {
                                    clearInterval(timerInterval);
                                    alert("Congratulations! You found all the matches!");
                                }, 500);
                                setTimeout(() => {
                                    $("#reset").click();
                                }, 500);
                            }
                        } else {
                            console.log("no match");
                            isFlipping = true; // Set flipping animation state to true

                            setTimeout(() => {
                                $(this).toggleClass("flip");
                                firstCard.parent().toggleClass("flip");
                                firstCard = undefined;
                                secondCard = undefined;
                                isFlipping = false; // Set flipping animation state to false
                            }, 1000);
                        }
                    }

                    clickCount++;
                    clicks(clickCount);
                });
            },
        });
    });

    function activatePowerUp() {
        if (!powerUpActive) return;
      
        const unflippedCards = $(".card").not(".flip");
      
        unflippedCards.addClass("flip");
      
        setTimeout(() => {
          unflippedCards.removeClass("flip");
        }, powerUpDuration);

      }
      

    function clicks(clicks) {
        const click = document.getElementById("clicks");
        setTimeout(() => {
            click.innerText = "Number of clicks: " + clicks;
        }, 500);
    }

    function pairsLeft(left) {
        const pairs = document.getElementById("pairs-left");
        setTimeout(() => {
            pairs.innerText = "Pairs left: " + left;
        }, 500);
    }

    function totalPairs(totalMatches) {
        const pairs = document.getElementById("pairs");
        setTimeout(() => {
            pairs.innerText = "Total pairs: " + totalMatches;
        }, 500);
    }

    function numOfMatches(num) {
        const matches = document.getElementById("matches");
        setTimeout(() => {
            matches.innerText = "Number of matches: " + num;
        }, 500);
    }

    function startTimer(timeLimit) {
        let remainingTime = timeLimit;

        const timerDisplay = document.getElementById("timer");

        function updateTimer() {
            timerDisplay.innerText = formatTime(remainingTime);

            if (remainingTime === 0) {
                clearInterval(timerInterval); // Stop the timer
                alert("Time's up! Game over.");
                $('#reset').click();
            }

            remainingTime--;
        }

        updateTimer(); // Update the timer immediately

        timerInterval = setInterval(updateTimer, 1000); // Update the timer every second
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }
});


// Get the DarkMode button element
const darkModeButton = document.getElementById('dark-mode-button');

// Define a variable to keep track of the current color state
let isDarkMode = false;

// Add an event listener to the button
darkModeButton.addEventListener('click', function () {
    // Toggle the color state
    isDarkMode = !isDarkMode;

    // Change the background color based on the color state
    if (isDarkMode) {
        document.body.style.backgroundColor = '#000000'; // Black color
        darkModeButton.innerHTML = 'Light Mode';
    } else {
        document.body.style.backgroundColor = '#FFFFFF'; // White color
        darkModeButton.innerHTML = 'Dark Mode';
    }
});