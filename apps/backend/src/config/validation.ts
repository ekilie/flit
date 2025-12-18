import * as Joi from 'joi';

export const validate = (config: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production')
      .default('development'),
    PORT: Joi.number().default(3000),
    APP_NAME: Joi.string().required(),
    APP_DESCRIPTION: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    DB_TYPE: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').required(),
    DB_DATABASE: Joi.string().required(),
    DB_SYNC: Joi.string().valid('true', 'false').default('false'),
    DB_LOGGING: Joi.string().valid('true', 'false').default('false'),
  });

  const { error, value } = schema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
  return value;
};
