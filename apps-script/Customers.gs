function createCustomer_(user,input) {
 authorize_(user,'customers.create');
 var name=text_(input.name,100),father=text_(input.father,100),cnic=text_(input.cnic,15),phone=text_(input.phone,30).replace(/[\s-]/g,'').replace(/^\+92/,'0'),address=text_(input.address,300),email=text_(input.email||'',150);
 if(!name||!father||!address||!/^\d{5}-\d{7}-\d$/.test(cnic)||!/^03\d{9}$/.test(phone))throw new Error('Required customer fields or CNIC/mobile format are invalid.');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try {
  var repo=repository_(),customers=repo.findMany('04_Customers');
  if(customers.some(function(c){return c.cnic===cnic;}))throw new Error('A customer with this CNIC already exists.');
  var seq=PropertiesService.getScriptProperties();var max=customers.reduce(function(n,c){return Math.max(n,Number(c.id.replace('CUS-',''))||0);},0);var next=Math.max(max,Number(seq.getProperty('ERP_CUSTOMER_SEQUENCE')||0))+1;
  // Reserve before writing: a failed write may leave a harmless gap, never a reused ID.
  seq.setProperty('ERP_CUSTOMER_SEQUENCE',String(next));
  var row=record_('CUS-'+('000000'+next).slice(-6),user,{name:name,father:father,cnic:cnic,phone:phone,address:address,email:email});
  repo.create('04_Customers',row);audit_(user,'Customer registered','Customers',row.uuid,'Created customer '+row.id);return {id:row.id,uuid:row.uuid};
 } finally {lock.releaseLock();}
}
