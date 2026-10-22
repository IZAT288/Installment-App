function actor_() {
 var email=Session.getActiveUser().getEmail().toLowerCase();
 if(!email) throw new Error('Google Workspace identity is unavailable. Access denied.');
 var user=repository_().findMany('01_Users').find(function(u){return u.email.toLowerCase()===email&&u.active===true&&u.status==='Active';});
 if(!user) throw new Error('Your account is not active in this workspace.');
 if(['SUPER_ADMIN','ADMIN'].indexOf(user.role)===-1) throw new Error('Staff access is not enabled until protected storage and assignment filtering are validated.');
 return user;
}
function authorize_(user,permission) {
 var matrix={SUPER_ADMIN:['read','customers.create','settings.manage'],ADMIN:['read','customers.create']};
 if(!matrix[user.role]||matrix[user.role].indexOf(permission)===-1) throw new Error('Permission denied.');
}
