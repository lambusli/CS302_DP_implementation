/*----------------
* Default values
-----------------*/
const N = 4 // # positions
const P = 5 // # players per position
const BUDGET = 20;
var PlayerList = [null];
var Table = d3.select("#player_matrix");
var DP_table = d3.select("#DP_matrix");
const LP = 3;
const UP = 15;
var tj = 400;
var tk = tj / P;
var ti = tj * N;
var T = [];
var choice = [];


/* -----------
* Player object
-------------*/
function Player(position, index, cost, vorp){
	this.position = +position; // int
	this.index = +index; // int
	this.cost = +cost; // int
	this.vorp = +vorp; // int
}

/*-------------
* Generate a 2D Array
-------------*/
function makeArray(nRow, nCol, initVal) {
    var arr = [];
    for(i = 0; i <= nRow; i++) {
        arr.push(new Array(nCol + 1));
    }

	for (let i = 0; i <= nRow; i++) {
		for (let j = 0; j <= nCol; j++){
			arr[i][j] = initVal;
		}
	}
    return arr;
}

/*-------------
* Generate a random player
* Vorp = k * cost +/- deviation
* Can be changed manually
-------------*/
function randomPlayer(position, index, lp, up) {
	let cost = Math.floor(Math.random() * (up - lp)) + lp;
	let vorp = cost * 10;
	let dev = 0.7 * vorp;
	vorp += Math.floor(Math.random() * dev - dev / 2);
	return (new Player(position, index, cost, vorp));
}

/*-------------
* Generate a list of player
-------------*/
function makePlayerList(n, p, lp, up) {
	for (let i = 1; i <= n; i++){
		let thisRow = [null]
		for (let j = 1; j <= p; j++) {
			let obj = randomPlayer(i, j, lp, up)
			thisRow.push(obj);
		}
		PlayerList.push(thisRow);
	}
}

/*-------------
* Generate a play info table in html
*
-------------*/
function player_info_table(n, p){
	var header_row = Table.append("tr");

	// Create header row
	header_row.append("th").text('(Cost, VORP)');
	for (let i = 1; i <= p; i++) {
		header_row.append("th").text("Player " + i);
	}

	// Finish the rest of table
	for (let i = 1; i <= n; i++) {
		let thisRow = Table.append("tr");
		thisRow.append("th").text("Pos " + i);
		thisRow.selectAll(".entry")
			.data(PlayerList[i].slice(1))
			.enter()
			.append("td")
			.attr("id", (d, idx) => "plentry_" + i + "_" + (idx + 1))
			.classed("plentry", true)
			.append("input")
			.attr("id", (d, idx) => "player_" + i + '_' + (idx + 1))
			.classed("entry", "true")
			.attr("value", (d, idx) => PlayerList[i][idx + 1].cost + ', ' + PlayerList[i][idx + 1].vorp);
	}

	// Event handler for price and value change
	// Update player list
	d3.selectAll(".entry").on("change", function(){
		d3.selectAll(".entry").style("background-color", "");
		d3.selectAll(".plentry").style("background-color", "");

		let info = d3.select(this).attr("id").split("_");
		let val = d3.select(this).property("value").split(",");

		let pos = +info[1]  // position of "changed" player
		let idx = +info[2] // index of "changed" player
		let newCost = +val[0] // newly changed cost
		let newVorp = +val[1] // newly changed vorp
		PlayerList[pos][idx].cost = newCost;
		PlayerList[pos][idx].vorp = newVorp;
	});
}

/*-------------
* Dynamic programming
-------------*/
function DP(budget, n, p, ti, tj, tk){
	DP_table.html("");
	// T[i, j] = optimized total vorp of the first jth position, if we use maximumly i dollars
	// Choice[i, j] = the optimal player choice of jth position, using maximumly i dollars
	T = makeArray(budget, n, 0);
	choice = makeArray(budget, n, null);

	// Add table head
	let header_row = DP_table.append("tr")
	header_row.append("th").text("(Player index, Total VORP)")
	for (let i = 1; i <= n; i++) {
		header_row.append("th").text("Pos " + i);
	}

	// start calculation
	// At each level of loop, I employ the function setTimeout() to create animation
	// bug: speed of animation can't be changed during animation
	for (let i = 1; i <= budget; i++) { // i: each amount of budget

		(function(i){ setTimeout(function(){
			let thisRow = DP_table.append("tr")
			thisRow.append("th").text("Budget $" + i);

			for (let j = 1; j <= n; j++) {// j: each position

				(function(j){setTimeout(function(){

					T[i][j] = T[i][j - 1] // assume not signing the current position j
					choice[i][j] = null;

					// show initial info in the table entry
					let thisGrid = thisRow.append("td")
						.classed("DP_entry", true)
						.attr("id", "DP_" + i + "_" + j)
						.text("None" + ", " + T[i][j]);

					for (let k = 1; k <= p; k++) { // k: each player at this position
						(function (k) {setTimeout(function () {
							// Clear previous color
							d3.selectAll(".DP_entry").style("background-color", "");

							let prevCost = i - PlayerList[j][k].cost;
							let prevPos = j - 1;

							if (prevCost >= 0){ // prevCost must >=0 s.t. no negative index for array

								d3.select("#DP_" + prevCost + "_" + prevPos)
									.style("background-color", "#CEB3AB");

								let temp = T[prevCost][prevPos] + PlayerList[j][k].vorp;
								if (temp > T[i][j]) { // if find a better choice, update
									T[i][j] = temp;
									choice[i][j] = PlayerList[j][k];

									// show which "subsolution" the better choice comes from
									d3.select("#DP_" + (prevCost) + "_" + prevPos)
										.style("background-color", "#FF5714");

									let choiceText = choice[i][j] == null ? "None" : choice[i][j]["index"];
									thisGrid.text(choiceText + ", " + T[i][j])
								}
							}

						}, tk * (k - 1));})(k);
					}
				}, tj * (j - 1));})(j)
			}
		}, ti * (i - 1));})(i);

	}
}

/* ----------------
* Upon creation of Table
---------------*/
d3.select("#create").on("click", function(){
	PlayerList = [null]
	Table.html("");
	DP_table.html("");

	// update parameters
	var n = document.getElementById("num_pos").value == "" ? N : +document.getElementById("num_pos").value;
	var p = document.getElementById("num_player").value == "" ? P : +document.getElementById("num_player").value;
 	var budget= document.getElementById("num_budget").value == "" ? BUDGET : +document.getElementById("num_budget").value;
	lp = document.getElementById("num_lp").value == "" ? LP : +document.getElementById("num_lp").value;
	up = document.getElementById("num_up").value == "" ? UP : +document.getElementById("num_up").value;
	var tj = document.getElementById("speed").value;
	var tk = tj / p;
	var ti = tj * n;

	makePlayerList(n, p, lp, up);
	player_info_table(n, p);

	// Start DP calculation
	d3.select("#start")
		.classed("hidden", false)
		.on("click", function(){
			DP(budget, n, p, ti, tj, tk);

			// Executed when calculation is done
			setTimeout(function(){
				d3.selectAll(".DP_entry").style("background-color", "");

				let infoText = "";
				i = budget, j = n;
				// save as much budget as we can
				while(T[i][j] == T[i - 1][j]) {
					i--;
				}
				infoText += "We use $" + i + " from the budget $" + budget
				infoText += "\nThe chosen player has been highlighted in the player list.";
				let choiceList = [];
				while (i > 0 && j > 0) {
					currP = choice[i][j];
					if (currP != null) {
						choiceList.push(currP)
						selector = currP.position + "_" + currP.index;
						d3.select("#player_" + selector).style("background-color", "yellow");
						d3.select("#plentry_" + selector).style("background-color", "yellow");
						i -= currP.cost;
					}
					j--;
				}
				console.log(choiceList)
				alert(infoText);

			}, ti * (budget));
		});

})
