const dropdowns = document.querySelectorAll(".selection-menu .dropdown");
const landscape = document.querySelector(".landscape");
const portrait = document.querySelector(".portrait");
const selection_menu = document.querySelector(".selection-menu");
const balls = document.querySelector(".balls");
const shot_type = document.querySelector(".shot-type");
const scores = document.querySelectorAll(".player > span.score");
const undo = document.querySelector(".undo");
const redo = document.querySelector(".redo");
const end_match = document.querySelector(".end-match");
const end_session = document.querySelector(".end-session");
const highest_break_spans = document.querySelectorAll(".highest-break");
const player_stats = document.querySelector(".player-stats");
const wrapper = document.querySelector(".wrapper");
const player_stats_container = document.querySelector(".player-stats-container");
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

function el(str) {
    const [tag, classes] = str.split(".");
    const dom_el = document.createElement(tag);

    if (classes) {
        classes.split(",").forEach(class_name => {
            dom_el.classList.add(class_name.trim());
        });
    }

    return dom_el;
}

Element.prototype.appendChildren = function(...children) {
    children.forEach(child => {
        if (child instanceof Node) {
            this.appendChild(child);
        } else {
            this.appendChild(document.createTextNode(child));
        }
    });
    return this;
};

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
        let i = 0

        btn.onclick = () => {
            i++;
            if(btn.classList.contains("who-breaks-button")) {
                setTimeout(() => {
                    dropdown.classList.toggle("active")
                }, 125);
            } else {
                btn.querySelector("img").classList.toggle("active");
                if(i === 1) {
                    wrapper.style.height = `${wrapper.offsetHeight}px`;
                }
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

function update_score(current_player, value, highest_breaks) {
    scores[current_player].textContent = value;
    highest_break_spans.forEach(function(span, index) {
        span.textContent = `Highest Break: ${highest_breaks[index]}`;
    })
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
}

function calculate_average_break(current_player, breaks, average_break, current_break) {
    const prev_break_average = average_break[current_player];
    return ((prev_break_average * breaks[current_player]) + current_break) / (breaks[current_player] + 1);
}

function average(x,y) {return (x+y)/2}

function update_player_objects(scores, winner, current_player, breaks, average_break, break_value, highest_breaks, match_stats, players, stats_arr, pots, misses, flukes, wtcbg, safeties, hits, end_match=true) {
    
    let winner_index;

    if(end_match) {
        winner_index = scores.indexOf(Math.max(...scores));
        winner[winner_index] = 1;
        match_stats.winner = players[winner_index].username;
    }

    average_break[current_player] = calculate_average_break(current_player, breaks, average_break, break_value);
    highest_breaks[current_player] = Math.max(highest_breaks[current_player], break_value);

    match_stats.players = [players[0].username, players[1].username];
    match_stats.score = scores;

    let stats_layout = {
            "General": {
                "Highest Break": [],
                "Total Pots": [],
                "WTCBG?": []
            },

            "Frames": {
                "Frames Won": [],
                "Frames Played": []
            },

            "Game Stats": {
                "Average Break": [],
                "Pot Probability": [],
                "Safety : Attack": [],
                "Fluke probability": []
            }
        }   
    

    stats_arr.forEach((player, index) => {
        
        const obj = players[index].stats.master;
        obj.games_played++;

        const safe = v => Number.isFinite(v) ? v : 0;

        // === Derived values (merged safe + obj + val logic) ===
        const games_played = safe(obj.games_played);
        const pots_val = safe(pots[index]);
        const misses_val = safe(misses[index]);
        const highest_break_val = safe(highest_breaks[index]);
        const avg_break_val = safe(average_break[index]);
        const flukes_val = safe(flukes[index]);
        const wtcbg_val = safe(wtcbg[index]);
        const safeties_val = safe(safeties[index]);
        const hits_val = Math.max(safe(hits[index]), 1);
        const winner_val = safe(winner[index]);

        // === Player assignments as variables ===
        const games_played_final = games_played;

        const break_pb = Math.max(highest_break_val, safe(obj.break_pb));

        const games_won = end_match ? winner_val + safe(obj.games_won) : safe(obj.games_won);
        
        const frame_win_percentage = end_match
            ? Math.min((safe(obj.games_won) + winner_val) / Math.max(games_played_final, 1), 1)
            : safe(obj.frame_win_percentage);

        const pot_success_rate = Math.min(
            (safe(obj.pot_success_rate) * safe(obj.total_pots) + (pots_val + flukes_val)) /
            safe(obj.total_pots + pots_val + flukes_val + misses_val),
            1
        );

        const total_pots = safe(obj.total_pots) + pots_val;

        const average_break_val = obj.average_break > 0
            ? (safe(obj.average_break) * (games_played - 1) + avg_break_val) / games_played
            : avg_break_val;

        const fluke_ratio = Math.min(
            ((flukes_val / Math.max(pots_val, 1)) + safe(obj.fluke_ratio) * (games_played - 1)) / games_played,
            1
        );

        const wheres_the_cue_ball_going = wtcbg_val + safe(obj.wheres_the_cue_ball_going);

        const safety_attack_ratio = Math.min(
            ((safe(safeties_val / hits_val) + safe(obj.safety_attack_ratio) * (games_played - (games_played > 1 ? 1 : 0)))) / games_played,
            1
        );

        // === Assign back to player ===
        player.games_played = games_played_final;
        player.break_pb = break_pb;
        player.games_won = games_won;
        player.frame_win_percentage = frame_win_percentage;
        player.pot_success_rate = pot_success_rate;
        player.total_pots = total_pots;
        player.average_break = average_break_val;
        player.fluke_ratio = fluke_ratio;
        player.wheres_the_cue_ball_going = wheres_the_cue_ball_going;
        player.safety_attack_ratio = safety_attack_ratio;

        stats_layout.General["Highest Break"].push(break_pb);
        stats_layout.General["Total Pots"].push(total_pots);
        stats_layout.General["WTCBG?"].push(wheres_the_cue_ball_going);

        stats_layout.Frames["Frames Played"].push(games_played_final);
        stats_layout.Frames["Frames Won"].push(games_won);

        stats_layout["Game Stats"]["Average Break"].push(average_break_val);
        stats_layout["Game Stats"]["Pot Probability"].push(pot_success_rate);
        stats_layout["Game Stats"]["Safety : Attack"].push(safety_attack_ratio);
        stats_layout["Game Stats"]["Fluke probability"].push(fluke_ratio);

        let snooker_object = JSON.parse(localStorage.getItem("snooker_scorer_json"));
        
        let global_player_index = snooker_object.findIndex(player_obj => player_obj.username === players[index].username);
        let stats = snooker_object[global_player_index].stats;

        if(end_match) {
            let timestamp = new Date();
            let timestamp_key = timestamp.getTime();
            stats[timestamp_key] = player;
        } 

        stats.master = player;

        localStorage.setItem("snooker_scorer_json", JSON.stringify(snooker_object));
    });

    return stats_layout;
}

function force_landscape(els = document.querySelectorAll(".force-landscape")) {
    els.forEach(container => {
        let pseudo_width = document.body.offsetWidth > document.body.offsetHeight ? document.body.offsetWidth : document.body.offsetHeight;
        let pseudo_height = document.body.offsetWidth < document.body.offsetHeight ? document.body.offsetWidth : document.body.offsetHeight;
        container.style.width = `${pseudo_width}px`;
        container.style.height = `${pseudo_height}px`;
    })
}

function update_statistics(layout) {
    const stats_wrapper = el("div.stats-wrapper");
    const players = Array.from(document.querySelectorAll(".usernames-container > span")).map(span => span.textContent);
    const player_1_span = el("span.player-1"); const player_2_span = el("span.player-2");
    player_1_span.textContent = players[0]; player_2_span.textContent = players[1];
    stats_wrapper.appendChildren(player_1_span, player_2_span);

    Object.entries(layout).forEach(([category, stats]) => {
        const category_heading = el(`h2`);
        category_heading.textContent = category;
        stats_wrapper.appendChild(category_heading);
        Object.entries(stats).forEach(([stat, values]) => {
            let statistic_heading = el(`h4`);
            statistic_heading.textContent = stat;
            stats_wrapper.appendChild(statistic_heading);
            values.forEach(value => {
                let stat_value = el("span.stat")
                stat_value.textContent = value;
                stats_wrapper.appendChild(stat_value);
            })
        })
    })
    player_stats_container.appendChild(stats_wrapper);
}   

force_landscape();

let score_history = [];
let history_index = 0;
let break_value = 0;

function start_match(players, frames_count, frames_arr) {
    const usernames = document.querySelectorAll(".usernames-container > span");

    let scores = [0, 0];
    let highest_breaks = [0,0];
    let flukes = [0,0];
    let breaks = [0,0];
    let average_break = [0,0];
    let pots = [0,0];
    let misses = [0,0];
    let hits = [0,0];
    let safeties = [0,0];
    let wtcbg = [0,0];
    let winner = [0,0]; // 1 = winner, 0 = loser

    let current_player = players.indexOf(players[2]);
    score_history = [[0, 0, current_player]];
    history_index = 0;
    players.pop();

    // Initialise JSON objects
    let match_stats = {
        "players": players,
        "score": scores,
        "winner": null
    };

    const empty_arr = {
        "games_played": 0,
        "total_pots": 0,
        "break_pb": 0,
        "frame_win_percentage": 0,
        "pot_success_rate": 0,
        "average_break": 0,
        "fluke_ratio": 0,
        "wheres_the_cue_ball_going": 0,
        "safety_attack_ratio": 0,
        "games_won": 0
    };

    let p1_stats = {...empty_arr}; let p2_stats = {...empty_arr};

    let stats_arr = [p1_stats, p2_stats];

    initialise_scores(usernames, players, current_player, frames_count, frames_arr);
    
    balls.addEventListener("click", (e) => {
        let shot = (Array.from(shot_type.children)
            .filter(type => type.classList.contains("active")))[0].textContent;

        let colour = e.target.classList[0];
        let ball_value = (ball_values.find(ball => ball.colour === colour))?.value ?? null;

        // === SCORING LOGIC ===
        if (["Pot", "Miss", "Foul", "Fluke"].includes(shot)) {
            if (colour === "safety") {
                // Safety = switch turn, end current break if active
                if (break_value > 0) {
                    highest_breaks[current_player] = Math.max(highest_breaks[current_player], break_value);
                    average_break[current_player] = calculate_average_break(current_player, breaks, average_break, break_value);
                    breaks[current_player]++;
                    break_value = 0;
                }
                safeties[current_player]++;
                current_player = Math.abs(1 - current_player);
                switch_carets();
                return;
            } else {
                hits[current_player]++;
            }

            if (shot === "Pot") {
                if (ball_value == null) { 
                    // Illegal pot (e.g., potting white) — foul, give 4 points to opponent
                    scores[Math.abs(1 - current_player)] += 4; 
                    update_score(Math.abs(1 - current_player), scores[Math.abs(1 - current_player)], highest_breaks);
                    wtcbg[current_player]++;
                    // End break and switch
                    if (break_value > 0) {
                        highest_breaks[current_player] = Math.max(highest_breaks[current_player], break_value);
                        average_break[current_player] = calculate_average_break(current_player, breaks, average_break, break_value);
                        breaks[current_player]++;
                        break_value = 0;
                    }
                    current_player = Math.abs(1 - current_player); 
                    switch_carets();
                } else {
                    // Normal pot
                    break_value += ball_value;
                    scores[current_player] += ball_value;
                    pots[current_player]++;
                    update_score(current_player, scores[current_player], highest_breaks);
                }

            } else if (shot === "Miss") {
                // Miss ends the current break
                highest_breaks[current_player] = Math.max(highest_breaks[current_player], break_value);
                
                if(break_value > 0) {
                    average_break[current_player] = calculate_average_break(current_player, breaks, average_break, break_value); 
                    breaks[current_player]++;
                }
                
                misses[current_player]++;
                break_value = 0;
                // Switch turn
                current_player = Math.abs(1 - current_player);
                switch_carets();

            } else if (shot === "Foul") {
                // Foul gives points to the opponent
                if (ball_value == 1) ball_value = 4;
                scores[Math.abs(1 - current_player)] += ball_value;
                update_score(Math.abs(1 - current_player), scores[Math.abs(1 - current_player)], highest_breaks);

                // End current break
                if (break_value > 0) {
                    highest_breaks[current_player] = Math.max(highest_breaks[current_player], break_value);
                    average_break[current_player] = calculate_average_break(current_player, breaks, average_break, break_value);
                    breaks[current_player]++;
                    break_value = 0;
                }

                current_player = Math.abs(1 - current_player);
                switch_carets();

            } else if (shot === "Fluke") {
                // A fluke counts as a successful pot
                scores[current_player] += ball_value;
                break_value += ball_value;
                flukes[current_player]++;
                update_score(current_player, scores[current_player], highest_breaks);
            }

            // === HISTORY MANAGEMENT ===
            score_history.splice(history_index + 1); // remove future states
            score_history.push([...scores, current_player]);
            history_index++;
        }

    })

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
            update_score(0, p1, highest_breaks);
            update_score(1, p2, highest_breaks);
            switch_carets(current_player);
        }
    };

    redo.onclick = () => {
        if (history_index < score_history.length - 1) {
            history_index++;
            let [p1, p2, player] = score_history[history_index];
            scores = [p1, p2];
            current_player = player;
            update_score(0, p1, highest_breaks);
            update_score(1, p2, highest_breaks);
            switch_carets(current_player);
        }
    };

    player_stats.onclick = () => {
        const stats_layout = update_player_objects(scores, winner, current_player, breaks, average_break, break_value, highest_breaks, match_stats, players, stats_arr, pots, misses, flukes, wtcbg, safeties, hits, false)
        update_statistics(stats_layout)
        activate(player_stats_container);
    } 
    end_match.onclick = () => {update_player_objects(scores, winner, current_player, breaks, average_break, break_value, highest_breaks, match_stats, players, stats_arr, pots, misses, flukes, wtcbg, safeties, hits)} 

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