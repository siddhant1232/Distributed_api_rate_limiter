exports.getData = (req, res) => {
  res.json({
    message: 'Data fetched successfully!',
    timestamp: new Date().toISOString()
  });
};

exports.getUser = (req, res) => {
  res.json({
    user: {
      id: 1,
      name: 'John Doe',
      role: 'Admin'
    }
  });
};

exports.createResource = (req, res) => {
  res.status(201).json({
    message: 'Resource created successfully!',
    data: req.body || {}
  });
};
