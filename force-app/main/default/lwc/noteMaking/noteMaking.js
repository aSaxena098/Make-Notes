import { LightningElement, wire } from 'lwc';
const DEFAULT_NOTE_FORM = {
   Name: "",
   Note_Description: ""
}
import createNoteRecord from '@salesforce/apex/NoteTakingController.createNoteRecord';
import updateNote from '@salesforce/apex/NoteTakingController.updateNote';
import getNotes from '@salesforce/apex/NoteTakingController.getNotes';
import deleteNote from '@salesforce/apex/NoteTakingController.deleteNote';
import { refreshApex } from '@salesforce/apex';
import LightningConfirm from 'lightning/confirm';
export default class NoteMaking extends LightningElement {
   showModal = false;
   noteRecord = DEFAULT_NOTE_FORM;
   noteListiInfo = [];
   selectedRecordId;
   wiredResult
   formats = ['font', 'size', 'bold', 'italic', 'underline', 'strike', 'list', 'indent', 'align', 'link', 'image', 'clean', 'table', 'header', 'color'];
   @wire(getNotes)
   getExistingNotes(result) {
      this.wiredResult = result;
      let { data, error } = result;
      if (data) {
         console.log(data);
         this.noteListiInfo = data.map(item => {
            let formattedDate = new Date(item.LastModifiedDate).toDateString();
            return { ...item, formattedDate };
         })
      } else if (error) {
         console.log(error);
      }
   }
   createNoteHandler() {
      this.noteRecord = DEFAULT_NOTE_FORM;
      this.showModal = true;
   }
   closeModalHandler() {
      this.noteRecord = DEFAULT_NOTE_FORM;
      this.showModal = false;
   }
   changeHandler(event) {
      const { name, value } = event.target;
      this.noteRecord = { ...this.noteRecord, [name]: value }
   }
   submitHandler(event) {
      event.preventDefault();
      console.log("Note Record ::: " + JSON.stringify(this.noteRecord));
      if (this.selectedRecordId) {
         this.updateNoteRecord(this.selectedRecordId);
      } else {
         this.createNote();
      }
   }
   get isFormInavlid() {
      return !(this.noteRecord && this.noteRecord.Note_Description && this.noteRecord.Name);
   }
   createNote() {
      createNoteRecord({ title: this.noteRecord.Name, description: this.noteRecord.Note_Description }).then(response => {
         console.log(response);
         this.showToastNotification('Note Created Successfully', 'success');
         this.showModal = false;
         this.refresh();
      }).catch(error => {
         this.showToastNotification(error.message.body, 'error');
      });
   }
   showToastNotification(message, variant) {
      const elem = this.template.querySelector('c-notification');
      if (elem) {
         elem.showToast(message, variant);
      }
   }
   editNoteHandler(event) {
      let { recordid } = event.target.dataset;
      this.selectedRecordId = recordid;
      let selectedNote = this.noteListiInfo.find((item) => {
         if (item.Id === recordid) {
            return item;
         }
      });
      this.noteRecord = {
         Name: selectedNote.Name,
         Note_Description: selectedNote.Description__c
      };
      this.showModal = true;
   }
   updateNoteRecord(noteId) {
      let { Name, Note_Description } = this.noteRecord;
      updateNote({ noteRecordId: noteId, title: Name, description: Note_Description }).then((response) => {
         console.log("Note record Updated ::: " + response);
         this.showModal = false;
         this.showToastNotification('Note Updated Successfully', 'success');
         this.refresh();
      }).catch(error => {
         console.error('Error ::: ' + error.message.body);
         this.showToastNotification(error.message.body, 'error');
      });

   }
   deleteNoteHandler(event) {
      let { recordid } = event.target.dataset;
      this.selectedRecordId = recordid;
      this.handleConfirmClick();
   }
   async handleConfirmClick() {
      const result = await LightningConfirm.open({
         message: "Are you sure you want to delete the existing note !!",
         varaint: 'headerless',
         label: 'Delete Confirmation'
      });
      if (result) {
         this.deleteHandler();
      }
   }
   deleteHandler() {
      deleteNote({ noteRecordID: this.selectedRecordId }).then(response => {
         console.log(response);
         this.selectedRecordId = null;
         this.showToastNotification('Note Deleted Successfully', 'success');
         this.refresh();
      }).catch(error => {
         this.showToastNotification('Note was not deleted!!', 'error');
         console.error(error.message.body);
      })
   }
   refresh() {
      return refreshApex(this.wiredResult);
   }
}