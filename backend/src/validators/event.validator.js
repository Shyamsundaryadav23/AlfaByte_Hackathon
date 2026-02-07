import Joi from "joi";

export const createEventValidator = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().allow("").optional(),
    event_type: Joi.string().valid("Seminar","Workshop","Conference","Hackathon").required(),
    start_time: Joi.date().required(),
    end_time: Joi.date().greater(Joi.ref('start_time')).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  next();
};

export const updateEventStatusValidator = (req, res, next) => {
  const schema = Joi.object({
    eventId: Joi.string().uuid().required(),
    status: Joi.string().valid("Draft","Published","Live","Completed","Archived").required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  next();
};
