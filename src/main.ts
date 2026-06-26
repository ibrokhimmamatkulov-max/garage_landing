import { createApp } from 'vue';
import App from '@/app/App.vue';
import { router } from '@/app/router';
import { store } from '@/app/store';

import {
  CarIcon,
  CustomCheckbox,
  CustomContext,
  CustomDatepicker,
  CustomInput,
  CustomMultiselect,
  CustomRadio,
  CustomSelect,
  CustomTable,
  CustomTextarea,
  DefaultButton,
  DraggableModal,
  FileUploader,
  IconButton,
  Toast,
  Toggle,
} from '@ioyandasoz/io_ui_lib';

import '@ioyandasoz/io_ui_lib/dist/io_ui_lib.css';
import '@/shared/assets/styles/global.css';

const app = createApp(App);

app.component('CarIcon', CarIcon);
app.component('DButton', DefaultButton);
app.component('IButton', IconButton);
app.component('CInput', CustomInput);
app.component('CSelect', CustomSelect);
app.component('CCheckbox', CustomCheckbox);
app.component('CTable', CustomTable);
app.component('CModal', DraggableModal);
app.component('CDatepicker', CustomDatepicker);
app.component('CRadio', CustomRadio);
app.component('FileUploader', FileUploader);
app.component('CToast', Toast);
app.component('CTextarea', CustomTextarea);
app.component('CCtxmenu', CustomContext);
app.component('CMultiselect', CustomMultiselect);
app.component('Toggle', Toggle);

app.use(store);
app.use(router);

app.mount('#app');
