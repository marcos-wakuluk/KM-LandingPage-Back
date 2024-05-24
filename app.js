const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
require('dotenv').config();

const app = express();
let port = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// Route to send email
app.post("/send-email", async (req, res) => {
  try {
    const { email, name, lastName } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to KM Pro Fitness',
      html: `<strong>Welcome ${name} ${lastName} to your KM Pro Fitness plan</strong>`
    });

    res.status(200).json({
      status: "success",
      data: { data }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while sending the email'
    });
  }
});

app.get("/", async (req, res) => {
  res.send("Backend is running");
});

const tryPort = async (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      server.close();
      resolve(port);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(0);
      } else {
        reject(err);
      }
    });
  });
};

const startServer = async () => {
  while (true) {
    const availablePort = await tryPort(port);
    if (availablePort === 0) {
      port++;
    } else {
      port = availablePort;
      break;
    }
  }

  const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });

  return server;
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
