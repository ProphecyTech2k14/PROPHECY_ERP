// const sql = require("mssql");

// // Ensure dbConfig is correctly defined
// const dbConfig = {
//   user: process.env.DB_USER || "your_db_user",
//   password: process.env.DB_PASSWORD || "your_db_password",
//   server: process.env.DB_SERVER || "your_server_address",
//   database: process.env.DB_NAME || "your_database_name",
//   port: isNaN(Number(process.env.DB_PORT)) ? 1433 : Number(process.env.DB_PORT),
//   options: {
//     encrypt: true, // Use encryption if required by your SQL Server
//     trustServerCertificate: true, // Only use this for local development
//   },
//   // requestTimeout: 60000, // 60 seconds (default is 15,000ms)
//   // connectionTimeout: 30000
// };

// // Create a connection pool
// const poolPromise = new sql.ConnectionPool(dbConfig)
//   .connect()
//   .then((pool) => {
//     console.log("✅ Connected to SQL Server");
//     return pool;
//   })
//   .catch((err) => {
//     console.error("❌ Database Connection Failed: ", err);
//   });

  

// module.exports = { sql, poolPromise, dbConfig };


const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || "your_db_user",
  password: process.env.DB_PASSWORD || "your_db_password",
  server: process.env.DB_SERVER || "your_server_address",
  database: process.env.DB_NAME || "your_database_name",
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
  dbConfig
};



