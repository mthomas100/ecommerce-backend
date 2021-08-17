module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '4a360982bcf12676d8ee7f58e5c490ea'),
    },
  },
  url: env('MY_HEROKU_URL'),
});
