import express from 'express';
import { PineconeService } from '../services/pineconeService';

const router = express.Router();

// NOTE: these pinecone routes probably won't be used in the actual app, only for initial testing

router.get('', async (req, res) => {
  try {
    res.json({ message: 'Successfully hit pinecone endpoint!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});

// get records by ids
router.post('/records', async (req, res) => {
  try {
    if (!req.body || !req.body?.ids) {
      return res
        .status(400)
        .json({ success: false, message: 'Error, ids must be provided in body' });
    }

    const ids = req.body.ids;
    const result = await PineconeService.fetchRecords(ids);
    res.json(result);
  } catch (err) {
    const message = `Failed to get entries by ids`;
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: message, error: err.message });
    } else {
      res.status(500).json({ success: false, message: message, error: 'Unknown error' });
    }
  }
});

router.post('/stats', async (req, res) => {
  try {
    const result = await PineconeService.checkIndex();
    console.debug('results', result);
    res.json(result);
  } catch (err) {
    const message = `Failed to get check stats`;
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: message, error: err.message });
    } else {
      res.status(500).json({ success: false, message: message, error: 'Unknown error' });
    }
  }
});

export default router;
