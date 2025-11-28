import bcrypt from 'bcryptjs';
const hash = '$2b$10$oIHm5lrcWuerpJ1d2WzHHuBzuWEB2QkDPhSTIjySCHj.mFEUH5iQu'; // tu hash
const plain = 'q'; // la contraseña que crees
bcrypt.compare(plain, hash).then(m => console.log('match?', m)).catch(e => console.error(e));