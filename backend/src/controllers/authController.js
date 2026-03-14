const userModel = require('../models/userModel');
const { generateToken, comparePassword } = require('../auth');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password_hash);
    console.log('\n🔐 PASSWORD COMPARISON DEBUG:');
    console.log('Password from request:', password);
    console.log('Password type:', typeof password);
console.log('Password length:', password?.length);
console.log('Stored hash:', user.password_hash);
console.log('Hash type:', typeof user.password_hash);
console.log('Hash length:', user.password_hash?.length);
console.log('Hash prefix:', user.password_hash?.substring(0, 7)); // Should be $2a$10$ or $2b$10$
console.log('Comparison result:', ok);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    console.log("passed: comparepassword")
    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { login };
