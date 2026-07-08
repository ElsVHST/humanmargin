import type { Access, CollectionConfig, FieldAccess } from "payload";

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

/**
 * Delete-access met prullenbak-onderscheid: Payload roept deze functie óók aan
 * bij een trash-poging (update die deletedAt zet) en geeft dan `data` mee.
 * Teamlid: alleen naar de prullenbak; permanent verwijderen: alleen beheerder.
 */
export const magTrashenPermanentAlleenBeheerder: Access = ({ req, data }) => {
  if (req.user?.role === "beheerder") {
    return true;
  }
  const isTrashPoging = Boolean(
    data && "deletedAt" in data && data.deletedAt != null,
  );
  return Boolean(req.user) && isTrashPoging;
};

/**
 * Standaard-access voor dashboard-collecties (spec §7): ingelogd = lezen,
 * aanmaken en bewerken (incl. naar prullenbak); permanent verwijderen
 * alleen beheerder.
 */
export const dashboardCollectionAccess: CollectionConfig["access"] = {
  read: isAuthenticated,
  create: isAuthenticated,
  update: isAuthenticated,
  delete: magTrashenPermanentAlleenBeheerder,
};
