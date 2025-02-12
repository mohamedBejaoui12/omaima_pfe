const diagnosticMiddleware = (req, res, next) => {
  console.group('Diagnostic Middleware');
  console.log('Request Method:', req.method);
  console.log('Request Path:', req.path);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Authentication Headers:', {
    authorization: req.headers['authorization'],
    contentType: req.headers['content-type']
  });

  // Check for authentication token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('No authentication token found');
  }

  console.groupEnd();
  next();
};

module.exports = diagnosticMiddleware;