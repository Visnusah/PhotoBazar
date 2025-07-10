import Joi from 'joi';

export const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().valid('user', 'photographer').default('user'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message,
    });
  }

  next();
};

export const validatePhotoUpload = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    price: Joi.number().min(0.01).max(9999.99).required(),
    categoryId: Joi.string().uuid().required(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).default([]),
    isExclusive: Joi.boolean().default(false),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message,
    });
  }

  next();
};

export const validatePhotoUpdate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().max(1000).allow(''),
    price: Joi.number().min(0.01).max(9999.99),
    categoryId: Joi.string().uuid(),
    tags: Joi.array().items(Joi.string().max(50)).max(20),
    isExclusive: Joi.boolean(),
    isActive: Joi.boolean(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message,
    });
  }

  next();
};

export const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(500).allow(''),
    slug: Joi.string().lowercase().pattern(/^[a-z0-9-]+$/),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message,
    });
  }

  next();
};

export const validatePurchase = (req, res, next) => {
  const schema = Joi.object({
    photoId: Joi.string().uuid().required(),
    paymentMethod: Joi.string().valid('credit_card', 'paypal', 'stripe').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message,
    });
  }

  next();
};
