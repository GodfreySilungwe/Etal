const userModel = require('../models/userModel');
const { generateToken, comparePassword } = require('../auth');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { login };
