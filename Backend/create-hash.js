import bcrypt from "bcryptjs";

async function generateHash() {
  const password = "q"; // <-- tu contraseña real
  const hash = await bcrypt.hash(password, 10);
  console.log("HASH GENERADO:", hash);
}

generateHash();
