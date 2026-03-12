const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = '/data/logs.json';
const PARENT_PIN = process.env.PARENT_PIN || '1234';
const CHILD_NAMES = (process.env.CHILD_NAMES || 'Child 1,Child 2').split(',').map(n => n.trim());

app.use(express.json());
app.use(express.static('public'));

// Load data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ logs: [] }));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET config (child names)
app.get('/api/config', (req, res) => {
  res.json({ children: CHILD_NAMES });
});

// GET all logs
app.get('/api/logs', (req, res) => {
  const data = loadData();
  res.json(data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// POST new log entry
app.post('/api/log', (req, res) => {
  const { childName, action } = req.body;
  if (!childName || !action) return res.status(400).json({ error: 'Missing fields' });
  if (!['empty', 'fill'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

  const data = loadData();
  const entry = {
    id: Date.now().toString(),
    childName,
    action,
    timestamp: new Date().toISOString(),
    validated: false,
    validatedBy: null,
    validatedAt: null
  };
  data.logs.push(entry);
  saveData(data);
  res.json(entry);
});

// POST validate entry
app.post('/api/validate/:id', (req, res) => {
  const { pin, parentName } = req.body;
  if (pin !== PARENT_PIN) return res.status(401).json({ error: 'Wrong PIN' });

  const data = loadData();
  const entry = data.logs.find(l => l.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  entry.validated = true;
  entry.validatedBy = parentName || 'Parent';
  entry.validatedAt = new Date().toISOString();
  saveData(data);
  res.json(entry);
});

// PATCH edit entry (parent only)
app.patch('/api/log/:id', (req, res) => {
  const { pin, childName, action } = req.body;
  if (pin !== PARENT_PIN) return res.status(401).json({ error: 'Wrong PIN' });

  const data = loadData();
  const entry = data.logs.find(l => l.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  if (childName) entry.childName = childName;
  if (action && ['empty', 'fill'].includes(action)) entry.action = action;
  if (req.body.timestamp) {
    const ts = new Date(req.body.timestamp);
    if (!isNaN(ts)) entry.timestamp = ts.toISOString();
  }
  if (typeof req.body.comment !== 'undefined') {
    entry.comment = req.body.comment.slice(0, 165);
  }
  if (typeof req.body.validated !== 'undefined') {
    entry.validated = req.body.validated === true;
    if (entry.validated) {
      entry.validatedBy = req.body.parentName || 'Parent';
      entry.validatedAt = new Date().toISOString();
    } else {
      entry.validatedBy = null;
      entry.validatedAt = null;
    }
  }
  saveData(data);
  res.json(entry);
});

// DELETE entry (parent only)
app.delete('/api/log/:id', (req, res) => {
  const { pin } = req.body;
  if (pin !== PARENT_PIN) return res.status(401).json({ error: 'Wrong PIN' });

  const data = loadData();
  data.logs = data.logs.filter(l => l.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// Verify PIN
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  res.json({ valid: pin === PARENT_PIN });
});

app.listen(PORT, () => console.log(`Dishwasher Tracker running on port ${PORT}`));
