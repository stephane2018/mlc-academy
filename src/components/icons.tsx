/**
 * Set d'icônes MLC Academy — Hugeicons (style stroke custom).
 * Wrapper « drop-in » : chaque export reprend le nom lucide utilisé dans l'app,
 * donc seul le chemin d'import change dans les écrans.
 *
 * Usage : <Trophy className="size-5 text-amber" />  (strokeWidth custom par défaut)
 */
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps, ReactElement } from 'react'
import {
  Activity01Icon,
  Alert02Icon,
  ArrowDownRight01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  ArrowReloadHorizontalIcon,
  Award01Icon,
  Notification03Icon,
  BellRingIcon,
  BoxesIcon,
  Calendar03Icon,
  Tick02Icon,
  CheckmarkCircle02Icon,
  CheckmarkSquare01Icon,
  HelpCircleIcon,
  Clock01Icon,
  Coffee02Icon,
  Copy01Icon,
  Crown02Icon,
  EuroCircleIcon,
  ViewOffSlashIcon,
  FilterIcon,
  FileDownloadIcon,
  Note01Icon,
  Fire02Icon,
  GameController01Icon,
  Mortarboard01Icon,
  FavouriteIcon,
  Home01Icon,
  InboxIcon,
  DashboardSquare01Icon,
  GridViewIcon,
  LibraryIcon,
  Link01Icon,
  LockIcon,
  Logout01Icon,
  Menu01Icon,
  Message01Icon,
  MinusSignIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PercentCircleIcon,
  PlayIcon,
  PlusSignIcon,
  Radio01Icon,
  Search01Icon,
  Sent02Icon,
  Settings01Icon,
  Shield01Icon,
  SecurityCheckIcon,
  SmileIcon,
  SparklesIcon,
  Target01Icon,
  Delete02Icon,
  TradeDownIcon,
  TradeUpIcon,
  ChampionIcon,
  User02Icon,
  UserAdd01Icon,
  UserGroupIcon,
  Video01Icon,
  Cancel01Icon,
  FlashIcon,
  BookOpen01Icon,
  Download01Icon,
  PauseIcon,
  Pdf01Icon,
  Maximize01Icon,
  VolumeHighIcon,
  PlayCircleIcon,
  Bookmark01Icon,
  ChevronLeftIcon,
  Dumbbell01Icon,
  Quiz01Icon,
  CreditCardIcon,
  BankIcon,
  Mic01Icon,
  MicOff01Icon,
  Camera01Icon,
  CameraOff01Icon,
  WavingHand01Icon,
  Share08Icon,
  EyeIcon,
  ListViewIcon,
  CloudUploadIcon,
  File01Icon,
  Loading03Icon,
  Sun03Icon,
  Moon02Icon,
  Mail01Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'

type HIProps = ComponentProps<typeof HugeiconsIcon>
export type IconProps = Omit<HIProps, 'icon'>

/** Type d'un composant icône (compatible avec les usages `icon: LucideIcon`). */
export type LucideIcon = (props: IconProps) => ReactElement
export type IconComponent = LucideIcon

function make(icon: HIProps['icon']) {
  function Icon(props: IconProps) {
    return <HugeiconsIcon icon={icon} strokeWidth={2} {...props} />
  }
  return Icon
}

export const Activity = make(Activity01Icon)
export const AlertCircle = make(Alert02Icon)
export const ArrowDownRight = make(ArrowDownRight01Icon)
export const ArrowLeft = make(ArrowLeft01Icon)
export const ArrowRight = make(ArrowRight01Icon)
export const ArrowUpRight = make(ArrowUpRight01Icon)
export const Award = make(Award01Icon)
export const Bell = make(Notification03Icon)
export const BellRing = make(BellRingIcon)
export const Boxes = make(BoxesIcon)
export const CalendarDays = make(Calendar03Icon)
export const Check = make(Tick02Icon)
export const CheckCircle2 = make(CheckmarkCircle02Icon)
export const CheckSquare = make(CheckmarkSquare01Icon)
export const ChevronRight = make(ArrowRight01Icon)
export const CircleHelp = make(HelpCircleIcon)
export const Clock = make(Clock01Icon)
export const Coffee = make(Coffee02Icon)
export const Copy = make(Copy01Icon)
export const Crown = make(Crown02Icon)
export const Euro = make(EuroCircleIcon)
export const EyeOff = make(ViewOffSlashIcon)
export const Filter = make(FilterIcon)
export const FileDown = make(FileDownloadIcon)
export const FileText = make(Note01Icon)
export const Flame = make(Fire02Icon)
export const Gamepad2 = make(GameController01Icon)
export const GraduationCap = make(Mortarboard01Icon)
export const Heart = make(FavouriteIcon)
export const Home = make(Home01Icon)
export const Inbox = make(InboxIcon)
export const LayoutDashboard = make(DashboardSquare01Icon)
export const LayoutGrid = make(GridViewIcon)
export const Library = make(LibraryIcon)
export const Link2 = make(Link01Icon)
export const Lock = make(LockIcon)
export const LogOut = make(Logout01Icon)
export const Menu = make(Menu01Icon)
export const MessageSquare = make(Message01Icon)
export const Minus = make(MinusSignIcon)
export const MoreHorizontal = make(MoreHorizontalIcon)
export const Pencil = make(PencilEdit01Icon)
export const Percent = make(PercentCircleIcon)
export const Play = make(PlayIcon)
export const Plus = make(PlusSignIcon)
export const Radio = make(Radio01Icon)
export const RotateCcw = make(ArrowReloadHorizontalIcon)
export const Search = make(Search01Icon)
export const Send = make(Sent02Icon)
export const Settings = make(Settings01Icon)
export const Shield = make(Shield01Icon)
export const ShieldCheck = make(SecurityCheckIcon)
export const Smile = make(SmileIcon)
export const Sparkles = make(SparklesIcon)
export const Target = make(Target01Icon)
export const Trash2 = make(Delete02Icon)
export const TrendingDown = make(TradeDownIcon)
export const TrendingUp = make(TradeUpIcon)
export const Trophy = make(ChampionIcon)
export const User = make(User02Icon)
export const UserPlus = make(UserAdd01Icon)
export const Users = make(UserGroupIcon)
export const Video = make(Video01Icon)
export const X = make(Cancel01Icon)
export const Zap = make(FlashIcon)
export const BookOpen = make(BookOpen01Icon)
export const Download = make(Download01Icon)
export const Pause = make(PauseIcon)
export const FilePdf = make(Pdf01Icon)
export const Maximize = make(Maximize01Icon)
export const Volume2 = make(VolumeHighIcon)
export const PlayCircle = make(PlayCircleIcon)
export const Bookmark = make(Bookmark01Icon)
export const ChevronLeft = make(ChevronLeftIcon)
export const Dumbbell = make(Dumbbell01Icon)
export const Quiz = make(Quiz01Icon)
export const CreditCard = make(CreditCardIcon)
export const Bank = make(BankIcon)
export const Mic = make(Mic01Icon)
export const MicOff = make(MicOff01Icon)
export const Camera = make(Camera01Icon)
export const CameraOff = make(CameraOff01Icon)
export const Hand = make(WavingHand01Icon)
export const ScreenShare = make(Share08Icon)
export const Eye = make(EyeIcon)
export const ListView = make(ListViewIcon)
export const CloudUpload = make(CloudUploadIcon)
export const FileIcon = make(File01Icon)
export const Loader = make(Loading03Icon)
export const Sun = make(Sun03Icon)
export const Moon = make(Moon02Icon)
export const Mail = make(Mail01Icon)
export const Smartphone = make(SmartPhone01Icon)
