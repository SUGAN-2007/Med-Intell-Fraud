import { getDriver, isRealNeo4jConnected } from '../config/neo4j.js';
import { getMemoryStore } from '../db/seedLoader.js';

export async function detectDuplicateLicenses() {
  const driver = getDriver();

  if (isRealNeo4jConnected() && driver) {
    const session = driver.session();
    try {
      const cypherQuery = `
        MATCH (d1:Doctor)-[:HOLDS_LICENSE]->(l:LicenseRecord)<-[:HOLDS_LICENSE]-(d2:Doctor)
        WHERE id(d1) < id(d2)
        RETURN l.licenseNumber AS licenseNumber,
               d1.id AS doc1_id, d1.name AS doc1_name, d1.specialty AS doc1_specialty,
               d2.id AS doc2_id, d2.name AS doc2_name, d2.specialty AS doc2_specialty
      `;
      const result = await session.run(cypherQuery);
      return result.records.map(record => ({
        licenseNumber: record.get('licenseNumber'),
        doctor1: { id: record.get('doc1_id'), name: record.get('doc1_name'), specialty: record.get('doc1_specialty') },
        doctor2: { id: record.get('doc2_id'), name: record.get('doc2_name'), specialty: record.get('doc2_specialty') }
      }));
    } finally {
      await session.close();
    }
  }

  // Fallback Graph Engine Execution
  const { nodes, relationships } = getMemoryStore();
  const licenseRels = relationships.filter(r => r.type === 'HOLDS_LICENSE');

  const licenseToDoctors = {};
  licenseRels.forEach(rel => {
    const licNode = nodes.find(n => n.id === rel.to);
    const docNode = nodes.find(n => n.id === rel.from);
    if (licNode && docNode) {
      const licNo = licNode.properties.licenseNumber;
      if (!licenseToDoctors[licNo]) {
        licenseToDoctors[licNo] = {
          licenseNumber: licNo,
          doctors: []
        };
      }
      licenseToDoctors[licNo].doctors.push({
        id: docNode.id,
        name: docNode.properties.name,
        specialty: docNode.properties.specialty,
        experienceYears: docNode.properties.experienceYears
      });
    }
  });

  const matches = [];
  Object.values(licenseToDoctors).forEach(group => {
    if (group.doctors.length > 1) {
      for (let i = 0; i < group.doctors.length; i++) {
        for (let j = i + 1; j < group.doctors.length; j++) {
          matches.push({
            licenseNumber: group.licenseNumber,
            doctor1: group.doctors[i],
            doctor2: group.doctors[j]
          });
        }
      }
    }
  });

  return matches;
}
