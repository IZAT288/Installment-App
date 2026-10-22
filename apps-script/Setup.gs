/** Run manually in the editor as the initial owner. Private functions cannot be called using google.script.run. */
function setup_() {
 var email=Session.getActiveUser().getEmail().toLowerCase();
 if(!email)throw new Error('An authenticated Google Workspace editor is required.');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try {
  var props=PropertiesService.getScriptProperties();
  var id=props.getProperty('ERP_SPREADSHEET_ID');
  var spreadsheet=id?SpreadsheetApp.openById(id):SpreadsheetApp.create('Installment ERP Database');
  if(!id)props.setProperty('ERP_SPREADSHEET_ID',spreadsheet.getId());
  // Preflight every existing worksheet before creating missing ones.
  Object.keys(ERP_SCHEMA_).forEach(function(name){var s=spreadsheet.getSheetByName(name);if(s&&s.getLastRow()>0){var expected=headers_(name);if(s.getLastColumn()!==expected.length||JSON.stringify(s.getRange(1,1,1,expected.length).getValues()[0])!==JSON.stringify(expected))throw new Error('Schema mismatch in '+name+'; migration required.');}});
  spreadsheet.setSpreadsheetTimeZone('Asia/Karachi');
  Object.keys(ERP_SCHEMA_).forEach(function(name){var s=spreadsheet.getSheetByName(name)||spreadsheet.insertSheet(name);if(s.getLastRow()===0){var h=headers_(name);s.getRange(1,1,1,h.length).setValues([h]);s.setFrozenRows(1);s.getRange(1,1,1,h.length).setFontWeight('bold').setBackground('#eaf4ed');}});
  var folderId=props.getProperty('ERP_FOLDER_ID');
  var root=folderId?DriveApp.getFolderById(folderId):DriveApp.createFolder('Installment_ERP');
  if(!folderId)props.setProperty('ERP_FOLDER_ID',root.getId());
  if(root.getSharingAccess()!==DriveApp.Access.PRIVATE)throw new Error('ERP folder must have restricted access.');
  ['Database','Customers','Contracts','Vouchers','Reports','Business_Assets','Backups','Logs'].forEach(function(name){if(!root.getFoldersByName(name).hasNext())root.createFolder(name);});
  var backups=root.getFoldersByName('Backups').next();['Daily','Weekly','Monthly'].forEach(function(name){if(!backups.getFoldersByName(name).hasNext())backups.createFolder(name);});
  var repository=repository_(),users=repository.findMany('01_Users');
  if(!users.length){var owner={email:email};repository.create('01_Users',record_('USR-000001',owner,{email:email,name:email.split('@')[0],role:'SUPER_ADMIN',active:true}));audit_(owner,'Initial ownership established','Users',email,'Editor authenticated through Google Workspace');}
  if(!repository.findMany('00_Settings').length)repository.create('00_Settings',record_('SET-000001',{email:email},{key:'business',valueJson:JSON.stringify({name:'Qist Business',owner:email.split('@')[0],address:'',phone:'',markup:35})}));
  if(!repository.findMany('24_SchemaVersions').length)repository.create('24_SchemaVersions',record_('SCHEMA-1',{email:email},{version:1,appliedAt:now_(),checksum:Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(ERP_SCHEMA_)))}));
  repository.getHealthStatus();
  // No triggers are registered until the corresponding reminder/backup implementations are delivered.
  props.setProperty('ERP_SETUP_VERSION','1');return {ok:true,schemaVersion:1,googleDeploymentValidationRequired:true};
 } finally {lock.releaseLock();}
}
