
$(document).ready(function(){

	model = createModel();
  	game = new TicTacToe();
  	minimax_memo = {};

 	$(".cell").click(function(){
 		if(!game.isEnded()){
	 		let pos = $(this).data("pos") - 1;
	 		if(game.isCellFree(pos)){	// Input is valid
	 			game.setCell(pos, 1);
	 			printCell(pos+1, "<h1>X</h1>");
	 			winner = game.checkWinner();
	 			if(winner == null){	// Game not over
	 				// minimax move
	 				optimal_move = getOptimalMove(game);
					botTurn(game, true);
					trainModel(model, game.getBoard(), optimal_move);
					winner = game.checkWinner();
				}	
				printResults(winner);
				if(winner != null){
					game.end();
				}
	 		}
	 	}
 	});

 	$("#auto-train").click(async function(){
 		$("#train-progress").html("training started");
 		const n_rounds = $("input[name='auto-train-rounds'").val();
 		for (var i = 0; i < n_rounds; i++){	// train for 50 games against minimax algorithm
  			training_ground = new TicTacToe();
  			first = true;
 			while(!training_ground.isEnded()){
 				// Minimax trainer ( with chaching )
 				let cache_key = training_ground.getBoard().join("");
 				if (first){	// First move is rand
	 				rand_move = Math.random()*9 + 1;
	 				optimal_move = training_ground.getBoard();
	 				//optimal_move[rand_move] = 1;
	 				optimal_move[5] = 1;
	 				first = false;
	 			}else{
	 				if(cache_key in minimax_memo){
	 					optimal_move = minimax_memo[cache_key];
	 				}else{
	 					optimal_move = getOptimalMove(training_ground);
	 					minimax_memo[cache_key] = optimal_move;
	 				}
	 			}
 				training_ground.setBoard(optimal_move);
 				if(training_ground.checkWinner() != null)
 					break;
 				// Bot
				botTurn(training_ground, false);
				// Training
				const c = await trainModel(model, training_ground.getBoard(), optimal_move);
				if(training_ground.checkWinner() != null)
 					break;
 			}
 			$("#train-progress").html("progress: "+i+"/"+n_rounds);
 		}
 		minimax_memo = {};	// Clear cache
 		$("#train-progress").html("training ended");
 	});

 	$("#reset-board").click(function(){
 		game.reset();
 		for(i in game.getBoard()){
 			printCell(parseInt(i)+1, "");
 		}
 		$("#winner").html("");
 	});

 	$("#export-model").click(function(){
 		saveModel(model);
 	});

 	$("#import-model").click(function(){
 		importModel(model);
 	});
});

function printCell(index, html){
	$("#c"+index).html(html);
}

function printResults(winner){
	if(winner != null){
		if( winner > 0 ){
			$("#winner").html("Player Wins!");
		}else if( winner < 0 ){
			$("#winner").html("Bot Wins!");
		}else{
			$("#winner").html("Draw");
		}
	}
}

class TicTacToe{
	constructor(){
		this.board = [0,0,0,0,0,0,0,0,0];
		this.game_end = false;
	}

	getBoard(){
		return this.board;
	}

	setBoard(new_board){
		for (var i = 0; i < this.board.length; i++) {
			this.board[i] = parseInt(new_board[i]);
		}
	}

	/** @return  1 = player1, -1 = player2, 0 draw */
	checkWinner(){
		// Check winner
		if(Math.abs(this.board[0]+this.board[3]+this.board[6]) == 3){			// Columns
			return (this.board[0]+this.board[3]+this.board[6])/3;

		}else if(Math.abs(this.board[1]+this.board[4]+this.board[7]) == 3){
			return (this.board[1]+this.board[4]+this.board[7])/3;

		}else if(Math.abs(this.board[2]+this.board[5]+this.board[8]) == 3){
			return (this.board[2]+this.board[5]+this.board[8])/3;

		}else if(Math.abs(this.board[0]+this.board[1]+this.board[2]) == 3){	// Rows
			return (this.board[0]+this.board[1]+this.board[2])/3;

		}else if(Math.abs(this.board[3]+this.board[4]+this.board[5]) == 3){
			return (this.board[3]+this.board[4]+this.board[5])/3;

		}else if(Math.abs(this.board[6]+this.board[7]+this.board[8]) == 3){
			return (this.board[6]+this.board[7]+this.board[8])/3;

		}else if(Math.abs(this.board[0]+this.board[4]+this.board[8]) == 3){	// Diagonals
			return (this.board[0]+this.board[4]+this.board[8])/3;

		}else if(Math.abs(this.board[2]+this.board[4]+this.board[6]) == 3){
			return (this.board[2]+this.board[4]+this.board[6])/3;
		}
		// Check Draw
		let sum = 0;
		for (var i = 0; i < this.board.length; i++) {
			if(this.board[i] == 0) break;
			sum += Math.abs(this.board[i]);
		}
		if(sum == 9){
			return 0; 
		}
		return null;	// Game still going
	}

	isCellFree(index){
		return this.board[index] == 0;
	}

	setCell(pos, val){
		this.board[pos] = val;
	}

	isEnded(){
		return this.game_end;
	}

	end(){
		this.game_end = true;
	}

	reset(){
		this.board = [0,0,0,0,0,0,0,0,0];
		this.game_end = false;
	}

	getAvailableMoves(player){
		let possible_moves = [];
		for (var i = 0; i < this.board.length; i++) {
			if(this.board[i] == 0){
				let copy_board = this.board.slice();
				copy_board[i] = player;
				possible_moves.push(copy_board);
			}
		}
		return possible_moves;
	}
}

function getOptimalMove(game){
	var board = game.getBoard();
	optimal_board = minimax(board, 0, -1);
	return optimal_board.move[0];	// For now choose only the first move
}

/*function getMove(old_board, new_board){
	for (var i = 0; i < old_board.length; i++) {
		if(old_board[i] != new_board[i]){
			return i;
		}
	}
	return -1;
}*/
/* AI */
function botTurn(game, print_cell){
	let board = game.getBoard();
	const input_board = tf.tensor2d([board]);

  	//predict_board = next_move(model, input_board);
  	predict_board = getOptimalMove(game);	// Test
  	console.log(predict_board);

  	let move = -100;
  	let choosen_cell = -1;
  	for(i = 0; i < board.length; i++){
  		/*if( predict_board[0][i] > move && board[i] == 0 ){
  			move = predict_board[0][i];
  			choosen_cell = i;
  		*/
  		if( predict_board[i] != board[i]){
  			choosen_cell = i;
  			break;
  		}
  	}

  	console.log(choosen_cell);

  	if(choosen_cell != -1){
  		game.setCell(choosen_cell, -1);
  	}

 	if(print_cell){
 		printCell(choosen_cell+1, "<h1>O</h1>"); 	
 	}
}

function createModel(){
	const model = tf.sequential();

	const hidden_1 = tf.layers.dense({units: 27, inputShape: [9], activation: "sigmoid"})
  	model.add(hidden_1);

  	//const hidden_2 = tf.layers.dense({units: 4, inputShape: [5], activation: "sigmoid"})
  	//model.add(hidden_2);

	const output = tf.layers.dense({units: 9, activation: "sigmoid"})
  	model.add(output);

  	const opt = tf.train.adam(0.1); // Test
  	model.compile({optimizer: opt, loss: "meanSquaredError"});

  	return model;
}

async function trainModel(model, actual_choice, opt_choice){
	const train_data = tf.tensor2d([actual_choice]);
	const expected_out = tf.tensor2d([opt_choice]);
	const h = await model.fit(train_data, expected_out, {epochs: 3});
	console.log("Loss: "+h.history.loss[0]);
}

function next_move(model, input){
	const next_move = model.predict(input);
  	return next_move.arraySync();	// array() ritorna una promise
}

async function saveModel(model){
	const saveResults = await model.save('downloads://my-model-1');
}

async function importModel(model){
	const uploadJSONInput = document.getElementById("upload-model");
	const uploadWeightsInput = document.getElementById("upload-weights");
	const model_up = await tf.loadLayersModel(tf.io.browserFiles(
			[uploadJSONInput.files[0], uploadWeightsInput.files[0]]));
	copyWeights(model, model_up);
}

function copyWeights(model, model_up){
	for (let i = 0; i < model.layers.length; i++) {
		model.layers[i].setWeights(model_up.layers[i].getWeights());
	}
}

/** Minimax Algorithm */
possible_reality = new TicTacToe();
function minimax(board, depth, player_turn){
	possible_reality.setBoard(board);
	if(score = possible_reality.checkWinner() != null)
			return {score:score*10, depth:depth};

	depth++;
	player_turn *= -1;
	
	var bestMove = null;
	var bestDepth = 11;
	var available_moves = possible_reality.getAvailableMoves(player_turn);

	if(player_turn > 0){
		bestScore = -10000000;
		for(move of available_moves){
			var board = move;
			var choice = minimax(board,depth, player_turn);
			if(choice.score > bestScore){
				bestScore = choice.score;
				bestDepth = choice.depth;
				bestMove = move;
			}else if(choice.score == bestScore){
				if(choice.depth < bestDepth){
					bestScore = choice.score;
					bestDepth = choice.depth;
					bestMove = move;
				}
			}
		}
	}else{
		bestScore = 10000000;
		for(move of available_moves){
			var board = move;
			var choice = minimax(board,depth, player_turn);
			if(choice.score < bestScore){
				bestScore = choice.score;
				bestDepth = choice.depth;
				bestMove = move;
			}else if(choice.score == bestScore){
				if(choice.depth < bestDepth){
					bestScore = choice.score;
					bestDepth = choice.depth;
					bestMove = move;
				}
			}	
		}
	}

	return {score:bestScore, move:[bestMove], depth:bestDepth};
}
