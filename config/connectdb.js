const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'admin123',
  database: 'first_index'
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection(); // สร้างการเชื่อมต่อด้วย pool.getConnection()
    connection.release(); // ปล่อยการเชื่อมต่อกลับไปยัง pool
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
};

module.exports = { connectDB, pool };