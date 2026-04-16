# 🏏 Cricket Carnage — Live Tournament Scoreboard

A real-time cricket tournament scoreboard with live updates powered by Socket.io.

## Features

- Live scoreboard updates across all connected clients
- Add / remove teams
- Enter scores for Round 1, Round 2, Round 3
- Auto-calculated totals and rankings
- Sort teams by total score with confetti animation
- Export scoreboard to Excel
- Custom cricket bat cursor with sound effects

## Tech Stack

- **Frontend** — HTML, CSS, JavaScript
- **Backend** — Node.js, Express, Socket.io
- **Database** — MongoDB Atlas (Mongoose)
- **Deployed on** — Render

## Local Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/bhumikau1605/cricket-carnage-live.git
   cd cricket-carnage-live
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3001
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3001` in your browser.

## Deployment

Live at: [https://cricket-carnage-live.onrender.com](https://cricket-carnage-live.onrender.com)

## License

© Augment AI: Cricket Carnage | Utsav 2026
