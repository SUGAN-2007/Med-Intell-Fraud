import { getDriver, isRealNeo4jConnected } from '../config/neo4j.js';
import { getMemoryStore } from '../db/seedLoader.js';

export async function detectCircularReferrals() {
  const driver = getDriver();

  if (isRealNeo4jConnected() && driver) {
    const session = driver.session();
    try {
      const cypherQuery = `
        MATCH path = (a:Agent)-[:REFERS_TO]->(c:Clinic)-[:EMPLOYS]->(d:Doctor)-[:KICKBACK_PAYOUT]->(a)
        RETURN a.id AS agentId, a.name AS agentName,
               c.id AS clinicId, c.name AS clinicName,
               d.id AS doctorId, d.name AS doctorName
      `;
      const result = await session.run(cypherQuery);
      return result.records.map(record => ({
        agent: { id: record.get('agentId'), name: record.get('agentName') },
        clinic: { id: record.get('clinicId'), name: record.get('clinicName') },
        doctor: { id: record.get('doctorId'), name: record.get('doctorName') },
        patternType: 'CIRCULAR_REFERRAL_LOOP'
      }));
    } finally {
      await session.close();
    }
  }

  // Fallback Graph Engine Execution
  const { nodes, relationships } = getMemoryStore();
  const loops = [];

  const refersToRels = relationships.filter(r => r.type === 'REFERS_TO');
  const employsRels = relationships.filter(r => r.type === 'EMPLOYS');
  const kickbackRels = relationships.filter(r => r.type === 'KICKBACK_PAYOUT');

  refersToRels.forEach(ref => {
    const agentId = ref.from;
    const clinicId = ref.to;

    // Find doctors employed by this clinic
    const clinicEmploys = employsRels.filter(e => e.from === clinicId);
    clinicEmploys.forEach(emp => {
      const doctorId = emp.to;

      // Check if doctor has kickback payout back to agent
      const kickback = kickbackRels.find(k => k.from === doctorId && k.to === agentId);
      if (kickback) {
        const agentNode = nodes.find(n => n.id === agentId);
        const clinicNode = nodes.find(n => n.id === clinicId);
        const doctorNode = nodes.find(n => n.id === doctorId);

        loops.push({
          agent: { id: agentNode.id, name: agentNode.properties.name },
          clinic: { id: clinicNode.id, name: clinicNode.properties.name },
          doctor: { id: doctorNode.id, name: doctorNode.properties.name },
          revenueShare: kickback.properties.revenueShare || '30-50%',
          patternType: 'CIRCULAR_REFERRAL_LOOP'
        });
      }
    });
  });

  return loops;
}
