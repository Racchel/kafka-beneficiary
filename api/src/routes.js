import { Router } from 'express';
import { CompressionTypes } from 'kafkajs';

const routes = Router();

routes.post('/beneficiaries', async (req, res) => {
  const beneficiary = req.body;
  
  const message = {
    beneficiary: beneficiary
  };

  // Chamar micro serviço
  await req.producer.send({
    topic: 'issue-beneficiary',
    compression: CompressionTypes.GZIP,
    messages: [
      { value: JSON.stringify(message) },
    ],
  })

  return res.json({ ok: true });
});

export default routes;