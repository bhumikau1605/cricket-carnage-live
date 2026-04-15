require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── MongoDB Schema ────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const teamSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true, trim: true },
  r1:       { type: Number, default: 0 },
  r2:       { type: Number, default: 0 },
  r3:       { type: Number, default: 0 },
  total:    { type: Number, default: 0 },
  position: { type: Number, default: 0 },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

// ── Helper: recalculate positions ─────────────────────────────────────────────
async function recalcPositions() {
  const teams = await Team.find().sort({ total: -1 });
  for (let i = 0; i < teams.length; i++) {
    teams[i].position = i + 1;
    await teams[i].save();
  }
  return await Team.find().sort({ position: 1 });
}

// ── REST API ──────────────────────────────────────────────────────────────────

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().sort({ position: 1, createdAt: 1 });
    res.json(teams);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add team
app.post('/api/teams', async (req, res) => {
  try {
    const { name } = req.body;
    const team = new Team({ name, r1: 0, r2: 0, r3: 0, total: 0 });
    await team.save();
    const teams = await Team.find().sort({ position: 1, createdAt: 1 });
    io.emit('teams_updated', teams);
    res.json(team);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update scores
app.put('/api/teams/:id', async (req, res) => {
  try {
    const { r1, r2, r3 } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.r1 = Number(r1) || 0;
    team.r2 = Number(r2) || 0;
    team.r3 = Number(r3) || 0;
    team.total = team.r1 + team.r2 + team.r3;
    await team.save();
    const teams = await recalcPositions();
    io.emit('teams_updated', teams);
    res.json(team);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete team
app.delete('/api/teams/:id', async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    const teams = await recalcPositions();
    io.emit('teams_updated', teams);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
io.on('connection', async (socket) => {
  console.log('🔌 Client connected:', socket.id);
  const teams = await Team.find().sort({ position: 1, createdAt: 1 });
  socket.emit('teams_updated', teams);
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
