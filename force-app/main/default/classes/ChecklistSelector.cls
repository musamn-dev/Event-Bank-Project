/**
 * @description       : This class uses the FFLib Library to create a Selector class for the Checklist object.
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public with sharing class ChecklistSelector extends fflib_SObjectSelector {
    public ChecklistSelector() {
        super.setDataAccess(DataAccess.SYSTEM_MODE);
    }

    public Schema.SObjectType getSObjectType() {
        return Checklist__c.sObjectType;
    }

    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            Checklist__c.Id,
            Checklist__c.Name,
            Checklist__c.EBEvent__c
        };
    }

    public Checklist__c selectById(Id checklistId) {
        return Database.query(
            newQueryFactory()
                .setCondition('Id = :checklistId')
                .setLimit(1)
                .toSOQL()
        );
    }

    public Checklist__c selectByEventId(Id eventId) {
        return Database.query(
            newQueryFactory()
                .setCondition('EBEvent__c = :eventId')
                .setLimit(1)
                .toSOQL()
        );
    }
}