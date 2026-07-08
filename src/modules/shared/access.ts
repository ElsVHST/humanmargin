import type { Access, FieldAccess } from "payload";

export const isAuthenticated: Access = ({ req }) => Boolean(req.user);

export const isBeheerder: Access = ({ req }) => req.user?.role === "beheerder";

export const isBeheerderOrSelf: Access = ({ req, id }) => {
  if (!req.user) {
    return false;
  }
  if (req.user.role === "beheerder") {
    return true;
  }
  return id !== undefined && String(req.user.id) === String(id);
};

/** Veld-access: alleen beheerders mogen dit veld wijzigen. */
export const beheerderFieldOnly: FieldAccess = ({ req }) =>
  req.user?.role === "beheerder";
