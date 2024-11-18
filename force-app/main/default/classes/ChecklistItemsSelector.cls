/**
 * @description       : This class uses the FFLib Library to create a Selector class for the Checklist Item object.
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public with sharing class ChecklistItemsSelector extends fflib_SObjectSelector {
    public ChecklistItemsSelector() {
        super.setDataAccess(DataAccess.SYSTEM_MODE);
    }

    public Schema.SObjectType getSObjectType() {
        return Checklist_Item__c.sObjectType;
    }

    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            Checklist_Item__c.Id,
            Checklist_Item__c.Name,
            Checklist_Item__c.User__c,
            Checklist_Item__c.Complete_Date__c,
            Checklist_Item__c.Complete__c,
            Checklist_Item__c.Checklist__c
        };
    }

    public List<Checklist_Item__c> selectByChecklistId(Id checklistId) {
        return Database.query(
            newQueryFactory()
                .setCondition('Checklist__c = :checklistId')
                .toSOQL()
        );
    }

    public Checklist_Item__c selectByChecklistIdSingleItem(Id checklistId, Id itemId) {
        return Database.query(
            newQueryFactory()
                .setCondition('Id = :itemId AND Checklist__c = :checklistId')
                .setLimit(1)
                .toSOQL()
        );
    }
}