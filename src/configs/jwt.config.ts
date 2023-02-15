import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenExpiresIn: 1000 * 60 * 10,
  refreshTokenExpiresIn: 1000 * 60 * 60 * 24,
  secretKey: process.env.JWT_SECRET_KEY,
}));
