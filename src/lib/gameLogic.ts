type Player = 'X' | 'O' | null
type Board = Player[]

interface GameResult {
  winner: 'X' | 'O' | 'draw'
  line?: number[]
}

export const checkWinner = (board: Board): GameResult | null => {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ]

  for (const line of winningLines) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as 'X' | 'O', line: line }
    }
  }

  if (board.every(cell => cell !== null)) {
    return { winner: 'draw' }
  }

  return null // খেলা এখনও শেষ হয়নি
}
