function repository_() {
 var spreadsheet=db_();
 function sheet(name) {
  var s=spreadsheet.getSheetByName(name);if(!s)throw new Error('Missing schema: '+name);
  var expected=headers_(name),actual=s.getRange(1,1,1,expected.length).getValues()[0];
  if(JSON.stringify(actual)!==JSON.stringify(expected)||s.getLastColumn()!==expected.length)throw new Error('Schema mismatch in '+name+'. No data was changed.');
  return s;
 }
 return {
  findMany:function(name) {var s=sheet(name);if(s.getLastRow()<2)return [];var h=headers_(name);return s.getRange(2,1,s.getLastRow()-1,h.length).getValues().map(function(row){var result={};h.forEach(function(k,i){var v=row[i];result[k]=v instanceof Date?v.toISOString():v;});return result;});},
  findById:function(name,uuid){return this.findMany(name).find(function(row){return row.uuid===uuid;})||null;},
  create:function(name,row){var s=sheet(name),h=headers_(name);s.getRange(s.getLastRow()+1,1,1,h.length).setValues([h.map(function(k){return safeCell_(row[k]===undefined?'':row[k]);})]);return row;},
  getHealthStatus:function(){Object.keys(ERP_SCHEMA_).forEach(sheet);return {ok:true,schemaVersion:1};}
 };
}
function record_(id,user,fields) {return Object.assign({uuid:Utilities.getUuid(),id:id,createdAt:now_(),updatedAt:now_(),createdBy:user.email,updatedBy:user.email,status:'Active'},fields);}
function audit_(user,action,entityType,entityUuid,summary) {return repository_().create('19_AuditLogs',record_(Utilities.getUuid(),user,{actorEmail:user.email,action:action,entityType:entityType,entityUuid:entityUuid,summary:summary,result:'Success'}));}
