import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', [verifyToken, isAdmin], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only allow admins or the user themselves to access their data
    if (req.userId !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { name, email, role, facility, specialty, active } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.update({
      name,
      email,
      role,
      facility,
      specialty,
      active
    });
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facility: user.facility,
        specialty: user.specialty,
        active: user.active
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (soft delete by setting active to false)
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.update({ active: false });
    
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
