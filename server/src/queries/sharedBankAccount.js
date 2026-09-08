import { getDriver, isRealNeo4jConnected } from '../config/neo4j.js';
import { getMemoryStore } from '../db/seedLoader.js';

export async function detectSharedBankAccounts() {
  const driver = getDriver();

  if (isRealNeo4jConnected() && driver) {
    const session = driver.session();
    try {
      const cypherQuery = `
        MATCH (e1)-[:USES_BANK_ACCOUNT]->(b:BankAccount)<-[:USES_BANK_ACCOUNT]-(e2)
        WHERE id(e1) < id(e2)
        RETURN b.accountNumber AS accountNumber, b.bankName AS bankName,
               e1.id AS entity1_id, e1.name AS entity1_name, labels(e1)[0] AS entity1_type,
               e2.id AS entity2_id, e2.name AS entity2_name, labels(e2)[0] AS entity2_type
      `;
      const result = await session.run(cypherQuery);
      return result.records.map(record => ({
        accountNumber: record.get('accountNumber'),
        bankName: record.get('bankName'),
        entity1: { id: record.get('entity1_id'), name: record.get('entity1_name'), type: record.get('entity1_type') },
        entity2: { id: record.get('entity2_id'), name: record.get('entity2_name'), type: record.get('entity2_type') }
      }));
    } finally {
      await session.close();
    }
  }

  // Fallback Graph Engine Execution
  const { nodes, relationships } = getMemoryStore();
  const bankRels = relationships.filter(r => r.type === 'USES_BANK_ACCOUNT');

  const accountToEntities = {};
  bankRels.forEach(rel => {
    const bankNode = nodes.find(n => n.id === rel.to);
    const entityNode = nodes.find(n => n.id === rel.from);
    if (bankNode && entityNode) {
      const accNo = bankNode.properties.accountNumber;
      if (!accountToEntities[accNo]) {
        accountToEntities[accNo] = {
          accountNumber: accNo,
          bankName: bankNode.properties.bankName || 'Unknown Bank',
          entities: []
        };
      }
      accountToEntities[accNo].entities.push({
        id: entityNode.id,
        name: entityNode.properties.name,
        type: entityNode.label,
        country: entityNode.properties.country
      });
    }
  });

  const matches = [];
  Object.values(accountToEntities).forEach(group => {
    if (group.entities.length > 1) {
      for (let i = 0; i < group.entities.length; i++) {
        for (let j = i + 1; j < group.entities.length; j++) {
          matches.push({
            accountNumber: group.accountNumber,
            bankName: group.bankName,
            entity1: group.entities[i],
            entity2: group.entities[j],
            sharedEntityCount: group.entities.length
          });
        }
      }
    }
  });

  return matches;
}
