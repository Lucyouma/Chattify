const bcrypt = require('bcryptjs');

// Debugging password mismatch
const debugPassword = async () => {
  const plainPassword = '123456'; // Password entered during login
  const storedHash = '$2a$10$nG/nU/TUiT9N0xl6dkJwe.rKlfaTUr9ZVDi.ZeMRwF1dIrnZLm4UG'; // Hash from DB

  const isMatch = await bcrypt.compare(plainPassword, storedHash);
  console.log('Password match status:', isMatch); // true or false
};

debugPassword();

