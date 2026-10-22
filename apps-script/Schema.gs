/** UUID internal keys; readable IDs never replace foreign keys. All amounts are integer paisa. */
var ERP_SCHEMA_ = {
'00_Settings':['key','valueJson'],
'01_Users':['email','name','role','active','lastLoginAt'],
'02_Roles':['code','name','permissionsJson'],
'03_Permissions':['code','description'],
'04_Customers':['name','father','cnic','phone','whatsapp','email','address','province','district','city','birthDate','occupation','photoFileId','cnicFrontFileId','cnicBackFileId','notes'],
'05_Guarantors':['customerUuid','name','father','cnic','phone','whatsapp','address','relationship','photoFileId','cnicFileId'],
'06_Products':['sku','name','category','brand','model','description','purchasePriceMinor','cashPriceMinor','markupBps','supplierUuid','stockTracked','minimumStock','imageFileId','warranty'],
'07_Inventory':['productUuid','serial','imei','quantity','location'],
'08_StockMovements':['productUuid','contractUuid','delta','reason','reversalOf'],
'09_Contracts':['customerUuid','guarantorUuidsJson','contractDate','cashMinor','discountMinor','downMinor','principalMinor','markupBps','markupMinor','receivableMinor','overallMinor','installmentCount','firstDueDate','finalDueDate','termsSnapshotJson','brandingSnapshotJson','approvedBy','version','amendmentOf'],
'10_ContractItems':['contractUuid','productUuid','quantity','unitPriceMinor','productSnapshotJson','serialsJson'],
'11_InstallmentSchedules':['contractUuid','customerUuid','number','dueDate','originalAmountMinor','paidMinor','lastPaymentDate'],
'12_Payments':['contractUuid','customerUuid','paymentDate','amountMinor','method','reference','receiverUuid','idempotencyKey','payloadDigest','journalUuid','commitState','voucherId'],
'13_PaymentAllocations':['paymentUuid','scheduleUuid','amountMinor','journalUuid'],
'14_PaymentReversals':['paymentUuid','amountMinor','reason','authorizedBy','journalUuid'],
'15_CashAccounts':['name','method','currency'],
'16_Reminders':['customerUuid','contractUuid','scheduleUuid','channel','dueAt','sentAt','providerReference','error'],
'17_Notifications':['userUuid','type','message','readAt','entityUuid'],
'18_Documents':['entityType','entityUuid','driveFileId','mimeType','name','checksum','brandingSnapshotJson'],
'19_AuditLogs':['actorEmail','action','entityType','entityUuid','summary','result','error'],
'20_BackupHistory':['kind','driveFolderId','manifestFileId','schemaVersion','verifiedAt','completedAt','error'],
'21_ImportJobs':['entityType','fileId','schemaVersion','cursor','validRows','invalidRows','reportFileId'],
'22_SyncJobs':['adapter','direction','cursor','completedAt','error'],
'23_IdSequences':['entityType','nextValue'],
'24_SchemaVersions':['version','appliedAt','checksum'],
'25_FinancialJournal':['idempotencyKey','payloadDigest','operation','payloadJson','commitState','recoveredAt','error']
};
var ERP_COMMON_ = ['uuid','id','createdAt','updatedAt','createdBy','updatedBy','status'];
function headers_(name) { if(!ERP_SCHEMA_[name]) throw new Error('Unknown entity.'); return ERP_COMMON_.concat(ERP_SCHEMA_[name]); }
