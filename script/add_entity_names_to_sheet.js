/**
 * Get the campaign and ad group name from the api
 * add them to the management sheet row
 * @param {string} campaignId
 * @param {string} adGroupId
 * @param {number} managementSheetRow
 */
function addEntityNamesToManagementSheet(
    campaignId,
    adGroupId,
    managementSheetRow,
) {
  const query = `SELECT campaign.name, ad_group.name FROM ad_group
WHERE ad_group.id = ${adGroupId}
AND campaign.id = ${campaignId}
`;
  console.log(`ad_group query: ${query}`);
  const rows = AdsApp.report(query).rows();
  if (!rows.hasNext()) {
    throw new Error(`No ad group found with id ${adGroupId}
    in campaign ${campaignId}`);
  }
  const row = rows.next();
  const campaignName = row['campaign.name'];
  const adGroupName = row['ad_group.name'];
  SCRIPT_MANAGER_SHEET.getRange(managementSheetRow, 1).setValue(campaignName);
  SCRIPT_MANAGER_SHEET.getRange(managementSheetRow, 2).setValue(adGroupName);
}
