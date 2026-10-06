const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next();
  };
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    mobileNumber: Joi.string().pattern(/^\+?[1-9]\d{6,14}$/).required()
      .messages({ 'string.pattern.base': 'Please enter a valid mobile number' }),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('public', 'family', 'investigator', 'organization').default('public'),
    consentGiven: Joi.boolean().valid(true).required()
      .messages({ 'any.only': 'You must agree to the terms and consent policy' })
  }),

  login: Joi.object({
    identifier: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().required()
  }).or('identifier', 'email'),

  requestOtp: Joi.object({
    mobileNumber: Joi.string().pattern(/^\+?[1-9]\d{6,14}$/).required()
  }),

  verifyOtp: Joi.object({
    mobileNumber: Joi.string().pattern(/^\+?[1-9]\d{6,14}$/),
    email: Joi.string().email(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    tempToken: Joi.string().allow('')
  }).or('mobileNumber', 'email'),

  createCase: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    ageWhenMissing: Joi.number().min(0).max(150),
    estimatedCurrentAge: Joi.number().min(0).max(150),
    dateMissing: Joi.date(),
    lastKnownLocation: Joi.object({
      address: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      country: Joi.string().allow(''),
      coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() })
    }),
    physicalDescription: Joi.object({
      height: Joi.string().allow(''),
      weight: Joi.string().allow(''),
      hairColor: Joi.string().allow(''),
      eyeColor: Joi.string().allow(''),
      distinguishingFeatures: Joi.string().allow(''),
      additionalDetails: Joi.string().allow('')
    }),
    clothing: Joi.string().allow(''),
    circumstances: Joi.string().allow(''),
    priority: Joi.string().valid('normal', 'high', 'critical'),
    contactInfo: Joi.object({
      primaryContact: Joi.string().allow(''),
      phone: Joi.string().allow(''),
      email: Joi.string().allow(''),
      relationship: Joi.string().allow('')
    }),
    visibilitySettings: Joi.object({
      publicVisible: Joi.boolean(),
      photoVisible: Joi.boolean(),
      locationVisible: Joi.boolean(),
      contactVisible: Joi.boolean()
    }),
    consentSettings: Joi.object({
      publicSearch: Joi.boolean(),
      mediaSharing: Joi.boolean(),
      reunificationConsent: Joi.boolean(),
      secureCommunication: Joi.boolean()
    })
  }),

  updateCase: Joi.object({
    name: Joi.string().min(1).max(200),
    ageWhenMissing: Joi.number().min(0).max(150),
    estimatedCurrentAge: Joi.number().min(0).max(150),
    dateMissing: Joi.date(),
    lastKnownLocation: Joi.object(),
    physicalDescription: Joi.object(),
    clothing: Joi.string().allow(''),
    circumstances: Joi.string().allow(''),
    priority: Joi.string().valid('normal', 'high', 'critical'),
    status: Joi.string().valid('active', 'under_investigation', 'resolved', 'closed'),
    contactInfo: Joi.object(),
    visibilitySettings: Joi.object(),
    consentSettings: Joi.object(),
    timeline: Joi.array()
  }),

  createSighting: Joi.object({
    location: Joi.object({
      address: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      country: Joi.string().allow(''),
      coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() })
    }),
    date: Joi.date(),
    approximateTime: Joi.string().allow(''),
    description: Joi.string().allow(''),
    clothing: Joi.string().allow(''),
    approximateAge: Joi.number().min(0).max(150),
    witnessNotes: Joi.string().allow(''),
    relatedCaseIds: Joi.array().items(Joi.string()),
    consentConfirmed: Joi.boolean()
  }),

  sendMessage: Joi.object({
    receiverId: Joi.string(),
    recipientId: Joi.string(),
    caseId: Joi.string().allow(''),
    message: Joi.string().min(1).max(5000),
    content: Joi.string().min(1).max(5000)
  }).or('receiverId', 'recipientId').or('message', 'content'),

  reviewLead: Joi.object({
    action: Joi.string().valid('approve', 'reject', 'needs_more_info', 'under_review').required(),
    notes: Joi.string().allow(''),
    evidenceUsed: Joi.array().items(Joi.string())
  }),

  consent: Joi.object({
    caseId: Joi.string(),
    consentType: Joi.string().valid(
      'public_visibility', 'photo_sharing', 'evidence_access', 'contact_sharing',
      'location_sharing', 'secure_communication', 'reunification', 'data_processing'
    ).required(),
    granted: Joi.boolean().required()
  }),

  clusterReview: Joi.object({
    reviewStatus: Joi.string().valid('pending', 'under_review', 'confirmed', 'rejected').required(),
    reviewNotes: Joi.string().allow('')
  })
};

module.exports = { validate, schemas };
