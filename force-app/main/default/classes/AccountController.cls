/**
 * @description       : 
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public with sharing class AccountController {
    /**
    * Retrieves the balance of the specified event account.
    *
    * @param eventId The ID of the event account.
    * @return The balance of the account.
    **/
    @AuraEnabled(cacheable=true)
    public static Decimal getAccountBalance(Id eventId) {
        EBAccount__c account = [SELECT Balance__c FROM EBAccount__c WHERE Id = :eventId];
        return account.Balance__c;
    }
}