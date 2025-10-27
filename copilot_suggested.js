// ...existing code...
-    balls.addEventListener("click", (e) => {
+    // ensure any previous handler is cleared, then assign a single handler per match
+    balls.onclick = null;
+    balls.onclick = (e) => {
         let shot = (Array.from(shot_type.children)
             .filter(type => type.classList.contains("active")))[0].textContent;
 
     // ...existing code...
-    balls.addEventListener("click", (e) => {
+    // ensure any previous handler is cleared, then assign a single handler per match
+    balls.onclick = null;
+    balls.onclick = (e) => {
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
 
-    })
+    };
 
-    shot_type.addEventListener("click", (e) => {
+    // replace shot_type listener similarly so it doesn't accumulate between matches
+    shot_type.onclick = null;
+    shot_type.onclick = (e) => {
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
-    });
+    };
 // ...existing code...    let colour = e.target.classList[0];
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
 
-    })
+    };
 
-    shot_type.addEventListener("click", (e) => {
+    // replace shot_type listener similarly so it doesn't accumulate between matches
+    shot_type.onclick = null;
+    shot_type.onclick = (e) => {
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
-    });
+    };
 // ...existing code...