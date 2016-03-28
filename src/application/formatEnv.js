'use strict';

/**
 * format env to item in enum(development|test|staging|production)
 * @param  {String} env Raw env
 * @return {String}
 */
export default function formatEnv(env) {
  switch(env) {
    case 'dev':
    case 'development':
      env = 'development';
      break;
    case 'pro':
    case 'prod':
    case 'production':
      env = 'production';
      break;
    case 'sta':
    case 'stag':
    case 'staging':
      env = 'staging';
      break;
    case 'test':
      env = 'test';
      break;
    default:
      env = 'production';
  }

  return env;
};