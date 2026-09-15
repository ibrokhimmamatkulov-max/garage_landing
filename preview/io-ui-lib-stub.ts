/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ЗАГЛУШКА @ioyandasoz/io_ui_lib — только для превью-сборки.
 *
 * Настоящий пакет лежит в приватном GitHub Packages и недоступен.
 * Этот файл подставляется алиасом ТОЛЬКО в vite.preview.config.ts,
 * на обычную сборку он не влияет.
 *
 * Сгенерировано автоматически. Имён: 81.
 */
import { defineComponent, h } from 'vue';

const iconStub = (name: string) =>
  defineComponent({
    name,
    props: { fill: { type: String, default: "currentColor" } },
    setup(props) {
      return () =>
        h(
          "svg",
          {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 2,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            width: "100%",
            height: "100%",
          },
          [h("path", { d: ICON_PATHS[name] ?? ICON_PATHS.__default })],
        );
    },
  });

/* Реальные контуры для иконок, которые видны на главном экране */
const ICON_PATHS: Record<string, string> = {
  FilterIcon: "M3 5h18M6 12h12M10 19h4",
  ChevronIcon: "M9 6l6 6-6 6",
  GeoIcon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z",
  SettingsIcon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  CheckMarkIcon: "M4 12l5 5L20 6",
  __default: "M4 12h16",
};

export const AddNotesIcon = iconStub('AddNotesIcon');
export const AddPhotoIcon = iconStub('AddPhotoIcon');
export const BackIcon = iconStub('BackIcon');
export const BellIcon = iconStub('BellIcon');
export const BookmarkIcon = iconStub('BookmarkIcon');
export const CalendarIcon = iconStub('CalendarIcon');
export const CarIcon = iconStub('CarIcon');
export const CheckMarkIcon = iconStub('CheckMarkIcon');
export const ChevronIcon = iconStub('ChevronIcon');
export const CircleIcon = iconStub('CircleIcon');
export const ClockIcon = iconStub('ClockIcon');
export const CountIcon = iconStub('CountIcon');
export const CrossedOutEyeIcon = iconStub('CrossedOutEyeIcon');
export const DeleteIcon = iconStub('DeleteIcon');
export const DownloadCloudIcon = iconStub('DownloadCloudIcon');
export const DragIcon = iconStub('DragIcon');
export const EditIcon = iconStub('EditIcon');
export const ExpandIcon = iconStub('ExpandIcon');
export const ExportIcon = iconStub('ExportIcon');
export const ExternalLinkIcon = iconStub('ExternalLinkIcon');
export const FilterEditIcon = iconStub('FilterEditIcon');
export const FilterIcon = iconStub('FilterIcon');
export const FilterLinesIcon = iconStub('FilterLinesIcon');
export const FilterPlusIcon = iconStub('FilterPlusIcon');
export const FilterRemoveIcon = iconStub('FilterRemoveIcon');
export const FilterTableIcon = iconStub('FilterTableIcon');
export const FlipIcon = iconStub('FlipIcon');
export const GeoIcon = iconStub('GeoIcon');
export const GiftIcon = iconStub('GiftIcon');
export const GraphIcon = iconStub('GraphIcon');
export const HelpIcon = iconStub('HelpIcon');
export const HomeIcon = iconStub('HomeIcon');
export const InboxIcon = iconStub('InboxIcon');
export const LayoutCarIcon = iconStub('LayoutCarIcon');
export const LightningIcon = iconStub('LightningIcon');
export const LinkIcon = iconStub('LinkIcon');
export const ListIcon = iconStub('ListIcon');
export const MailIcon = iconStub('MailIcon');
export const MenuDownIcon = iconStub('MenuDownIcon');
export const MenuFilterIcon = iconStub('MenuFilterIcon');
export const MenuIcon = iconStub('MenuIcon');
export const MinusCircleIcon = iconStub('MinusCircleIcon');
export const MinusIcon = iconStub('MinusIcon');
export const MoonIcon = iconStub('MoonIcon');
export const PersonEditIcon = iconStub('PersonEditIcon');
export const PhoneIcon = iconStub('PhoneIcon');
export const PlaneIcon = iconStub('PlaneIcon');
export const PlusCircleIcon = iconStub('PlusCircleIcon');
export const PlusIcon = iconStub('PlusIcon');
export const RefreshIcon = iconStub('RefreshIcon');
export const ReportIcon = iconStub('ReportIcon');
export const RotateIcon = iconStub('RotateIcon');
export const SaveIcon = iconStub('SaveIcon');
export const SettingsIcon = iconStub('SettingsIcon');
export const SigmaIcon = iconStub('SigmaIcon');
export const SpinnerSvg = iconStub('SpinnerSvg');
export const SqlIcon = iconStub('SqlIcon');
export const SquareEditOutlineIcon = iconStub('SquareEditOutlineIcon');
export const StatusAlertIcon = iconStub('StatusAlertIcon');
export const StatusCheckIcon = iconStub('StatusCheckIcon');
export const SubtractIcon = iconStub('SubtractIcon');
export const SunIcon = iconStub('SunIcon');
export const TaxiIcon = iconStub('TaxiIcon');
export const XCircleIcon = iconStub('XCircleIcon');

/* Компоненты формы: минимальные, но рабочие — превью только про главный экран */
export const AddLocation = defineComponent({ name: 'AddLocation', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('div', { ...attrs, 'data-stub': 'AddLocation' }, slots.default ? slots.default() : undefined); } });
export const CustomCheckbox = defineComponent({ name: 'CustomCheckbox', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('input', { ...attrs, 'data-stub': 'CustomCheckbox' }); } });
export const CustomContext = defineComponent({ name: 'CustomContext', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('div', { ...attrs, 'data-stub': 'CustomContext' }, slots.default ? slots.default() : undefined); } });
export const CustomDatepicker = defineComponent({ name: 'CustomDatepicker', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('input', { ...attrs, 'data-stub': 'CustomDatepicker' }); } });
export const CustomInput = defineComponent({ name: 'CustomInput', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('input', { ...attrs, 'data-stub': 'CustomInput' }); } });
export const CustomMultiselect = defineComponent({ name: 'CustomMultiselect', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('select', { ...attrs, 'data-stub': 'CustomMultiselect' }, slots.default ? slots.default() : undefined); } });
export const CustomRadio = defineComponent({ name: 'CustomRadio', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('input', { ...attrs, 'data-stub': 'CustomRadio' }); } });
export const CustomSelect = defineComponent({ name: 'CustomSelect', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('select', { ...attrs, 'data-stub': 'CustomSelect' }, slots.default ? slots.default() : undefined); } });
export const CustomTable = defineComponent({ name: 'CustomTable', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('table', { ...attrs, 'data-stub': 'CustomTable' }, slots.default ? slots.default() : undefined); } });
export const CustomTextarea = defineComponent({ name: 'CustomTextarea', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('textarea', { ...attrs, 'data-stub': 'CustomTextarea' }, slots.default ? slots.default() : undefined); } });
export const DefaultButton = defineComponent({ name: 'DefaultButton', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('button', { ...attrs, 'data-stub': 'DefaultButton' }, slots.default ? slots.default() : undefined); } });
export const DraggableModal = defineComponent({ name: 'DraggableModal', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('div', { ...attrs, 'data-stub': 'DraggableModal' }, slots.default ? slots.default() : undefined); } });
export const FileUploader = defineComponent({ name: 'FileUploader', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('div', { ...attrs, 'data-stub': 'FileUploader' }, slots.default ? slots.default() : undefined); } });
export const IconButton = defineComponent({ name: 'IconButton', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('button', { ...attrs, 'data-stub': 'IconButton' }, slots.default ? slots.default() : undefined); } });
export const Toast = defineComponent({ name: 'Toast', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('div', { ...attrs, 'data-stub': 'Toast' }, slots.default ? slots.default() : undefined); } });
export const Toggle = defineComponent({ name: 'Toggle', inheritAttrs: false, setup(_, { slots, attrs }) { return () => h('div', { ...attrs, 'data-stub': 'Toggle' }, slots.default ? slots.default() : undefined); } });

/* Маска телефона: тот же контракт, что у Maskito */
export const phoneOptions = { mask: /^[+\d\s()-]*$/ } as any;
