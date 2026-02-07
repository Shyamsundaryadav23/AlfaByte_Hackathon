import Joi from "joi";

export const registerAttendanceValidator = (req, res, next) => {
  const schema = Joi.object({
    eventId: Joi.string().uuid().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  next();
};

export const markAttendanceValidator = (req, res, next) => {
  const schema = Joi.object({
    eventId: Joi.string().uuid().required(),
    studentId: Joi.string().uuid().required(),
    status: Joi.string().valid("Present", "Absent", "Late").required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  next();
};
