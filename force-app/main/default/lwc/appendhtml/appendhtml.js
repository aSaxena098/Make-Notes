import { LightningElement, api } from 'lwc';

export default class Appendhtml extends LightningElement {
   loaded;
   _result

   @api
   get result() {
      return this._result;
   }
   set result(data) {
      this._result = data;
      if (this.loaded) {
         this.attachHTML();
      }
   }
   renderedCallback() {
      if (this._result && !this.loaded) {
         this.attachHTML();
      }
   }
   attachHTML() {
      let elem = this.template.querySelector('.html-container');
      if (elem) {
         elem.innerHTML = this._result;
         this.loaded = true;
      }
   }
}