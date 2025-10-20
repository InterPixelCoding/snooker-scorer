const dropdowns = document.querySelectorAll(".selection-menu .dropdown");
const landscape = document.querySelector(".landscape");
const portrait = document.querySelector(".portrait");
const selection_menu = document.querySelector(".selection-menu");

function activate(el) {
    el.classList.add("active")
}

function deactivate(el) {
    el.classList.add("active")
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

function initiate_dropdowns(json) {
    dropdowns.forEach(dropdown => {
        for(let i = 0; i<json.length; i++) {
            let username = json[i].username;
            const player_span = document.createElement("span");
            player_span.textContent = username;
            dropdown.appendChild(player_span)
        }
    })
}

async function selection_menu_logic() {
    const start_session = document.querySelector(".start-session");
    let player_indexes = [];

    dropdowns.forEach(function(dropdown, index) {
        const btn = dropdown.parentElement.querySelector("button");
        const player_span = document.querySelectorAll("span.player")[index];

        btn.onclick = () => {
            dropdown.classList.toggle("active");
        };

        dropdown.addEventListener("click", (e) => {
            let player_index = Array.from(dropdown.children).indexOf(e.target);
            player_indexes[index] = player_index;
            player_span.textContent = e.target.textContent;
            player_span.classList.add("active");
        });
    });

    return new Promise((resolve) => {
        start_session.onclick = () => {
            if (player_indexes.length < 2) {
                modal("Please select each player using the dropdown menus");
            } else if (player_indexes[0] === player_indexes[1]) {
                modal("Please select two different players to start the session");
            } else {
                const players_arr = Array.from(document.querySelectorAll("span.player"))
                    .map(item => item.textContent);

                resolve(players_arr);
            }
        };
    });
}

function initialise_scores(usernames, total_frames, players, frames_count, frames_arr) {
    usernames.forEach(function(username, index) {username.textContent = players[index].username});
    document.querySelector(".player-1-frames").textContent = frames_arr[0];
    document.querySelector(".player-2-frames").textContent = frames_arr[1];
    document.querySelector(".total-frames").textContent = `(${frames_count})`;
}

function start_match(players, frames_count, frames_arr) {
    const usernames = document.querySelectorAll(".usernames-container > span");
    const total_frames = document.querySelectorAll(".frames > *");
    let scores = [0, 0];
    initialise_scores(usernames, total_frames, players, frames_count, frames_arr);

    

}

function main_session(players, json) {
    let frames_count = 0; frames_arr = [0, 0];
    let session_players = []; players.forEach(player => {for(let i = 0; i<json.length; i++) {if(player === json[i].username) {session_players.push(json[i]);}}})
    activate(landscape);
    deactivate(selection_menu);

    frames_count++;
    start_match(session_players, frames_count, frames_arr);

}

window.addEventListener("DOMContentLoaded", () => {
    let json = JSON.parse(localStorage.getItem("snooker_scorer_json"));
    initiate_dropdowns(json);
    selection_menu_logic(json)
    .then(players => main_session(players, json));
});