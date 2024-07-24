const Api = 'https://api.telegram.org/bot';

interface sendMessageProps {
    name: string;
    phone: number;
    totalPrice: number; 
    call: boolean;
    payment: string;
    orderItems: {
        product: {name: string;

        };
        quantity: number;
       
        }[];
    }


export const sendMessage = async ( order : sendMessageProps) => {

    const text = `
        Нове замовлення
        Від ${order.name}
        телефон: ${order.phone}
        Замовлені книги: ${order.orderItems.map((item) => `
        ${item.product.name} - ${item.quantity} шт. 
        `)}
        Загальною сумою на: ${order.totalPrice} грн
        ${order.call ? 'Передзвонити клієнту' : 'Не передзвонювати'}
        ${order.payment === 'byIBAN' ? 'Надіслати реквізити' : ''}
    `;

    // console.log(text);

  const url = `${Api}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  // console.log(url);
  const body = JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text });
  const headers = { 'Content-Type': 'application/json' };

  try {
    const response = await fetch(url, { method: 'POST', body, headers });
    console.log('Message sent to Telegram', response.status);
    return response.json();
  } catch (error) {
    console.error('Error while sending message to Telegram', error);
  }
 
};