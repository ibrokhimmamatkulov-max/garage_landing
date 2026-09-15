import type { Component } from 'vue';
import {
  ChevronIcon,
  BackIcon,
  ExpandIcon,
  ExternalLinkIcon,
  MenuIcon,
  MenuDownIcon,
  HomeIcon,
  XCircleIcon,
  PlusIcon,
  PlusCircleIcon,
  MinusIcon,
  MinusCircleIcon,
  CheckMarkIcon,
  EditIcon,
  DeleteIcon,
  SaveIcon,
  DownloadCloudIcon,
  ExportIcon,
  RefreshIcon,
  LinkIcon,
  FlipIcon,
  RotateIcon,
  DragIcon,
  SubtractIcon,
  FilterEditIcon,
  FilterLinesIcon,
  FilterPlusIcon,
  FilterRemoveIcon,
  FilterTableIcon,
  MenuFilterIcon,
  BellIcon,
  StatusAlertIcon,
  StatusCheckIcon,
  HelpIcon,
  LightningIcon,
  AddPhotoIcon,
  AddNotesIcon,
  TaxiIcon,
  PlaneIcon,
  GeoIcon,
  AddLocation,
  SettingsIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  BookmarkIcon,
  CircleIcon,
  GiftIcon,
  GraphIcon,
  InboxIcon,
  ListIcon,
  MoonIcon,
  SunIcon,
  ReportIcon,
  PersonEditIcon,
  SigmaIcon,
  SpinnerSvg,
  SqlIcon,
  SquareEditOutlineIcon,
  CountIcon,
  CrossedOutEyeIcon,
  LayoutCarIcon,
} from '@ioyandasoz/io_ui_lib';

import type { IconName } from './types';

/**
 * Маппинг ключей на компоненты иконок из io_ui_lib.
 *
 * Для иконок из библиотеки — ссылка на компонент.
 * Для кастомных иконок (которых нет в библиотеке) — null,
 * они рендерятся через inline SVG в компоненте AppIcon.
 */
export const ICON_COMPONENTS: Record<IconName, Component | null> = {
  // --- Навигация ---
  'chevron-left': ChevronIcon,
  'chevron-right': ChevronIcon,
  'chevron-down': ChevronIcon,
  'chevron-up': ChevronIcon,
  'arrow-left': null,
  'arrow-right': null,
  back: BackIcon,
  expand: ExpandIcon,
  'external-link': ExternalLinkIcon,
  menu: MenuIcon,
  'menu-down': MenuDownIcon,
  home: HomeIcon,

  // --- Действия ---
  x: null,
  'x-circle': XCircleIcon,
  plus: PlusIcon,
  'plus-circle': PlusCircleIcon,
  minus: MinusIcon,
  'minus-circle': MinusCircleIcon,
  check: CheckMarkIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  save: SaveIcon,
  download: DownloadCloudIcon,
  export: ExportIcon,
  refresh: RefreshIcon,
  copy: null,
  link: LinkIcon,
  flip: FlipIcon,
  rotate: RotateIcon,
  drag: DragIcon,
  subtract: SubtractIcon,

  // --- Фильтры ---
  // Рисуем сами: иконка из библиотеки — три прямые линии, читается как
  // «меню», а не «фильтры», и выглядит грубо на мелком кегле.
  filter: null,
  'filter-edit': FilterEditIcon,
  'filter-lines': FilterLinesIcon,
  'filter-plus': FilterPlusIcon,
  'filter-remove': FilterRemoveIcon,
  'filter-table': FilterTableIcon,
  'menu-filter': MenuFilterIcon,

  // --- Уведомления и статусы ---
  bell: BellIcon,
  'status-alert': StatusAlertIcon,
  'status-check': StatusCheckIcon,
  help: HelpIcon,
  info: null,
  lightning: LightningIcon,

  // --- Медиа ---
  'add-photo': AddPhotoIcon,
  'add-notes': AddNotesIcon,

  // --- Объекты ---
  car: LayoutCarIcon,
  taxi: TaxiIcon,
  plane: PlaneIcon,
  geo: GeoIcon,
  'add-location': AddLocation,
  'map-pin': null,
  building: null,
  tag: null,
  settings: SettingsIcon,
  phone: PhoneIcon,
  mail: MailIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  bookmark: BookmarkIcon,
  circle: CircleIcon,
  gift: GiftIcon,
  globe: null,
  graph: GraphIcon,
  inbox: InboxIcon,
  list: ListIcon,
  moon: MoonIcon,
  sun: SunIcon,
  report: ReportIcon,
  'person-edit': PersonEditIcon,
  sigma: SigmaIcon,
  spinner: SpinnerSvg,
  sql: SqlIcon,
  'square-edit': SquareEditOutlineIcon,
  count: CountIcon,
  eye: null,
  'eye-off': CrossedOutEyeIcon,
  shield: null,
  search: null,
  heart: null,
  star: null,
  user: null,
  share: null,
  'log-in': null,
  'log-out': null,
  fuel: null,
  gauge: null,
  maximize: null,
  taxipark: null,
};

/**
 * Кастомные SVG-иконки, которых нет в io_ui_lib.
 *
 * Все в viewBox 0 0 24 24, stroke-based.
 */
export const CUSTOM_ICON_PATHS: Partial<Record<IconName, string>> = {
  x: '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />',
  'arrow-left': '<line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />',
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />',

  // Ползунки, а не гамбургер: сразу читается как «настроить выдачу»
  filter:
    '<path d="M4 7h7" /><path d="M16 7h4" /><circle cx="13.5" cy="7" r="2.2" /><path d="M4 17h4" /><path d="M13 17h7" /><circle cx="10.5" cy="17" r="2.2" />',

  // Каплевидная булавка со скруглённой посадкой — мягче стандартной «пирамидки»
  'map-pin':
    '<path d="M12 21.5c4.2-4.4 6.3-7.8 6.3-10.6a6.3 6.3 0 1 0-12.6 0c0 2.8 2.1 6.2 6.3 10.6z" /><circle cx="12" cy="10.6" r="2.4" />',
  building:
    '<path d="M1 11V21H6V15H10V21H15V11L8 6L1 11Z" /><path d="M10 3V4.97L17 9.97V11H19V13H17V15H19V17H17V21H23V3H10ZM19 9H17V7H19V9Z" />',
  tag: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" />',
  maximize:
    '<polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />',

  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />',
  info: '<circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />',
  globe:
    '<circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />',

  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />',
  search: '<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />',
  heart:
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />',
  share:
    '<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />',
  'log-in':
    '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />',
  'log-out':
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />',
  fuel: '<path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" /><path d="M3 22h10" /><path d="M13 11h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 6" /><path d="M6 8h4" /><path d="M6 12h4" />',
  gauge:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /><path d="M12 6v2" /><path d="M16.24 7.76l-1.42 1.42" /><path d="M18 12h-2" /><path d="M12 18v-2" /><path d="M7.76 16.24l1.42-1.42" /><path d="M6 12h2" /><path d="M7.76 7.76l4.95 4.95" />',
  taxipark:
    '<g transform="translate(2, 3)"><path d="M0 18V0H10V4H20V18H0ZM2 16H8V14H2V16ZM2 12H8V10H2V12ZM2 8H8V6H2V8ZM2 4H8V2H2V4ZM10 16H18V6H10V16ZM12 10V8H16V10H12ZM12 14V12H16V14H12Z" /></g>',
};

/**
 * Иконки, использующие fill вместо stroke.
 * Все остальные кастомные иконки рендерятся как stroke-based.
 */
export const FILL_BASED_ICONS: Set<IconName> = new Set(['building', 'taxipark']);
