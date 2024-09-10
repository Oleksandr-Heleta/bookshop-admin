// pages/api/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';
import crypto from 'crypto';

// const verifySignature = (req: NextApiRequest, secret: string) => {
//   const signature = req.headers['x-signature'] as string;
//   const body = JSON.stringify(req.body);
//   const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
//   return signature === hash;
// };

const getMonobankPublicKey = async () => {
  if (!process.env.MONOBANK_API_TOKEN) {
    throw new Error('MONOBANK_API_TOKEN is not defined');
  }
  const response = await fetch('https://api.monobank.ua/api/merchant/pubkey', {
    method: 'GET',
    headers: {
      'X-Token': process.env.MONOBANK_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Monobank public key');
  }
  const data = await response.json();
  return data.key;
};

const verifySignature = (req: NextApiRequest, publicKey: string) => {
  const signature = req.headers['x-signature'] as string;
  const body = JSON.stringify(req.body);
  const verifier = crypto.createVerify('SHA256');
  verifier.update(body);
  verifier.end();
  return verifier.verify(publicKey, signature, 'base64');
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // const secret = process.env.MONOBANK_WEBHOOK_SECRET;
    // if (!secret) {
    //   throw new Error('Webhook secret is not defined');
    // }

    // if (!verifySignature(req, secret)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const publicKey = await getMonobankPublicKey();

    if (!verifySignature(req, publicKey)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { invoiceId, status } = req.body;

    console.log('[WEBHOOK]', req.body);

    // Перевірка статусу платежу
    if (status === 'success') {
      // Оновлення статусу замовлення в базі даних
      await prismadb.order.update({
        where: { id: invoiceId },
        data: { orderStatus: 'paid' },
      });
    } else {
      // Обробка неуспішної оплати
      await prismadb.order.update({
        where: { id: invoiceId },
        data: { orderStatus: 'failed' },
      });
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('[WEBHOOK_ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
