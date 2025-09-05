import { connectDB } from '../src/db/mongoose.js';
import Screen from '../src/models/Screen.js';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/hash.js';

await connectDB();

const screens = [
  { key: 'DIVISION_FORM', name: 'Division Data Entry', category: 'Data Entry' },
  { key: 'REPORT_DASHBOARD', name: 'Report Dashboard', category: 'Reports' },
  { key: 'ADMIN_SCREENS', name: 'Screen Access Admin', category: 'Admin' }
];

for (const s of screens) {
  await Screen.updateOne({ key: s.key }, { $setOnInsert: s }, { upsert: true });
}
console.log('[seed] screens ok');

const superCount = await User.countDocuments({ role: 'superadmin' });
if (superCount === 0) {
  const passwordHash = await hashPassword('00000000');
  const u = await User.create({
    fullName: 'SuperAdmin',
    email: 'superadmin@rrispat.com',
    passwordHash,
    role: 'superadmin',
    screenAccess: (await Screen.find({}, '_id')).map(s => s._id)
  });
  console.log('[seed] superadmin created:', u.email, '(password: 00000000)');
} else {
  console.log('[seed] superadmin exists, skipped');
}
process.exit(0);
