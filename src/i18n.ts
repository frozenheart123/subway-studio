import { useCallback } from 'react'
import { create } from 'zustand'
import type { Ingredient, Preset, Step } from './data/catalog'
import type { Tone } from './lib/nutrition'

export type Lang = 'zh' | 'en'

const zh = {
  'nav.build': '自由搭配', 'nav.inspo': '灵感菜单', 'nav.gallery': '大家的搭配', 'nav.cart': '购物车',
  'studio.tag': 'The Sandwich Studio', 'studio.sub': '你的专属三明治工坊',
  'cloud.online': 'Supabase 已连接', 'cloud.checking': '连接中…', 'cloud.offline': '本地模式',
  'cloud.online.tip': '搭配与订单会同步到 Supabase', 'cloud.offline.tip': '数据只保存在本机',
  'sound.on': '关闭音效', 'sound.off': '开启音效', 'theme.toLight': '切换到浅色', 'theme.toDark': '切换到深色', 'lang.switch': 'EN',
  'hero.eyebrow': 'Freshly made. Uniquely you.', 'hero.h1a': '好味道，', 'hero.h1b': '由你搭。',
  'hero.copy': '选你所爱，层层加满。每加一层，卡路里立刻算给你看；想要双份酱、三份生菜，也都由你说了算。搭好一份加入购物车，再搭下一份，最后一起付款。',
  'hero.live': '当前搭配',
  'marquee': 'FRESHLY MADE|每一层都算数|UNIQUELY YOU|卡路里实时可见|MAKE IT YOURS|同一款酱加两次也行|ADD TO CART|搭完一份再来一份',
  'builder.eyebrow': 'Build your sub · 四步搭好', 'builder.title': '自由搭配工作台', 'reset': '重新搭配', 'toast.reset': '已清空，重新开始搭配',
  'pantry.included': '已含', 'pantry.fresh': '为你新鲜准备', 'pantry.next': '选好了，下一步', 'pantry.finish': '合上面包，去打包',
  'qty.1': '单份', 'qty.2': '双份', 'qty.n': '{n} 份', 'pantry.max': '{name} 最多 {n} 份啦',
  'stage.station': 'Your fresh station', 'view.2d': '俯视', 'view.3d': '3D 工作台', 'undo': '撤销', 'drop': '放到这里，加点好料',
  'layers.bread': '面包已就位', 'layers.n': '{n} 层好料', 'hint.2d': '点击食材，或拖到面包上', 'hint.3d': '拖动旋转 · 自动展示',
  'size.inch': '{n} 英寸', 'toastit': '烤一烤', 'lid.open': '打开面包', 'lid.close': '合上面包', 'stage.max': '这一款已经加到上限啦',
  'cal.title': 'Calories · 实时卡路里', 'cal.meal': '{tone}的一餐', 'cal.daily': '约占每日 {n} kcal 的 {pct}%', 'macro.protein': '蛋白质', 'macro.carbs': '碳水', 'macro.fat': '脂肪', 'sodium': '钠', 'cal.note': '营养数据为估算示例',
  'receipt.sub': '每一层，都是你的选择', 'receipt.order': 'Fresh order', 'receipt.toasted': '烤制', 'receipt.empty': '还没有加料，去左边挑点好吃的。', 'receipt.total': '搭配合计', 'receipt.made': 'Made fresh. Made by you.',
  'receipt.pack': '打包我的 SUB', 'receipt.surprise': '没灵感？来份惊喜搭配', 'receipt.demo': '创意互动展示 · 示例价格 · 示例支付', 'toast.surprise': '来了一份惊喜搭配，看看喜不喜欢',
  'gallery.eyebrow.online': 'Community subs · Live from Supabase', 'gallery.eyebrow.offline': 'Community subs · 保存在本机', 'gallery.title': '大家的搭配', 'gallery.copy': '打包后分享出来，别人可以点赞，也可以一键搭一份一样的。',
  'order.new': '最新', 'order.top': '最受欢迎', 'refresh': '刷新', 'gallery.empty': '还没有人分享搭配。打包你的第一份 SUB，成为第一个吧。', 'gallery.make': '搭一样的',
  'gallery.liked': '你已经点过赞啦', 'gallery.likeFail': '点赞没发出去，稍后再试', 'gallery.copied': '已经把「{name}」搭到你的工作台',
  'time.now': '刚刚', 'time.min': '{n} 分钟前', 'time.hour': '{n} 小时前', 'time.day': '{n} 天前',
  'pack.eyebrow': 'Freshly wrapped, just for you', 'pack.title': '你的好滋味，打包好了。', 'pack.name': '给这份搭配取个名字', 'pack.author': '署名（可选）', 'pack.author.ph': '匿名主厨', 'pack.defaultName': '今天的好心情',
  'pack.addCart': '加入购物车', 'pack.added': '已加入购物车', 'pack.share': '分享到大家的搭配', 'pack.shareLocal': '保存到本机图库', 'pack.shared': '已分享到大家的搭配', 'pack.sharing': '分享中…',
  'pack.download': '下载搭配卡 PNG', 'pack.generating': '生成中…', 'pack.continue': '继续调整搭配 →', 'toast.shared.cloud': '已分享到大家的搭配', 'toast.shared.local': '本地模式：已保存在这台设备', 'toast.card': '搭配卡已保存', 'toast.added': '「{name}」已加入购物车，可以继续搭下一份',
  'inspo.eyebrow': 'A little inspiration', 'inspo.title': '今天，想来点什么？', 'inspo.copy': '从一份灵感开始，再改成你的风格。', 'toast.preset': '已为你搭好「{name}」',
  'cart.title': '购物车', 'cart.sub': '搭好的 SUB 都在这里，可以继续加', 'cart.empty': '购物车还是空的', 'cart.emptyCopy': '去工作台搭一份，打包后加入购物车。', 'cart.continue': '继续搭配', 'cart.subtotal': '小计', 'cart.kcal': '总热量', 'cart.items': '{n} 份', 'cart.checkout': '去付款', 'cart.remove': '移除',
  'checkout.title': '确认订单', 'checkout.back': '返回购物车', 'checkout.name': '取餐人', 'checkout.name.ph': '你的名字', 'checkout.phone': '手机号（可选）', 'checkout.pickup': '取餐方式', 'pickup.asap': '立即取餐', 'pickup.later': '30 分钟后', 'checkout.pay': '模拟支付 ¥{n}', 'checkout.paying': '支付中…', 'checkout.note': '示例支付，不会真的扣款。', 'checkout.nameRequired': '先填一下取餐人',
  'done.title': '支付成功！', 'done.copy': '你的 SUB 正在新鲜制作，取餐时报订单号就好。', 'done.orderNo': '订单号', 'done.total': '实付', 'done.kcal': '总热量', 'done.close': '完成', 'done.cloud': '订单已同步到 Supabase', 'done.local': '本地模式：订单保存在本机',
  'footer.copy': '一份面包，无数种可能。营养数据为估算示例。', 'footer.tag': 'Independent concept experience',
  'tone.light': '轻盈', 'tone.balanced': '均衡', 'tone.hearty': '满足', 'tone.feast': '豪华', 'tone.monster': '巨无霸',
  'tone.light.note': '轻松一餐，没有负担。', 'tone.balanced.note': '刚刚好的一份午餐。', 'tone.hearty.note': '吃饱吃好，下午有劲。', 'tone.feast.note': '放纵一下，也很值得。', 'tone.monster.note': '勇士的选择，分享更快乐。',
}

const en: Record<keyof typeof zh, string> = {
  'nav.build': 'Build', 'nav.inspo': 'Inspiration', 'nav.gallery': 'Community', 'nav.cart': 'Cart',
  'studio.tag': 'The Sandwich Studio', 'studio.sub': 'Your own sandwich workshop',
  'cloud.online': 'Supabase connected', 'cloud.checking': 'Connecting…', 'cloud.offline': 'Local mode',
  'cloud.online.tip': 'Creations and orders sync to Supabase', 'cloud.offline.tip': 'Data stays on this device',
  'sound.on': 'Mute sounds', 'sound.off': 'Enable sounds', 'theme.toLight': 'Switch to light', 'theme.toDark': 'Switch to dark', 'lang.switch': '中文',
  'hero.eyebrow': 'Freshly made. Uniquely you.', 'hero.h1a': 'Good taste,', 'hero.h1b': 'your way.',
  'hero.copy': 'Pick what you love and stack it high. Every layer updates the calories instantly; double sauce or triple lettuce is your call. Add a finished sub to the cart, build another, and pay once.',
  'hero.live': 'Current build',
  'marquee': 'FRESHLY MADE|EVERY LAYER COUNTS|UNIQUELY YOU|LIVE CALORIES|MAKE IT YOURS|DOUBLE SAUCE WELCOME|ADD TO CART|BUILD ANOTHER',
  'builder.eyebrow': 'Build your sub · Four steps', 'builder.title': 'The Workbench', 'reset': 'Start over', 'toast.reset': 'Cleared. Start a fresh sub.',
  'pantry.included': 'Included', 'pantry.fresh': 'Made fresh for you', 'pantry.next': 'Next step', 'pantry.finish': 'Close it & pack',
  'qty.1': 'Single', 'qty.2': 'Double', 'qty.n': '×{n}', 'pantry.max': '{name} is capped at {n}',
  'stage.station': 'Your fresh station', 'view.2d': 'Top view', 'view.3d': '3D bench', 'undo': 'Undo', 'drop': 'Drop it here',
  'layers.bread': 'Bread ready', 'layers.n': '{n} layers', 'hint.2d': 'Click an ingredient or drag it onto the bread', 'hint.3d': 'Drag to rotate · auto showcase',
  'size.inch': '{n} inch', 'toastit': 'Toast it', 'lid.open': 'Open lid', 'lid.close': 'Close lid', 'stage.max': 'That one is at its limit',
  'cal.title': 'Calories · Live', 'cal.meal': 'A {tone} meal', 'cal.daily': '{pct}% of a {n} kcal day', 'macro.protein': 'Protein', 'macro.carbs': 'Carbs', 'macro.fat': 'Fat', 'sodium': 'Sodium', 'cal.note': 'Nutrition values are estimates',
  'receipt.sub': 'Every layer is your call', 'receipt.order': 'Fresh order', 'receipt.toasted': 'toasted', 'receipt.empty': 'Nothing added yet. Pick something tasty on the left.', 'receipt.total': 'Total', 'receipt.made': 'Made fresh. Made by you.',
  'receipt.pack': 'Pack my sub', 'receipt.surprise': 'No ideas? Surprise me', 'receipt.demo': 'Concept demo · sample prices · demo payment', 'toast.surprise': 'Here is a surprise build. Like it?',
  'gallery.eyebrow.online': 'Community subs · Live from Supabase', 'gallery.eyebrow.offline': 'Community subs · Saved on this device', 'gallery.title': 'Community subs', 'gallery.copy': 'Share after packing. Others can like it or build the same one in a click.',
  'order.new': 'Newest', 'order.top': 'Most liked', 'refresh': 'Refresh', 'gallery.empty': 'Nobody has shared yet. Pack your first sub and be the first.', 'gallery.make': 'Make this',
  'gallery.liked': 'You already liked this', 'gallery.likeFail': 'Like did not go through, try again', 'gallery.copied': '"{name}" is now on your bench',
  'time.now': 'just now', 'time.min': '{n} min ago', 'time.hour': '{n} h ago', 'time.day': '{n} d ago',
  'pack.eyebrow': 'Freshly wrapped, just for you', 'pack.title': 'Your sub is wrapped.', 'pack.name': 'Name this build', 'pack.author': 'Signed by (optional)', 'pack.author.ph': 'Anonymous chef', 'pack.defaultName': 'Good mood today',
  'pack.addCart': 'Add to cart', 'pack.added': 'Added to cart', 'pack.share': 'Share to community', 'pack.shareLocal': 'Save to local gallery', 'pack.shared': 'Shared to community', 'pack.sharing': 'Sharing…',
  'pack.download': 'Download card PNG', 'pack.generating': 'Rendering…', 'pack.continue': 'Keep editing →', 'toast.shared.cloud': 'Shared to the community', 'toast.shared.local': 'Local mode: saved on this device', 'toast.card': 'Card saved', 'toast.added': '"{name}" added to cart. Build the next one!',
  'inspo.eyebrow': 'A little inspiration', 'inspo.title': 'What are you craving today?', 'inspo.copy': 'Start from an idea, then make it yours.', 'toast.preset': '"{name}" is ready on your bench',
  'cart.title': 'Your cart', 'cart.sub': 'Finished subs live here. Keep adding.', 'cart.empty': 'Your cart is empty', 'cart.emptyCopy': 'Build a sub on the bench, pack it, and add it here.', 'cart.continue': 'Keep building', 'cart.subtotal': 'Subtotal', 'cart.kcal': 'Total calories', 'cart.items': '{n} items', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove',
  'checkout.title': 'Confirm order', 'checkout.back': 'Back to cart', 'checkout.name': 'Pickup name', 'checkout.name.ph': 'Your name', 'checkout.phone': 'Phone (optional)', 'checkout.pickup': 'Pickup', 'pickup.asap': 'ASAP', 'pickup.later': 'In 30 min', 'checkout.pay': 'Pay ¥{n} (demo)', 'checkout.paying': 'Processing…', 'checkout.note': 'Demo payment. Nothing is charged.', 'checkout.nameRequired': 'Add a pickup name first',
  'done.title': 'Paid!', 'done.copy': 'Your subs are being made fresh. Quote the order number at pickup.', 'done.orderNo': 'Order no.', 'done.total': 'Paid', 'done.kcal': 'Total calories', 'done.close': 'Done', 'done.cloud': 'Order synced to Supabase', 'done.local': 'Local mode: order saved on this device',
  'footer.copy': 'One bread, endless possibilities. Nutrition values are estimates.', 'footer.tag': 'Independent concept experience',
  'tone.light': 'Light', 'tone.balanced': 'Balanced', 'tone.hearty': 'Hearty', 'tone.feast': 'Feast', 'tone.monster': 'Monster',
  'tone.light.note': 'An easy meal, no regrets.', 'tone.balanced.note': 'Just right for lunch.', 'tone.hearty.note': 'Full and fueled for the afternoon.', 'tone.feast.note': 'A little indulgence, well worth it.', 'tone.monster.note': 'A warrior’s pick. Better shared.',
}

export type Key = keyof typeof zh
const dict: Record<Lang, Record<Key, string>> = { zh, en }

const KEY = 'subway-studio:lang'
const initial = (): Lang => {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch { /* ignore */ }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

interface LangState { lang: Lang; setLang: (l: Lang) => void; toggle: () => void }
export const useLang = create<LangState>((set, get) => ({
  lang: initial(),
  setLang: (lang) => {
    set({ lang })
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  },
  toggle: () => get().setLang(get().lang === 'zh' ? 'en' : 'zh'),
}))

export function format(s: string, vars?: Record<string, string | number>) {
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s
}

export function useT() {
  const lang = useLang((s) => s.lang)
  return useCallback((key: Key, vars?: Record<string, string | number>) => format(dict[lang][key] ?? key, vars), [lang])
}

export function useName() {
  const lang = useLang((s) => s.lang)
  return useCallback((ing: Pick<Ingredient, 'nameZh' | 'nameEn'>) => (lang === 'zh' ? ing.nameZh : ing.nameEn), [lang])
}

export function useStepText() {
  const lang = useLang((s) => s.lang)
  return useCallback((s: Step) => (lang === 'zh'
    ? { title: s.title, headline: s.headline, description: s.description, hint: s.hint }
    : { title: s.titleEn, headline: s.headlineEn, description: s.descriptionEn, hint: s.hintEn }), [lang])
}

export function usePresetText() {
  const lang = useLang((s) => s.lang)
  return useCallback((p: Preset) => (lang === 'zh' ? { name: p.name, description: p.description } : { name: p.en, description: p.descriptionEn }), [lang])
}

export function useToneText() {
  const t = useT()
  return useCallback((tone: Tone) => ({ label: t(`tone.${tone.key}` as Key), note: t(`tone.${tone.key}.note` as Key) }), [t])
}

export function useBlurb() {
  const lang = useLang((s) => s.lang)
  return useCallback((ing: Ingredient) => (lang === 'zh' ? ing.blurb : ing.blurbEn), [lang])
}
