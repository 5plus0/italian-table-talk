'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const cloudTtsVoiceProfiles = [
  {
    id: 'cloud-nova-calm',
    label: '女声1 平缓清晰',
    description: '语速平稳，发音清楚，适合跟读。',
    voice: 'nova',
    instructions: 'Speak in clear natural English with a steady calm pace. Avoid dramatic intonation and keep pronunciation crisp for language learners.',
    speed: 0.82,
  },
  {
    id: 'cloud-coral-clear',
    label: '女声2 清亮自然',
    description: '更明亮一点，适合听辨短句。',
    voice: 'coral',
    instructions: 'Speak in natural English with a friendly clear female voice. Keep the tone neutral, stable, and useful for restaurant English practice.',
    speed: 0.9,
  },
  {
    id: 'cloud-shimmer-british',
    label: '女声3 英式清晰',
    description: '英式口音，清楚克制。',
    voice: 'shimmer',
    instructions: 'Speak with a clear British English accent. Keep the delivery natural, composed, and easy for learners to repeat.',
    speed: 0.88,
  },
  {
    id: 'cloud-sage-british-calm',
    label: '女声4 英式平缓',
    description: '英式口音，语速更慢。',
    voice: 'sage',
    instructions: 'Speak with a gentle British English accent at a slow steady pace. Prioritize clarity and stable pronunciation.',
    speed: 0.8,
  },
  {
    id: 'browser-female',
    label: '女声5 本机备用',
    description: '使用系统语音，云端不可用时备用。',
    voice: 'browser',
    instructions: '',
    speed: 0.82,
  },
] as const;

type Line = {
  speaker: string;
  english: string;
  chinese: string;
};

type VocabWord = {
  en: string;
  zh: string;
};

type Scene = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  lines: Line[];
  dishes: VocabWord[];
};

type Category = {
  title: string;
  words: VocabWord[];
};

type PlayingTarget = {
  id: string;
  text: string;
};

const scenes: Scene[] = [
  {
    id: 'arrival',
    number: '01',
    title: '进店与入座',
    subtitle: '等位、选座位、问水',
    lines: [
      { speaker: 'You', english: 'Good evening. A table for four, please.', chinese: '晚上好，要一张四人桌。' },
      { speaker: 'Waiter', english: 'Do you have a reservation?', chinese: '您有预订吗？' },
      { speaker: 'You', english: "No, we don't. / Yes, under Wu.", chinese: '没有。/ 有的，姓吴。' },
      { speaker: 'Waiter', english: "There's a 15-minute wait. Is that okay?", chinese: '需要等15分钟，可以吗？' },
      { speaker: 'You', english: "OK, we'll wait. / We'll come back later.", chinese: '好的，我们等。/ 我们待会再来。' },
      { speaker: 'Waiter', english: 'Inside or outside?', chinese: '室内还是室外？' },
      { speaker: 'You', english: 'Inside, please. / Outside, please. / By the window if possible.', chinese: '室内。/ 室外。/ 如果可以的话靠窗。' },
      { speaker: 'Waiter', english: 'Still or sparkling water?', chinese: '普通水还是气泡水？' },
      { speaker: 'You', english: 'Still, please. / Tap water, please.', chinese: '普通水。/ 免费自来水。' },
    ],
    dishes: [
      { en: 'reservation', zh: '预订' },
      { en: 'table for four', zh: '四人桌' },
      { en: 'still water', zh: '普通水' },
      { en: 'sparkling water', zh: '气泡水' },
      { en: 'tap water', zh: '自来水' },
    ],
  },
  {
    id: 'thefork-discount',
    number: '02',
    title: '确认 TheFork 预订折扣',
    subtitle: '入座确认、点餐问限制、结账核对和漏折扣处理',
    lines: [
      { speaker: 'You', english: "Good evening, we have a reservation through TheFork. I'd like to confirm the discount included in our booking, please.", chinese: '晚上好，我们通过 TheFork 预订了。我想确认一下预订包含的折扣。' },
      { speaker: 'Host', english: 'Yes, under what name?', chinese: '好的，请问预订人姓名？' },
      { speaker: 'You', english: 'Under [your last name]. Our reservation includes a 20% discount, right?', chinese: '姓［你的姓］。我们的预订包含减免20%（八折）的优惠，对吗？' },
      { speaker: 'Host', english: 'Yes. The discount is for food only. Drinks and the cover charge are not included.', chinese: '是的，折扣只适用于食物，饮品和餐位费不包括。' },
      { speaker: 'You', english: 'Does the discount apply to all food, or are any items excluded?', chinese: '折扣适用于所有餐食吗？有没有不参与优惠的菜品？' },
      { speaker: 'Waiter', english: 'It applies to food from the à la carte menu, except set menus.', chinese: '优惠适用于单点菜单中的餐食，固定套餐除外。' },
      { speaker: 'You', english: 'So we can order à la carte?', chinese: '那么我们可以单点，对吗？' },
      { speaker: 'Waiter', english: 'Yes, of course.', chinese: '当然可以。' },
      { speaker: 'You', english: 'Will the discount be applied automatically to the bill?', chinese: '结账时会自动把折扣算进去吗？' },
      { speaker: 'Waiter', english: 'Please remind us when you ask for the bill.', chinese: '最后要账单时请提醒我们一下。' },
      { speaker: 'You', english: 'Great. Could you please make a note of it for our table?', chinese: '好的，可以帮我们这桌备注一下吗？' },
      { speaker: 'Waiter', english: "Certainly. I'll note it on your table.", chinese: '当然，我会为您这桌备注。' },
      { speaker: 'You', english: 'The bill, please. We have the 20% TheFork discount. Has it already been applied?', chinese: '买单，谢谢。我们有 TheFork 减免20%的优惠，已经算进去了吗？' },
      { speaker: 'Waiter', english: 'Yes. The discount has been applied to the food.', chinese: '是的，折扣已经应用在餐食部分。' },
      { speaker: 'You', english: 'Thank you. Can we pay by card?', chinese: '谢谢。可以刷卡吗？' },
      { speaker: 'Waiter', english: 'Yes, of course.', chinese: '当然可以。' },
      { speaker: 'You', english: "Excuse me, I don't see the TheFork discount on the bill. Our reservation includes the 20% offer. Could you check, please?", chinese: '不好意思，我在账单上没看到 TheFork 折扣。我们的预订包含减免20%的优惠，能帮我检查一下吗？' },
      { speaker: 'Waiter', english: "I'm sorry. Let me check right away.", chinese: '很抱歉，我马上检查。' },
      { speaker: 'Waiter', english: "Yes, you're right. I'll redo the bill.", chinese: '是的，您说得对。我会重新打账单。' },
      { speaker: 'You', english: 'Thank you very much.', chinese: '非常感谢。' },
    ],
    dishes: [
      { en: 'reservation', zh: '预订' },
      { en: 'promotion', zh: '优惠活动' },
      { en: 'discount', zh: '折扣' },
      { en: 'à la carte menu', zh: '单点菜单' },
      { en: 'set menu', zh: '套餐' },
      { en: 'cover charge', zh: '餐位费' },
      { en: 'excluded', zh: '不包含在内的' },
      { en: 'automatically', zh: '自动地' },
      { en: 'apply the discount', zh: '应用折扣' },
      { en: 'pay by card', zh: '刷卡支付' },
      { en: 'redo the bill', zh: '重新打账单' },
    ],
  },
  {
    id: 'recommendations',
    number: '03',
    title: '看菜单与询问推荐',
    subtitle: '问招牌菜、热门菜和今日特供',
    lines: [
      { speaker: 'You', english: "What do you recommend? / What's your specialty?", chinese: '您推荐什么？/ 招牌菜是什么？' },
      { speaker: 'Waiter', english: 'The seafood pasta is very popular. The risotto is also good.', chinese: '海鲜意面很受欢迎。烩饭也不错。' },
      { speaker: 'You', english: 'Do you have any daily specials?', chinese: '有今日特供吗？' },
    ],
    dishes: [
      { en: 'seafood pasta', zh: '海鲜意面' },
      { en: 'risotto', zh: '意式烩饭' },
      { en: 'specialty', zh: '招牌菜' },
      { en: 'daily specials', zh: '今日特供' },
    ],
  },
  {
    id: 'ordering',
    number: '04',
    title: '点餐',
    subtitle: '主菜、配菜、饮品、甜品合并点单',
    lines: [
      { speaker: 'You', english: "I'll have the spaghetti carbonara. And a side salad.", chinese: '我要一份奶油培根意面，再加一份配菜沙拉。' },
      { speaker: 'You', english: "She'll have the lasagna.", chinese: '她要一份千层面。' },
      { speaker: 'You', english: 'A glass of red wine and a Coke, please.', chinese: '一杯红酒和一杯可乐。' },
      { speaker: 'You', english: "We'll order dessert later.", chinese: '我们待会再点甜品。' },
    ],
    dishes: [
      { en: 'spaghetti carbonara', zh: '奶油培根意面' },
      { en: 'side salad', zh: '配菜沙拉' },
      { en: 'lasagna', zh: '千层面' },
      { en: 'red wine', zh: '红酒' },
      { en: 'Coke', zh: '可乐' },
      { en: 'dessert', zh: '甜品' },
    ],
  },
  {
    id: 'portion-size',
    number: '05',
    title: '询问份量与尺寸',
    subtitle: '点餐时顺带确认大小、人数和小份',
    lines: [
      { speaker: 'You', english: 'How big is this pizza? Is it enough for one person?', chinese: '这个披萨多大？够一个人吃吗？' },
      { speaker: 'Waiter', english: "It's about 30 cm, enough for one person.", chinese: '大约30厘米，够一个人。' },
      { speaker: 'You', english: 'Can two people share the pasta?', chinese: '这份意面两个人分享够吗？' },
      { speaker: 'Waiter', english: "It's a regular portion, but we can give you extra plates.", chinese: '是常规份量，但我们可以给您多拿盘子。' },
      { speaker: 'You', english: 'Do you have a smaller size?', chinese: '有小份吗？' },
    ],
    dishes: [
      { en: 'pizza', zh: '披萨' },
      { en: 'pasta', zh: '意面' },
      { en: 'regular portion', zh: '常规份量' },
      { en: 'extra plates', zh: '额外盘子' },
      { en: 'smaller size', zh: '小份' },
    ],
  },
  {
    id: 'taste-texture',
    number: '06',
    title: '口味与口感要求',
    subtitle: '辣咸、油、意面软硬和牛排熟度',
    lines: [
      { speaker: 'You', english: 'Is this dish spicy?', chinese: '这道菜辣吗？' },
      { speaker: 'You', english: 'Is it very salty?', chinese: '会很咸吗？' },
      { speaker: 'You', english: 'Is it oily? Can you make it less oily?', chinese: '会很油吗？可以少油吗？' },
      { speaker: 'You', english: 'Lighter seasoning, please.', chinese: '请调味清淡一点。' },
      { speaker: 'You', english: 'If possible, could you ask the kitchen to go easy on the seasoning?', chinese: '如果可以，能请厨房少放一些调味料吗？' },
      { speaker: 'You', english: 'For the pasta, can you make it a bit softer?', chinese: '意面能煮得软一点？' },
      { speaker: 'You', english: "I'd like it medium-rare, please.", chinese: '我要三分熟。' },
    ],
    dishes: [
      { en: 'spicy', zh: '辣的' },
      { en: 'salty', zh: '咸的' },
      { en: 'oily', zh: '油腻的' },
      { en: 'lighter seasoning', zh: '清淡调味' },
      { en: 'go easy on the seasoning', zh: '少放调味料' },
      { en: 'softer', zh: '更软的' },
      { en: 'medium-rare', zh: '三分熟' },
    ],
  },
  {
    id: 'florentine-steak',
    number: '07',
    title: '在佛罗伦萨点牛排',
    subtitle: '确认重量、够几人分享以及牛排熟度',
    lines: [
      { speaker: 'You', english: "We'd like to try the bistecca alla fiorentina. Is it sold by weight?", chinese: '我们想尝尝佛罗伦萨牛排。它是按重量出售的吗？' },
      { speaker: 'Waiter', english: 'Yes, it is priced by the kilogram.', chinese: '是的，按公斤计价。' },
      { speaker: 'You', english: 'What is the minimum weight?', chinese: '最低重量是多少？' },
      { speaker: 'Waiter', english: 'The smallest one available today is about 1.2 kilograms.', chinese: '今天最小的一块大约是1.2公斤。' },
      { speaker: 'You', english: 'How many people is that enough for?', chinese: '这个份量够几个人吃？' },
      { speaker: 'Waiter', english: 'It is enough for two to three people to share.', chinese: '够两到三个人分享。' },
      { speaker: 'You', english: 'How do you normally cook it?', chinese: '你们通常会做成几分熟？' },
      { speaker: 'Waiter', english: 'Traditionally, it is served rare.', chinese: '传统上会做成偏生的熟度。' },
      { speaker: 'You', english: "Could we have it medium-rare instead? We don't want it too raw in the center.", chinese: '可以改成三到五分熟吗？我们不希望中间太生。' },
      { speaker: 'Waiter', english: "Certainly. I'll ask the kitchen, but the chef may recommend keeping the center pink.", chinese: '可以，我会跟厨房说明，不过主厨可能仍建议保留粉红色的中心。' },
      { speaker: 'You', english: 'Could you show us the steak and tell us the exact weight before cooking it?', chinese: '烹饪前可以给我们看一下牛排，并告诉我们准确重量吗？' },
    ],
    dishes: [
      { en: 'bistecca alla fiorentina', zh: '佛罗伦萨牛排' },
      { en: 'sold by weight', zh: '按重量出售' },
      { en: 'minimum weight', zh: '最低重量' },
      { en: 'per kilogram', zh: '每公斤' },
      { en: 'blue / extra rare', zh: '近生（表面煎封、中心几乎生）' },
      { en: 'rare', zh: '一分熟（中心红色）' },
      { en: 'medium-rare', zh: '三分熟（中心红粉色）' },
      { en: 'medium', zh: '五分熟（中心粉色）' },
      { en: 'medium-well', zh: '七分熟（中心略带粉色）' },
      { en: 'well-done', zh: '全熟' },
    ],
  },
  {
    id: 'sweetness',
    number: '08',
    title: '甜度要求',
    subtitle: '少糖、不额外加糖和确认酸甜',
    lines: [
      { speaker: 'You', english: 'Can you make it less sweet? Not too sweet, please.', chinese: '可以少放糖吗？不要太甜。' },
      { speaker: 'Waiter', english: 'How sweet do you want it? Half sugar or just a little?', chinese: '要多甜？半糖还是只放一点点？' },
      { speaker: 'You', english: 'Just a little sugar, please.', chinese: '只放一点点糖。' },
      { speaker: 'You', english: 'Is the orange juice freshly squeezed? Any added sugar?', chinese: '橙汁是鲜榨的吗？加糖了吗？' },
      { speaker: 'Waiter', english: "It's fresh and unsweetened.", chinese: '鲜榨不加糖。' },
    ],
    dishes: [
      { en: 'less sweet', zh: '少甜' },
      { en: 'half sugar', zh: '半糖' },
      { en: 'a little sugar', zh: '一点点糖' },
      { en: 'orange juice', zh: '橙汁' },
      { en: 'freshly squeezed', zh: '鲜榨的' },
      { en: 'unsweetened', zh: '不加糖的' },
    ],
  },
  {
    id: 'special-requests',
    number: '09',
    title: '特殊要求',
    subtitle: '忌口、替换、酱汁另放',
    lines: [
      { speaker: 'You', english: 'No garlic, no onion, no cheese, please.', chinese: '请不要放大蒜、洋葱、奶酪。' },
      { speaker: 'You', english: 'Can I swap the fries for a salad?', chinese: '能把薯条换成沙拉吗？' },
      { speaker: 'You', english: 'Can you put the sauce on the side?', chinese: '能把酱汁放在旁边吗？' },
      { speaker: 'You', english: 'Does this contain nuts / eggs / gluten?', chinese: '这个含坚果/鸡蛋/麸质吗？' },
    ],
    dishes: [
      { en: 'garlic', zh: '大蒜' },
      { en: 'onion', zh: '洋葱' },
      { en: 'cheese', zh: '奶酪' },
      { en: 'fries', zh: '薯条' },
      { en: 'sauce on the side', zh: '酱汁另放' },
      { en: 'gluten', zh: '麸质' },
    ],
  },
  {
    id: 'order-confirmation',
    number: '10',
    title: '确认订单',
    subtitle: '服务员复述，自己核对或纠正',
    lines: [
      { speaker: 'Waiter', english: "So that's one carbonara, one lasagna, a side salad, and a Coke. Correct?", chinese: '所以是一份奶油培根意面、一份千层面、一份配菜沙拉和一杯可乐，对吗？' },
      { speaker: 'You', english: "Yes, that's right.", chinese: '对。' },
      { speaker: 'You', english: 'Actually, I wanted the pasta a bit softer, and no cheese on the salad.', chinese: '实际上，我要意面硬一点，沙拉不要奶酪。' },
    ],
    dishes: [
      { en: 'carbonara', zh: '奶油培根意面' },
      { en: 'lasagna', zh: '千层面' },
      { en: 'side salad', zh: '配菜沙拉' },
      { en: 'Coke', zh: '可乐' },
      { en: 'no cheese', zh: '不要奶酪' },
    ],
  },
  {
    id: 'waiting',
    number: '11',
    title: '等待中催单',
    subtitle: '上菜慢、只差一道菜时怎么问',
    lines: [
      { speaker: 'You', english: "Excuse me, we've been waiting for a while. Is our food almost ready?", chinese: '打扰一下，我们已经等了一会儿，我们的餐快好了吗？' },
      { speaker: 'Waiter', english: 'Let me check with the kitchen.', chinese: '我去厨房确认一下。' },
      { speaker: 'You', english: 'Could you check on our main course, please?', chinese: '能帮我看一下我们的主菜吗？' },
    ],
    dishes: [
      { en: 'food', zh: '餐食' },
      { en: 'kitchen', zh: '厨房' },
      { en: 'main course', zh: '主菜' },
    ],
  },
  {
    id: 'utensils-condiments',
    number: '12',
    title: '索要调料、餐具、空盘',
    subtitle: '缺餐具、加调料、分享用盘',
    lines: [
      { speaker: 'You', english: 'Could we have some forks / knives / napkins, please?', chinese: '能给我们一些叉子/刀子/餐巾纸吗？' },
      { speaker: 'You', english: 'Can I have some olive oil / vinegar / chili sauce, please?', chinese: '能给我一些橄榄油/醋/辣椒酱吗？' },
      { speaker: 'You', english: 'Could we have an extra plate to share?', chinese: '能给我们一个空盘子分着吃吗？' },
    ],
    dishes: [
      { en: 'forks', zh: '叉子' },
      { en: 'knives', zh: '刀子' },
      { en: 'napkins', zh: '餐巾纸' },
      { en: 'olive oil', zh: '橄榄油' },
      { en: 'vinegar', zh: '醋' },
      { en: 'chili sauce', zh: '辣椒酱' },
      { en: 'extra plate', zh: '额外盘子' },
    ],
  },
  {
    id: 'counter-ordering',
    number: '13',
    title: '前台点餐',
    subtitle: '柜台下单、说明桌位、索要小票或号码',
    lines: [
      { speaker: 'You', english: "Hi, we'd like to order here. We're sitting at the corner table.", chinese: '你好，我们想在这点餐。我们坐在角落那张桌子。' },
      { speaker: 'Staff', english: 'Sure. What would you like?', chinese: '可以。您想点什么？' },
      { speaker: 'You', english: 'Could you repeat our order? And can we have a receipt / number?', chinese: '能复述一下我们的订单吗？能给我们小票/号码吗？' },
    ],
    dishes: [
      { en: 'corner table', zh: '角落桌位' },
      { en: 'receipt', zh: '小票' },
      { en: 'number', zh: '取餐号码' },
      { en: 'counter', zh: '前台/柜台' },
    ],
  },
  {
    id: 'missing-wrong-order',
    number: '14',
    title: '漏单或上错菜',
    subtitle: '处理漏单、取消订单、确认不会收费',
    lines: [
      { speaker: 'You', english: 'Excuse me, we ordered about 30 minutes ago, but nothing has come. Could you check?', chinese: '打扰一下，我们大约30分钟前点了菜，但什么都没上。能查一下吗？' },
      { speaker: 'Waiter', english: "I'm sorry, I'll check right away.", chinese: '很抱歉，我马上去查。' },
      { speaker: 'Waiter', english: "I'm really sorry, but I don't see your order in our system. It seems it wasn't recorded properly.", chinese: '非常抱歉，我在系统里没看到您的订单。好像没有成功录入。' },
      { speaker: 'You', english: "That's frustrating. If we reorder now, how long will it take?", chinese: '这真让人郁闷。如果现在重新点，要多久？' },
      { speaker: 'Waiter', english: 'The kitchen is busy right now. It would be at least another 30 to 40 minutes.', chinese: '厨房现在很忙，至少还要30到40分钟。' },
      { speaker: 'You', english: "We can't wait that long. Please cancel the order. And could you confirm that we won't be charged for anything?", chinese: '我们等不了那么久。请取消订单。能确认一下我们不会被收取任何费用吗？' },
      { speaker: 'Waiter', english: "Of course. I've cancelled it. You won't be charged. I'm very sorry for the trouble.", chinese: '当然。我已经取消了，您不会被收费。给您带来的不便非常抱歉。' },
      { speaker: 'You', english: "Thank you. We'll just pay for the drinks we already had (if any).", chinese: '谢谢。我们只付已经喝掉的饮品就好（如果有的话）。' },
      { speaker: 'You', english: 'Excuse me, this is not what we ordered. We ordered carbonara, but this is arrabbiata.', chinese: '不好意思，这不是我们点的。我们点的是奶油培根意面，但这是辣番茄意面。' },
      { speaker: 'Waiter', english: "I'm sorry, I'll replace it.", chinese: '很抱歉，我给您换。' },
    ],
    dishes: [
      { en: 'order', zh: '订单' },
      { en: 'system', zh: '系统' },
      { en: 'reorder', zh: '重新下单' },
      { en: 'cancel the order', zh: '取消订单' },
      { en: 'charged', zh: '收费' },
      { en: 'carbonara', zh: '奶油培根意面' },
      { en: 'arrabbiata', zh: '辣番茄意面' },
    ],
  },
  {
    id: 'checkout-payment',
    number: '15',
    title: '结账与支付',
    subtitle: '呼唤服务员、确认支付方式',
    lines: [
      { speaker: 'You', english: 'Check, please. / Could we have the bill?', chinese: '买单。/ 请给我们账单。' },
      { speaker: 'Waiter', english: 'Together or separately?', chinese: '一起付还是分开付？' },
      { speaker: 'You', english: 'Together, please.', chinese: '一起付。' },
      { speaker: 'You', english: 'Do you accept WeChat Pay, Alipay, Mastercard, or cash?', chinese: '你们接受微信支付、支付宝、万事达卡还是现金？' },
      { speaker: 'Waiter', english: 'We accept Mastercard and cash. / We accept all of them. / Cash only.', chinese: '我们接受万事达和现金。/ 我们都接受。/ 只收现金。' },
      { speaker: 'You', english: "I'll pay by Mastercard. / I'll use Alipay. / OK, cash. Here you are.", chinese: '我用万事达卡。/ 我使用支付宝。/ 好的，现金，给你。' },
    ],
    dishes: [
      { en: 'bill', zh: '账单' },
      { en: 'together', zh: '一起付' },
      { en: 'separately', zh: '分开付' },
      { en: 'WeChat Pay', zh: '微信支付' },
      { en: 'Alipay', zh: '支付宝' },
      { en: 'Mastercard', zh: '万事达卡' },
      { en: 'cash', zh: '现金' },
    ],
  },
  {
    id: 'takeaway',
    number: '16',
    title: '打包带走',
    subtitle: '索要打包盒，把剩菜带走',
    lines: [
      { speaker: 'You', english: 'Could I have a box for this? / Can I take this to go?', chinese: '能给我一个盒子装这个吗？/ 我能把这个带走吗？' },
      { speaker: 'Waiter', english: "Sure, I'll bring you a box.", chinese: '好的，我给您拿盒子。' },
      { speaker: 'You', english: 'Thank you.', chinese: '谢谢。' },
    ],
    dishes: [
      { en: 'box', zh: '打包盒' },
      { en: 'to go', zh: '带走' },
      { en: 'leftovers', zh: '剩菜' },
    ],
  },
];

const dishCategories: Category[] = [
  {
    title: 'Pasta 意面',
    words: [
      { en: 'spaghetti carbonara', zh: '奶油培根意面' },
      { en: 'seafood pasta', zh: '海鲜意面' },
      { en: 'arrabbiata', zh: '辣番茄意面' },
      { en: 'bolognese', zh: '肉酱意面' },
      { en: 'pesto pasta', zh: '青酱意面' },
      { en: 'lasagna', zh: '千层面' },
      { en: 'gnocchi', zh: '意式土豆团子' },
      { en: 'ravioli', zh: '意式馄饨/夹心面' },
    ],
  },
  {
    title: 'Pizza 披萨',
    words: [
      { en: 'Margherita pizza', zh: '玛格丽特披萨' },
      { en: 'pepperoni pizza', zh: '辣香肠披萨' },
      { en: 'four cheese pizza', zh: '四奶酪披萨' },
      { en: 'seafood pizza', zh: '海鲜披萨' },
      { en: 'vegetarian pizza', zh: '素食披萨' },
      { en: 'mushroom pizza', zh: '蘑菇披萨' },
    ],
  },
  {
    title: 'Risotto & Mains 烩饭和主菜',
    words: [
      { en: 'risotto', zh: '意式烩饭' },
      { en: 'seafood risotto', zh: '海鲜烩饭' },
      { en: 'mushroom risotto', zh: '蘑菇烩饭' },
      { en: 'steak', zh: '牛排' },
      { en: 'bistecca alla fiorentina', zh: '佛罗伦萨牛排' },
      { en: 'grilled fish', zh: '烤鱼' },
      { en: 'chicken Milanese', zh: '米兰式鸡排' },
    ],
  },
  {
    title: 'Starters & Sides 前菜和配菜',
    words: [
      { en: 'bruschetta', zh: '番茄烤面包' },
      { en: 'caprese salad', zh: '卡布里沙拉' },
      { en: 'side salad', zh: '配菜沙拉' },
      { en: 'fries', zh: '薯条' },
      { en: 'bread basket', zh: '面包篮' },
      { en: 'olive oil', zh: '橄榄油' },
      { en: 'balsamic vinegar', zh: '黑醋' },
    ],
  },
  {
    title: 'Drinks 饮品',
    words: [
      { en: 'still water', zh: '普通水' },
      { en: 'sparkling water', zh: '气泡水' },
      { en: 'tap water', zh: '自来水' },
      { en: 'red wine', zh: '红酒' },
      { en: 'white wine', zh: '白葡萄酒' },
      { en: 'Coke', zh: '可乐' },
      { en: 'orange juice', zh: '橙汁' },
      { en: 'espresso', zh: '意式浓缩咖啡' },
      { en: 'cappuccino', zh: '卡布奇诺' },
    ],
  },
  {
    title: 'Dessert & Gelato 甜品和冰淇淋',
    words: [
      { en: 'tiramisu', zh: '提拉米苏' },
      { en: 'panna cotta', zh: '奶冻' },
      { en: 'cannoli', zh: '奶油甜馅卷' },
      { en: 'gelato', zh: '意式冰淇淋' },
      { en: 'pistachio gelato', zh: '开心果冰淇淋' },
      { en: 'hazelnut gelato', zh: '榛子冰淇淋' },
      { en: 'stracciatella gelato', zh: '巧克力碎片牛奶冰淇淋' },
      { en: 'lemon gelato', zh: '柠檬冰淇淋' },
      { en: 'strawberry gelato', zh: '草莓冰淇淋' },
      { en: 'mango gelato', zh: '芒果冰淇淋' },
      { en: 'chocolate gelato', zh: '巧克力冰淇淋' },
      { en: 'vanilla gelato', zh: '香草冰淇淋' },
    ],
  },
];

const uniqueSceneWords = Array.from(
  new Map(scenes.flatMap((scene) => scene.dishes).map((word) => [word.en.toLowerCase(), word])).values(),
);

function getPattern(text: string) {
  const rules: Array<[RegExp, string]> = [
    [/A table for four/i, 'A table for + [number], please. = 要一张 [人数] 桌。'],
    [/Do you have a reservation/i, 'Do you have + [noun]? = 你有 [某物/预订] 吗？'],
    [/under Wu/i, 'Yes, under + [name]. = 有的，登记在 [姓名] 名下。'],
    [/reservation through TheFork/i, 'I have a reservation through + [platform] under + [name]. = 我通过 [平台] 预订，预订人是 [姓名]。'],
    [/booking includes/i, 'My booking includes + [discount/benefit]. = 我的预订包含 [折扣/权益]。'],
    [/under what name/i, 'Under what name? = 请问预订人姓名？'],
    [/Under \[your last name\]/i, 'Under + [your last name]. = 预订人姓 [你的姓]。'],
    [/food only/i, 'The discount is for + [eligible items] only. = 折扣只适用于 [参与项目]。'],
    [/confirm that it applies/i, 'Could you confirm that + [offer] applies? = 能确认 [优惠] 适用吗？'],
    [/any items excluded/i, 'Does it apply to + [items], or are any items excluded? = 它适用于 [项目] 吗？有没有不包含的？'],
    [/order à la carte/i, 'Can we order + [menu type]? = 我们可以点 [菜单类型] 吗？'],
    [/applied automatically/i, 'Will + [discount] be applied automatically to the bill? = [折扣] 会自动计入账单吗？'],
    [/remind us when/i, 'Please remind us when + [time/action]. = 请在 [时间/动作] 时提醒我们。'],
    [/make a note of it/i, 'Could you make a note of + [request] for our table? = 能为我们这桌备注 [要求] 吗？'],
    [/discount has been applied/i, 'Could you check that + [discount] has been applied to the bill? = 能确认账单已使用 [折扣] 吗？'],
    [/Has it already been applied/i, 'Has + [discount/charge] already been applied? = [折扣/费用] 已经计入了吗？'],
    [/pay by card/i, 'Can we pay by + [payment method]? = 我们可以用 [支付方式] 吗？'],
    [/don't see the TheFork discount/i, "I don't see + [discount/item] on the bill. Could you check? = 我在账单上没看到 [折扣/项目]，能检查一下吗？"],
    [/redo the bill/i, "I'll redo the bill. = 我会重新打账单。"],
    [/15-minute wait/i, "There's a + [time] wait. Is that okay? = 需要等 [时间]，可以吗？"],
    [/Inside or outside/i, '[Option A] or [option B]? = A 还是 B？'],
    [/By the window/i, 'By the + [place] if possible. = 如果可以的话，靠 [位置]。'],
    [/Still or sparkling water/i, '[Still / sparkling / tap] water, please. = 请给我 [水的种类]。'],
    [/What do you recommend/i, 'What do you recommend? = 您推荐什么？'],
    [/specialty/i, "What's your + [noun]? = 你们的 [某类特色] 是什么？"],
    [/daily specials/i, 'Do you have any + [item]? = 有 [某类菜/服务] 吗？'],
    [/I'll have/i, "I'll have + [dish/drink]. = 我要 [菜品/饮品]。"],
    [/She'll have/i, "[He/She]'ll have + [dish]. = 他/她要 [菜品]。"],
    [/A glass of/i, 'A glass of + [drink], please. = 请给我一杯 [饮品]。'],
    [/order dessert later/i, "We'll order + [item] later. = 我们稍后再点 [某物]。"],
    [/How big is this/i, 'How big is this + [item]? = 这个 [物品] 多大？'],
    [/enough for one person/i, 'Is it enough for + [number/person]? = 够 [人数] 吃吗？'],
    [/Can two people share/i, 'Can + [number] people share + [dish]? = [人数] 可以分着吃 [菜品] 吗？'],
    [/regular portion/i, "It's a + [size] portion. = 这是 [尺寸/份量]。"],
    [/smaller size/i, 'Do you have a + [smaller/larger] size? = 有 [更小/更大] 份吗？'],
    [/spicy/i, 'Is this dish + [adjective]? = 这道菜 [口味/口感] 吗？'],
    [/salty/i, 'Is it very + [adjective]? = 它会很 [咸/甜/酸/辣] 吗？'],
    [/less oily/i, 'Can you make it less + [adjective]? = 可以做得少一点 [油/甜/咸] 吗？'],
    [/Lighter seasoning/i, 'Lighter + [seasoning/sauce], please. = 请把 [调味/酱汁] 做清淡一点。'],
    [/go easy on the seasoning/i, 'Could you ask the kitchen to go easy on + [ingredient/seasoning]? = 能请厨房少放 [配料/调味料] 吗？'],
    [/a bit softer/i, 'For the + [dish], can you make it a bit + [texture]? = [菜品] 能做得更 [口感] 一点吗？'],
    [/too raw in the center/i, "Could we have it + [doneness]? We don't want it too + [texture]. = 可以做成 [熟度] 吗？我们不想太 [口感]。"],
    [/medium-rare/i, "I'd like it + [doneness], please. = 我要 [熟度]。"],
    [/sold by weight/i, 'Is + [dish] sold by weight? = [菜品] 是按重量出售的吗？'],
    [/minimum weight/i, 'What is the minimum + [weight/order]? = 最低 [重量/起订量] 是多少？'],
    [/How many people is that enough for/i, 'How many people is + [portion] enough for? = [份量] 够几个人吃？'],
    [/normally cook it/i, 'How do you normally cook + [dish]? = 你们通常怎样烹饪 [菜品]？'],
    [/exact weight before cooking/i, 'Could you show us + [item] and tell us the exact + [measurement]? = 能给我们看 [物品] 并告知准确 [数据] 吗？'],
    [/less sweet/i, 'Can you make it less + [flavor]? = 可以少一点 [甜/酸/辣] 吗？'],
    [/How sweet/i, 'How + [adjective] do you want it? = 你想要多 [甜/辣/酸]？'],
    [/Just a little sugar/i, 'Just a little + [ingredient], please. = 只放一点点 [配料]。'],
    [/Any added sugar/i, 'Any added + [ingredient]? = 有额外加 [配料] 吗？'],
    [/unsweetened/i, "It's + [fresh/unsweetened/etc.]. = 它是 [状态/口味] 的。"],
    [/No garlic/i, 'No + [ingredient], please. = 请不要放 [食材]。'],
    [/swap the fries/i, 'Can I swap + [A] for + [B]? = 能把 A 换成 B 吗？'],
    [/sauce on the side/i, 'Can you put + [item] on the side? = 能把 [某物] 单独放吗？'],
    [/contain nuts/i, 'Does this contain + [allergen/ingredient]? = 这个含 [过敏原/食材] 吗？'],
    [/Correct/i, "So that's + [order list]. Correct? = 所以是 [订单列表]，对吗？"],
    [/that's right/i, "Yes, that's right. = 对，没错。"],
    [/Actually/i, 'Actually, I wanted + [correction]. = 实际上，我想要 [纠正内容]。'],
    [/waiting for a while/i, "We've been waiting for + [time]. = 我们已经等了 [时长]。"],
    [/almost ready/i, 'Is our food almost ready? = 我们的餐快好了吗？'],
    [/check with the kitchen/i, 'Let me check with + [person/place]. = 我去跟 [人/地方] 确认。'],
    [/main course/i, 'Could you check on + [item], please? = 能帮我看一下 [某物] 吗？'],
    [/forks/i, 'Could we have some + [items], please? = 能给我们一些 [物品] 吗？'],
    [/olive oil/i, 'Can I have some + [condiment], please? = 能给我一些 [调料] 吗？'],
    [/extra plate/i, 'Could we have an extra + [item] to share? = 能给我们一个额外的 [物品] 分着用吗？'],
    [/order here/i, "We'd like to order here. = 我们想在这里点餐。"],
    [/corner table/i, "We're sitting at + [place]. = 我们坐在 [位置]。"],
    [/repeat our order/i, 'Could you repeat our order? = 能复述一下我们的订单吗？'],
    [/receipt/i, 'Can we have a + [receipt/number]? = 能给我们 [小票/号码] 吗？'],
    [/30 minutes ago/i, 'We ordered about + [time] ago. = 我们大约 [时间] 前点了菜。'],
    [/nothing has come/i, 'Nothing has come. Could you check? = 什么都没上，能查一下吗？'],
    [/system/i, "I don't see your order in our system. = 我在系统里没看到您的订单。"],
    [/reorder/i, 'If we reorder now, how long will it take? = 如果现在重新点，要多久？'],
    [/cancel the order/i, 'Please cancel + [item/order]. = 请取消 [某物/订单]。'],
    [/charged/i, "Could you confirm that we won't be charged? = 能确认我们不会被收费吗？"],
    [/not what we ordered/i, 'This is not what we ordered. = 这不是我们点的。'],
    [/replace it/i, "I'll replace it. = 我会给您换。"],
    [/bill/i, 'Could we have the bill? = 请给我们账单。'],
    [/Together or separately/i, '[Together] or [separately]? = 一起还是分开？'],
    [/accept WeChat Pay/i, 'Do you accept + [payment methods]? = 你们接受 [支付方式] 吗？'],
    [/pay by Mastercard/i, "I'll pay by + [method]. = 我用 [方式] 支付。"],
    [/use Alipay/i, "I'll use + [payment app/card]. = 我使用 [支付工具/卡]。"],
    [/box for this/i, 'Could I have a + [container] for this? = 能给我一个 [容器] 装这个吗？'],
    [/take this to go/i, 'Can I take this to go? = 我能把这个带走吗？'],
    [/bring you a box/i, "I'll bring you + [item]. = 我给您拿 [物品]。"],
  ];

  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? '替换练习：保留礼貌开头 + 换入你想点的菜品、口味、时间或支付方式。';
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function PlayIcon({ isPlaying }: { isPlaying: boolean }) {
  return <span aria-hidden="true" className={`play-icon ${isPlaying ? 'is-pause' : ''}`} />;
}

function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<PlayingTarget | null>(null);
  const [voiceId, setVoiceId] = useState<(typeof cloudTtsVoiceProfiles)[number]['id']>('cloud-nova-calm');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices?.() ?? []);
    loadVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setPlaying(null);
  };

  const playWithBrowserVoice = (target: PlayingTarget, profile: (typeof cloudTtsVoiceProfiles)[number]) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(target.text);
    utterance.lang = profile.id.includes('british') ? 'en-GB' : 'en-US';
    utterance.rate = profile.speed;
    utterance.pitch = 1;
    utterance.voice =
      voices.find((voice) => /female|samantha|victoria|karen|serena|ava|susan|zoe/i.test(voice.name)) ??
      voices.find((voice) => voice.lang.startsWith(utterance.lang)) ??
      voices[0] ??
      null;
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  const toggle = async (target: PlayingTarget) => {
    if (playing?.id === target.id) {
      stop();
      return;
    }

    stop();
    setPlaying(target);
    const profile = cloudTtsVoiceProfiles.find((item) => item.id === voiceId) ?? cloudTtsVoiceProfiles[0];

    if (profile.voice !== 'browser') {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: target.text, voiceId: profile.id }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const audio = new Audio(URL.createObjectURL(blob));
          audioRef.current = audio;
          audio.onended = () => setPlaying(null);
          audio.onerror = () => {
            setPlaying(null);
            playWithBrowserVoice(target, profile);
          };
          await audio.play();
          return;
        }
      } catch {
        // Fall back to the local browser voice when cloud audio is unavailable.
      }
    }

    playWithBrowserVoice(target, profile);
  };

  return { playing, voiceId, setVoiceId, toggle, stop };
}

function LineCard({ line, sceneId, index, isPlaying, onPlay }: { line: Line; sceneId: string; index: number; isPlaying: boolean; onPlay: (target: PlayingTarget) => void }) {
  const targetId = `${sceneId}-line-${index}`;
  return (
    <div className="line-card">
      <button className="play-button line-play" type="button" aria-label={`${isPlaying ? 'Pause' : 'Play'}: ${line.english}`} onClick={() => onPlay({ id: targetId, text: line.english })}>
        <PlayIcon isPlaying={isPlaying} />
      </button>
      <div className="line-copy">
        <div className="speaker">{line.speaker}</div>
        <p className="english">{line.english}</p>
        <p className="chinese">{line.chinese}</p>
        <p className="pattern">句式：{getPattern(line.english)}</p>
      </div>
    </div>
  );
}

function WordChip({ word, idPrefix, playingId, onPlay }: { word: VocabWord; idPrefix: string; playingId?: string; onPlay: (target: PlayingTarget) => void }) {
  const id = `${idPrefix}-${slug(word.en)}`;
  const isPlaying = playingId === id;
  return (
    <div className="word-chip">
      <button className="play-button word-play" type="button" aria-label={`${isPlaying ? 'Pause' : 'Play'} word: ${word.en}`} onClick={() => onPlay({ id, text: word.en })}>
        <PlayIcon isPlaying={isPlaying} />
      </button>
      <span className="word-text">
        <strong>{word.en}</strong>
        <em>{word.zh}</em>
      </span>
    </div>
  );
}

export default function Page() {
  const { playing, voiceId, setVoiceId, toggle, stop } = useAudioPlayer();
  const activeScene = useMemo(() => scenes.find((scene) => scene.id === 'missing-wrong-order') ?? scenes[0], []);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Italian Restaurant English</p>
          <h1>意大利餐厅点餐英文练习</h1>
          <p className="intro">按真实用餐流程练习：入座、推荐、点餐、份量、口味、催单、漏单处理、结账和打包。每句英文和每个单词都可以点击播放，再点一次暂停。</p>
        </div>
        <div className="voice-panel" aria-label="Voice selection">
          <div>
            <span>音色</span>
            <strong>{cloudTtsVoiceProfiles.find((voice) => voice.id === voiceId)?.label}</strong>
          </div>
          <select value={voiceId} onChange={(event) => { stop(); setVoiceId(event.target.value as typeof voiceId); }}>
            {cloudTtsVoiceProfiles.map((voice) => (
              <option key={voice.id} value={voice.id}>{voice.label} - {voice.description}</option>
            ))}
          </select>
        </div>
      </section>

      <nav className="scene-nav" aria-label="Scene shortcuts">
        {scenes.map((scene) => (
          <a key={scene.id} href={`#${scene.id}`}>{scene.number} {scene.title}</a>
        ))}
      </nav>

      <section className="spotlight" aria-labelledby="spotlight-title">
        <div>
          <p className="eyebrow">重点防坑</p>
          <h2 id="spotlight-title">{activeScene.title}</h2>
          <p>柜台点餐和漏单场景被单独保留，方便你在餐厅很忙、桌边服务不清楚、订单迟迟没来时直接套用。</p>
        </div>
        <a href={`#${activeScene.id}`}>跳到场景</a>
      </section>

      <div className="scenes">
        {scenes.map((scene) => (
          <section className="scene" id={scene.id} key={scene.id}>
            <header className="scene-header">
              <span>{scene.number}</span>
              <div>
                <h2>{scene.title}</h2>
                <p>{scene.subtitle}</p>
              </div>
            </header>

            <div className="dialogue-list">
              {scene.lines.map((line, index) => (
                <LineCard key={`${scene.id}-${index}`} line={line} sceneId={scene.id} index={index} isPlaying={playing?.id === `${scene.id}-line-${index}`} onPlay={toggle} />
              ))}
            </div>

            <div className="scene-words">
              <h3>本轮出现的词</h3>
              <div className="word-grid">
                {scene.dishes.map((word) => (
                  <WordChip key={`${scene.id}-${word.en}`} word={word} idPrefix={`scene-${scene.id}`} playingId={playing?.id} onPlay={toggle} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="vocabulary" id="vocabulary">
        <header>
          <p className="eyebrow">Vocabulary</p>
          <h2>场景单词汇总</h2>
        </header>
        <div className="word-grid dense">
          {uniqueSceneWords.map((word) => (
            <WordChip key={`summary-${word.en}`} word={word} idPrefix="summary" playingId={playing?.id} onPlay={toggle} />
          ))}
        </div>
      </section>

      <section className="categories" id="dish-categories">
        <header>
          <p className="eyebrow">Italian Menu</p>
          <h2>意大利餐厅常见菜品分类</h2>
        </header>
        <div className="category-grid">
          {dishCategories.map((category) => (
            <article className="category" key={category.title}>
              <h3>{category.title}</h3>
              <div className="word-grid compact">
                {category.words.map((word) => (
                  <WordChip key={`${category.title}-${word.en}`} word={word} idPrefix={`category-${slug(category.title)}`} playingId={playing?.id} onPlay={toggle} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <style>{`
        :root {
          color-scheme: light;
          --ink: #202024;
          --muted: #626266;
          --line: #e5ddd0;
          --paper: #fffaf2;
          --panel: #ffffff;
          --sage: #4d705a;
          --tomato: #bf4f3d;
          --gold: #c89735;
          --blue: #3a6f8f;
          --shadow: 0 18px 50px rgba(45, 38, 25, 0.12);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background:
            radial-gradient(circle at 15% 0%, rgba(200, 151, 53, 0.16), transparent 32rem),
            linear-gradient(180deg, #fff7ec 0%, #f7efe3 44%, #fdf8f0 100%);
          color: var(--ink);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.5;
          user-select: text;
        }

        button,
        select,
        a,
        p,
        h1,
        h2,
        h3,
        span,
        strong,
        em {
          user-select: text;
        }

        main {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 32px 0 64px;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
          align-items: end;
          min-height: 58vh;
          padding: 48px 0 24px;
        }

        .hero-copy {
          max-width: 760px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: var(--tomato);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        h1 {
          margin-bottom: 18px;
          font-size: clamp(2.4rem, 7vw, 5.6rem);
          line-height: 0.98;
          letter-spacing: 0;
        }

        .intro {
          max-width: 680px;
          margin-bottom: 0;
          color: #48433c;
          font-size: 1.1rem;
        }

        .voice-panel,
        .spotlight,
        .scene,
        .vocabulary,
        .category {
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.84);
          box-shadow: var(--shadow);
          backdrop-filter: blur(18px);
        }

        .voice-panel {
          display: grid;
          gap: 14px;
          padding: 18px;
          border-radius: 8px;
        }

        .voice-panel span {
          display: block;
          color: var(--muted);
          font-size: 0.86rem;
        }

        .voice-panel strong {
          display: block;
          margin-top: 2px;
          font-size: 1.05rem;
        }

        select {
          width: 100%;
          border: 1px solid #d3c6b5;
          border-radius: 6px;
          background: #fff;
          color: var(--ink);
          padding: 11px 12px;
          font: inherit;
        }

        .scene-nav {
          position: sticky;
          top: 0;
          z-index: 4;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin: 0 -16px 32px;
          padding: 12px 16px;
          background: rgba(255, 247, 236, 0.88);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(229, 221, 208, 0.9);
        }

        .scene-nav a {
          flex: 0 0 auto;
          border: 1px solid #d9cbb8;
          border-radius: 999px;
          padding: 8px 12px;
          color: #3f3c37;
          background: rgba(255, 255, 255, 0.75);
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
        }

        .scene-nav a:hover {
          border-color: var(--tomato);
          color: var(--tomato);
        }

        .spotlight {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
          margin-bottom: 28px;
          padding: 22px;
          border-radius: 8px;
          border-left: 5px solid var(--tomato);
        }

        .spotlight h2 {
          margin-bottom: 8px;
          font-size: 1.5rem;
        }

        .spotlight p {
          margin-bottom: 0;
          color: var(--muted);
        }

        .spotlight a {
          flex: 0 0 auto;
          border-radius: 6px;
          background: var(--tomato);
          color: white;
          padding: 10px 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .scenes {
          display: grid;
          gap: 24px;
        }

        .scene,
        .vocabulary,
        .categories {
          scroll-margin-top: 86px;
        }

        .scene,
        .vocabulary {
          border-radius: 8px;
          padding: 24px;
        }

        .scene-header {
          display: flex;
          gap: 16px;
          align-items: start;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--line);
        }

        .scene-header > span {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #21362a;
          color: #fff;
          font-weight: 900;
        }

        .scene-header h2,
        .vocabulary h2,
        .categories h2 {
          margin-bottom: 5px;
          font-size: 1.75rem;
          line-height: 1.18;
          letter-spacing: 0;
        }

        .scene-header p {
          margin-bottom: 0;
          color: var(--muted);
        }

        .dialogue-list {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .line-card {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          border: 1px solid #eadfce;
          border-radius: 8px;
          background: #fffdf9;
          padding: 14px;
        }

        .play-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          padding: 0;
          border: 1px solid #d6c8b6;
          border-radius: 999px;
          background: #ffffff;
          color: var(--sage);
          cursor: pointer;
          line-height: 1;
        }

        .play-button:hover {
          border-color: var(--sage);
          background: #eef5ef;
        }

        .line-play {
          margin-top: 2px;
        }

        .play-icon {
          width: 0;
          height: 0;
          margin-left: 3px;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 12px solid currentColor;
        }

        .play-icon.is-pause {
          width: 13px;
          height: 16px;
          margin-left: 0;
          border: 0;
          background:
            linear-gradient(currentColor, currentColor) left center / 5px 100% no-repeat,
            linear-gradient(currentColor, currentColor) right center / 5px 100% no-repeat;
        }

        .speaker {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          margin-bottom: 7px;
          border-radius: 999px;
          padding: 2px 9px;
          background: #f0e6d6;
          color: #6b4a1f;
          font-size: 0.78rem;
          font-weight: 900;
        }

        .english {
          margin-bottom: 5px;
          color: #1f2320;
          font-size: 1.08rem;
          font-weight: 750;
        }

        .chinese {
          margin-bottom: 8px;
          color: #4f4b46;
          font-size: 0.98rem;
        }

        .pattern {
          margin-bottom: 0;
          color: #7a7066;
          font-size: 0.83rem;
        }

        .scene-words {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }

        .scene-words h3,
        .category h3 {
          margin-bottom: 12px;
          font-size: 1.08rem;
        }

        .word-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 10px;
        }

        .word-grid.dense {
          grid-template-columns: repeat(auto-fit, minmax(178px, 1fr));
        }

        .word-grid.compact {
          grid-template-columns: 1fr;
        }

        .word-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 52px;
          border: 1px solid #eadfce;
          border-radius: 8px;
          background: #fffdf9;
          padding: 8px 10px;
        }

        .word-play {
          width: 34px;
          height: 34px;
          min-width: 34px;
          min-height: 34px;
        }

        .word-text {
          display: grid;
          gap: 1px;
          min-width: 0;
        }

        .word-text strong {
          color: #222822;
          font-size: 0.95rem;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .word-text em {
          color: var(--muted);
          font-size: 0.86rem;
          font-style: normal;
          line-height: 1.25;
        }

        .vocabulary,
        .categories {
          margin-top: 30px;
        }

        .vocabulary header,
        .categories header {
          margin-bottom: 18px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .category {
          border-radius: 8px;
          padding: 18px;
        }

        @media (max-width: 900px) {
          main {
            width: min(100% - 24px, 760px);
            padding-top: 20px;
          }

          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 28px;
          }

          .category-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          h1 {
            font-size: 2.55rem;
          }

          .intro {
            font-size: 1rem;
          }

          .scene,
          .vocabulary,
          .category {
            padding: 16px;
          }

          .spotlight {
            align-items: stretch;
            flex-direction: column;
          }

          .line-card {
            grid-template-columns: 40px minmax(0, 1fr);
            padding: 12px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
