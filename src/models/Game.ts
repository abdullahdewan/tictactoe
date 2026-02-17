import mongoose from 'mongoose'

//===========================
// Game Schema
//===========================

// A sub-schema for players inside the Game schema
const playerSchema = new mongoose.Schema({
  user_id: {
    index: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Creates a reference to the User model
    required: true,
  },
  symbol: {
    type: String,
    enum: ['X', 'O'], // Player's symbol can only be 'X' or 'O'
    required: true,
  },
  isHost: {
    type: Boolean,
    default: false,
  },
})

const moveSchema = new mongoose.Schema({
  symbol: {
    type: String,
    enum: ['X', 'O'],
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
})

const gameSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    players: {
      type: [playerSchema], // An array containing player sub-documents
      validate: [
        (val: any) => val.length <= 2, // Ensures a game can have at most 2 players
        'A game can have at most 2 players.',
      ],
    },
    board: {
      type: [String], // Array of 'X', 'O', or null
      default: Array(9).fill(null), // Initializes a 3x3 board with null values
    },
    status: {
      type: String,
      enum: ['waiting', 'playing', 'completed'],
      default: 'waiting', // A new game starts in 'waiting' state
    },
    turn: {
      type: String,
      enum: ['X', 'O'], // The turn belongs to either 'X' or 'O'
    },
    winner: {
      type: String, // Can be 'X', 'O', or 'draw'
    },
    winningLine: {
      type: [Number],
    },
    moves: {
      type: [moveSchema],
      default: [],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  },
)

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema)

export default Game
export type { Game }
