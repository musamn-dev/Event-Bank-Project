/**
 * @description       : 
 * @author            : musa.nkuna@absa.africa
 * @group             : 
 * @last modified on  : 11-18-2024
 * @last modified by  : musa.nkuna@absa.africa
**/
public with sharing class TransactionController {
    /**
    * Creates a transaction and updates the account balance.
    *
    * @param eventId The ID of the event account.
    * @param amount The amount of the transaction.
    * @param description The description of the transaction.
    * @param type The type of the transaction (Deposit or Payment).
    **/
    @AuraEnabled
    public static void createTransaction(Id eventId, Decimal amount, String description, String type) {
        Transaction__c trans = new Transaction__c();
        trans.AccountId__c = eventId;
        trans.Amount__c = amount;
        trans.Description__c = description;
        insert trans;

        EBAccount__c account = [SELECT Balance__c FROM EBAccount__c WHERE Id = :eventId FOR UPDATE];
        if (type == 'Deposit') {
            account.Balance__c += amount;
        } else if (type == 'Payment') {
            account.Balance__c -= amount;
        }
        update account;
    }

     /**
    * Retrieves all transactions for a specific event.
    *
    * @param eventId The ID of the event.
    * @return A list of transactions.
    **/
    @AuraEnabled(cacheable=true)
    public static List<Transaction__c> getTransactions(Id eventId) {
        return [SELECT Id, CreatedDate, Description__c, Amount__c FROM Transaction__c WHERE AccountId__c = :eventId ORDER BY CreatedDate DESC];
    }
}