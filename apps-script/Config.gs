function config_() {
  var props=PropertiesService.getScriptProperties();
  var spreadsheetId=props.getProperty('ERP_SPREADSHEET_ID');
  if(!spreadsheetId) throw new Error('Run editor-only setup_ first.');
  return {spreadsheetId:spreadsheetId,folderId:props.getProperty('ERP_FOLDER_ID')};
}
function db_() { return SpreadsheetApp.openById(config_().spreadsheetId); }
function now_() { return new Date().toISOString(); }
function text_(v,max) { if(typeof v!=='string'||v.length>(max||300)) throw new Error('Invalid text.'); return v.trim(); }
function safeCell_(v) { if(typeof v==='string'&&/^[\s]*[=+@-]/.test(v)) return "'"+v; return v; }
