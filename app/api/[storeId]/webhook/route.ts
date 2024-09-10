// pages/api/webhook.ts
import { NextResponse } from 'next/server';
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

const verifySignature = (req: Request, publicKey: string) => {
  const signature = req.headers.get('x-signature') as string;
  const body = JSON.stringify(req.body);
  const verifier = crypto.createVerify('SHA256');
  verifier.update(body);
  verifier.end();
  return verifier.verify(publicKey, signature, 'base64');
};

export async function POST(req: Request, res: NextResponse) {
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
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId, status } = body;

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

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
