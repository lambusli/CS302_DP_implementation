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

function Player(position, index, cost, vorp){
	this.position = +position; // int
	this.index = +index; // int
	this.cost = +cost; // int
	this.vorp = +vorp; // int
}

function randomPlayer(position, index) {
	let cost = Math.floor(Math.random() * 10) + 3;
	let vorp = Math.floor(Math.random() * 20);
	return (new Player(position, index, cost, vorp));
}

const N = 6 // # positions
const P = 10 // # plaers per position
const BUDGET = 100;
var PlayerList = [null];
var Table = d3.select("#player_matrix");
var DP_table = d3.select("#DP_matrix");

function makePlayerList(n, p) {
	for (let i = 1; i <= n; i++){
		let thisRow = [null]
		for (let j = 1; j <= p; j++) {
			let obj = randomPlayer(i, j)
			thisRow.push(obj);
		}
		PlayerList.push(thisRow);
	}
}

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
			.classed("entry", "true")
			.attr("id", (d, idx) => "player_" + i + '_' + (idx + 1))
			.text((d, idx) => PlayerList[i][idx + 1].cost + ', ' + PlayerList[i][idx + 1].vorp);
	}
}

// recommended budget: 45
function DP(budget, n, p){
	// T[i, j] = optimized total vorp of the first jth position, if we use maximumly i dollars
	// Choice[i, j] = the optimal player choice of jth position, using maximumly i dollars
	var T = makeArray(budget, n, 0);
	var choice = makeArray(budget, n, null);

	// Add table head
	let header_row = DP_table.append("tr")
	header_row.append("th").text("(Player_id, Total VORP)")
	for (let i = 1; i <= n; i++) {
		header_row.append("th").text("Pos " + i);
	}

	for (let i = 1; i <= budget; i++) {
		thisRow = DP_table.append("tr")
		thisRow.append("th").text("Budget $" + i);
		// each position
		for (let j = 1; j <= n; j++) {

			T[i][j] = T[i][j - 1] // assume not signing the current position j
			choice[i][j] = null;

			// each player at this position
			for (let k = 1; k <= p; k++) {
				if (i - PlayerList[j][k].cost >= 0){
					let temp = T[i - PlayerList[j][k].cost][j - 1] + PlayerList[j][k].vorp;
					if (temp > T[i][j]) {
						T[i][j] = temp;
						choice[i][j] = PlayerList[j][k];
					}
				}
			}

			// Enter data into table
			let choiceText = choice[i][j] == null ? "None" : choice[i][j]["index"];
			thisRow.append("td")
				.classed("DP_entry", true)
				.classed("id", "DP_" + i + "_" + j)
				.text(choiceText + " " + T[i][j]);

		}
	}
}

makePlayerList(N, P);
player_info_table(N, P);
DP(BUDGET, N, P)
