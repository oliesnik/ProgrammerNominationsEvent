public with sharing class ContactDelitionController {
    @AuraEnabled
    public static Integer totalRecords(){
        return [SELECT COUNT() FROM Contact];
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(Integer vOffset, Integer vPagesize){
        return [SELECT FirstName, LastName, Email, Title FROM Contact ORDER BY FirstName LIMIT :vPagesize OFFSET :vOffset];
    }
    @AuraEnabled(cacheable=true)
    public static Integer getNext(Integer vOffset, Integer vPagesize){
        vOffset += vPagesize;
        return vOffset;
    }

    @AuraEnabled(cacheable=true)
    public static Integer getPrevious(Integer vOffset, Integer vPagesize){
        vOffset -= vPagesize;
        return vOffset;
    }
    @AuraEnabled
    public static void contactDelition( List<Contact> contactsList ) {
        List<Case> relatedCases = [ SELECT Id FROM Case WHERE ContactId IN :contactsList  ];
        for(Case c : relatedCases){
            c.ContactId = null;
        }
        update relatedCases;
        delete contactsList;
    }
}
