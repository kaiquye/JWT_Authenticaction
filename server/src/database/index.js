import "dotenv/config";
import connection from 'knex'
const config = {
    client: "mysql",
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    }
}
export default connection(config);
