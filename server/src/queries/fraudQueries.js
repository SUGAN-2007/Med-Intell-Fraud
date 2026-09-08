/**
 * Fraud Detection Cypher Queries
 */

export function getFullGraph() {
  return `
    MATCH (n)-[r]->(m) 
    RETURN n, r, m 
    LIMIT 200
  `;
}

export function getSharedBankAccounts() {
  return `
    MATCH (c1:Clinic), (c2:Clinic) 
    WHERE c1.bank_account = c2.bank_account AND c1.id <> c2.id 
    RETURN DISTINCT c1.id AS clinic1, c1.name AS clinic1_name, c2.id AS clinic2, c2.name AS clinic2_name, c1.bank_account AS bank_account
  `;
}

export function getDuplicateLicenses() {
  return `
    MATCH (d1:Doctor), (d2:Doctor) 
    WHERE d1.license_number = d2.license_number AND d1.id <> d2.id 
    RETURN DISTINCT d1.id AS doctor1, d1.name AS doctor1_name, d2.id AS doctor2, d2.name AS doctor2_name, d1.license_number AS license_number
  `;
}

export function getCircularReferrals() {
  return `
    MATCH path=(a:Agent)-[:REFERS_TO*2..4]->(a) 
    RETURN [n IN nodes(path) | n.id] AS cycle, [n IN nodes(path) | n.name] AS agent_names
  `;
}

export function getHighConnectivityNodes() {
  return `
    MATCH (n) 
    WHERE n:Clinic OR n:Agent 
    MATCH (n)-[r:PARTNERS_WITH|REFERS_TO]-(m) 
    WITH n, count(DISTINCT m) AS connectionCount 
    WHERE connectionCount > 4 
    RETURN n.id AS id, labels(n)[0] AS type, n.name AS name, connectionCount
  `;
}
