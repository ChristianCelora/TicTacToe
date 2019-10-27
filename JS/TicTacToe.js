
$(document).ready(function(){
	console.log("TICTACTOE");

	model = createModel();

  	game = new TicTacToe();

 	$(".cell").click(function(){
 		if(!game.isended()){
	 		let pos = $(this).data("pos") - 1;
	 		if(game.isCellFree(pos)){	// Input is valid
	 			game.setCell(pos, 1);
	 			printCell(pos+1, "<h1>X</h1>");
	 			winner = game.checkWinner();
	 			if(winner == null){	// Game not over
	 				// minimax move
	 				optimal_move = getOptimalMove(game);
					botTurn(game);
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

 	$("#reset-board").click(function(){
 		game.reset();
 		for(i in game.getBoard()){
 			printCell(parseInt(i)+1, "");
 		}
 		$("#winner").html("");
 	});
});

function printCell(index, html){
	$("#c"+index).html(html);
}

function printResults(winner){
	console.log("winner: "+winner);
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

	isended(){
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
	//return getMove(board, optimal_board); 	
	return optimal_board;
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
function botTurn(game){
	let board = game.getBoard();
	const input_board = tf.tensor2d([board]);

  	predict_board = next_move(model, input_board);
  	console.log(predict_board[0]);

  	let move = -100;
  	let choosen_cell = -1;
  	for(i=0; i< board.length; i++){
  		if( predict_board[0][i] > move && board[i] == 0 ){
  			move = predict_board[0][i];
  			choosen_cell = i;
  		}
  	}

  	if(choosen_cell != -1){
  		game.setCell(choosen_cell, -1);
  	}
 	console.log("mossa AI nella cella "+(choosen_cell+1));

 	printCell(choosen_cell+1, "<h1>O</h1>"); 	
}

function createModel(){
	const model = tf.sequential();

	const hidden = tf.layers.dense({units: 4, inputShape: [9], activation: "sigmoid"})
  	model.add(hidden);

	const output = tf.layers.dense({units: 9, activation: "sigmoid"})
  	model.add(output);

  	const opt = tf.train.adam(0.1); // Test
  	model.compile({optimizer: opt, loss: "meanSquaredError"});

  	console.log(model.summary());
  	return model;
}

function trainModel(model, actual_choice, opt_choice){
	const train_data = tf.tensor2d([actual_choice]);
	const expected_out = tf.tensor2d([opt_choice]);
	const h = model.fit(train_data, expected_out, {epochs: 3});
	console.log("Loss: "+h.history.loss[0]);
	return model;
}

function next_move(model, input){
	const next_move = model.predict(input);
  	return next_move.arraySync();	// array() ritorna una promise
}

possible_reality = new TicTacToe();
function minimax(board, depth, player_turn){
	possible_reality.setBoard(board);
	if(score = possible_reality.checkWinner() != null)
			return {score:score*10};

	var scores = [];
	var moves = [];
	var available_moves = possible_reality.getAvailableMoves(player_turn);

	depth++;
	player_turn *= -1;

	if(depth-1 == 0)
		console.log(available_moves);
	for(move of available_moves){
		var board = move;
		var choice = minimax(board,depth, player_turn);
		if(choice.score != null){
			scores.push(choice.score);
			moves.push(board);
		}
	}

	if(depth-1 == 0)
		console.log(moves);

	// get min calculation
	min_score = scores[0];
	let min_score_moves = [];
	let min_score_index = 10000000;
	for (var i = 1; i < scores.length; i++) {
		if(min_score > scores[i]){
			min_score = scores[i];
			min_score_index = i;
			min_score_moves = [moves[i]];
		}else if (min_score == scores[i]){
			min_score_moves.push(moves[i]);
			min_score_index = i;
		}
	}
	//console.log(scores);
	return {score:scores[min_score_index], move:min_score_moves};
}
