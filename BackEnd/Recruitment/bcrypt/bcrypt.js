const bcrypt = require("bcryptjs");

async function generateHashedPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  console.log("Hashed Password:", hashedPassword);
}

generateHashedPassword("Abi@6380"); // Replace with your desired password

