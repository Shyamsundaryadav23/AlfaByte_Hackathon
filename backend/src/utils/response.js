export const successResponse = (res, data, message = "Success") => {
  return res.status(200).json({ message, data });
};

export const errorResponse = (res, message = "Error", status = 500) => {
  return res.status(status).json({ message });
};
