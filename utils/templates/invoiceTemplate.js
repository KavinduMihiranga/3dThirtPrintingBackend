module.exports = function generateInvoiceHTML(order) {
  const { orderId, customerName, email, phone, address, items, totalAmount, paymentStatus, date } = order;

  const itemRows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:right;">${item.qty}</td>
      <td style="text-align:right;">LKR ${item.price}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:Arial; padding:20px;">
      <h2>Invoice</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Status:</strong> ${paymentStatus}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>

      <table width="100%" border="1" cellspacing="0" cellpadding="5" style="margin-top:20px;">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:right;">Qty</th>
            <th style="text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <h3 style="text-align:right; margin-top:20px;">Total: LKR ${totalAmount}</h3>
    </div>
  `;
};
