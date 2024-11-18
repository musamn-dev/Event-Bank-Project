/**
 * @description       : 
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public with sharing class ChecklistController {

    public void createNewChecklist(Id eventId){
        try{
            Checklist__c checklist = new checklist__c(
                EBEvent__c = eventId
            );
            insert checklist;
        }
        catch(Exception e){
            throw new AuraHandledException('Error creating checklist for event: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Checklist__c getChecklist(Id checklistId) {
        return new ChecklistSelector().selectById(checklistId);
    }

    @AuraEnabled(cacheable=true)
    public static String getEventIdForCurrentUser() {
        GlobalVariable__c globalVar = [
            SELECT EventId__c
            FROM GlobalVariable__c
            WHERE UserId__c = :UserInfo.getUserId()
            LIMIT 1
        ];
        return globalVar != null ? globalVar.EventId__c : null;
    }

    @AuraEnabled(cacheable=true)
    public static String getCurrentUserRole(Id eventId) {
        User_Event__c userEvent = [
            SELECT Role__c
            FROM User_Event__c
            WHERE User__c = :UserInfo.getUserId() AND EBEvent__c = :eventId
            LIMIT 1
        ];
        return userEvent != null ? userEvent.Role__c : null;
    }
}