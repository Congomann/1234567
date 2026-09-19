const { pool } = require('./backend/db.cjs');
pool.query('SELECT * FROM carrier_packages ORDER BY id DESC LIMIT 5').then(res => {
   console.log(res.rows);
   process.exit(0);
}).catch(console.error);
