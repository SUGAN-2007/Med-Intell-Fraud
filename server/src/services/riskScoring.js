import { runQuery } from '../config/neo4j.js';
import {
  getSharedBankAccounts,
  getDuplicateLicenses,
  getCircularReferrals,
  getHighConnectivityNodes
} from '../queries/fraudQueries.js';

/**
 * Calculate risk score (0-100) for a given entity ID based on triggered fraud patterns.
 */
export async function calculateRiskScore(entityId) {
  const [sharedAccs, dupLicenses, circRefs, highConn, nodeQueryResult] = await Promise.all([
    runQuery(getSharedBankAccounts()),
    runQuery(getDuplicateLicenses()),
    runQuery(getCircularReferrals()),
    runQuery(getHighConnectivityNodes()),
    runQuery(`MATCH (n) WHERE n.id = $entityId RETURN n.name AS name, labels(n)[0] AS type LIMIT 1`, { entityId })
  ]);

  const nodeInfo = (nodeQueryResult && nodeQueryResult[0]) ? nodeQueryResult[0] : {};
  const name = nodeInfo.name || entityId;
  const type = nodeInfo.type || 'Entity';

  let score = 0;
  const triggeredPatterns = [];

  // Check 1: Shared Bank Account (+40 points)
  const isSharedBank = sharedAccs.some(
    row => row.clinic1 === entityId || row.clinic2 === entityId
  );
  if (isSharedBank) {
    score += 40;
    triggeredPatterns.push('shared_bank_account');
  }

  // Check 2: Duplicate License (+35 points)
  const isDupLicense = dupLicenses.some(
    row => row.doctor1 === entityId || row.doctor2 === entityId
  );
  if (isDupLicense) {
    score += 35;
    triggeredPatterns.push('duplicate_license');
  }

  // Check 3: Circular Referral (+25 points)
  const isCircular = circRefs.some(
    row => Array.isArray(row.cycle) && row.cycle.includes(entityId)
  );
  if (isCircular) {
    score += 25;
    triggeredPatterns.push('circular_referral');
  }

  // Check 4: High Connectivity (+20 points)
  const isHighConn = highConn.some(
    row => row.id === entityId
  );
  if (isHighConn) {
    score += 20;
    triggeredPatterns.push('high_connectivity');
  }

  const riskScore = Math.min(100, Math.max(0, score));

  return {
    id: entityId,
    name,
    type,
    riskScore,
    triggeredPatterns
  };
}
