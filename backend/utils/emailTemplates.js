const generatePinEmailTemplate = (title, message, pin, footerText = "") => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <p>${message}</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${pin}</span>
      </div>
      <p style="color: #666;">This PIN will expire in <strong>10 minutes</strong>.</p>
      ${footerText ? `<p style="color: #999; font-size: 12px;">${footerText}</p>` : ""}
    </div>
  `;
};

module.exports = {
  generatePinEmailTemplate,
};
