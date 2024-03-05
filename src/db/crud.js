const { desc, eq } = require("drizzle-orm");
const clients = require("./clients");
const schemas = require("./schemas");

const newLead = async (newLeadObject) => {
  const db = await clients.getDrizzleDbClient();
  const result = await db
    .insert(schemas.LeadTable)
    .values(newLeadObject)
    .returning();
  if (result.length === 1) {
    return result[0];
  }
  return result;
};

const listAllLeads = async () => {
  const db = await clients.getDrizzleDbClient();
  const results = await db
    .select()
    .from(schemas.LeadTable)
    .orderBy(desc(schemas.LeadTable.createdAt))
    .limit(10);
  return results;
};

const listSingleLead = async (id) => {
  const db = await clients.getDrizzleDbClient();
  const result = await db
    .select()
    .from(schemas.LeadTable)
    .where(eq(schemas.LeadTable.id, id));
  if (result.length === 1) {
    return result[0];
  }
  return result;
};

const editLead = async (id, editedLeadObject) => {
  const db = await clients.getDrizzleDbClient();
  const result = await db
    .update(schemas.LeadTable)
    .set(editedLeadObject)
    .where(eq(schemas.LeadTable.id, id))
    .returning();
  if (result.length === 1) {
    return result[0];
  }
  return result;
};

module.exports = {
  newLead,
  listAllLeads,
  listSingleLead,
  editLead,
};
