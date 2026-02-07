import { fetchUsers, modifyUserRole } from "../services/user.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const updated = await modifyUserRole(userId, role);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
