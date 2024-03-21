import app from './app';

exports.module = app.listen(process.env.HTTP_PORT || 3000);
