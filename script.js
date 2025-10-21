const dropdowns = document.querySelectorAll(".selection-menu .dropdown");
const landscape = document.querySelector(".landscape");
const portrait = document.querySelector(".portrait");
const selection_menu = document.querySelector(".selection-menu");
const balls = document.querySelector(".balls");
const shot_type = document.querySelector(".shot-type");
const scores = document.querySelectorAll(".player > span.score");
const undo = document.querySelector(".undo");
const redo = document.querySelector(".redo");
const ball_values = [
    { colour: "red", value: 1 },
    { colour: "yellow", value: 2 },
    { colour: "green", value: 3 },
    { colour: "brown", value: 4 },
    { colour: "blue", value: 5 },
    { colour: "pink", value: 6 },
    { colour: "black", value: 7 },
    { colour: "white", value: null },
    { colour: "safety", value: 0 },
];

function activate(el) {
    if(el) {
        if(el.length == undefined) {
            el.classList.add("active")
        } else {
            el.forEach(sub_el => {
                sub_el.classList.add("active")
            })
        }
    } else {
        console.error(el, " not defined!")
    }
    
}

function deactivate(el) {
    if(el) {
        if(el.length == undefined) {
            el.classList.remove("active")
        } else {
            el.forEach(sub_el => {
                sub_el.classList.remove("active")
            })
        } 
    } else {
        console.error(el, " not defined!")
    }
}

function modal(text) {
    const modal_container = document.createElement("div");
    const modal_text = document.createElement("span");
    const ok = document.createElement("button");
    ok.textContent = "Ok!"
    modal_container.classList.add("modal-container");
    modal_text.classList.add("modal-text");
    modal_text.textContent = text;
    modal_container.appendChild(modal_text);
    modal_container.appendChild(ok);
    document.body.appendChild(modal_container);

    setTimeout(() => {
        activate(modal_container);
    }, 100);
    ok.onclick = () => {
        deactivate(modal_container);
        setTimeout(() => {
            modal_container.remove()
        }, 500);
    }
}

async function sync() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.style.display = "none";

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject("No file selected");
                return;
            }

            try {
                const text = await file.text();
                const json_data = JSON.parse(text);
                document.querySelector(".sync > img").style.animation = "spin 3s ease forwards";
                localStorage.setItem("snooker_scorer_json", JSON.stringify(json_data));
                resolve(json_data);
            } catch (err) {
                reject(`Error reading JSON file: ${err.message}`);
            }
        };

        document.body.appendChild(input);
        input.click();

        input.addEventListener("click", () => {
            setTimeout(() => input.remove(), 0);
        });
    });
}

function initialise_dropdowns(json) {
    dropdowns.forEach(dropdown => {
        if(!dropdown.classList.contains("who-breaks")) {
            for(let i = 0; i<json.length; i++) {
                const player_span = document.createElement("span");
                let username = json[i].username;
                player_span.textContent = username;
                dropdown.appendChild(player_span)
            }
        }
    });
}

function deactivate_other_dropdowns() {
    let players = [...document.querySelectorAll("span.player")].map(player => player.textContent);
    const dropdown = document.querySelector(".dropdown.who-breaks")
    if(players.includes('')) {
        modal("You must select both players before choosing who breaks!")
    } else if (players[0] === players [1]) {
        modal("Please select two different players!")
    } else if (Array.from(document.querySelectorAll(".dropdown.who-breaks > span")).length < 2) {
        players.forEach(player => {
            const player_span = document.createElement("span");
            player_span.textContent = player;
            dropdown.appendChild(player_span)
        });
        deactivate(document.querySelectorAll(".dropdown:not(.who-breaks)"));
    } else {
        deactivate(document.querySelectorAll(".dropdown:not(.who-breaks)"));
    }
}

async function selection_menu_logic() {
    const start_session = document.querySelector(".start-session");
    let player_indexes = [];
    let who_breaks;

    document.querySelector(".toss").onclick = () => {
        if (player_indexes.length < 2) {
            modal("Please select the players before you toss the coin!");
        } else {
            let random = Math.round(Math.random());
            who_breaks = document.querySelectorAll("span.player")[random].textContent;
            modal(`${who_breaks} has won the toss`);
        }

    }

    dropdowns.forEach(function(dropdown, index) {
        const btn = dropdown.parentElement.querySelector("button");
        const player_span = document.querySelectorAll("span.player")[index];

        btn.onclick = () => {
            if(btn.classList.contains("who-breaks-button")) {
                setTimeout(() => {
                    dropdown.classList.toggle("active")
                }, 125);
            } else {
                dropdown.classList.toggle("active")
            }
        };

        dropdown.addEventListener("click", (e) => {
            if(e.target.parentElement.classList.contains("who-breaks")) {
                who_breaks = e.target.textContent;
            } else {
                let player_index = Array.from(dropdown.children).indexOf(e.target);
                player_indexes[index] = player_index;
                player_span.textContent = e.target.textContent;
                activate(player_span)
            }
        });
    });

    document.querySelector(".who-breaks-button").addEventListener("click", deactivate_other_dropdowns);

    return new Promise((resolve) => {
        start_session.onclick = () => {
            if (player_indexes.length < 2) {
                modal("Please select each player using the dropdown menus");
            } else if (player_indexes[0] === player_indexes[1]) {
                modal("Please select two different players to start the session");
            } else if (who_breaks == undefined) {
                modal("Please select who breaks");
            }
            else {
                const players_arr = Array.from(document.querySelectorAll("span.player"))
                    .map(item => item.textContent);
                players_arr.push(who_breaks);
                resolve(players_arr);
            }
        };
    });
}

function initialise_scores(usernames, players, current_player, frames_count, frames_arr) {
    usernames.forEach(function(username, index) {username.textContent = players[index].username});
    const player_1_frames = document.querySelector(".player-1-frames");
    const player_2_frames = document.querySelector(".player-2-frames");
    const total_frames = document.querySelector(".total-frames");

    player_1_frames.textContent = frames_arr[0];
    player_2_frames.textContent = frames_arr[1];
    total_frames.textContent = `(${frames_count})`;

    const carets = [document.querySelector(".left-caret"), document.querySelector(".right-caret")]
    activate(carets[current_player]);
}

function update_score(current_player, value) {
    scores[current_player].textContent = value
}

function switch_carets(player_index = null) {
    const carets = document.querySelectorAll(".player-indicator");
    if (player_index !== null) {
        carets.forEach((caret, index) => {
            caret.classList.toggle("active", index === player_index);
        });
    } 
    else {
        carets.forEach(caret => caret.classList.toggle("active"));
    }
}

function update_score_history(scores, current_player) {
    let new_log = [scores[0], scores[1], current_player];
    score_history.push(new_log);
    console.log(score_history);
}

function average(x,y) {return (x+y)/2}

let score_history = [];
let history_index = 0;

function start_match(players, frames_count, frames_arr) {
    const usernames = document.querySelectorAll(".usernames-container > span");
    let scores = [0, 0];
    let current_player = players.indexOf(players[2]);
    score_history = [[0, 0, current_player]];
    history_index = 0;
    players.pop();

    // Initialise JSON objects
    let match_stats = {
        "players": players,
        "winner": null
    };

    let p1_stats = {

    };
    
    let p2_stats = {};


    initialise_scores(usernames, players, current_player, frames_count, frames_arr);
    
    balls.addEventListener("click", (e) => {
        let shot = (Array.from(shot_type.children)
            .filter(type => type.classList.contains("active")))[0].textContent;

        let colour = e.target.classList[0];
        let ball_value = (ball_values.find(ball => ball.colour === colour))?.value ?? null;

        // === SCORING LOGIC ===
        if (colour === "safety") {
            current_player = Math.abs(1 - current_player);
            switch_carets();
            return;
        }

        if (shot === "Pot") {
            scores[current_player] += ball_value;
            update_score(current_player, scores[current_player]);

        } else if (shot === "Miss") {
            current_player = Math.abs(1 - current_player);
            switch_carets();

        } else if (shot === "Foul") {
            if (ball_value === 1) ball_value = 4;
            current_player = Math.abs(1 - current_player);
            scores[current_player] += ball_value;
            update_score(current_player, scores[current_player]);
            switch_carets();

        } else if (shot === "Fluke") {
            scores[current_player] += ball_value;
            update_score(current_player, scores[current_player]);
        }

        // === HISTORY MANAGEMENT ===
        score_history.splice(history_index + 1); // remove future states
        score_history.push([...scores, current_player]); // push new snapshot
        history_index++;

        console.log("History:", score_history);
    });

    shot_type.addEventListener("click", (e) => {
        const spans = Array.from(document.querySelectorAll(".shot-type > span"));
        if (spans.includes(e.target)) {
            deactivate(document.querySelector(".shot-type > span.active"));
            activate(e.target);

            let shot = e.target.textContent;
            if (shot !== "Pot") deactivate(document.querySelector(".white"));
            else activate(document.querySelector(".white"));

            if (shot === "Foul") deactivate(document.querySelector(".safety"));
            else activate(document.querySelector(".safety"));
        }
    });

    // === UNDO / REDO ===
    undo.onclick = () => {
        if (history_index > 0) {
            history_index--;
            let [p1, p2, player] = score_history[history_index];
            scores = [p1, p2];
            current_player = player;
            update_score(0, p1);
            update_score(1, p2);
            switch_carets(current_player);
        }
    };

    redo.onclick = () => {
        if (history_index < score_history.length - 1) {
            history_index++;
            let [p1, p2, player] = score_history[history_index];
            scores = [p1, p2];
            current_player = player;
            update_score(0, p1);
            update_score(1, p2);
            switch_carets(current_player);
        }
    };
}

function main_session(players, json) {
    let frames_count = 0; frames_arr = [0, 0];
    let session_players = []; players.forEach(player => {for(let i = 0; i<json.length; i++) {if(player === json[i].username) {session_players.push(json[i]);}}})
    activate([landscape, portrait]);
    deactivate(selection_menu);

    frames_count++;
    start_match(session_players, frames_count, frames_arr);

}

window.addEventListener("DOMContentLoaded", () => {
    let json = JSON.parse(localStorage.getItem("snooker_scorer_json"));
    initialise_dropdowns(json);
    selection_menu_logic(json)
    .then(players => main_session(players, json));
});