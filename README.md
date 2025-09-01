# Tic-Tac-Toe Multiplayer App

A full-stack multiplayer Tic-Tac-Toe game built with **Vue 3**, **TypeScript**, **Vite** (frontend), and **Node.js**, **Express**, **Socket.IO**, **MongoDB** (backend). Play real-time games, challenge friends, and enjoy a modern UI.

## Features

- Real-time multiplayer gameplay using Socket.IO
- User authentication
- Game room creation and joining via unique codes
- Automatic win/draw detection
- Responsive Vue 3 frontend
- Play again and reconnect support (coming soon)

## Tech Stack

- **Frontend:** Vue 3, Vite, TypeScript, Pinia, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Socket.IO, MongoDB (Mongoose)
- **Docker:** Multi-stage build for production deployment

## Getting Started

### Prerequisites

- Node.js (v22+)
- Yarn
- MongoDB

### Development

#### 1. Clone the repository

```bash
git clone https://github.com/abdullahdewan/tictactoe.git
cd tictactoe
```

#### 2. Install dependencies

```bash
yarn install
cd frontend
yarn install
```

#### 3. Start MongoDB

Make sure MongoDB is running locally or update your `.env` file with your connection string.

#### 4. Run the game

```bash
yarn dev
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

### Docker

Build and run the app using Docker:

```bash
# you need mongodb running
docker build -t tictactoe-app .
docker run -p 5000:5000 --env-file .env tictactoe-app
```

OR using docker compose

```bash
# just run it and enjoy the Game
docker-compose up --build
```

## Environment Variables

Create a `.env` file in the root directory:

```txt
MONGO_URI=mongodb://localhost:27017/tictactoe
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback


# For dev you need .env.local
PORT=3000

# and for production
PORT=5000
```

## Project Structure

```txt
├── frontend/        # Vue 3 app
├── src/             # Backend source code
├── Dockerfile
├── README.md
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

---

**Enjoy playing Tic-Tac-Toe!**
