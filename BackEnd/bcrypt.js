// const bcrypt = require("bcryptjs");

// async function generateHashedPassword(plainPassword) {
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(plainPassword, salt);
//   console.log("Hashed Password:", hashedPassword);
// }

// generateHashedPassword("Poongo@9894"); // Replace with your desired password

const bcrypt = require("bcryptjs");

async function generateHashedPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  console.log("Hashed Password:", hashedPassword);
}

generateHashedPassword("defaultPassword123!"); // Your new password