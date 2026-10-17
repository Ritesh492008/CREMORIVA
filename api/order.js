/**
 * Vercel Serverless Function: /api/order
 * Receives customer order manifest from CREMORIVA Haute Glacerie
 * Logs and dispatches order details to Manager at rahekrishn07@gmail.com
 */

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const orderData = req.body || {};
    const managerEmail = 'rahekrishn07@gmail.com';
    const timestamp = new Date().toISOString();

    const orderRef = orderData.orderRef || `#CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const customer = orderData.customer || {};
    const items = orderData.items || [];
    const total = orderData.total || 0;

    console.log(`[CREMORIVA DISPATCH] New Order ${orderRef} received for Manager (${managerEmail})`);
    console.log(`Client: ${customer.name || 'Anonymous'} | Phone: ${customer.phone || 'N/A'}`);
    console.log(`Items: ${items.length} | Grand Total: $${total}`);

    // If an external SMTP or Resend service key is configured in Vercel environment variables:
    if (process.env.RESEND_API_KEY) {
      try {
        const itemRowsHtml = items.map((item, idx) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #3f322e;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #3f322e;"><strong>${item.title}</strong><br><small style="color: #d5c4b4;">${item.desc || ''}</small></td>
            <td style="padding: 8px; border-bottom: 1px solid #3f322e; text-align: center;">${item.qty}</td>
            <td style="padding: 8px; border-bottom: 1px solid #3f322e; text-align: right;">$${Number(item.price).toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #3f322e; text-align: right; color: #ffc684; font-weight: bold;">$${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        `).join('');

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CREMORIVA Orders <orders@cremoriva.com>',
            to: [managerEmail],
            subject: `[CREMORIVA ORDER] ${orderRef} - ${customer.name || 'Client'} ($${Number(total).toFixed(2)})`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #1b110e; color: #f4ded8; padding: 24px; border-radius: 12px; max-width: 650px; margin: auto;">
                <h1 style="color: #ffc684; margin-bottom: 4px; font-size: 22px;">CREMORIVA Haute Glacerie</h1>
                <p style="color: #fab98c; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Official Order Manifest & Dispatch Record</p>
                <hr style="border: 0; border-top: 1px solid #3f322e; margin: 16px 0;">
                
                <h3 style="color: #ffc684; margin-bottom: 8px;">Customer Coordinates:</h3>
                <p style="margin: 4px 0;"><strong>Name:</strong> ${customer.name || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Mobile / WhatsApp:</strong> ${customer.phone || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${customer.address || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Delivery Slot:</strong> ${customer.deliveryTime || 'Standard Cryo Dispatch'}</p>
                <p style="margin: 4px 0;"><strong>Special Notes:</strong> ${customer.notes || 'None'}</p>
                
                <hr style="border: 0; border-top: 1px solid #3f322e; margin: 16px 0;">
                
                <h3 style="color: #ffc684; margin-bottom: 8px;">Order Manifest:</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background-color: #291d19; color: #fab98c; text-align: left;">
                      <th style="padding: 8px;">#</th>
                      <th style="padding: 8px;">Item</th>
                      <th style="padding: 8px; text-align: center;">Qty</th>
                      <th style="padding: 8px; text-align: right;">Unit Price</th>
                      <th style="padding: 8px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRowsHtml}
                  </tbody>
                </table>
                
                <div style="margin-top: 16px; padding: 12px; background-color: #291d19; border-radius: 8px; text-align: right;">
                  <p style="margin: 4px 0; font-size: 13px;">Subtotal: <strong>$${Number(orderData.subtotal || 0).toFixed(2)}</strong></p>
                  <p style="margin: 4px 0; font-size: 13px;">Courier Thermal Dispatch: <strong>$${Number(orderData.dispatch || 4.50).toFixed(2)}</strong></p>
                  <p style="margin: 4px 0; font-size: 16px; color: #ffc684; font-weight: bold;">Grand Total: $${Number(total).toFixed(2)}</p>
                </div>
                
                <p style="font-size: 11px; color: #9d8e80; margin-top: 20px; text-align: center;">
                  Vacuum sealed at -196°C • Target plating temperature: -12.5°C<br>
                  Dispatched to Manager: ${managerEmail}
                </p>
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.warn('Resend email dispatch error:', emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      orderRef,
      managerEmail,
      timestamp,
      message: `Order manifest successfully recorded for Manager ${managerEmail}`
    });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
