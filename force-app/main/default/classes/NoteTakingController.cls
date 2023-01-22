public without sharing class NoteTakingController {
    @AuraEnabled
    public static Boolean createNoteRecord(String title,String description)
    {
        try 
        {
            if(!String.isBlank(title))
            {
                My_Notes__c noteRecord = new My_Notes__c(Name=title,Description__c=description);
                INSERT noteRecord;
                return true;
            }
            return false;    
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<My_Notes__c> getNotes()
    {
       return [SELECT Id,Name,Description__c,LastModifiedDate FROM My_Notes__c ORDER BY LastModifiedDate DESC];
    }
    @AuraEnabled
    public static Boolean updateNote(String noteRecordId,String title,String description)
    {
        try 
        {
            List<My_Notes__c> noteList = [SELECT Id,Name,Description__c,LastModifiedDate FROM My_Notes__c WHERE Id =:noteRecordId];
            List<My_Notes__c> noteUpdateList = new List<My_Notes__c>();
            for(My_Notes__c note:noteList)
            {
                note.Name = title;
                note.Description__c = description;
                noteUpdateList.add(note);
            }
            if(noteUpdateList.size()>0)
            {
                UPDATE noteUpdateList;
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Boolean deleteNote(String noteRecordID){
        try 
        {
            if(String.isNotBlank(noteRecordID))
            {
                List<My_Notes__c> noteList = [SELECT Id,Name,Description__c,LastModifiedDate FROM My_Notes__c WHERE Id =:noteRecordId];
                DELETE noteList;
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}