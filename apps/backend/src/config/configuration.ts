export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET,
  app: {
    name: process.env.APP_NAME || 'API',
    description: process.env.APP_DESCRIPTION || 'API Description',
  },
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'your-password',
    database: process.env.DB_DATABASE || 'your-database',
    sync: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
});
