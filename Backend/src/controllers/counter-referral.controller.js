import CounterReferral from '../models/counter-referral.model.js';
import Referral from '../models/referral.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';

// Get all counter-referrals
export const getAllCounterReferrals = async (req, res) => {
  try {
    const counterReferrals = await CounterReferral.findAll({
      include: [
        {
          model: Referral,
          as: 'referral',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['patientId', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['name', 'specialty', 'facility']
        },
        {
          model: User,
          as: 'referredDoctor',
          attributes: ['name', 'specialty', 'facility']
        }
      ]
    });
    
    res.status(200).json(counterReferrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counter-referral by ID
export const getCounterReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const counterReferral = await CounterReferral.findByPk(id, {
      include: [
        {
          model: Referral,
          as: 'referral',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['patientId', 'name', 'age', 'gender', 'idNumber']
            }
          ]
        },
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['name', 'specialty', 'facility']
        },
        {
          model: User,
          as: 'referredDoctor',
          attributes: ['name', 'specialty', 'facility']
        }
      ]
    });
    
    if (!counterReferral) {
      return res.status(404).json({ message: 'Counter-referral not found' });
    }
    
    res.status(200).json(counterReferral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new counter-referral
export const createCounterReferral = async (req, res) => {
  try {
    const {
      referralId,
      diagnosis,
      treatment,
      followUpNeeded,
      followUpInstructions,
      notes
    } = req.body;
    
    // Check if referral exists
    const referral = await Referral.findByPk(referralId, {
      include: [
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['id']
        }
      ]
    });
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Generate counter-referral ID
    const counterReferralCount = await CounterReferral.count();
    const currentYear = new Date().getFullYear();
    const counterReferralId = `CR-${currentYear}-${String(counterReferralCount + 1).padStart(3, '0')}`;
    
    // Create counter-referral
    const counterReferral = await CounterReferral.create({
      counterReferralId,
      referralId,
      diagnosis,
      treatment,
      followUpNeeded: followUpNeeded || false,
      followUpInstructions,
      referringDoctorId: req.userId,
      referredDoctorId: referral.referringDoctor.id,
      status: 'Pending',
      notes,
      dateCreated: new Date()
    });
    
    // Update referral status to Completed
    await referral.update({ status: 'Completed', dateCompleted: new Date() });
    
    res.status(201).json({
      message: 'Counter-referral created successfully',
      counterReferral
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update counter-referral status
export const updateCounterReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const counterReferral = await CounterReferral.findByPk(id);
    if (!counterReferral) {
      return res.status(404).json({ message: 'Counter-referral not found' });
    }
    
    // Update counter-referral
    const updateData = { status };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    await counterReferral.update(updateData);
    
    res.status(200).json({
      message: 'Counter-referral status updated successfully',
      counterReferral
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counter-referrals by doctor
export const getCounterReferralsByDoctor = async (req, res) => {
  try {
    const doctorId = req.userId;
    
    const counterReferrals = await CounterReferral.findAll({
      where: {
        [sequelize.Op.or]: [
          { referringDoctorId: doctorId },
          { referredDoctorId: doctorId }
        ]
      },
      include: [
        {
          model: Referral,
          as: 'referral',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['patientId', 'name']
            }
          ]
        }
      ]
    });
    
    res.status(200).json(counterReferrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
