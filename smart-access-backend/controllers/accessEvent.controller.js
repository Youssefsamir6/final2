const { handleAccessEvent } = require('../services/accessEvent.service');

const createAccessEvent = async (req, res) => {
  try {
    const data = req.body; // {userId?, rfid?, image?, method, gateName}
    const result = await handleAccessEvent(data);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createAccessEvent };

