export type Group = 'bread' | 'protein' | 'veggie' | 'sauce'
export type AtlasName = 'bread' | 'fillings'

export interface Ingredient {
  id: string
  group: Group
  nameZh: string
  nameEn: string
  blurb: string
  blurbEn: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  sodium: number
  price: number
  maxQty: number
  sort: number
  atlas: AtlasName
  tile: number
  tint?: string
  layerOrder: number
  color: string
  crust?: string
  thickness: number
}

type Seed = Partial<Ingredient> & Pick<Ingredient, 'id' | 'group' | 'nameZh' | 'nameEn' | 'kcal' | 'tile' | 'color'>

const base = (p: Seed): Ingredient => ({
  blurb: '', blurbEn: '',
  protein: 0, carbs: 0, fat: 0, sodium: 0, price: 0,
  maxQty: p.group === 'bread' ? 1 : p.group === 'protein' ? 2 : 3,
  sort: 0,
  atlas: p.group === 'bread' ? 'bread' : 'fillings',
  layerOrder: 5,
  thickness: 0.16,
  ...p,
})

export const CATALOG: Ingredient[] = [
  base({ id: 'italian', group: 'bread', nameZh: '意式白面包', nameEn: 'ITALIAN WHITE', blurb: '松软经典，怎么搭都对。', blurbEn: 'Soft classic that goes with everything.', kcal: 200, protein: 7, carbs: 38, fat: 2, sodium: 360, price: 18, tile: 0, sort: 0, color: '#e9c98f', crust: '#d9a65e', thickness: 0.62 }),
  base({ id: 'wheat', group: 'bread', nameZh: '全麦面包', nameEn: 'WHOLE WHEAT', blurb: '麦香扎实，饱腹更久。', blurbEn: 'Nutty and hearty, keeps you full.', kcal: 210, protein: 8, carbs: 40, fat: 2.5, sodium: 330, price: 18, tile: 1, sort: 1, color: '#c99a5c', crust: '#b47c3e', thickness: 0.62 }),
  base({ id: 'herbs', group: 'bread', nameZh: '香草芝士面包', nameEn: 'HERBS & CHEESE', blurb: '烤芝士边，香气先到。', blurbEn: 'Toasted cheese edges, aroma first.', kcal: 240, protein: 9, carbs: 40, fat: 5, sodium: 470, price: 20, tile: 2, sort: 2, color: '#e5b96a', crust: '#cf9443', thickness: 0.64 }),
  base({ id: 'grain', group: 'bread', nameZh: '多谷物面包', nameEn: 'MULTIGRAIN', blurb: '谷粒点缀，每口有层次。', blurbEn: 'Seeded crust with bite in every mouthful.', kcal: 210, protein: 8, carbs: 39, fat: 2.5, sodium: 350, price: 20, tile: 3, sort: 3, color: '#c4934f', crust: '#a86f35', thickness: 0.62 }),

  base({ id: 'turkey', group: 'protein', nameZh: '烟熏火鸡胸', nameEn: 'SMOKED TURKEY', blurb: '轻盈低脂的经典之选。', blurbEn: 'The light, lean classic.', kcal: 50, protein: 9, carbs: 1, fat: 1, sodium: 480, price: 6, tile: 0, sort: 10, color: '#e8b8a6', layerOrder: 1, thickness: 0.2 }),
  base({ id: 'chicken', group: 'protein', nameZh: '香烤鸡胸', nameEn: 'GRILLED CHICKEN', blurb: '炭烤纹路，高蛋白担当。', blurbEn: 'Char marks and plenty of protein.', kcal: 110, protein: 19, carbs: 2, fat: 3, sodium: 330, price: 8, tile: 1, sort: 11, color: '#d9a060', layerOrder: 1, thickness: 0.22 }),
  base({ id: 'beef', group: 'protein', nameZh: '经典烤牛肉', nameEn: 'ROAST BEEF', blurb: '肉香浓郁，边缘微焦。', blurbEn: 'Rich and beefy with browned edges.', kcal: 70, protein: 12, carbs: 1, fat: 2, sodium: 420, price: 10, tile: 2, sort: 12, color: '#9c5b4d', layerOrder: 1, thickness: 0.2 }),
  base({ id: 'cheese', group: 'protein', nameZh: '切达芝士', nameEn: 'CHEDDAR CHEESE', blurb: '烤一烤，拉丝更香。', blurbEn: 'Toast it for the melt.', kcal: 60, protein: 4, carbs: 0, fat: 5, sodium: 100, price: 3, tile: 3, sort: 13, color: '#f2a93b', layerOrder: 2, thickness: 0.08 }),

  base({ id: 'lettuce', group: 'veggie', nameZh: '脆嫩生菜', nameEn: 'CRISP LETTUCE', blurb: '清脆打底，几乎零负担。', blurbEn: 'Crunchy base, almost zero calories.', kcal: 5, protein: 0, carbs: 1, fat: 0, sodium: 5, tile: 4, sort: 20, color: '#8fd14f', layerOrder: 0, thickness: 0.24 }),
  base({ id: 'tomato', group: 'veggie', nameZh: '鲜切番茄', nameEn: 'RIPE TOMATO', blurb: '多汁酸甜，颜色也好看。', blurbEn: 'Juicy, sweet and bright.', kcal: 10, protein: 0, carbs: 2, fat: 0, sodium: 5, tile: 5, sort: 21, color: '#e8452e', layerOrder: 3, thickness: 0.14 }),
  base({ id: 'cucumber', group: 'veggie', nameZh: '清脆黄瓜', nameEn: 'CUCUMBER', blurb: '一口清爽，解腻担当。', blurbEn: 'Cool and refreshing.', kcal: 3, protein: 0, carbs: 1, fat: 0, sodium: 0, tile: 6, sort: 22, color: '#a9d58a', layerOrder: 4, thickness: 0.12 }),
  base({ id: 'onion', group: 'veggie', nameZh: '紫洋葱', nameEn: 'RED ONION', blurb: '微辛提味，层次瞬间拉满。', blurbEn: 'A little sharpness, a lot of depth.', kcal: 5, protein: 0, carbs: 1, fat: 0, sodium: 0, tile: 7, sort: 23, color: '#b86fb8', layerOrder: 5, thickness: 0.12 }),
  base({ id: 'olive', group: 'veggie', nameZh: '黑橄榄', nameEn: 'BLACK OLIVES', blurb: '咸香小点，地中海风味。', blurbEn: 'Salty Mediterranean bites.', kcal: 15, protein: 0, carbs: 1, fat: 1.5, sodium: 120, tile: 8, sort: 24, color: '#3a2a2a', layerOrder: 7, thickness: 0.12 }),
  base({ id: 'pepper', group: 'veggie', nameZh: '甜青椒', nameEn: 'GREEN PEPPER', blurb: '清甜爽脆，加点绿意。', blurbEn: 'Sweet, crisp and green.', kcal: 3, protein: 0, carbs: 1, fat: 0, sodium: 0, tile: 9, sort: 25, color: '#5fbf3a', layerOrder: 6, thickness: 0.14 }),

  base({ id: 'mayo', group: 'sauce', nameZh: '经典蛋黄酱', nameEn: 'CREAMY MAYO', blurb: '绵密顺滑，经典不出错。', blurbEn: 'Smooth, creamy, never wrong.', kcal: 110, protein: 0, carbs: 0, fat: 12, sodium: 90, tile: 10, sort: 30, color: '#f5ecd3', layerOrder: 8, thickness: 0.05 }),
  base({ id: 'mustard', group: 'sauce', nameZh: '蜂蜜芥末酱', nameEn: 'HONEY MUSTARD', blurb: '甜中带辛，和鸡肉是绝配。', blurbEn: 'Sweet heat, perfect with chicken.', kcal: 30, protein: 0, carbs: 7, fat: 0, sodium: 120, tile: 11, sort: 31, color: '#f0b429', layerOrder: 8, thickness: 0.05 }),
  base({ id: 'bbq', group: 'sauce', nameZh: '烟熏烧烤酱', nameEn: 'SMOKY BBQ', blurb: '烟熏焦糖感，配牛肉更香。', blurbEn: 'Smoky caramel notes, great on beef.', kcal: 35, protein: 0, carbs: 8, fat: 0, sodium: 200, tile: 11, tint: '#5a2410', sort: 32, color: '#7a3416', layerOrder: 8, thickness: 0.05 }),
  base({ id: 'chili', group: 'sauce', nameZh: '甜辣酱', nameEn: 'SWEET CHILI', blurb: '先甜后辣，越吃越上头。', blurbEn: 'Sweet first, then the kick.', kcal: 40, protein: 0, carbs: 10, fat: 0, sodium: 150, tile: 11, tint: '#d8381f', sort: 33, color: '#e04a2a', layerOrder: 8, thickness: 0.05 }),
]

export const byId = (id: string) => CATALOG.find((x) => x.id === id)
export const breads = () => CATALOG.filter((x) => x.group === 'bread')
export const ofGroup = (g: Group) => CATALOG.filter((x) => x.group === g).sort((a, b) => a.sort - b.sort)

export interface Step {
  key: Group; num: string; en: string
  title: string; headline: string; description: string; hint: string
  titleEn: string; headlineEn: string; descriptionEn: string; hintEn: string
}
export const STEPS: Step[] = [
  { key: 'bread', num: '01', en: 'THE FOUNDATION', title: '面包', headline: '先选一款面包', description: '一口好滋味，从现烤的面包开始。', hint: '4 款面包 · 单选', titleEn: 'Bread', headlineEn: 'Pick your bread', descriptionEn: 'Great taste starts with fresh-baked bread.', hintEn: '4 breads · pick one' },
  { key: 'protein', num: '02', en: 'THE GOOD STUFF', title: '主料', headline: '主角，由你决定', description: '香烤、烟熏，加双份也可以。', hint: '可多选 · 每款最多双份', titleEn: 'Protein', headlineEn: 'Choose the star', descriptionEn: 'Grilled, smoked, or doubled up.', hintEn: 'Mix freely · up to double each' },
  { key: 'veggie', num: '03', en: 'A LITTLE FRESHNESS', title: '蔬菜', headline: '来点鲜活的颜色', description: '脆的、甜的、爽口的，喜欢就多加。', hint: '6 款鲜蔬 · 每款最多 3 份', titleEn: 'Veggies', headlineEn: 'Add some color', descriptionEn: 'Crisp, sweet, fresh. Pile on what you love.', hintEn: '6 veggies · up to 3 portions each' },
  { key: 'sauce', num: '04', en: 'THE FINISHING TOUCH', title: '酱料', headline: '最后一抹好滋味', description: '同一款酱想加两次？当然可以。', hint: '每款最多 3 份 · 卡路里实时更新', titleEn: 'Sauce', headlineEn: 'The finishing touch', descriptionEn: 'Want the same sauce twice? Go ahead.', hintEn: 'Up to 3 each · calories update live' },
]

export interface Preset { id: string; name: string; en: string; description: string; descriptionEn: string; bread: string; items: { id: string; qty: number }[]; toasted: boolean; size: 6 | 12 }
export const PRESETS: Preset[] = [
  { id: 'golden', name: '阳光香烤鸡', en: 'THE GOLDEN CHICKEN', description: '香草芝士 / 香烤鸡胸 / 鲜蔬 / 蜂蜜芥末', descriptionEn: 'Herbs & cheese / grilled chicken / veggies / honey mustard', bread: 'herbs', items: [{ id: 'chicken', qty: 1 }, { id: 'cheese', qty: 1 }, { id: 'lettuce', qty: 1 }, { id: 'tomato', qty: 1 }, { id: 'cucumber', qty: 1 }, { id: 'mustard', qty: 1 }], toasted: true, size: 6 },
  { id: 'club', name: '经典火鸡派', en: 'THE TURKEY CLUB', description: '意式白面包 / 火鸡胸 / 切达 / 蛋黄酱', descriptionEn: 'Italian white / turkey / cheddar / mayo', bread: 'italian', items: [{ id: 'turkey', qty: 1 }, { id: 'cheese', qty: 1 }, { id: 'lettuce', qty: 1 }, { id: 'tomato', qty: 1 }, { id: 'onion', qty: 1 }, { id: 'mayo', qty: 1 }], toasted: false, size: 6 },
  { id: 'garden', name: '满满绿意', en: 'THE GARDEN PARTY', description: '多谷物 / 六种鲜蔬 / 切达 / 蜂蜜芥末', descriptionEn: 'Multigrain / six veggies / cheddar / honey mustard', bread: 'grain', items: [{ id: 'cheese', qty: 1 }, { id: 'lettuce', qty: 2 }, { id: 'tomato', qty: 1 }, { id: 'cucumber', qty: 1 }, { id: 'onion', qty: 1 }, { id: 'olive', qty: 1 }, { id: 'pepper', qty: 1 }, { id: 'mustard', qty: 1 }], toasted: false, size: 6 },
  { id: 'smokehouse', name: '烟熏双牛', en: 'THE SMOKEHOUSE', description: '全麦 / 双份烤牛肉 / 洋葱青椒 / 双份烧烤酱', descriptionEn: 'Wheat / double roast beef / onion & pepper / double BBQ', bread: 'wheat', items: [{ id: 'beef', qty: 2 }, { id: 'cheese', qty: 1 }, { id: 'onion', qty: 1 }, { id: 'pepper', qty: 1 }, { id: 'bbq', qty: 2 }], toasted: true, size: 12 },
]
