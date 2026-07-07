import mysql from 'mysql2/promise';

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS `wedding_db`;');
    console.log('Database wedding_db created or already exists.');
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

createDatabase();
