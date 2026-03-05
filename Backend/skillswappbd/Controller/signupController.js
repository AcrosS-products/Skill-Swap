const User = require("../Model/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

require("dotenv").config();

async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SkillSwap Team" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Intentionally ignore email failures to avoid blocking signup
  }
}

const signupHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const subject = "Welcome to SkillSwap 🎉";
    const html = `
      <div style="font-family: Arial, sans-serif; background: #121212; color: #ffffff; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4caf50;">Welcome, ${name}!</h2>
        <p>Thanks for joining <b>SkillSwap</b> — a place to learn and share skills.</p>
        <p>You can now log in and start exploring!</p>
        <a href="${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}/auth" 
           style="background: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
        <br/><br/>
        <p>Best regards,<br/>The SkillSwap Team</p>
      </div>
    `;

    await sendEmail(email, subject, html);

    res.status(201).json({
      message: "User created successfully. Welcome email sent!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = signupHandler;
