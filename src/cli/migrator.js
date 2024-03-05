// tsx src/cli/migrator.js
require("dotenv").config();
const { drizzle } = require("drizzle-orm/neon-serverless");
const { migrate } = require("drizzle-orm/postgres-js/migrator");
const secrets = require("../lib/secrets");
const schema = require("../db/schemas");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

neonConfig.webSocketConstructor = ws; // <-- this is the key bit
async function performMigration() {
  const dbUrl = await secrets.getDatabaseUrl();
  if(!dbUrl) {
    return
  }
  // neon serverless pool
  // https://github.com/neondatabase/serverless?tab=readme-ov-file#example-nodejs-with-poolconnect
  const pool = new Pool({ connectionString: dbUrl });
  pool.on("error", (err) => console.error(err)); // deal with e.g. re-connect
  // ...
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const db = await drizzle(client, { schema });
    await migrate(db, { migrationsFolder: "src/migrations" });

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  // ...
  await pool.end();
}

if (require.main === module) {
  console.log("run Migrations!");
  performMigration()
    .then((val) => {
        console.log("Migrations done")
      process.exit(0);
    })
    .catch((err) => {
      console.log("Migrations error");
      process.exit(1);
    });
}
