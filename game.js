class ChessGame {
    constructor() {
        this.pieces = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        this.board = this.createBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.setupBoard();
        this.addEventListeners();
    }

    createBoard() {
        const board = document.getElementById('chessBoard');
        const squares = [];
        
        for (let row = 0; row < 8; row++) {
            squares[row] = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                board.appendChild(square);
                squares[row][col] = square;
            }
        }
        return squares;
    }

    setupBoard() {
        // Setup pawns
        for (let col = 0; col < 8; col++) {
            this.placePiece('pawn', 'black', 1, col);
            this.placePiece('pawn', 'white', 6, col);
        }

        // Setup other pieces
        const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        pieces.forEach((piece, col) => {
            this.placePiece(piece, 'black', 0, col);
            this.placePiece(piece, 'white', 7, col);
        });
    }

    placePiece(type, color, row, col) {
        const piece = document.createElement('div');
        piece.className = `piece ${color}-piece`;
        piece.dataset.type = type;
        piece.dataset.color = color;
        piece.textContent = this.pieces[color][type];
        this.board[row][col].appendChild(piece);
    }

    addEventListeners() {
        document.getElementById('chessBoard').addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            this.handleSquareClick(row, col);
        });
    }

    handleSquareClick(row, col) {
        const square = this.board[row][col];
        const piece = square.querySelector('.piece');

        if (this.selectedPiece) {
            if (this.isValidMove(row, col)) {
                this.movePiece(row, col);
                document.getElementById('currentTurn').textContent = 
                    this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
            }
            this.clearSelection();
        } else if (piece && piece.dataset.color === this.currentPlayer) {
            this.selectPiece(square);
            this.showValidMoves(row, col);
        }
    }

    selectPiece(square) {
        this.selectedPiece = square;
        square.classList.add('selected');
    }

    clearSelection() {
        if (this.selectedPiece) {
            this.selectedPiece.classList.remove('selected');
            this.selectedPiece = null;
        }
        this.validMoves.forEach(move => {
            this.board[move.row][move.col].classList.remove('valid-move');
        });
        this.validMoves = [];
    }

    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }

    movePiece(toRow, toCol) {
        const fromSquare = this.selectedPiece;
        const toSquare = this.board[toRow][toCol];
        
        // Remove any existing piece at the destination
        if (toSquare.querySelector('.piece')) {
            toSquare.removeChild(toSquare.querySelector('.piece'));
        }
        
        // Move the piece
        const piece = fromSquare.querySelector('.piece');
        fromSquare.removeChild(piece);
        toSquare.appendChild(piece);
        
        // Switch turns
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    showValidMoves(row, col) {
        const piece = this.board[row][col].querySelector('.piece');
        if (!piece) return;

        const moves = this.getValidMoves(piece.dataset.type, row, col, piece.dataset.color);
        
        moves.forEach(move => {
            if (this.isInBounds(move.row, move.col)) {
                this.validMoves.push(move);
                this.board[move.row][move.col].classList.add('valid-move');
            }
        });
    }

    getValidMoves(type, row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;

        switch (type) {
            case 'pawn':
                // Forward move
                if (this.isInBounds(row + direction, col) && 
                    !this.board[row + direction][col].querySelector('.piece')) {
                    moves.push({ row: row + direction, col });
                    
                    // Initial two-square move
                    if ((color === 'white' && row === 6) || (color === 'black' && row === 1)) {
                        if (!this.board[row + direction * 2][col].querySelector('.piece')) {
                            moves.push({ row: row + direction * 2, col });
                        }
                    }
                }
                
                // Capture moves
                [-1, 1].forEach(offset => {
                    if (this.isInBounds(row + direction, col + offset)) {
                        const targetSquare = this.board[row + direction][col + offset];
                        const targetPiece = targetSquare.querySelector('.piece');
                        if (targetPiece && targetPiece.dataset.color !== color) {
                            moves.push({ row: row + direction, col: col + offset });
                        }
                    }
                });
                break;

            case 'rook':
                // Horizontal and vertical moves
                [[-1,0], [1,0], [0,-1], [0,1]].forEach(([dr, dc]) => {
                    let r = row + dr;
                    let c = col + dc;
                    while (this.isInBounds(r, c)) {
                        const targetPiece = this.board[r][c].querySelector('.piece');
                        if (!targetPiece) {
                            moves.push({ row: r, col: c });
                        } else {
                            if (targetPiece.dataset.color !== color) {
                                moves.push({ row: r, col: c });
                            }
                            break;
                        }
                        r += dr;
                        c += dc;
                    }
                });
                break;

            case 'knight':
                [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]].forEach(([dr, dc]) => {
                    const r = row + dr;
                    const c = col + dc;
                    if (this.isInBounds(r, c)) {
                        const targetPiece = this.board[r][c].querySelector('.piece');
                        if (!targetPiece || targetPiece.dataset.color !== color) {
                            moves.push({ row: r, col: c });
                        }
                    }
                });
                break;

            case 'bishop':
                [[-1,-1], [-1,1], [1,-1], [1,1]].forEach(([dr, dc]) => {
                    let r = row + dr;
                    let c = col + dc;
                    while (this.isInBounds(r, c)) {
                        const targetPiece = this.board[r][c].querySelector('.piece');
                        if (!targetPiece) {
                            moves.push({ row: r, col: c });
                        } else {
                            if (targetPiece.dataset.color !== color) {
                                moves.push({ row: r, col: c });
                            }
                            break;
                        }
                        r += dr;
                        c += dc;
                    }
                });
                break;

            case 'queen':
                // Combine rook and bishop moves
                [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]].forEach(([dr, dc]) => {
                    let r = row + dr;
                    let c = col + dc;
                    while (this.isInBounds(r, c)) {
                        const targetPiece = this.board[r][c].querySelector('.piece');
                        if (!targetPiece) {
                            moves.push({ row: r, col: c });
                        } else {
                            if (targetPiece.dataset.color !== color) {
                                moves.push({ row: r, col: c });
                            }
                            break;
                        }
                        r += dr;
                        c += dc;
                    }
                });
                break;

            case 'king':
                [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]].forEach(([dr, dc]) => {
                    const r = row + dr;
                    const c = col + dc;
                    if (this.isInBounds(r, c)) {
                        const targetPiece = this.board[r][c].querySelector('.piece');
                        if (!targetPiece || targetPiece.dataset.color !== color) {
                            moves.push({ row: r, col: c });
                        }
                    }
                });
                break;
        }
        return moves;
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new ChessGame();
});
