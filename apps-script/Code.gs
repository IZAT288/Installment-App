function doGet() {
 // Authentication is checked again for every data call. No anonymous data is embedded.
 actor_();return HtmlService.createHtmlOutputFromFile('Index').setTitle('Qist — Business workspace').addMetaTag('viewport','width=device-width, initial-scale=1');
}
function api(action,payload) {
 var user=actor_();
 if(action==='createCustomer')return createCustomer_(user,payload||{});
 if(action!=='bootstrap')throw new Error('This server operation is not enabled in this phase.');
 authorize_(user,'read');var repo=repository_();var settings=repo.findMany('00_Settings').find(function(r){return r.key==='business';});
 return {customers:repo.findMany('04_Customers'),products:repo.findMany('06_Products').map(function(p){return {id:p.id,name:p.name,category:p.category,brand:p.brand,model:p.model,price:Number(p.cashPriceMinor),stock:repo.findMany('07_Inventory').filter(function(r){return r.productUuid===p.uuid;}).reduce(function(n,r){return n+Number(r.quantity);},0),min:Number(p.minimumStock)};}),contracts:[],payments:[],audit:repo.findMany('19_AuditLogs').slice(-100).reverse().map(function(a){return {id:a.id,date:a.createdAt,action:a.action,entity:a.entityType};}),settings:settings?JSON.parse(settings.valueJson):{name:'Qist Business',owner:user.name,address:'',phone:'',markup:35}};
}
