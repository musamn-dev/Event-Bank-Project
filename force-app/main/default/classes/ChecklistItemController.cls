/**
 * @description       : This class is used to manage checklist items
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public with sharing class ChecklistItemController {
    @AuraEnabled(cacheable=true)
    public static List<Checklist_Item__c> getChecklistItems(String eventId) { 
        Checklist__c checklistId = new ChecklistSelector().selectByEventId(eventId);
        return new ChecklistItemsSelector().selectByChecklistId(checklistId.Id);
    }

    @AuraEnabled
    public static void deleteChecklistItem(String eventId, Id itemId) {
        Checklist__c checklist = new ChecklistSelector().selectByEventId(eventId);
        System.debug('checklist :: ' + checklist);
        //new ChecklistItemsSelector().selectByChecklistIdSingleItem(checklist.Id).Id;
        //Checklist_Item__c checklistItem = [SELECT Id FROM Checklist_Item__c WHERE Id = :checklistItemId LIMIT 1];
        Checklist_Item__c item = new ChecklistItemsSelector().selectByChecklistIdSingleItem(checklist.Id, itemId);
        System.debug('item :: ' + item);
        delete item;
    }

    @AuraEnabled
    public static void updateChecklistItem(List<Checklist_Item__c> items) {
        try {
            update items;
        } catch (DmlException e) {
            throw new AuraHandledException('Failed to update checklist item: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void createChecklistItem(String itemName, String eventId) {
        List<Checklist__c> checklist = [SELECT Id FROM Checklist__c WHERE EBEvent__c = :eventId LIMIT 1];
        if (checklist.isEmpty()) {
            new ChecklistController().createNewChecklist(eventId);
            checklist = [SELECT Id FROM Checklist__c WHERE EBEvent__c = :eventId LIMIT 1];
            if (checklist.isEmpty()) {
                throw new AuraHandledException('No checklist found for the given event ID.');
            }
        }

        Checklist_Item__c checklistItem = new Checklist_Item__c();
        checklistItem.Checklist__c = checklist[0].Id;
        checklistItem.Complete__c = false;
        checklistItem.Name = itemName;

        insert checklistItem;
    }
}