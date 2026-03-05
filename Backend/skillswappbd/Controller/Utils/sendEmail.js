import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
  try {
    // Create reusable transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail address
        pass: process.env.GMAIL_PASS, // app password (not your normal Gmail password)
      },
    });

    // Email options
    const mailOptions = {
      from: `"SkillSwap Team" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email sending failed silently
  }
};
