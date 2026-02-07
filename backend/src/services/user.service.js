import { getAllUsers, updateUserRole } from "../models/user.model.js";

export const fetchUsers = async () => {
  return await getAllUsers();
};

export const modifyUserRole = async (userId, role) => {
  return await updateUserRole(userId, role);
};
