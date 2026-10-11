import * as L from 'lucide-react';
import type { CSSProperties } from 'react';

/**
 * Central icon set. Flows reference icons by NAME only, so swapping the whole set
 * (e.g. for exported noon SVGs) is a one-file change. Add a key → any lucide icon
 * (https://lucide.dev/icons) or your own SVG component.
 */
export const icons = {
  back: L.ChevronLeft,
  arrowLeft: L.ArrowLeft,
  chevronRight: L.ChevronRight,
  chevronDown: L.ChevronDown,
  chevronUp: L.ChevronUp,
  search: L.Search,
  camera: L.Camera,
  mic: L.Mic,
  heart: L.Heart,
  share: L.Share,
  cart: L.ShoppingCart,
  home: L.House,
  categories: L.LayoutGrid,
  account: L.User,
  deals: L.BadgePercent,
  plus: L.Plus,
  minus: L.Minus,
  trash: L.Trash2,
  star: L.Star,
  close: L.X,
  filter: L.SlidersHorizontal,
  sort: L.ArrowUpDown,
  pin: L.MapPin,
  truck: L.Truck,
  package: L.Package,
  packageCheck: L.PackageCheck,
  packageOpen: L.PackageOpen,
  returns: L.RotateCcw,
  card: L.CreditCard,
  gift: L.Gift,
  bell: L.Bell,
  settings: L.Settings,
  shield: L.ShieldCheck,
  logout: L.LogOut,
  globe: L.Globe,
  language: L.Languages,
  check: L.Check,
  checkCircle: L.CircleCheck,
  info: L.Info,
  tag: L.Tag,
  percent: L.Percent,
  clock: L.Clock,
  wallet: L.Wallet,
  edit: L.Pencil,
  copy: L.Copy,
  upload: L.Upload,
  arrowUp: L.ArrowUp,
  store: L.Store,
  zap: L.Zap,
  lock: L.Lock,
  chat: L.MessageCircle,
  help: L.CircleHelp,
  sparkles: L.Sparkles,
  imagePlus: L.ImagePlus,
  flame: L.Flame,
  receipt: L.Receipt,
  file: L.FileText,
  more: L.Ellipsis,
  calendar: L.Calendar,
  phone: L.Phone,
  alert: L.CircleAlert,
  bookmark: L.Bookmark,
  scan: L.ScanLine,
  crown: L.Crown,
  building: L.Building2,
  box: L.Box,
} as const;

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
  style?: CSSProperties;
  /** mirror in RTL (arrows / chevrons) */
  flipRtl?: boolean;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, fill = 'none', className, style, flipRtl }: IconProps) {
  const Cmp = icons[name];
  return (
    <Cmp
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      className={[flipRtl ? 'nk-flip-rtl' : '', className].filter(Boolean).join(' ') || undefined}
      style={{ flexShrink: 0, ...style }}
      aria-hidden
    />
  );
}
