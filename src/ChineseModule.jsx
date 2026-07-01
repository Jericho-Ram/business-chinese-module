import { useState } from "react";

// ── Colors ─────────────────────────────────────────────────
const C = {
  red:"#C9382C", navy:"#1A2744", gold:"#C9A84C",
  green:"#1A7A4A", purple:"#6B3FA0", blue:"#1A4A7A",
  bg:"#FAF8F5", light:"#F0EDE7", white:"#FFFFFF",
};

// ── Audio engine ───────────────────────────────────────────
// Tries Google Translate TTS first (works in sandboxed iframes),
// then falls back to Web Speech API if that fails.
function SpeakBtn({ text, small }) {
  const [status, setStatus] = useState("idle"); // idle | playing | error

  async function go(e) {
    e.stopPropagation();
    if (status === "playing") { setStatus("idle"); return; }
    setStatus("playing");

    // Method 1 — Google Translate TTS (audio element, works in iframes)
    const gttsUrl =
      "https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=" +
      encodeURIComponent(text);
    const audio = new Audio(gttsUrl);
    audio.onended  = () => setStatus("idle");
    audio.onerror  = () => tryWebSpeech();
    try {
      await audio.play();
      return;
    } catch (_) {
      tryWebSpeech();
    }

    // Method 2 — Web Speech API fallback
    function tryWebSpeech() {
      const ss = window?.speechSynthesis;
      if (!ss) { fail(); return; }
      ss.cancel();
      const voices = ss.getVoices();
      const zhVoice = voices.find(v => v.lang.startsWith("zh")) || null;
      const u = new SpeechSynthesisUtterance(text);
      if (zhVoice) u.voice = zhVoice;
      u.lang = zhVoice?.lang || "zh-CN";
      u.rate = 0.8;
      u.onend  = () => setStatus("idle");
      u.onerror = () => fail();
      ss.speak(u);
    }

    function fail() {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const icon = status === "playing" ? "⏸" : status === "error" ? "✗" : "🔊";
  return (
    <button onClick={go} title={"Hear: " + text} style={{
      background: status === "playing" ? C.red : status === "error" ? "#c0392b" : "rgba(26,39,68,0.09)",
      color: status !== "idle" ? "#fff" : C.navy,
      border:"none", borderRadius:8, cursor:"pointer",
      padding: small ? "3px 7px" : "5px 11px",
      fontSize: small ? 12 : 15,
      fontWeight:700, transition:"all .15s", lineHeight:1, flexShrink:0,
    }}>{icon}</button>
  );
}

// ── Audio diagnostics (shown in Lesson tab banner) ─────────
function AudioDiag() {
  const [result, setResult] = useState(null);

  async function test() {
    setResult("testing");
    const gttsUrl =
      "https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=" +
      encodeURIComponent("你好");
    const audio = new Audio(gttsUrl);
    try {
      await audio.play();
      setResult("gtts_ok");
      audio.onended = () => {};
      return;
    } catch (_) {}

    const ss = window?.speechSynthesis;
    if (!ss) { setResult("none"); return; }
    const voices = ss.getVoices();
    const zh = voices.find(v => v.lang.startsWith("zh"));
    setResult(zh ? "ws_ok" : "ws_no_voice");
  }

  const msgs = {
    testing:     { bg:"#FFF8E7", border:C.gold, icon:"⏳", text:"Testing audio…"                                                      },
    gtts_ok:     { bg:"#E8F7EE", border:C.green,icon:"✓",  text:"Audio works! (Google TTS)"                                           },
    ws_ok:       { bg:"#E8F7EE", border:C.green,icon:"✓",  text:"Audio works! (Web Speech)"                                           },
    ws_no_voice: { bg:"#FFF0F0", border:C.red,  icon:"⚠",  text:"No Chinese voice found. Install zh-CN voice in device Settings."     },
    none:        { bg:"#FFF0F0", border:C.red,  icon:"✗",  text:"Audio blocked by this browser. Open artifact in Chrome or Safari."   },
  };
  const m = result ? msgs[result] : null;

  return (
    <div style={{marginBottom:14}}>
      <div style={{background:"#E8F4E8",border:`1px solid ${C.green}`,borderRadius:10,padding:"8px 12px",fontSize:12,color:"#2A6A4A",display:"flex",gap:8,alignItems:"center",marginBottom:m?6:0}}>
        <span>🔊 Tap any button to hear Chinese pronunciation.</span>
        <button onClick={test} style={{marginLeft:"auto",background:C.green,color:"#fff",border:"none",borderRadius:8,padding:"4px 10px",fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>Test Audio</button>
      </div>
      {m && (
        <div style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:10,padding:"8px 12px",fontSize:12,color:"#333"}}>
          {m.icon} {m.text}
        </div>
      )}
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────

const PHASES = [
  { id:1, hanzi:"拼", bg:C.red,    title:"Pinyin & Literacy",   weeks:"Weeks 1–4",   goal:"Bridge what you hear → written form",  active:true  },
  { id:2, hanzi:"词", bg:C.green,  title:"Business Vocabulary", weeks:"Weeks 5–10",  goal:"300 characters for professional use",  active:true  },
  { id:3, hanzi:"商", bg:C.navy,   title:"Pro Communication",   weeks:"Weeks 11–18", goal:"Emails, meetings, negotiations",       active:true  },
  { id:4, hanzi:"精", bg:C.purple, title:"Advanced Fluency",    weeks:"Weeks 19–26", goal:"Contracts, presentations, proposals",  active:true  },
];

const TONES = [
  { num:"1st", mark:"ā", shape:"—", color:C.green,  desc:"High & flat — sustained like a musical note",
    word:{hz:"妈",py:"mā", en:"Mother"   }, biz:{hz:"公司",py:"gōngsī", en:"Company"    } },
  { num:"2nd", mark:"á", shape:"⟋", color:C.blue,   desc:'Rising — like asking "huh?" in English',
    word:{hz:"麻",py:"má", en:"Numb"     }, biz:{hz:"人才",py:"réncái",  en:"Talent (HR)"} },
  { num:"3rd", mark:"ǎ", shape:"∨", color:C.purple, desc:"Low dip then rise — a curve down then up",
    word:{hz:"马",py:"mǎ", en:"Horse"    }, biz:{hz:"你好",py:"nǐ hǎo", en:"Hello"       } },
  { num:"4th", mark:"à", shape:"⟍", color:C.red,    desc:"Sharp falling — firm and assertive",
    word:{hz:"骂",py:"mà", en:"To scold" }, biz:{hz:"报价",py:"bàojià", en:"Price quote" } },
];

const RADICALS = [
  { r:"人", py:"rén",  en:"Person",      chars:["你 (you)","他 (he)","们 (plural)"]        },
  { r:"口", py:"kǒu",  en:"Mouth/speak", chars:["说 (speak)","问 (ask)","叫 (call)"]      },
  { r:"金", py:"jīn",  en:"Metal/money", chars:["钱 (money)","银 (silver)","账 (account)"] },
  { r:"手", py:"shǒu", en:"Hand/action", chars:["打 (do)","拿 (take)","接 (receive)"]     },
  { r:"心", py:"xīn",  en:"Heart/feel",  chars:["想 (think)","忙 (busy)","感 (feel)"]     },
  { r:"言", py:"yán",  en:"Speech",      chars:["话 (speech)","请 (please)","谢 (thanks)"] },
];

const P1_VOCAB = [
  { hz:"你好",  py:"nǐ hǎo",  en:"Hello",       use:"Standard greeting to any professional",          phase:1 },
  { hz:"谢谢",  py:"xièxiè",  en:"Thank you",   use:"After any meeting, favor, or gesture",            phase:1 },
  { hz:"公司",  py:"gōngsī",  en:"Company",     use:"贵公司 (guì gōngsī) = your esteemed company",     phase:1 },
  { hz:"合同",  py:"hétóng",  en:"Contract",    use:"签合同 = sign a contract",                        phase:1 },
  { hz:"会议",  py:"huìyì",   en:"Meeting",     use:"开会 (kāihuì) = hold a meeting",                  phase:1 },
  { hz:"客户",  py:"kèhù",    en:"Client",      use:"重要客户 = important client",                     phase:1 },
  { hz:"合作",  py:"hézuò",   en:"Cooperation", use:"期待合作 = looking forward to cooperating",        phase:1 },
  { hz:"报价",  py:"bàojià",  en:"Price quote", use:"发报价单 = send a quotation",                     phase:1 },
  { hz:"老板",  py:"lǎobǎn",  en:"Boss/Owner",  use:"Casual address to a business owner",              phase:1 },
  { hz:"经理",  py:"jīnglǐ",  en:"Manager",     use:"张经理 = Manager Zhang (formal by title)",        phase:1 },
  { hz:"发票",  py:"fāpiào",  en:"Invoice",     use:"开发票 = issue an invoice",                       phase:1 },
  { hz:"银行",  py:"yínháng", en:"Bank",        use:"银行账户 = bank account",                         phase:1 },
];

const P2_VOCAB = [
  { hz:"您好",    py:"nín hǎo",      en:"Hello (formal)",  use:"More respectful than 你好; use with seniors & clients", phase:2 },
  { hz:"幸会",    py:"xìng huì",     en:"Pleased to meet", use:"Said at formal first meetings — reply with 幸会 back",  phase:2 },
  { hz:"名片",    py:"míngpiàn",     en:"Business card",   use:"Hand and receive with both hands. Never write on it.",  phase:2 },
  { hz:"截止日期", py:"jiézhǐ rìqī", en:"Deadline",        use:"截止日期是几号？= What is the deadline date?",          phase:2 },
  { hz:"万",      py:"wàn",          en:"10,000",          use:"50万 = 500,000. Chinese counts in 万, not thousands",   phase:2 },
  { hz:"人民币",  py:"rénmínbì",     en:"RMB / Yuan",      use:"RMB is the currency; 元 is the unit; 块 is casual",    phase:2 },
  { hz:"总经理",  py:"zǒng jīnglǐ", en:"General Manager", use:"Top operational title; address as 总 (zǒng) for short", phase:2 },
  { hz:"部门",    py:"bùmén",        en:"Department",      use:"你在哪个部门？= Which department are you in?",          phase:2 },
  { hz:"销售部",  py:"xiāoshòu bù", en:"Sales dept.",      use:"销售部经理 = Sales Manager",                           phase:2 },
  { hz:"关系",    py:"guānxi",       en:"Relationships",   use:"The foundation of Chinese business — personal networks", phase:2 },
  { hz:"面子",    py:"miànzi",       en:"Face / Status",   use:"Never embarrass someone publicly — 面子 is critical",   phase:2 },
  { hz:"干杯",    py:"gān bēi",      en:"Cheers!",         use:"Toast at business dinners; match the host's enthusiasm", phase:2 },
];

const P3_VOCAB = [
  { hz:"尊敬的",   py:"zūnjìng de",    en:"Dear / Respected",   use:"Email opener: 尊敬的张总 = Dear GM Zhang. Always more formal than 你好", phase:3 },
  { hz:"附件",    py:"fùjiàn",         en:"Attachment",         use:"请查收附件 = Please find the attachment. Critical for business emails", phase:3 },
  { hz:"议程",    py:"yìchéng",        en:"Agenda",             use:"请查收今天的议程 = Please see today's agenda",                         phase:3 },
  { hz:"谈判",    py:"tánpàn",         en:"Negotiation",        use:"价格谈判 = price negotiation; 进入谈判阶段 = enter negotiation phase",   phase:3 },
  { hz:"折扣",    py:"zhékòu",         en:"Discount",           use:"给折扣 = give a discount; 打折 (dǎzhé) = to discount",                phase:3 },
  { hz:"条款",    py:"tiáokuǎn",       en:"Terms / Clauses",    use:"合同条款 = contract terms; 付款条款 = payment terms",                  phase:3 },
  { hz:"交货期",  py:"jiāohuò qī",    en:"Delivery date",      use:"交货期是几号？= What is the delivery date?",                          phase:3 },
  { hz:"定金",    py:"dìngjīn",        en:"Deposit",            use:"付定金 = pay a deposit; usually 30% upfront in Chinese business",      phase:3 },
  { hz:"提案",    py:"tí'àn",          en:"Proposal",           use:"提交提案 = submit a proposal; 审核提案 = review a proposal",           phase:3 },
  { hz:"样品",    py:"yàngpǐn",        en:"Sample",             use:"寄样品 = send a sample; 看样品 = inspect a sample",                   phase:3 },
  { hz:"期待合作", py:"qīdài hézuò",   en:"Looking fwd to cooperating", use:"Standard closing phrase in business emails and meetings",    phase:3 },
  { hz:"成交",    py:"chéngjiāo",      en:"Deal / It's a deal", use:"Said to close a negotiation. 一言为定 (yīyánwéidìng) = it's settled", phase:3 },
];

const P4_VOCAB = [
  { hz:"甲方",     py:"jiǎfāng",           en:"Party A",              use:"甲方 = buyer/client; 乙方 (yǐfāng) = seller/supplier in any contract", phase:4 },
  { hz:"违约金",   py:"wéiyuē jīn",        en:"Breach penalty",       use:"违约金条款 = penalty clause; protects you if the other party defaults",   phase:4 },
  { hz:"不可抗力", py:"bùkě kànglì",       en:"Force majeure",        use:"Not negotiable in most contracts — natural disasters, war, pandemic",    phase:4 },
  { hz:"保密协议", py:"bǎomì xiéyì",       en:"NDA",                  use:"签保密协议 = sign an NDA. Standard before sharing trade data in China",   phase:4 },
  { hz:"知识产权", py:"zhīshí chǎnquán",   en:"Intellectual property",use:"保护知识产权 = protect IP. Critical in manufacturing partnerships",        phase:4 },
  { hz:"供应商",   py:"gōngyìngshāng",     en:"Supplier",             use:"合格供应商 = qualified supplier; 供应商审核 = supplier audit",             phase:4 },
  { hz:"原材料",   py:"yuáncáiliào",       en:"Raw materials",        use:"原材料成本 = raw material cost; directly affects your product pricing",   phase:4 },
  { hz:"人工智能", py:"réngōng zhìnéng",   en:"Artificial intelligence",use:"AI is 人工智能 — abbreviated 人工智能 or just AI in professional settings", phase:4 },
  { hz:"市场份额", py:"shìchǎng fèné",     en:"Market share",         use:"增加市场份额 = grow market share; key metric in business presentations",  phase:4 },
  { hz:"数字化转型",py:"shùzìhuà zhuǎnxíng",en:"Digital transformation",use:"企业数字化转型 = enterprise digital transformation — hot topic in China", phase:4 },
  { hz:"签字盖章", py:"qiānzì gàizhāng",   en:"Sign and seal",        use:"Chinese contracts require both signature AND company chop (official stamp)", phase:4 },
  { hz:"投资回报率",py:"tóuzī huíbào lǜ",  en:"ROI",                  use:"提高投资回报率 = improve ROI; essential for any proposal or pitch deck",   phase:4 },
];

const ALL_VOCAB = [...P1_VOCAB, ...P2_VOCAB, ...P3_VOCAB, ...P4_VOCAB];

// ── Phase 4 Data ───────────────────────────────────────────

const CONTRACT_TERMS = [
  { hz:"甲方 / 乙方", py:"jiǎfāng / yǐfāng",  en:"Party A / Party B",    note:"Party A is typically the buyer or client; Party B is the seller or service provider." },
  { hz:"有效期",      py:"yǒuxiào qī",          en:"Validity period",      note:"有效期为一年 = valid for one year. Always specify; contracts without dates are unenforceable." },
  { hz:"违约金",      py:"wéiyuē jīn",          en:"Breach penalty",       note:"Specifies financial consequences if terms are broken. Negotiate this carefully — defaults can be steep." },
  { hz:"不可抗力",    py:"bùkě kànglì",         en:"Force majeure",        note:"Covers acts outside either party's control: natural disasters, war, government orders. Non-negotiable." },
  { hz:"保密协议",    py:"bǎomì xiéyì",         en:"NDA / Confidentiality",note:"Always sign before sharing pricing, formulas, or trade data with a Chinese partner." },
  { hz:"知识产权",    py:"zhīshí chǎnquán",     en:"Intellectual property",note:"Define ownership of IP explicitly. Manufacturing in China requires clear IP clauses to avoid infringement." },
  { hz:"仲裁",        py:"zhòngcái",            en:"Arbitration",          note:"Disputes go to arbitration rather than court. Specify the body: CIETAC is China's main commercial arbitration center." },
  { hz:"签字盖章",    py:"qiānzì gàizhāng",     en:"Sign and seal",        note:"Chinese contracts need both: your signature AND your company's official chop (公章 gōngzhāng). A signature alone is insufficient." },
];

const CONTRACT_PHRASES = [
  { hz:"本合同自双方签字盖章之日起生效。",        py:"Běn hétóng zì shuāngfāng qiānzì gàizhāng zhī rì qǐ shēngxiào.",    en:"This contract takes effect from the date both parties sign and seal." },
  { hz:"本合同一式两份，双方各执一份，具有同等法律效力。", py:"Běn hétóng yīshì liǎng fèn, shuāngfāng gè zhí yī fèn.",   en:"This contract is made in duplicate; each party holds one copy with equal legal force." },
  { hz:"若有争议，双方应首先协商解决。",           py:"Ruò yǒu zhēngyì, shuāngfāng yīng shǒuxiān xiéshāng jiějué.",       en:"In the event of a dispute, both parties shall first seek resolution through negotiation." },
  { hz:"付款方式为货到后三十日内付清。",           py:"Fùkuǎn fāngshì wéi huò dào hòu sānshí rì nèi fùqīng.",            en:"Payment terms: full payment within 30 days of delivery." },
];

const PRES_PHRASES = [
  { stage:"Welcome",    hz:"感谢各位的出席，今天非常荣幸能在这里发言。", py:"Gǎnxiè gèwèi de chūxí, jīntiān fēicháng rónghǎo néng zài zhèlǐ fāyán.", en:"Thank you all for attending. It is a great honour to speak here today." },
  { stage:"Agenda",     hz:"今天我将介绍三个方面：背景、分析和建议。", py:"Jīntiān wǒ jiāng jièshào sān gè fāngmiàn: bèijǐng, fēnxī hé jiànyì.",   en:"Today I will cover three areas: background, analysis, and recommendations." },
  { stage:"Transition", hz:"接下来，我们来看第二点。",                 py:"Jiē xià lái, wǒmen lái kàn dì èr diǎn.",                                   en:"Next, let us move on to the second point." },
  { stage:"Data",       hz:"根据数据显示，我们的销售额增长了20%。",    py:"Gēnjù shùjù xiǎnshì, wǒmen de xiāoshòu é zēngzhǎng le 20%.",             en:"According to the data, our sales have grown by 20%." },
  { stage:"Summary",    hz:"总结一下，我们提出以下三点建议。",          py:"Zǒngjié yīxià, wǒmen tíchū yǐxià sān diǎn jiànyì.",                       en:"In summary, we put forward the following three recommendations." },
  { stage:"Q&A",        hz:"以上是我的报告，感谢聆听，欢迎提问。",     py:"Yǐshàng shì wǒ de bàogào, gǎnxiè língtīng, huānyíng tíwèn.",             en:"That concludes my presentation. Thank you for listening. Questions are welcome." },
];

const INDUSTRY_FB = [
  { hz:"供应商",    py:"gōngyìngshāng",  en:"Supplier"              },
  { hz:"原材料",    py:"yuáncáiliào",    en:"Raw materials"         },
  { hz:"最小起订量", py:"zuìxiǎo qǐdìng liàng", en:"MOQ"          },
  { hz:"批发价",    py:"pīfājià",        en:"Wholesale price"       },
  { hz:"保质期",    py:"bǎozhì qī",      en:"Shelf life"            },
  { hz:"食品安全",  py:"shípǐn ānquán",  en:"Food safety"           },
];

const INDUSTRY_TECH = [
  { hz:"人工智能",   py:"réngōng zhìnéng",    en:"Artificial intelligence" },
  { hz:"数据分析",   py:"shùjù fēnxī",        en:"Data analysis"           },
  { hz:"云计算",     py:"yún jìsuàn",          en:"Cloud computing"         },
  { hz:"数字化转型", py:"shùzìhuà zhuǎnxíng",  en:"Digital transformation"  },
  { hz:"市场份额",   py:"shìchǎng fèné",       en:"Market share"            },
  { hz:"投资回报率", py:"tóuzī huíbào lǜ",     en:"ROI"                     },
];

const ETIQUETTE_NOTES = [
  { icon:"🎁", title:"Gift giving",      body:"Bring a gift from your home country or city — local specialty foods are ideal. Avoid clocks (送钟 sounds like 'attending a funeral'), shoes, or anything in sets of 4 (四 sounds like 'death'). Present with both hands." },
  { icon:"🪑", title:"Banquet seating",  body:"The seat facing the door is the guest of honour's position. Never sit there unless directed. The host sits opposite, closest to the kitchen. Wait to be seated." },
  { icon:"🥂", title:"Drinking pressure",body:"If you do not drink alcohol, say 我不喝酒 (Wǒ bù hē jiǔ) early and firmly. Offer tea or juice for toasting. Attempting to drink shows goodwill even if you only sip. Refusing entirely is acceptable but set expectations early." },
  { icon:"🧧", title:"Red envelopes (红包)", body:"Digital 红包 (hóngbāo) via WeChat are common for celebrations and team bonding. In B2B contexts, giving 红包 to officials can cross into bribery — know the line. For team staff during 春节, it is expected and appreciated." },
  { icon:"🏭", title:"Factory visits",   body:"Dress practically but neatly. Compliment the operation genuinely. Never photograph without asking. Bring your own business cards and offer them at the first meeting with each person, not as a group handout." },
  { icon:"🌸", title:"Holiday greetings",body:"春节快乐 (Chūnjié kuàilè) = Happy Spring Festival. 新年好 (Xīnnián hǎo) = Happy New Year. Send greetings via WeChat the morning of — it signals attentiveness. A voice message is more personal than text." },
];

// ── Phase 3 Data ───────────────────────────────────────────

const EMAIL_PARTS = [
  { label:"Opening",   hz:"尊敬的 [Name] 先生/女士，",  py:"Zūnjìng de [Name] xiānsheng/nǚshì,", en:"Dear Mr./Ms. [Name],",      note:"Always use surname + title. 先生 (Mr.) or 女士 (Ms.). More formal than 您好." },
  { label:"Greeting",  hz:"您好！感谢您的来信。",         py:"Nín hǎo! Gǎnxiè nín de láixìn.",    en:"Hello! Thank you for your letter.", note:"Use after the salutation. If opening a new thread, use 特此联系您 (I am writing to contact you)." },
  { label:"Purpose",   hz:"兹就以下事项向您说明：",        py:"Zī jiù yǐxià shìxiàng xiàng nín shuōmíng:", en:"I am writing to clarify the following matters:", note:"Formal way to state the email purpose. 兹 is written-only formal Chinese." },
  { label:"Request",   hz:"烦请您尽快回复。",             py:"Fán qǐng nín jǐnkuài huífù.",       en:"Please kindly reply at your earliest convenience.", note:"烦请 is polite yet direct. Stronger: 敬请于 [date] 前回复 = Please reply by [date]." },
  { label:"Attachment",hz:"请查收附件，如有问题请告知。",   py:"Qǐng cháshōu fùjiàn, rú yǒu wèntí qǐng gàozhī.", en:"Please find the attachment; let me know if there are any issues.", note:"Standard phrase whenever sending files. Always mention the attachment in the body." },
  { label:"Closing",   hz:"期待您的回复，此致敬礼。",      py:"Qīdài nín de huífù, cǐzhì jìnglǐ.",  en:"Looking forward to your reply. Yours sincerely.", note:"此致敬礼 is the standard formal closing — equivalent to 'Yours faithfully'. Never skip it." },
];

const MEETING_PHRASES = [
  { stage:"Opening",      hz:"现在我们开始今天的会议。",       py:"Xiànzài wǒmen kāishǐ jīntiān de huìyì.", en:"Let us now begin today's meeting."         },
  { stage:"Agenda",       hz:"今天的议程包括三个议题。",        py:"Jīntiān de yìchéng bāokuò sān gè yìtí.", en:"Today's agenda includes three items."     },
  { stage:"Floor",        hz:"我想补充一点。",                 py:"Wǒ xiǎng bǔchōng yī diǎn.",             en:"I would like to add one point."            },
  { stage:"Agree",        hz:"我完全同意您的看法。",            py:"Wǒ wánquán tóngyì nín de kànfǎ.",        en:"I fully agree with your view."             },
  { stage:"Disagree",     hz:"恕我有不同意见。",               py:"Shù wǒ yǒu bùtóng yìjiàn.",             en:"Please allow me to respectfully disagree."  },
  { stage:"Clarify",      hz:"您能再解释一下吗？",              py:"Nín néng zài jiěshì yīxià ma?",          en:"Could you explain that again?"             },
  { stage:"Pause",        hz:"我们休息十分钟。",               py:"Wǒmen xiūxi shí fēnzhōng.",              en:"Let us take a ten-minute break."           },
  { stage:"Action item",  hz:"请在周五前发送会议纪要。",         py:"Qǐng zài zhōuwǔ qián fāsòng huìyì jìyào.", en:"Please send the meeting minutes by Friday."},
  { stage:"Close",        hz:"今天的会议到此结束，谢谢大家。",   py:"Jīntiān de huìyì dào cǐ jiéshù, xièxiè dàjiā.", en:"This concludes today's meeting. Thank you all." },
];

const NEGOTIATION_PHRASES = [
  { phase:"Interest",   hz:"我们对贵公司的产品非常感兴趣。",      py:"Wǒmen duì guì gōngsī de chǎnpǐn fēicháng gǎn xìngqù.", en:"We are very interested in your company's products."     },
  { phase:"Offer",      hz:"我们可以提供以下条件。",              py:"Wǒmen kěyǐ tígōng yǐxià tiáojiàn.",                    en:"We can offer the following terms."                     },
  { phase:"Counter",    hz:"能否给我们一个更优惠的价格？",          py:"Néng fǒu gěi wǒmen yīgè gèng yōuhuì de jiàgé?",        en:"Could you offer us a more favourable price?"           },
  { phase:"Budget",     hz:"这个价格超出了我们的预算。",           py:"Zhège jiàgé chāochū le wǒmen de yùsuàn.",               en:"This price exceeds our budget."                        },
  { phase:"Volume",     hz:"如果数量增加，价格能否优惠？",          py:"Rúguǒ shùliàng zēngjiā, jiàgé néng fǒu yōuhuì?",       en:"If we increase the quantity, can the price be reduced?"},
  { phase:"Stall",      hz:"我们需要内部讨论一下，明天给您答复。",  py:"Wǒmen xūyào nèibù tǎolùn yīxià, míngtiān gěi nín dáfù.", en:"We need to discuss internally and will reply tomorrow."},
  { phase:"Accept",     hz:"我们可以接受这个条款。",              py:"Wǒmen kěyǐ jiēshòu zhège tiáokuǎn.",                    en:"We can accept this term."                              },
  { phase:"Close",      hz:"成交！期待我们的合作。",              py:"Chéngjiāo! Qīdài wǒmen de hézuò.",                     en:"Deal! Looking forward to our cooperation."             },
];

const REGISTER_PAIRS = [
  { formal:"您 (nín)",           casual:"你 (nǐ)",          meaning:"You",           tip:"Always 您 with clients and seniors until they use 你 first." },
  { formal:"贵公司 (guì gōngsī)",casual:"你们公司 (nǐmen gōngsī)", meaning:"Your company", tip:"贵 (esteemed) adds respect. Use in all written communication." },
  { formal:"惠顾 (huìgù)",       casual:"光临 (guānglín)",  meaning:"Patronage/visit",tip:"惠顾 for written; 光临 for spoken welcome when someone arrives." },
  { formal:"烦请 (fán qǐng)",    casual:"请 (qǐng)",        meaning:"Please",        tip:"烦请 is softer and more deferential — preferred in formal emails." },
  { formal:"兹 (zī)",            casual:"这 (zhè)",         meaning:"This / hereby",  tip:"兹 only appears in formal written Chinese. Never say it aloud." },
  { formal:"此致敬礼",            casual:"祝好 (zhù hǎo)",   meaning:"Email sign-off", tip:"此致敬礼 for formal letters; 祝好 (Best wishes) for internal emails." },
];

const GREETINGS = [
  { hz:"您好",      py:"nín hǎo",          en:"Hello (respectful)",         note:"More polite than 你好. Use with clients, seniors, and all first meetings." },
  { hz:"幸会幸会",  py:"xìng huì xìng huì",en:"Pleased to meet you",         note:"Doubling 幸会 adds warmth. The other person will usually reply in kind." },
  { hz:"久仰大名",  py:"jiǔ yǎng dà míng", en:"I've long heard of your name",note:"Reserved for senior or influential contacts. Shows you know their reputation." },
  { hz:"请多关照",  py:"qǐng duō guānzhào",en:"Please look after me",         note:"Said when starting a new business relationship. Signals humility and openness." },
  { hz:"名片",      py:"míngpiàn",         en:"Business card",               note:"Always offer and receive with both hands. Read it; never write on it or pocket it immediately." },
  { hz:"请坐",      py:"qǐng zuò",         en:"Please, sit down",            note:"The host says this to guests. Wait for the host to sit first before sitting yourself." },
];

const NUMBERS = [
  { hz:"零",py:"líng",en:"0" },{ hz:"一",py:"yī", en:"1" },{ hz:"二",py:"èr", en:"2" },
  { hz:"三",py:"sān", en:"3" },{ hz:"四",py:"sì", en:"4" },{ hz:"五",py:"wǔ", en:"5" },
  { hz:"六",py:"liù", en:"6" },{ hz:"七",py:"qī", en:"7" },{ hz:"八",py:"bā", en:"8" },
  { hz:"九",py:"jiǔ", en:"9" },{ hz:"十",py:"shí",en:"10"},{ hz:"百",py:"bǎi",en:"100" },
  { hz:"千",py:"qiān",en:"1,000"},{ hz:"万",py:"wàn",en:"10,000 ⭐"},{ hz:"亿",py:"yì",en:"100M" },
];

const MONEY_PHRASES = [
  { hz:"人民币",   py:"rénmínbì",        en:"RMB (Chinese currency)"           },
  { hz:"美元",     py:"měiyuán",         en:"USD (US Dollar)"                   },
  { hz:"汇率",     py:"huìlǜ",           en:"Exchange rate"                     },
  { hz:"总价",     py:"zǒngjià",         en:"Total price"                       },
  { hz:"优惠价",   py:"yōuhuìjià",       en:"Discounted / preferential price"   },
  { hz:"付款方式", py:"fùkuǎn fāngshì",  en:"Payment method"                   },
];

const ROLES = [
  { hz:"董事长",   py:"dǒngshì zhǎng",   en:"Chairman of the Board", rank:1 },
  { hz:"总裁",     py:"zǒngcái",         en:"CEO / President",       rank:2 },
  { hz:"总经理",   py:"zǒng jīnglǐ",    en:"General Manager",       rank:3 },
  { hz:"副总经理", py:"fù zǒng jīnglǐ", en:"Deputy GM / VP",        rank:4 },
  { hz:"经理",     py:"jīnglǐ",          en:"Manager / Dept Head",   rank:5 },
  { hz:"主管",     py:"zhǔguǎn",         en:"Supervisor",            rank:6 },
  { hz:"员工",     py:"yuángōng",        en:"Staff / Employee",      rank:7 },
];

const DEPARTMENTS = [
  { hz:"财务部", py:"cáiwù bù",    en:"Finance"    },
  { hz:"市场部", py:"shìchǎng bù", en:"Marketing"  },
  { hz:"销售部", py:"xiāoshòu bù", en:"Sales"      },
  { hz:"人事部", py:"rénshì bù",   en:"HR"         },
  { hz:"技术部", py:"jìshù bù",    en:"Tech / IT"  },
  { hz:"运营部", py:"yùnyíng bù",  en:"Operations" },
];

const CULTURE_CONCEPTS = [
  { hz:"关系",    py:"guānxi",      en:"Relationships / Connections",
    note:"The single most important concept in Chinese business. Personal networks that enable deals, introductions, and trust. Investing in 关系 is investing in business." },
  { hz:"面子",    py:"miànzi",      en:"Face / Reputation / Dignity",
    note:"Social currency. Never embarrass someone in public — it destroys 面子 and the relationship. Always give credit, avoid direct public criticism, and compliment openly." },
  { hz:"干杯",    py:"gān bēi",     en:"Cheers! / Bottoms up",
    note:"Common at business dinners. Match the host's enthusiasm to show respect. You can sip — you don't always have to drain the glass, but volume signals sincerity." },
  { hz:"敬酒",    py:"jìng jiǔ",   en:"Propose a toast",
    note:"The host always toasts guests first. You'll be expected to reciprocate. Have a short, sincere thing to say about the relationship or the cooperation ahead." },
  { hz:"不好意思", py:"bù hǎo yìsi",en:"Excuse me / I'm sorry (soft)",
    note:"A gentle apology for minor awkwardness — arriving slightly late, asking someone to repeat themselves. Less formal than 对不起 (duìbuqǐ = deep apology)." },
  { hz:"辛苦了",  py:"xīnkǔ le",   en:"You've worked hard",
    note:"Said to acknowledge effort — after a long meeting, project, or presentation. Widely appreciated. The reply is usually 没什么 (méi shénme = it's nothing)." },
];

const QUIZ_ALL = [
  { hz:"公司",     en:"Company",               py:"gōngsī"          },
  { hz:"谢谢",     en:"Thank you",             py:"xièxiè"          },
  { hz:"合同",     en:"Contract",              py:"hétóng"          },
  { hz:"客户",     en:"Client",                py:"kèhù"            },
  { hz:"会议",     en:"Meeting",               py:"huìyì"           },
  { hz:"报价",     en:"Price quote",           py:"bàojià"          },
  { hz:"您好",     en:"Hello (formal)",        py:"nín hǎo"         },
  { hz:"名片",     en:"Business card",         py:"míngpiàn"        },
  { hz:"万",       en:"10,000",                py:"wàn"             },
  { hz:"关系",     en:"Relationships",         py:"guānxi"          },
  { hz:"面子",     en:"Face / Status",         py:"miànzi"          },
  { hz:"总经理",   en:"General Manager",       py:"zǒng jīnglǐ"    },
  { hz:"附件",     en:"Attachment",            py:"fùjiàn"          },
  { hz:"谈判",     en:"Negotiation",           py:"tánpàn"          },
  { hz:"折扣",     en:"Discount",              py:"zhékòu"          },
  { hz:"条款",     en:"Terms / Clauses",       py:"tiáokuǎn"        },
  { hz:"交货期",   en:"Delivery date",         py:"jiāohuò qī"      },
  { hz:"成交",     en:"Deal / Done",           py:"chéngjiāo"       },
  { hz:"甲方",     en:"Party A",               py:"jiǎfāng"         },
  { hz:"违约金",   en:"Breach penalty",        py:"wéiyuē jīn"      },
  { hz:"供应商",   en:"Supplier",              py:"gōngyìngshāng"   },
  { hz:"人工智能", en:"Artificial intelligence",py:"réngōng zhìnéng" },
  { hz:"市场份额", en:"Market share",          py:"shìchǎng fèné"   },
  { hz:"知识产权", en:"Intellectual property", py:"zhīshí chǎnquán" },
];

// ── Poetry & Literature Data ────────────────────────────────
// Classical lines & chengyu that educated Chinese business contacts
// recognise instantly — useful for toasts, small talk, and signalling
// cultural fluency. Each item: read the line(s), fill the blank,
// then answer a comprehension / usage question.

const POETRY_ITEMS = [
  {
    id:1, kind:"Poem", title:"《静夜思》", titlePy:"Jìng Yè Sī", titleEn:"Thoughts on a Quiet Night",
    author:"李白", authorPy:"Lǐ Bái", dynasty:"Tang Dynasty",
    lines:[
      { hz:"床前明月光，", py:"Chuáng qián míng yuè guāng,", en:"Moonlight before my bed," },
      { hz:"疑是地上霜。", py:"Yí shì dìshàng shuāng.",       en:"I took it for frost on the ground." },
      { hz:"举头望明月，", py:"Jǔ tóu wàng míng yuè,",        en:"I raise my head to gaze at the moon," },
      { hz:"低头思故乡。", py:"Dītóu sī gùxiāng.",             en:"then lower it, thinking of home." },
    ],
    context:"China's most-quoted poem. Reciting even one line at a dinner — especially near Mid-Autumn Festival or when a colleague is far from family — signals genuine cultural warmth.",
    blank:{ before:"举头望明月，低头思", after:"。", answer:"故乡", answerPy:"gùxiāng", answerEn:"hometown",
      options:[{hz:"故乡",py:"gùxiāng",en:"hometown"},{hz:"朋友",py:"péngyǒu",en:"friend"},{hz:"公司",py:"gōngsī",en:"company"},{hz:"未来",py:"wèilái",en:"future"}] },
    mc:{ q:"What is the poem's central theme?", options:["Homesickness / longing for one's hometown","Romantic love","A business negotiation","Celebrating a victory"], answer:0,
      explain:"The poem is about a traveler seeing moonlight and being reminded of home — the archetypal expression of homesickness (思乡 sī xiāng) in Chinese literature." },
  },
  {
    id:2, kind:"Poem", title:"《水调歌头》(excerpt)", titlePy:"Shuǐ Diào Gē Tóu", titleEn:"Prelude to Water Melody",
    author:"苏轼", authorPy:"Sū Shì", dynasty:"Song Dynasty",
    lines:[
      { hz:"但愿人长久，", py:"Dàn yuàn rén chángjiǔ,", en:"May we all be blessed with long life," },
      { hz:"千里共婵娟。", py:"Qiānlǐ gòng chánjuān.",  en:"Sharing this beautiful moonlight, though miles apart." },
    ],
    context:"The standard closing toast at Mid-Autumn Festival business dinners. Offering this line shows you understand the sentiment behind the holiday, not just the dumplings.",
    blank:{ before:"但愿人", after:"，千里共婵娟。", answer:"长久", answerPy:"chángjiǔ", answerEn:"long-lasting",
      options:[{hz:"长久",py:"chángjiǔ",en:"long-lasting"},{hz:"平安",py:"píng'ān",en:"safe"},{hz:"成功",py:"chénggōng",en:"successful"},{hz:"快乐",py:"kuàilè",en:"happy"}] },
    mc:{ q:"When would this line be most appropriate to use?", options:["Signing a supplier contract","A toast during Mid-Autumn Festival, especially with someone far from family","Apologizing for a missed deadline","Opening a product presentation"], answer:1,
      explain:"苏轼 wrote this while separated from his brother during 中秋节 (Mid-Autumn Festival). It is the go-to toast when colleagues or partners are apart from loved ones." },
  },
  {
    id:3, kind:"Poem", title:"《送杜少府之任蜀州》(excerpt)", titlePy:"Sòng Dù Shàofǔ Zhī Rèn Shǔzhōu", titleEn:"Farewell to Vice-Prefect Du",
    author:"王勃", authorPy:"Wáng Bó", dynasty:"Tang Dynasty",
    lines:[
      { hz:"海内存知己，", py:"Hǎinèi cún zhījǐ,",     en:"While a true friend remains within the four seas," },
      { hz:"天涯若比邻。", py:"Tiānyá ruò bǐlín.",      en:"even distant horizons feel like a neighbouring gate." },
    ],
    context:"The classic line for parting with a business partner or colleague who is relocating. It reassures the relationship (关系) will hold despite distance.",
    blank:{ before:"海内存", after:"，天涯若比邻。", answer:"知己", answerPy:"zhījǐ", answerEn:"a true friend / soulmate",
      options:[{hz:"知己",py:"zhījǐ",en:"true friend"},{hz:"财富",py:"cáifù",en:"wealth"},{hz:"合同",py:"hétóng",en:"contract"},{hz:"客户",py:"kèhù",en:"client"}] },
    mc:{ q:"This line is best used when...", options:["Closing a price negotiation","Saying farewell to a partner who is moving far away, to reassure the relationship endures","Requesting a discount","Complaining about a delayed shipment"], answer:1,
      explain:"It literally means: as long as a true friend exists, even the ends of the earth feel like next door. A warm, literary way to say 'distance won't change our 关系.'" },
  },
  {
    id:4, kind:"Chengyu", title:"一诺千金", titlePy:"Yī Nuò Qiān Jīn", titleEn:"One Promise, a Thousand Gold",
    author:"Historical idiom", authorPy:"", dynasty:"Han Dynasty origin",
    lines:[
      { hz:"一诺千金。", py:"Yī nuò qiān jīn.", en:"A single promise is worth a thousand pieces of gold." },
    ],
    context:"A four-character idiom (成语) praising someone whose word is completely reliable. Say this about a partner who always delivers — high praise in Chinese business culture.",
    blank:{ before:"一", after:"千金", answer:"诺", answerPy:"nuò", answerEn:"promise",
      options:[{hz:"诺",py:"nuò",en:"promise"},{hz:"言",py:"yán",en:"speech"},{hz:"心",py:"xīn",en:"heart"},{hz:"信",py:"xìn",en:"trust"}] },
    mc:{ q:"一诺千金 is best used to describe...", options:["A very expensive product","Someone who always keeps their promises","A large cash payment","A failed negotiation"], answer:1,
      explain:"It praises absolute trustworthiness — someone whose spoken word needs no contract to be believed. High-value compliment for a supplier or partner." },
  },
  {
    id:5, kind:"Literature", title:"《道德经》(excerpt)", titlePy:"Dàodéjīng", titleEn:"Tao Te Ching",
    author:"老子", authorPy:"Lǎozǐ", dynasty:"Zhou Dynasty",
    lines:[
      { hz:"千里之行，", py:"Qiānlǐ zhī xíng,", en:"A journey of a thousand miles" },
      { hz:"始于足下。", py:"Shǐ yú zúxià.",     en:"begins beneath one's own feet." },
    ],
    context:"Often used to open a presentation about a long-term plan, a market entry strategy, or to encourage a team taking on a big project.",
    blank:{ before:"千里之行，始于", after:"。", answer:"足下", answerPy:"zúxià", answerEn:"one's own feet / right here, right now",
      options:[{hz:"足下",py:"zúxià",en:"one's own feet"},{hz:"努力",py:"nǔlì",en:"effort"},{hz:"计划",py:"jìhuà",en:"a plan"},{hz:"团队",py:"tuánduì",en:"a team"}] },
    mc:{ q:"This line would fit best at the start of...", options:["A complaint email","A presentation launching a long-term strategy or ambitious project","A refusal of a discount","A resignation letter"], answer:1,
      explain:"It's the Chinese equivalent of 'every journey begins with a single step' — a motivating opener for kicking off something ambitious." },
  },
  {
    id:6, kind:"Chengyu", title:"人无信不立", titlePy:"Rén Wú Xìn Bù Lì", titleEn:"Without Trust, One Cannot Stand",
    author:"孔子 (attributed)", authorPy:"Kǒngzǐ", dynasty:"Spring and Autumn period",
    lines:[
      { hz:"人无信不立。", py:"Rén wú xìn bù lì.", en:"A person without trustworthiness cannot stand (in society)." },
    ],
    context:"A Confucian principle underlying Chinese business ethics — 信 (trust/credibility) is treated as the foundation of any relationship, not a bonus.",
    blank:{ before:"人无", after:"不立。", answer:"信", answerPy:"xìn", answerEn:"trust / credibility",
      options:[{hz:"信",py:"xìn",en:"trust"},{hz:"钱",py:"qián",en:"money"},{hz:"名",py:"míng",en:"fame"},{hz:"才",py:"cái",en:"talent"}] },
    mc:{ q:"This saying reflects which core business value?", options:["Aggressive negotiation","Trustworthiness as the foundation of any relationship","Speed of delivery","Low pricing"], answer:1,
      explain:"Attributed to Confucius — it argues that without 信 (credibility), a person has no standing at all. It's often cited to explain why Chinese partners value reputation over contracts alone." },
  },
];

const P1_TITLES = ["Pinyin Bridge","The 4 Tones","Radicals","Business Chars"];
const P2_TITLES = ["Greetings","Numbers & Money","Company Structure","Business Culture"];
const P3_TITLES = ["Business Emails","Meeting Language","Negotiation","Formal vs Casual"];
const P4_TITLES = ["Contract Language","Presentations","Industry Vocab","Etiquette & Protocol"];

// ── Onboarding ─────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [step, setStep] = useState(0);
  const [sit,  setSit]  = useState(null);
  const [lvl,  setLvl]  = useState(null);

  const SITUATIONS = [
    { id:"supplier",  label:"Negotiating with suppliers", icon:"🏭", desc:"Price, MOQ, delivery terms"        },
    { id:"meetings",  label:"Meeting Chinese clients",    icon:"🤝", desc:"Introductions, presentations"      },
    { id:"emails",    label:"Writing business emails",    icon:"📧", desc:"Formal correspondence"             },
    { id:"contracts", label:"Reviewing contracts",        icon:"📋", desc:"Terms, clauses, signing"           },
  ];

  const LEVELS = [
    { id:0, label:"Starting from zero",           desc:"I have never studied Mandarin"    },
    { id:1, label:"I can speak some",              desc:"But I cannot read or write"       },
    { id:2, label:"I can read basic characters",   desc:"Some vocabulary and Pinyin"       },
    { id:3, label:"Conversational level",           desc:"I need professional fluency"      },
  ];

  const PATHS = {
    supplier:  { label:"Supplier Negotiation",    route:{phase:3,lesson:2}, startLabel:"Phase 3, Lesson 11 — Negotiation Phrases",    timeline:"8 weeks",  outcome:"negotiate price, terms, and delivery with Chinese suppliers",  words:[{hz:"报价",py:"bàojià",en:"Price quote"},{hz:"折扣",py:"zhékòu",en:"Discount"},{hz:"成交",py:"chéngjiāo",en:"Deal"}] },
    meetings:  { label:"Client Meetings",         route:{phase:2,lesson:0}, startLabel:"Phase 2, Lesson 5 — Professional Greetings",   timeline:"4 weeks",  outcome:"greet, introduce yourself, and run meetings with Chinese clients", words:[{hz:"您好",py:"nín hǎo",en:"Hello (formal)"},{hz:"名片",py:"míngpiàn",en:"Business card"},{hz:"幸会",py:"xìng huì",en:"Pleased to meet"}] },
    emails:    { label:"Business Emails",         route:{phase:3,lesson:0}, startLabel:"Phase 3, Lesson 9 — Business Email Writing",   timeline:"6 weeks",  outcome:"write and read professional Chinese business emails",               words:[{hz:"尊敬的",py:"zūnjìng de",en:"Dear (formal)"},{hz:"附件",py:"fùjiàn",en:"Attachment"},{hz:"此致敬礼",py:"cǐzhì jìnglǐ",en:"Yours sincerely"}] },
    contracts: { label:"Contracts & Agreements",  route:{phase:4,lesson:0}, startLabel:"Phase 4, Lesson 13 — Contract Language",       timeline:"10 weeks", outcome:"read, understand, and discuss Chinese contracts confidently",       words:[{hz:"甲方",py:"jiǎfāng",en:"Party A"},{hz:"违约金",py:"wéiyuē jīn",en:"Breach penalty"},{hz:"签字盖章",py:"qiānzì gàizhāng",en:"Sign and seal"}] },
  };

  const sp         = sit ? PATHS[sit] : null;
  const canProceed = sit !== null && lvl !== null;

  function getRoute() {
    if (!sp) return { phase:1, lesson:0, tab:"lesson" };
    if (lvl <= 1) return { phase:1, lesson:0, tab:"lesson" };
    return { phase:sp.route.phase, lesson:sp.route.lesson, tab:"lesson" };
  }

  /* Screen 0 — Welcome */
  if (step===0) return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,maxWidth:480,margin:"0 auto"}}>
      <div style={{fontSize:88,fontWeight:900,color:C.red,lineHeight:1,marginBottom:20,letterSpacing:-4}}>商</div>
      <div style={{fontSize:26,fontWeight:900,color:"#fff",textAlign:"center",lineHeight:1.25,marginBottom:12,letterSpacing:-.5}}>
        Business Chinese<br/>for Deal Makers.
      </div>
      <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",textAlign:"center",lineHeight:1.8,marginBottom:44,maxWidth:300}}>
        The language of contracts, negotiations, and business relationships — built for professionals who need results, not textbook theory.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:300}}>
        <button onClick={()=>setStep(1)} style={{width:"100%",padding:16,background:C.red,color:"#fff",border:"none",borderRadius:14,fontWeight:800,fontSize:16,cursor:"pointer",letterSpacing:.3}}>
          Begin →
        </button>
        <button onClick={()=>onStart({phase:1,lesson:0,tab:"roadmap"})} style={{width:"100%",padding:14,background:"transparent",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:14,fontWeight:600,fontSize:13,cursor:"pointer"}}>
          Skip — take me to the module
        </button>
      </div>
      <div style={{marginTop:44,display:"flex",gap:28}}>
        {["16 Lessons","48 Words","4 Phases"].map(l=>(
          <div key={l} style={{textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:11,letterSpacing:.5}}>{l}</div>
        ))}
      </div>
    </div>
  );

  /* Screen 1 — Situation & Level */
  if (step===1) return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"28px 20px",maxWidth:480,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
        <button onClick={()=>setStep(0)} style={{background:"none",border:"none",color:C.navy,fontSize:18,cursor:"pointer",padding:"4px 8px",marginLeft:-8}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:18,color:C.navy}}>Two quick questions.</div>
          <div style={{fontSize:13,color:"#888",marginTop:2}}>We will build your personalised path.</div>
        </div>
        <div style={{background:C.light,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:C.navy}}>1 of 2</div>
      </div>

      <div style={{fontWeight:700,color:C.navy,marginBottom:10,fontSize:14}}>What is your most urgent business need?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:22}}>
        {SITUATIONS.map(s=>{
          const sel=sit===s.id;
          return (
            <button key={s.id} onClick={()=>setSit(s.id)} style={{background:sel?C.navy:C.white,border:`2px solid ${sel?C.navy:C.light}`,borderRadius:14,padding:14,textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontWeight:700,color:sel?"#fff":C.navy,fontSize:13,lineHeight:1.3,marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:11,color:sel?"rgba(255,255,255,0.6)":"#999",lineHeight:1.4}}>{s.desc}</div>
            </button>
          );
        })}
      </div>

      <div style={{fontWeight:700,color:C.navy,marginBottom:10,fontSize:14}}>How much Mandarin do you know?</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>
        {LEVELS.map(l=>{
          const sel=lvl===l.id;
          return (
            <button key={l.id} onClick={()=>setLvl(l.id)} style={{background:sel?C.navy:C.white,border:`2px solid ${sel?C.navy:C.light}`,borderRadius:12,padding:"11px 14px",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .15s"}}>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?"#fff":"#ccc"}`,background:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {sel && <div style={{width:9,height:9,borderRadius:"50%",background:C.red}}/>}
              </div>
              <div>
                <div style={{fontWeight:700,color:sel?"#fff":C.navy,fontSize:14}}>{l.label}</div>
                <div style={{fontSize:12,color:sel?"rgba(255,255,255,0.6)":"#999",marginTop:1}}>{l.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={()=>setStep(2)} disabled={!canProceed} style={{width:"100%",padding:16,background:canProceed?C.red:"#ddd",color:canProceed?"#fff":"#aaa",border:"none",borderRadius:14,fontWeight:800,fontSize:15,cursor:canProceed?"pointer":"not-allowed",transition:"all .2s"}}>
        See my learning path →
      </button>
    </div>
  );

  /* Screen 2 — Personalised Path */
  const route      = getRoute();
  const isRerouted = lvl <= 1 && sp.route.phase > 1;
  const sitIcon    = SITUATIONS.find(s=>s.id===sit)?.icon;
  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"28px 20px",maxWidth:480,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
        <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:C.navy,fontSize:18,cursor:"pointer",padding:"4px 8px",marginLeft:-8}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:18,color:C.navy}}>Your learning path.</div>
          <div style={{fontSize:13,color:"#888",marginTop:2}}>Built around your goal and level.</div>
        </div>
        <div style={{background:C.light,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:C.navy}}>2 of 2</div>
      </div>

      <div style={{background:C.navy,borderRadius:16,padding:16,marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:28}}>{sitIcon}</span>
        <div>
          <div style={{fontWeight:600,color:"rgba(255,255,255,0.55)",fontSize:11,marginBottom:2}}>YOUR GOAL</div>
          <div style={{fontWeight:800,color:"#fff",fontSize:15}}>{sp.label}</div>
        </div>
      </div>

      <div style={{background:C.white,border:`2px solid ${C.red}`,borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{fontWeight:700,color:C.red,fontSize:11,marginBottom:6,letterSpacing:.5}}>START HERE</div>
        <div style={{fontWeight:800,color:C.navy,fontSize:14,lineHeight:1.4}}>
          {route.phase===1 ? "Phase 1, Lesson 1 — The Pinyin Bridge" : sp.startLabel}
        </div>
        {isRerouted && (
          <div style={{background:"#FFF8E7",borderRadius:8,padding:"8px 10px",fontSize:12,color:"#666",lineHeight:1.6,marginTop:10}}>
            Since you cannot yet read characters, we will build your literacy foundation in Phase 1 first. You will reach {sp.label} content within a few weeks.
          </div>
        )}
      </div>

      <div style={{fontWeight:700,color:C.navy,fontSize:13,marginBottom:10}}>Priority vocabulary for your situation:</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {sp.words.map((w,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:12,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:C.navy,lineHeight:1,marginBottom:4}}>{w.hz}</div>
            <div style={{fontSize:11,color:C.red,fontWeight:600,marginBottom:2}}>{w.py}</div>
            <div style={{fontSize:11,color:"#666",marginBottom:6}}>{w.en}</div>
            <SpeakBtn text={w.hz} small />
          </div>
        ))}
      </div>

      <div style={{background:C.light,borderRadius:14,padding:14,marginBottom:24}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
          <span style={{fontSize:26,fontWeight:900,color:C.red}}>{sp.timeline}</span>
          <span style={{fontSize:12,color:"#888"}}>of 20-minute daily sessions</span>
        </div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>You will be able to {sp.outcome}.</div>
        <div style={{fontSize:11,color:"#aaa",marginTop:6,lineHeight:1.5}}>A realistic estimate. Consistent daily practice is the single biggest factor.</div>
      </div>

      <button onClick={()=>onStart(route)} style={{width:"100%",padding:16,background:C.red,color:"#fff",border:"none",borderRadius:14,fontWeight:800,fontSize:16,cursor:"pointer",marginBottom:10}}>
        Start Learning →
      </button>
      <button onClick={()=>onStart({phase:1,lesson:0,tab:"roadmap"})} style={{width:"100%",padding:12,background:"transparent",color:"#bbb",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
        View full roadmap instead
      </button>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────
function App({ initPhase=1, initLesson=0, initTab="roadmap" }) {
  const [tab,      setTab]      = useState(initTab);
  const [phase,    setPhase]    = useState(initPhase);
  const [p1Page,   setP1Page]   = useState(initPhase===1 ? initLesson : 0);
  const [p2Page,   setP2Page]   = useState(initPhase===2 ? initLesson : 0);
  const [p3Page,   setP3Page]   = useState(initPhase===3 ? initLesson : 0);
  const [p4Page,   setP4Page]   = useState(initPhase===4 ? initLesson : 0);
  const [toneOpen, setToneOpen] = useState(null);
  const [cardIdx,  setCardIdx]  = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [vFilter,  setVFilter]  = useState(0);
  const [quizIdx,  setQuizIdx]  = useState(0);
  const [answer,   setAnswer]   = useState("");
  const [result,   setResult]   = useState(null);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);

  // Poetry & Literature state
  const [poemIdx,      setPoemIdx]      = useState(0);
  const [poemStage,    setPoemStage]    = useState("read");   // read | blank | mc | result
  const [blankPick,    setBlankPick]    = useState(null);
  const [blankResult,  setBlankResult]  = useState(null);      // ok | wrong
  const [mcPick,       setMcPick]       = useState(null);
  const [mcResult,     setMcResult]     = useState(null);      // ok | wrong
  const [poemScore,    setPoemScore]    = useState(0);
  const [poemDone,     setPoemDone]     = useState(false);

  function pickBlank(opt) {
    if (blankResult) return;
    setBlankPick(opt.hz);
    const ok = opt.hz === POETRY_ITEMS[poemIdx].blank.answer;
    setBlankResult(ok ? "ok" : "wrong");
  }
  function pickMc(i) {
    if (mcResult) return;
    setMcPick(i);
    const ok = i === POETRY_ITEMS[poemIdx].mc.answer;
    setMcResult(ok ? "ok" : "wrong");
    if (ok && blankResult==="ok") setPoemScore(s=>s+1);
  }
  function nextPoem() {
    if (poemIdx+1 >= POETRY_ITEMS.length) { setPoemDone(true); return; }
    setPoemIdx(i=>i+1); setPoemStage("read"); setBlankPick(null); setBlankResult(null); setMcPick(null); setMcResult(null);
  }
  function resetPoetry() { setPoemIdx(0); setPoemStage("read"); setBlankPick(null); setBlankResult(null); setMcPick(null); setMcResult(null); setPoemScore(0); setPoemDone(false); }

  const VLIST = vFilter===0 ? ALL_VOCAB
              : vFilter===1 ? P1_VOCAB
              : vFilter===2 ? P2_VOCAB
              : vFilter===3 ? P3_VOCAB
              : P4_VOCAB;

  function checkAnswer() {
    if (!answer.trim()) return;
    const c = QUIZ_ALL[quizIdx];
    const ok = answer.trim().toLowerCase() === c.en.toLowerCase();
    setResult(ok ? "ok" : "wrong");
    if (ok) setScore(s => s + 1);
  }
  function nextQuiz() {
    if (quizIdx+1 >= QUIZ_ALL.length) { setDone(true); return; }
    setQuizIdx(i=>i+1); setAnswer(""); setResult(null);
  }
  function resetQuiz() { setQuizIdx(0); setAnswer(""); setResult(null); setScore(0); setDone(false); }

  // ── Phase 1 Lesson Pages ───────────────────────────────────
  function renderP1() {

    /* P1 — Page 0: Pinyin Bridge */
    if (p1Page===0) return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.red},#8B1F17)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>拼</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 1 · The Pinyin Bridge</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>Connect what you already hear → written form</div>
        </div>
        <p style={{color:C.navy,lineHeight:1.75,marginBottom:14}}>
          <strong>Your advantage:</strong> You already know many Mandarin sounds from listening. Pinyin writes those sounds in Latin letters — it's the bridge from the spoken language you know to written Chinese.
        </p>
        <div style={{background:"#FFF8E7",border:`2px solid ${C.gold}`,borderRadius:12,padding:14,marginBottom:18}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>🎯 Pinyin is how you type Chinese</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>All Chinese typing on phones uses Pinyin input — type the sounds, select the character. Knowing Pinyin = typing emails and WeChat messages professionally.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:10}}>Words you know → now in Pinyin:</div>
        {[["你好","nǐ hǎo","Hello"],["谢谢","xièxiè","Thank you"],["公司","gōngsī","Company"],["老板","lǎobǎn","Boss"],["没问题","méi wèntí","No problem"]].map(([hz,py,en])=>(
          <div key={hz} style={{display:"flex",alignItems:"center",gap:10,background:C.light,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <SpeakBtn text={hz} small />
            <span style={{fontSize:22,fontWeight:900,color:C.navy,minWidth:56}}>{hz}</span>
            <span style={{color:C.red,fontWeight:700,minWidth:84,fontSize:14}}>{py}</span>
            <span style={{color:"#666",fontSize:13}}>{en}</span>
          </div>
        ))}
        <div style={{background:C.light,borderRadius:12,padding:14,marginTop:8}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:8}}>Tricky sounds (differ from English):</div>
          {[["x","Between 'sh' and 's' — tongue forward","xièxiè"],["q","Like 'ch' but tongue forward","qǐng (请 = please)"],["zh","Like 'j' in judge — retroflex","zhōng (中 = China)"],["r","Between English 'r' and 'zh'","rén (人 = person)"]].map(([l,h,e])=>(
            <div key={l} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
              <span style={{background:C.red,color:"#fff",borderRadius:6,padding:"3px 10px",fontWeight:800,fontSize:16,minWidth:28,textAlign:"center"}}>{l}</span>
              <div><div style={{fontSize:13,color:"#444"}}>{h}</div><div style={{fontSize:12,color:C.red,fontWeight:600}}>e.g. {e}</div></div>
            </div>
          ))}
        </div>
      </div>
    );

    /* P1 — Page 1: 4 Tones */
    if (p1Page===1) return (
      <div>
        <div style={{fontWeight:800,fontSize:20,color:C.navy,marginBottom:4}}>The 4 Tones</div>
        <div style={{color:"#666",fontSize:14,marginBottom:12}}>Same syllable, 4 pitches = 4 completely different meanings.</div>
        <div style={{background:"#FFF0F0",border:`2px solid ${C.red}`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontWeight:700,color:C.red,marginBottom:4}}>⚠️ Business stakes</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>"mài" (卖) = to sell; "mǎi" (买) = to buy. One wrong tone in a negotiation and you've said the exact opposite of what you meant. Tones signal credibility.</div>
        </div>
        {TONES.map((t,i)=>(
          <div key={i} style={{border:`2px solid ${toneOpen===i?t.color:C.light}`,borderRadius:14,padding:14,marginBottom:10,background:C.white,cursor:"pointer",transition:"border .2s"}} onClick={()=>setToneOpen(toneOpen===i?null:i)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{background:t.color,color:"#fff",borderRadius:10,padding:"4px 12px",fontWeight:900,fontSize:20,minWidth:44,textAlign:"center"}}>{t.mark}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:C.navy}}>{t.num} Tone {t.shape}</div>
                <div style={{fontSize:13,color:"#666"}}>{t.desc}</div>
              </div>
              <SpeakBtn text={t.word.hz} small />
              <span style={{color:"#aaa",fontSize:11,marginLeft:4}}>{toneOpen===i?"▲":"▼"}</span>
            </div>
            {toneOpen===i && (
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.light}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:C.light,borderRadius:10,padding:12}}>
                  <div style={{fontSize:10,color:"#aaa",marginBottom:4,letterSpacing:.5}}>EXAMPLE</div>
                  <div style={{fontSize:36,fontWeight:900,color:C.navy}}>{t.word.hz}</div>
                  <div style={{color:t.color,fontWeight:700}}>{t.word.py}</div>
                  <div style={{fontSize:12,color:"#666"}}>{t.word.en}</div>
                </div>
                <div style={{background:"#EBF5EB",borderRadius:10,padding:12}}>
                  <div style={{fontSize:10,color:"#aaa",marginBottom:4,letterSpacing:.5}}>BUSINESS USE</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:24,fontWeight:900,color:C.navy}}>{t.biz.hz}</span>
                    <SpeakBtn text={t.biz.hz} small />
                  </div>
                  <div style={{color:t.color,fontWeight:700,fontSize:14}}>{t.biz.py}</div>
                  <div style={{fontSize:12,color:"#666"}}>{t.biz.en}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div style={{background:C.light,borderRadius:12,padding:12}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>Neutral / 0th Tone</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6,flex:1}}>Some syllables carry no tone — short and unstressed. Example: 吗 (ma) at the end of yes/no questions. 是吗？(Is that right?)</div>
            <SpeakBtn text="是吗" small />
          </div>
        </div>
      </div>
    );

    /* P1 — Page 2: Radicals */
    if (p1Page===2) return (
      <div>
        <div style={{fontWeight:800,fontSize:20,color:C.navy,marginBottom:4}}>Radicals: Decode Any Character</div>
        <div style={{color:"#666",fontSize:14,marginBottom:12}}>Chinese characters are built from ~200 radicals — visual building blocks that carry meaning clues.</div>
        <div style={{background:"#E8F0FF",border:`2px solid ${C.blue}`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontWeight:700,color:C.blue,marginBottom:4}}>💡 The key insight</div>
          <div style={{fontSize:13,color:"#444",lineHeight:1.65}}>银行 (yínháng = bank) contains 金 (metal/money) inside 银. The radical is a meaning clue baked into the character. Know ~30 radicals and you can make educated guesses about unfamiliar characters.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:10}}>6 high-value business radicals:</div>
        {RADICALS.map((r,i)=>(
          <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:14,marginBottom:8}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{fontSize:36,fontWeight:900,color:C.red,lineHeight:1}}>{r.r}</div>
              <SpeakBtn text={r.r} small />
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                <span style={{fontWeight:800,color:C.navy}}>{r.en}</span>
                <span style={{color:C.red,fontSize:13,fontWeight:600}}>{r.py}</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {r.chars.map((c,j)=><span key={j} style={{background:C.light,borderRadius:6,padding:"3px 8px",fontSize:13,color:"#555"}}>{c}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    /* P1 — Page 3: Business Characters */
    return (
      <div>
        <div style={{fontWeight:800,fontSize:20,color:C.navy,marginBottom:4}}>First 12 Business Characters</div>
        <div style={{color:"#666",fontSize:14,marginBottom:14}}>Study 3 per day. Tap 🔊 to hear each one. Drill with the Vocab flashcards.</div>
        {P1_VOCAB.map((v,i)=>{
          const colors=[C.red,C.blue,C.green,C.purple];
          return (
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:14,marginBottom:8}}>
              <div style={{background:colors[i%4],color:"#fff",borderRadius:10,padding:"6px 10px",minWidth:50,textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:900,lineHeight:1.1}}>{v.hz}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontWeight:800,color:C.navy}}>{v.en}</span>
                  <span style={{color:C.red,fontSize:13,fontWeight:600}}>{v.py}</span>
                  <SpeakBtn text={v.hz} small />
                </div>
                <div style={{fontSize:13,color:"#777",fontStyle:"italic"}}>{v.use}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Phase 2 Lesson Pages ───────────────────────────────────
  function renderP2() {

    /* P2 — Page 0: Professional Greetings */
    if (p2Page===0) return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.green},#0E5233)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>礼</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 5 · Professional Greetings</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>First impressions in Chinese business are permanent</div>
        </div>
        <div style={{background:"#FFF8E7",border:`2px solid ${C.gold}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>🤝 The rule: formality first</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Always start formal and let the other party set the tone for informality. Using 您好 instead of 你好 costs nothing and gains significant respect.</div>
        </div>
        {GREETINGS.map((g,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontSize:22,fontWeight:900,color:C.navy,flex:1}}>{g.hz}</div>
              <div style={{flex:2}}>
                <div style={{color:C.red,fontWeight:700,fontSize:14}}>{g.py}</div>
                <div style={{fontWeight:600,color:C.navy,fontSize:14}}>{g.en}</div>
              </div>
              <SpeakBtn text={g.hz} />
            </div>
            <div style={{background:C.light,borderRadius:8,padding:10,fontSize:13,color:"#555",lineHeight:1.6}}>{g.note}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:16,color:"#fff",marginTop:4}}>
          <div style={{fontWeight:700,marginBottom:10}}>🎯 A complete first-meeting script</div>
          {[["您好！幸会幸会。","Nín hǎo! Xìng huì xìng huì.","Hello! Very pleased to meet you."],["我叫 Jericho，来自 Pinya Co.","Wǒ jiào Jericho, láizì Pinya Co.","I'm Jericho, from Pinya Co."],["请多关照。","Qǐng duō guānzhào.","Please look after me."]].map(([hz,py,en])=>(
            <div key={hz} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.12)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,flex:1}}>{hz}</span>
                <SpeakBtn text={hz} small />
              </div>
              <div style={{opacity:.65,fontSize:12,marginBottom:2}}>{py}</div>
              <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>{en}</div>
            </div>
          ))}
        </div>
      </div>
    );

    /* P2 — Page 1: Numbers & Money */
    if (p2Page===1) return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.blue},#0D2750)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>数</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 6 · Numbers & Money</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>Count in 万 or you'll quote the wrong price</div>
        </div>
        <div style={{background:"#FFF0F0",border:`2px solid ${C.red}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.red,marginBottom:4}}>⚠️ Critical: Chinese counts in 万 (10,000)</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>1,000,000 in English = 100万 in Chinese. If you say 一百万 (yī bǎi wàn) that means 1 million. The 万 unit trips up almost every non-native speaker in price negotiations.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:10}}>Numbers 0–100M:</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {NUMBERS.map((n,i)=>{
            const isKey=n.en.includes("⭐");
            return (
              <div key={i} style={{background:isKey?`${C.green}18`:C.light,border:isKey?`2px solid ${C.green}`:"none",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:900,color:C.navy,lineHeight:1,marginBottom:2}}>{n.hz}</div>
                <div style={{color:C.red,fontSize:11,fontWeight:600,marginBottom:2}}>{n.py}</div>
                <div style={{fontSize:11,color:"#666",marginBottom:4}}>{n.en.replace("⭐","")}</div>
                <SpeakBtn text={n.hz} small />
              </div>
            );
          })}
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:10}}>Business money phrases:</div>
        {MONEY_PHRASES.map((m,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:C.white,border:`1px solid ${C.light}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:17,fontWeight:800,color:C.navy}}>{m.hz}</span>
                <span style={{color:C.red,fontSize:12,fontWeight:600}}>{m.py}</span>
              </div>
              <div style={{fontSize:13,color:"#666"}}>{m.en}</div>
            </div>
            <SpeakBtn text={m.hz} small />
          </div>
        ))}
        <div style={{background:C.light,borderRadius:12,padding:14,marginTop:4}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:8}}>Practice: reading business prices</div>
          {[["50万元","wǔ shí wàn yuán","500,000 RMB"],["两千五百美元","liǎng qiān wǔ bǎi měiyuán","$2,500 USD"],["一千两百万","yī qiān liǎng bǎi wàn","12 million"]].map(([hz,py,en])=>(
            <div key={hz} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.white}`}}>
              <SpeakBtn text={hz} small />
              <span style={{fontWeight:700,color:C.navy,fontSize:15,flex:1}}>{hz}</span>
              <span style={{color:C.red,fontSize:12}}>{py}</span>
              <span style={{color:"#666",fontSize:12}}>{en}</span>
            </div>
          ))}
        </div>
      </div>
    );

    /* P2 — Page 2: Company Structure */
    if (p2Page===2) return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.navy},#0A1628)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>组</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 7 · Company Structure</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>Titles matter — never get a rank wrong in Chinese business</div>
        </div>
        <div style={{background:"#FFF8E7",border:`2px solid ${C.gold}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>💡 How to address people by title</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Always use surname + title: 张总 (Zhāng Zǒng = GM Zhang), 李经理 (Lǐ Jīnglǐ = Manager Li). Never use first names until explicitly invited. Hierarchy is visible, expected, and respected.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:10}}>Corporate hierarchy (top → bottom):</div>
        {ROLES.map((r,i)=>{
          const rankColor=i<2?C.red:i<4?C.blue:i<6?C.purple:"#888";
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:12,marginBottom:8}}>
              <div style={{background:rankColor,color:"#fff",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{r.rank}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:18,fontWeight:900,color:C.navy}}>{r.hz}</span>
                  <span style={{color:C.red,fontSize:12,fontWeight:600}}>{r.py}</span>
                </div>
                <div style={{fontSize:13,color:"#666"}}>{r.en}</div>
              </div>
              <SpeakBtn text={r.hz} small />
            </div>
          );
        })}
        <div style={{fontWeight:700,color:C.navy,marginTop:16,marginBottom:10}}>Key departments:</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {DEPARTMENTS.map((d,i)=>(
            <div key={i} style={{background:C.light,borderRadius:10,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <span style={{fontSize:18,fontWeight:900,color:C.navy}}>{d.hz}</span>
                <SpeakBtn text={d.hz} small />
              </div>
              <div style={{color:C.red,fontSize:12,fontWeight:600,marginBottom:2}}>{d.py}</div>
              <div style={{fontSize:13,color:"#666"}}>{d.en}</div>
            </div>
          ))}
        </div>
      </div>
    );

    /* P2 — Page 3: Business Culture */
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.purple},#3D1A6E)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>文</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 8 · Business Culture</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>关系 and 面子 — the invisible rules behind every deal</div>
        </div>
        <div style={{background:"#F5F0FF",border:`2px solid ${C.purple}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.purple,marginBottom:4}}>🧠 The cultural layer</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Chinese business has two invisible layers beneath every transaction: 关系 (who you know and trust) and 面子 (how you maintain dignity). Understanding both is more valuable than any phrase book.</div>
        </div>
        {CULTURE_CONCEPTS.map((c,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontSize:24,fontWeight:900,color:C.navy,flex:1}}>{c.hz}</div>
              <div style={{flex:2}}>
                <div style={{color:C.red,fontWeight:700,fontSize:13}}>{c.py}</div>
                <div style={{fontWeight:700,color:C.navy,fontSize:14}}>{c.en}</div>
              </div>
              <SpeakBtn text={c.hz} />
            </div>
            <div style={{background:C.light,borderRadius:8,padding:10,fontSize:13,color:"#555",lineHeight:1.65}}>{c.note}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:16,color:"#fff",marginTop:4}}>
          <div style={{fontWeight:700,marginBottom:12}}>🍽 Business dinner essentials</div>
          {[["干杯！","Gān bēi!","Cheers / Bottoms up"],["您先请。","Nín xiān qǐng.","After you / Please go first"],["感谢今天的招待。","Gǎnxiè jīntiān de zhāodài.","Thank you for today's hospitality"]].map(([hz,py,en])=>(
            <div key={hz} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,flex:1}}>{hz}</span>
                <SpeakBtn text={hz} small />
              </div>
              <div style={{opacity:.65,fontSize:12,marginBottom:2}}>{py}</div>
              <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>{en}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Phase 3 Lesson Pages ───────────────────────────────────
  function renderP3() {
    const teal = "#1A7A6E";

    /* P3 — Page 0: Business Emails */
    if (p3Page===0) return (
      <div>
        <div style={{background:`linear-gradient(135deg,${teal},#0D4A43)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>邮</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 9 · Business Email Writing</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>The structure every professional Chinese email must follow</div>
        </div>
        <div style={{background:"#FFF8E7",border:`2px solid ${C.gold}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>📧 Why email structure matters in Chinese</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Chinese business emails follow a stricter protocol than English ones. An email that skips the proper opening or closing signals inexperience. Getting this right signals professionalism before a single content word is read.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12}}>Email anatomy — part by part:</div>
        {EMAIL_PARTS.map((p,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <div style={{background:teal,color:"#fff",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{p.label}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:15,fontWeight:800,color:C.navy}}>{p.hz}</span>
                  <SpeakBtn text={p.hz} small />
                </div>
                <div style={{color:C.red,fontSize:12,fontWeight:600,marginTop:2}}>{p.py}</div>
                <div style={{color:"#444",fontSize:13,marginTop:2}}>{p.en}</div>
              </div>
            </div>
            <div style={{background:C.light,borderRadius:8,padding:10,fontSize:13,color:"#555",lineHeight:1.6}}>{p.note}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:16,color:"#fff",marginTop:4}}>
          <div style={{fontWeight:700,marginBottom:10}}>📝 A complete sample email</div>
          {[
            ["尊敬的张总，","Zūnjìng de Zhāng Zǒng,","Dear GM Zhang,"],
            ["您好！感谢您的来信。兹就报价事宜向您说明：","Nín hǎo! Gǎnxiè nín de láixìn. Zī jiù bàojià shìyí xiàng nín shuōmíng:","Hello! Thank you for your letter. I am writing regarding the quotation:"],
            ["请查收附件中的报价单，烦请于本周五前回复。","Qǐng cháshōu fùjiàn zhōng de bàojià dān, fán qǐng yú běn zhōuwǔ qián huífù.","Please find the quotation in the attachment; kindly reply by this Friday."],
            ["期待您的回复，此致敬礼。","Qīdài nín de huífù, cǐzhì jìnglǐ.","Looking forward to your reply. Yours sincerely."],
          ].map(([hz,py,en])=>(
            <div key={hz} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:14,flex:1}}>{hz}</span>
                <SpeakBtn text={hz} small />
              </div>
              <div style={{opacity:.65,fontSize:12,marginBottom:2}}>{py}</div>
              <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>{en}</div>
            </div>
          ))}
        </div>
      </div>
    );

    /* P3 — Page 1: Meeting Language */
    if (p3Page===1) return (
      <div>
        <div style={{background:`linear-gradient(135deg,#B5451B,#7A2C10)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>会</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 10 · Meeting Language</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>From opening to action items — the full meeting toolkit</div>
        </div>
        <div style={{background:"#FFF0F0",border:`2px solid #B5451B`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:"#B5451B",marginBottom:4}}>🧠 The unspoken meeting rule</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>In Chinese business meetings, disagreement is rarely expressed directly. Phrases like 我理解您的观点 (I understand your view) followed by a suggestion often means disagreement. Read between the lines.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12}}>Meeting phrases by stage:</div>
        {MEETING_PHRASES.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:14,marginBottom:8}}>
            <div style={{background:i<2?"#B5451B":i<4?C.green:i<6?C.blue:i<7?C.purple:C.navy,color:"#fff",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,alignSelf:"flex-start"}}>{m.stage}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,color:C.navy,fontSize:14}}>{m.hz}</span>
                <SpeakBtn text={m.hz} small />
              </div>
              <div style={{color:C.red,fontSize:12,fontWeight:600,marginBottom:2}}>{m.py}</div>
              <div style={{color:"#666",fontSize:13}}>{m.en}</div>
            </div>
          </div>
        ))}
        <div style={{background:C.light,borderRadius:12,padding:14,marginTop:4}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:6}}>💡 Polite disagreement — the safer version</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:15,fontWeight:700,color:C.navy,flex:1}}>我理解您的观点，但我们可以考虑另一个方案。</span>
            <SpeakBtn text="我理解您的观点，但我们可以考虑另一个方案。" small />
          </div>
          <div style={{color:C.red,fontSize:12,fontWeight:600,marginBottom:4}}>Wǒ lǐjiě nín de guāndiǎn, dàn wǒmen kěyǐ kǎolǜ lìng yīgè fāng'àn.</div>
          <div style={{color:"#555",fontSize:13,fontStyle:"italic"}}>I understand your view, but we could consider an alternative approach.</div>
        </div>
      </div>
    );

    /* P3 — Page 2: Negotiation */
    if (p3Page===2) return (
      <div>
        <div style={{background:`linear-gradient(135deg,#7B3FB0,#4A1A80)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>谈</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 11 · Negotiation Phrases</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>From first interest to closing the deal</div>
        </div>
        <div style={{background:"#F5F0FF",border:`2px solid ${C.purple}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.purple,marginBottom:4}}>🎯 Negotiation culture note</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Chinese negotiations often start with a high anchor and expect counter-offers. Silence after your offer is not rejection — it is thinking time. Never rush it. Patience signals confidence.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12}}>Full negotiation arc — phrase by phrase:</div>
        {NEGOTIATION_PHRASES.map((n,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{background:i===0?C.green:i<3?C.blue:i<5?C.gold:i<6?C.navy:i===6?teal:C.red,color:i===4?"#333":"#fff",borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{n.phase}</div>
              <SpeakBtn text={n.hz} small />
            </div>
            <div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:4}}>{n.hz}</div>
            <div style={{color:C.red,fontSize:12,fontWeight:600,marginBottom:4}}>{n.py}</div>
            <div style={{color:"#555",fontSize:13,fontStyle:"italic"}}>{n.en}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:16,color:"#fff",marginTop:4}}>
          <div style={{fontWeight:700,marginBottom:8}}>⚡ Power phrase to know</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontWeight:700,fontSize:15,flex:1}}>这是我们能给出的最低价了。</span>
            <SpeakBtn text="这是我们能给出的最低价了。" small />
          </div>
          <div style={{opacity:.65,fontSize:12,marginBottom:4}}>Zhè shì wǒmen néng gěi chū de zuìdī jià le.</div>
          <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>This is the lowest price we can offer.</div>
          <div style={{opacity:.65,fontSize:12,marginTop:8}}>Use this to signal the floor of negotiation. If they accept, great. If they push back further, that is when non-price terms (delivery, payment schedule, samples) become the negotiation.</div>
        </div>
      </div>
    );

    /* P3 — Page 3: Formal vs Casual Register */
    const teal2 = "#1A7A6E";
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,#1A4A7A,#0D2750)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>级</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 12 · Formal vs Casual Register</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>Knowing which register you are in is half the battle</div>
        </div>
        <div style={{background:"#E8F0FF",border:`2px solid ${C.blue}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.blue,marginBottom:4}}>📐 The register principle</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Chinese has a sharper formal/informal split than English. Some words exist only in writing (like 兹, 谨). Others are too casual for any client communication. Matching your register to the situation signals cultural intelligence.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:8}}>Formal ↔ Casual side-by-side:</div>
        <div style={{background:C.light,borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",gap:4}}>
          <div style={{flex:1,textAlign:"center",fontWeight:700,color:C.blue,fontSize:12}}>FORMAL (written / client)</div>
          <div style={{width:1,background:"#ccc"}}/>
          <div style={{flex:1,textAlign:"center",fontWeight:700,color:C.green,fontSize:12}}>CASUAL (internal / peers)</div>
        </div>
        {REGISTER_PAIRS.map((r,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr"}}>
              <div style={{padding:12,background:"#EEF4FF"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:16,fontWeight:800,color:C.blue}}>{r.formal}</span>
                  <SpeakBtn text={r.formal.split(" ")[0]} small />
                </div>
              </div>
              <div style={{padding:"12px 8px",background:C.light,display:"flex",alignItems:"center"}}>
                <span style={{fontSize:11,color:"#888",fontWeight:600}}>{r.meaning}</span>
              </div>
              <div style={{padding:12,background:"#EEF8EE"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:16,fontWeight:800,color:C.green}}>{r.casual}</span>
                  <SpeakBtn text={r.casual.split(" ")[0]} small />
                </div>
              </div>
            </div>
            <div style={{padding:"8px 12px",background:C.light,borderTop:`1px solid #ddd`,fontSize:12,color:"#555"}}>{r.tip}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:16,color:"#fff",marginTop:4}}>
          <div style={{fontWeight:700,marginBottom:8}}>🏁 Phase 3 Complete</div>
          <div style={{fontSize:13,lineHeight:1.65,opacity:.85,marginBottom:12}}>You now have the email structure, meeting language, negotiation arc, and register awareness to operate professionally in Chinese business contexts. Phase 4 covers contracts, presentations, and advanced industry vocabulary.</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:10,padding:10,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900}}>36</div>
              <div style={{fontSize:11,opacity:.65,marginTop:2}}>Words learned</div>
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:10,padding:10,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900}}>12</div>
              <div style={{fontSize:11,opacity:.65,marginTop:2}}>Lessons done</div>
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:10,padding:10,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900}}>18</div>
              <div style={{fontSize:11,opacity:.65,marginTop:2}}>Weeks 1–18</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 4 Lesson Pages ───────────────────────────────────
  function renderP4() {
    const gold2 = "#B8860B";

    /* P4 — Page 0: Contract Language */
    if (p4Page===0) return (
      <div>
        <div style={{background:`linear-gradient(135deg,${gold2},#7A5500)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>约</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 13 · Contract Language</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>The terms you must know before signing anything in China</div>
        </div>
        <div style={{background:"#FFF8E7",border:`2px solid ${C.gold}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>⚠️ The chop rule</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>In China, a signature alone does not make a contract legally binding. You need the company's official red stamp (公章 gōngzhāng). Always verify the chop is present before considering anything finalised.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12}}>Essential contract terms:</div>
        {CONTRACT_TERMS.map((t,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontSize:18,fontWeight:900,color:C.navy,flex:1}}>{t.hz}</div>
              <div style={{flex:2}}>
                <div style={{color:C.red,fontWeight:700,fontSize:13}}>{t.py}</div>
                <div style={{fontWeight:700,color:C.navy,fontSize:14}}>{t.en}</div>
              </div>
              <SpeakBtn text={t.hz.split(" ")[0]} small />
            </div>
            <div style={{background:C.light,borderRadius:8,padding:10,fontSize:13,color:"#555",lineHeight:1.65}}>{t.note}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:16,color:"#fff",marginTop:4}}>
          <div style={{fontWeight:700,marginBottom:10}}>📋 Key contract phrases</div>
          {CONTRACT_PHRASES.map((p,i)=>(
            <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:13,flex:1,lineHeight:1.5}}>{p.hz}</span>
                <SpeakBtn text={p.hz} small />
              </div>
              <div style={{opacity:.65,fontSize:11,marginBottom:2}}>{p.py}</div>
              <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>{p.en}</div>
            </div>
          ))}
        </div>
      </div>
    );

    /* P4 — Page 1: Business Presentations */
    if (p4Page===1) return (
      <div>
        <div style={{background:`linear-gradient(135deg,#B5451B,#6B2010)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>演</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 14 · Business Presentations</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>Open strong, present data clearly, close with confidence</div>
        </div>
        <div style={{background:"#FFF0F0",border:`2px solid #B5451B`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:"#B5451B",marginBottom:4}}>🎤 Presentation culture note</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Chinese business audiences expect structured formality: a clear opening that thanks attendees, an explicit agenda, numbered points, and a formal close. Improvisation reads as unpreparedness. Have your structure visible on slides.</div>
        </div>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12}}>Full presentation phrase toolkit:</div>
        {PRES_PHRASES.map((p,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{background:["#B5451B",C.blue,C.navy,C.green,C.purple,C.gold][i]||C.navy,color:i===5?C.navy:"#fff",borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{p.stage}</div>
              <SpeakBtn text={p.hz} small />
            </div>
            <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:4,lineHeight:1.5}}>{p.hz}</div>
            <div style={{color:C.red,fontSize:12,fontWeight:600,marginBottom:4}}>{p.py}</div>
            <div style={{color:"#555",fontSize:13,fontStyle:"italic"}}>{p.en}</div>
          </div>
        ))}
        <div style={{background:C.light,borderRadius:12,padding:14,marginTop:4}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:6}}>💡 Buying time in Q&A</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:14,fontWeight:700,color:C.navy,flex:1}}>这是个很好的问题，让我稍后回复您。</span>
            <SpeakBtn text="这是个很好的问题，让我稍后回复您。" small />
          </div>
          <div style={{color:C.red,fontSize:12,fontWeight:600,marginBottom:4}}>Zhè shì gè hěn hǎo de wèntí, ràng wǒ shāohòu huífù nín.</div>
          <div style={{color:"#555",fontSize:13,fontStyle:"italic"}}>That is a very good question — let me follow up with you afterwards.</div>
        </div>
      </div>
    );

    /* P4 — Page 2: Industry Vocabulary */
    if (p4Page===2) return (
      <div>
        <div style={{background:`linear-gradient(135deg,#1A4A7A,#0D2750)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>业</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 15 · Industry Vocabulary</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>F&B sourcing + tech & digital — tailored to your two business contexts</div>
        </div>
        <div style={{background:"#FFF8E7",border:`2px solid ${C.gold}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.navy,marginBottom:4}}>🎯 Why industry vocab matters</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>General business Chinese gets you to the meeting. Industry-specific vocabulary gets you through it. Suppliers and partners immediately trust someone who speaks their operational language.</div>
        </div>

        <div style={{fontWeight:700,color:C.navy,marginBottom:10}}>🥤 F&B & Sourcing (Pinya Co. context)</div>
        {INDUSTRY_FB.map((v,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:20,fontWeight:900,color:C.navy}}>{v.hz}</span>
                <span style={{color:C.red,fontSize:13,fontWeight:600}}>{v.py}</span>
              </div>
              <div style={{fontSize:13,color:"#666"}}>{v.en}</div>
            </div>
            <SpeakBtn text={v.hz} small />
          </div>
        ))}

        <div style={{fontWeight:700,color:C.navy,marginTop:16,marginBottom:10}}>💻 Tech & Digital (FlyRank context)</div>
        {INDUSTRY_TECH.map((v,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:C.white,border:`1px solid ${C.light}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:18,fontWeight:900,color:C.navy}}>{v.hz}</span>
                <span style={{color:C.red,fontSize:13,fontWeight:600}}>{v.py}</span>
              </div>
              <div style={{fontSize:13,color:"#666"}}>{v.en}</div>
            </div>
            <SpeakBtn text={v.hz} small />
          </div>
        ))}

        <div style={{background:C.navy,borderRadius:12,padding:14,marginTop:8,color:"#fff"}}>
          <div style={{fontWeight:700,marginBottom:6}}>📝 Power sentence for supplier meetings</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:14,flex:1}}>请问贵方的最小起订量和交货期是多少？</span>
            <SpeakBtn text="请问贵方的最小起订量和交货期是多少？" small />
          </div>
          <div style={{opacity:.65,fontSize:12,marginBottom:2}}>Qǐngwèn guìfāng de zuìxiǎo qǐdìng liàng hé jiāohuò qī shì duōshǎo?</div>
          <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>May I ask what your MOQ and delivery lead time are?</div>
        </div>
      </div>
    );

    /* P4 — Page 3: Etiquette & Protocol */
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.purple},#3D1A6E)`,borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:52,fontWeight:900,lineHeight:1,marginBottom:6}}>礼</div>
          <div style={{fontSize:18,fontWeight:800}}>Lesson 16 · Etiquette & Protocol</div>
          <div style={{fontSize:13,opacity:.75,marginTop:4}}>The details that turn a competent foreigner into a trusted partner</div>
        </div>
        <div style={{background:"#F5F0FF",border:`2px solid ${C.purple}`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:C.purple,marginBottom:4}}>🧠 The trust equation</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.65}}>Technical competence gets you in the room. Etiquette keeps you in the relationship. Chinese business partners remember small courtesies — and small missteps — for a long time. These details are not optional.</div>
        </div>
        {ETIQUETTE_NOTES.map((n,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.light}`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:28}}>{n.icon}</span>
              <span style={{fontWeight:800,color:C.navy,fontSize:15}}>{n.title}</span>
            </div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.7}}>{n.body}</div>
          </div>
        ))}
        <div style={{background:C.navy,borderRadius:14,padding:18,color:"#fff",marginTop:4,textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:10}}>🎓</div>
          <div style={{fontWeight:900,fontSize:20,marginBottom:8}}>All 4 Phases Complete</div>
          <div style={{fontSize:13,lineHeight:1.7,opacity:.85,marginBottom:16,padding:"0 4px"}}>
            You have covered 48 business vocabulary words, 16 lessons across phonetics, vocabulary, professional communication, and advanced fluency. You now have the language foundation for real Chinese business interactions.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[["48","Words"],["16","Lessons"],["26","Weeks"],["4","Phases"]].map(([n,l])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:10}}>
                <div style={{fontWeight:900,fontSize:22}}>{n}</div>
                <div style={{fontSize:10,opacity:.6,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,fontSize:12,opacity:.6}}>Next: find a native-speaking conversation partner and practise.</div>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>

      {/* Header */}
      <div style={{background:C.navy,padding:"18px 20px 0",color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{fontSize:42,fontWeight:900,color:C.red,lineHeight:1,letterSpacing:-2}}>中</div>
          <div>
            <div style={{fontWeight:800,fontSize:17}}>Business Chinese</div>
            <div style={{fontSize:11,opacity:.55,marginTop:2}}>All 4 Phases · 🔊 Audio · 26-Week Track · Tailored for Jericho</div>
          </div>
        </div>
        <div style={{display:"flex",gap:1}}>
          {[["roadmap","路 Map"],["lesson","学 Learn"],["vocab","词 Vocab"],["quiz","练 Quiz"],["poetry","诗 Poetry"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 2px",background:tab===id?C.bg:"transparent",color:tab===id?C.navy:"rgba(255,255,255,0.5)",border:"none",borderRadius:"8px 8px 0 0",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .2s",letterSpacing:.3}}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:20}}>

        {/* ══ ROADMAP ══════════════════════════════════════════════ */}
        {tab==="roadmap" && (
          <div>
            <div style={{background:C.white,borderRadius:16,padding:16,marginBottom:16,border:`2px solid ${C.gold}`}}>
              <div style={{fontWeight:800,color:C.navy,marginBottom:10}}>Your Learning Profile</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                {[["Level","Hear & speak some"],["Goal","Business & professional"],["Style","Mix of everything"],["Track","26-week program"]].map(([k,v])=>(
                  <div key={k} style={{background:C.light,borderRadius:8,padding:10}}>
                    <div style={{fontSize:10,color:"#aaa",marginBottom:2}}>{k.toUpperCase()}</div>
                    <div style={{fontWeight:700,color:C.navy,fontSize:13}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#FFF8E7",borderRadius:8,padding:10,fontSize:13,color:"#555",lineHeight:1.6}}>
                <strong style={{color:C.gold}}>Your edge:</strong> You already know sounds and some vocabulary. Phase 1 moves faster for you — it's connecting what you hear to how it's written.
              </div>
            </div>

            {PHASES.map(p=>(
              <div key={p.id} style={{background:C.white,borderRadius:16,padding:16,marginBottom:12,border:p.active?`2px solid ${p.bg}`:`1px solid ${C.light}`,opacity:p.active?1:.75}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{background:p.bg,color:"#fff",borderRadius:12,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontWeight:900,flexShrink:0}}>{p.hanzi}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontWeight:800,color:C.navy}}>Phase {p.id}: {p.title}</span>
                      {p.active && <span style={{background:p.bg,color:"#fff",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>ACTIVE</span>}
                    </div>
                    <div style={{color:"#888",fontSize:12,marginTop:2}}>{p.weeks}</div>
                  </div>
                </div>
                <div style={{background:C.light,borderRadius:8,padding:10,fontSize:13,color:"#555"}}>🎯 {p.goal}</div>
              </div>
            ))}

            <div style={{background:C.navy,borderRadius:16,padding:18,color:"#fff",textAlign:"center"}}>
              <div style={{fontSize:11,opacity:.55,marginBottom:4,letterSpacing:.5}}>DAILY COMMITMENT</div>
              <div style={{fontWeight:900,fontSize:28}}>20–30 min / day</div>
              <div style={{fontSize:13,opacity:.6,marginTop:4}}>= Business Chinese in 6 months</div>
              <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:14}}>
                {[["📖 Learn","10 min"],["🃏 Vocab","10 min"],["✏️ Quiz","10 min"]].map(([l,t])=>(
                  <div key={l}><div style={{fontWeight:700,fontSize:14}}>{t}</div><div style={{fontSize:11,opacity:.55}}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ LESSONS ═══════════════════════════════════════════════ */}
        {tab==="lesson" && (
          <div>
            <AudioDiag />

            {/* Phase selector — 2×2 grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
              {[[1,"① Literacy",C.red],[2,"② Vocabulary",C.green],[3,"③ Communication","#1A7A6E"],[4,"④ Fluency",C.purple]].map(([p,label,col])=>(
                <button key={p} onClick={()=>setPhase(p)} style={{padding:"9px 6px",background:phase===p?col:C.light,color:phase===p?"#fff":C.navy,border:"none",borderRadius:12,fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .2s"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Sub-lesson pills */}
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
              {(phase===1?P1_TITLES:phase===2?P2_TITLES:phase===3?P3_TITLES:P4_TITLES).map((title,i)=>{
                const active=phase===1?p1Page===i:phase===2?p2Page===i:phase===3?p3Page===i:p4Page===i;
                const col=phase===1?C.red:phase===2?C.green:phase===3?"#1A7A6E":C.purple;
                return (
                  <button key={i} onClick={()=>phase===1?setP1Page(i):phase===2?setP2Page(i):phase===3?setP3Page(i):setP4Page(i)} style={{background:active?col:C.light,color:active?"#fff":C.navy,border:"none",borderRadius:20,padding:"6px 14px",fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                    {i+(phase===1?1:phase===2?5:phase===3?9:13)}. {title}
                  </button>
                );
              })}
            </div>

            {phase===1?renderP1():phase===2?renderP2():phase===3?renderP3():renderP4()}

            {/* Lesson navigation */}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              {(phase===1?p1Page:phase===2?p2Page:phase===3?p3Page:p4Page)>0 && (
                <button onClick={()=>phase===1?setP1Page(p=>p-1):phase===2?setP2Page(p=>p-1):phase===3?setP3Page(p=>p-1):setP4Page(p=>p-1)} style={{flex:1,padding:14,background:C.light,color:C.navy,border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>← Back</button>
              )}
              {(phase===1?p1Page:phase===2?p2Page:phase===3?p3Page:p4Page)<3 ? (
                <button onClick={()=>phase===1?setP1Page(p=>p+1):phase===2?setP2Page(p=>p+1):phase===3?setP3Page(p=>p+1):setP4Page(p=>p+1)} style={{flex:1,padding:14,background:phase===1?C.red:phase===2?C.green:phase===3?"#1A7A6E":C.purple,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Next →</button>
              ) : phase===1 ? (
                <button onClick={()=>{setPhase(2);setP2Page(0);}} style={{flex:1,padding:14,background:C.green,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Go to Phase 2 →</button>
              ) : phase===2 ? (
                <button onClick={()=>{setPhase(3);setP3Page(0);}} style={{flex:1,padding:14,background:"#1A7A6E",color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Go to Phase 3 →</button>
              ) : phase===3 ? (
                <button onClick={()=>{setPhase(4);setP4Page(0);}} style={{flex:1,padding:14,background:C.purple,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Go to Phase 4 →</button>
              ) : (
                <button onClick={()=>setTab("vocab")} style={{flex:1,padding:14,background:C.navy,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Go to Vocab →</button>
              )}
            </div>
          </div>
        )}

        {/* ══ VOCAB FLASHCARDS ════════════════════════════════════ */}
        {tab==="vocab" && (
          <div>
            <div style={{fontWeight:800,fontSize:20,color:C.navy,marginBottom:2}}>Flashcards</div>
            <div style={{color:"#888",fontSize:13,marginBottom:12}}>Tap card to flip · {cardIdx+1} of {VLIST.length}</div>

            {/* Phase filter */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:14}}>
              {[[0,"All (48)"],[1,"P1"],[2,"P2"],[3,"P3"],[4,"P4"]].map(([f,label])=>(
                <button key={f} onClick={()=>{setVFilter(f);setCardIdx(0);setFlipped(false);}} style={{padding:"7px 2px",background:vFilter===f?C.navy:C.light,color:vFilter===f?"#fff":C.navy,border:"none",borderRadius:10,fontWeight:700,fontSize:11,cursor:"pointer"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div style={{background:C.light,borderRadius:10,height:6,marginBottom:14}}>
              <div style={{background:C.red,borderRadius:10,height:6,width:`${((cardIdx+1)/VLIST.length)*100}%`,transition:"width .3s"}}/>
            </div>

            {/* Card */}
            <div onClick={()=>setFlipped(!flipped)} style={{background:C.white,borderRadius:20,padding:32,minHeight:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`2px solid ${C.light}`,cursor:"pointer",marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",textAlign:"center"}}>
              {!flipped ? (
                <>
                  <div style={{fontSize:76,fontWeight:900,color:C.navy,lineHeight:1}}>{VLIST[cardIdx].hz}</div>
                  <div style={{fontSize:12,color:"#bbb",marginTop:14}}>Tap to reveal meaning</div>
                </>
              ) : (
                <>
                  <div style={{fontSize:40,fontWeight:900,color:C.navy,marginBottom:4}}>{VLIST[cardIdx].hz}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:4}}>
                    <span style={{fontSize:18,fontWeight:700,color:C.red}}>{VLIST[cardIdx].py}</span>
                    <SpeakBtn text={VLIST[cardIdx].hz} />
                  </div>
                  <div style={{fontSize:20,fontWeight:700,color:"#333",marginBottom:14}}>{VLIST[cardIdx].en}</div>
                  <div style={{background:C.light,borderRadius:10,padding:"8px 14px"}}>
                    <div style={{fontSize:11,color:"#aaa",marginBottom:3}}>Business context</div>
                    <div style={{fontSize:13,color:"#555",fontStyle:"italic"}}>{VLIST[cardIdx].use}</div>
                  </div>
                </>
              )}
            </div>

            {!flipped ? (
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{setCardIdx(i=>Math.max(0,i-1));setFlipped(false);}} disabled={cardIdx===0} style={{flex:1,padding:14,background:C.light,color:cardIdx===0?"#ccc":C.navy,border:"none",borderRadius:12,fontWeight:700,cursor:cardIdx===0?"not-allowed":"pointer"}}>← Prev</button>
                <button onClick={()=>{setCardIdx(i=>Math.min(VLIST.length-1,i+1));setFlipped(false);}} disabled={cardIdx===VLIST.length-1} style={{flex:1,padding:14,background:cardIdx===VLIST.length-1?C.light:C.red,color:cardIdx===VLIST.length-1?"#ccc":"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:cardIdx===VLIST.length-1?"not-allowed":"pointer"}}>Next →</button>
              </div>
            ) : (
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{setCardIdx(i=>Math.min(VLIST.length-1,i+1));setFlipped(false);}} style={{flex:1,padding:14,background:C.green,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>✓ Got it</button>
                <button onClick={()=>setFlipped(false)} style={{flex:1,padding:14,background:"#FFF0F0",color:C.red,border:`1px solid ${C.red}`,borderRadius:12,fontWeight:700,cursor:"pointer"}}>✗ Again</button>
              </div>
            )}
            {cardIdx===VLIST.length-1 && (
              <button onClick={()=>setTab("quiz")} style={{width:"100%",marginTop:10,padding:14,background:C.navy,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Take the Full Quiz →</button>
            )}
          </div>
        )}

        {/* ══ QUIZ ════════════════════════════════════════════════ */}
        {tab==="quiz" && (
          <div>
            {!done ? (
              <>
                <div style={{fontWeight:800,fontSize:20,color:C.navy,marginBottom:2}}>Recognition Drill</div>
                <div style={{color:"#888",fontSize:13,marginBottom:14}}>See character → type English meaning. All 4 phases combined (24 questions).</div>

                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{flex:1,background:C.light,borderRadius:10,height:6}}>
                    <div style={{background:C.red,borderRadius:10,height:6,width:`${(quizIdx/QUIZ_ALL.length)*100}%`,transition:"width .3s"}}/>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:C.navy,minWidth:36}}>{quizIdx}/{QUIZ_ALL.length}</div>
                </div>

                <div style={{background:C.white,borderRadius:20,padding:32,textAlign:"center",marginBottom:14,border:`2px solid ${C.light}`}}>
                  <div style={{fontSize:84,fontWeight:900,color:C.navy,lineHeight:1,marginBottom:12}}>{QUIZ_ALL[quizIdx].hz}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <SpeakBtn text={QUIZ_ALL[quizIdx].hz} />
                    <span style={{fontSize:14,color:"#aaa"}}>What does this mean in English?</span>
                  </div>
                </div>

                <input value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!result&&checkAnswer()} placeholder="Type the English meaning…" disabled={!!result}
                  style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`2px solid ${result==="ok"?C.green:result==="wrong"?C.red:C.light}`,fontSize:16,fontFamily:"inherit",background:result==="ok"?"#E8F7EE":result==="wrong"?"#FFF0F0":C.white,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:10}}/>

                {result==="ok"    && <div style={{background:"#E8F7EE",border:`2px solid ${C.green}`,borderRadius:12,padding:12,marginBottom:10,color:C.green,fontWeight:700}}>✓ Correct! {QUIZ_ALL[quizIdx].hz} = {QUIZ_ALL[quizIdx].en} · {QUIZ_ALL[quizIdx].py}</div>}
                {result==="wrong" && <div style={{background:"#FFF0F0",border:`2px solid ${C.red}`,borderRadius:12,padding:12,marginBottom:10,color:C.red,fontWeight:700}}>✗ Answer: <strong>{QUIZ_ALL[quizIdx].en}</strong> ({QUIZ_ALL[quizIdx].py})</div>}

                {!result
                  ? <button onClick={checkAnswer} style={{width:"100%",padding:14,background:C.navy,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer"}}>Check Answer</button>
                  : <button onClick={nextQuiz}    style={{width:"100%",padding:14,background:C.red, color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer"}}>Next →</button>}

                <div style={{textAlign:"center",marginTop:10,color:"#aaa",fontSize:13}}>Score so far: {score}/{quizIdx}</div>
              </>
            ) : (
              <div style={{textAlign:"center",paddingTop:24}}>
                <div style={{fontSize:68,marginBottom:14}}>{score>=10?"🏆":score>=7?"💪":"📚"}</div>
                <div style={{fontWeight:900,fontSize:24,color:C.navy,marginBottom:8}}>Quiz Complete!</div>
                <div style={{fontSize:48,fontWeight:900,color:C.red,marginBottom:6}}>{score}<span style={{fontSize:22,color:"#aaa"}}>/{QUIZ_ALL.length}</span></div>
                <div style={{color:"#666",fontSize:15,marginBottom:24,lineHeight:1.7,padding:"0 8px"}}>
                  {score>=20?"🏆 Outstanding — all 4 phases mastered. You are ready for real business conversations in Chinese.":score>=15?"💪 Strong result. Review the missed words in Vocab, then retry.":"📚 Keep drilling the flashcards daily — consistency beats intensity every time."}
                </div>
                <button onClick={resetQuiz} style={{width:"100%",padding:14,background:C.navy,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer",marginBottom:10}}>Retry Quiz</button>
                <button onClick={()=>setTab("vocab")} style={{width:"100%",padding:14,background:C.light,color:C.navy,border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer"}}>Back to Flashcards</button>
              </div>
            )}
          </div>
        )}

        {/* ══ POETRY & LITERATURE ═══════════════════════════════ */}
        {tab==="poetry" && (
          <div>
            {!poemDone ? (() => {
              const teal3 = "#1A7A6E";
              const item = POETRY_ITEMS[poemIdx];
              const fullHz = item.lines.map(l=>l.hz).join("");
              return (
                <>
                  <div style={{fontWeight:800,fontSize:20,color:C.navy,marginBottom:2}}>Poetry & Literature</div>
                  <div style={{color:"#888",fontSize:13,marginBottom:14}}>Classical lines every educated Chinese contact recognises. Read → fill the blank → answer the usage question.</div>

                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{flex:1,background:C.light,borderRadius:10,height:6}}>
                      <div style={{background:C.purple,borderRadius:10,height:6,width:`${(poemIdx/POETRY_ITEMS.length)*100}%`,transition:"width .3s"}}/>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:C.navy,minWidth:36}}>{poemIdx}/{POETRY_ITEMS.length}</div>
                  </div>

                  <div style={{background:C.navy,borderRadius:16,padding:18,color:"#fff",marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{background:item.kind==="Poem"?C.purple:item.kind==="Chengyu"?C.gold:teal3,color:item.kind==="Chengyu"?C.navy:"#fff",borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:700}}>{item.kind}</span>
                      <span style={{fontSize:11,opacity:.55}}>{item.dynasty}</span>
                    </div>
                    <div style={{fontWeight:900,fontSize:20,marginBottom:2}}>{item.title}</div>
                    <div style={{fontSize:12,opacity:.65,marginBottom:2}}>{item.titlePy} — {item.titleEn}</div>
                    {item.author && <div style={{fontSize:12,opacity:.55,marginBottom:12}}>{item.author}{item.authorPy?` (${item.authorPy})`:""}</div>}

                    <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:14,marginBottom:12}}>
                      {item.lines.map((l,i)=>(
                        <div key={i} style={{marginBottom:i<item.lines.length-1?10:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                            <span style={{fontWeight:700,fontSize:17,flex:1,lineHeight:1.6}}>{l.hz}</span>
                            <SpeakBtn text={l.hz} small />
                          </div>
                          <div style={{opacity:.6,fontSize:12}}>{l.py}</div>
                          <div style={{opacity:.85,fontSize:13,fontStyle:"italic"}}>{l.en}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:12,opacity:.75,lineHeight:1.6}}>💼 {item.context}</div>
                  </div>

                  {poemStage==="read" && (
                    <button onClick={()=>setPoemStage("blank")} style={{width:"100%",padding:14,background:C.purple,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer"}}>Fill in the Blank →</button>
                  )}

                  {poemStage!=="read" && (
                    <div style={{background:C.white,border:`2px solid ${C.light}`,borderRadius:16,padding:16,marginBottom:14}}>
                      <div style={{fontWeight:700,color:C.navy,marginBottom:10,fontSize:14}}>1. Complete the line</div>
                      <div style={{fontSize:20,fontWeight:900,color:C.navy,textAlign:"center",background:C.light,borderRadius:10,padding:"14px 10px",marginBottom:12,lineHeight:1.8}}>
                        {item.blank.before}
                        <span style={{display:"inline-block",minWidth:44,borderBottom:`3px solid ${blankResult==="ok"?C.green:blankResult==="wrong"?C.red:C.purple}`,color:blankResult?(blankResult==="ok"?C.green:C.red):C.purple,margin:"0 2px"}}>
                          {blankPick || "＿＿"}
                        </span>
                        {item.blank.after}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:blankResult?10:0}}>
                        {item.blank.options.map((opt,i)=>{
                          const isPicked = blankPick===opt.hz;
                          const isAnswer = opt.hz===item.blank.answer;
                          const showState = !!blankResult && (isPicked || isAnswer);
                          const bg = showState ? (isAnswer?"#E8F7EE":isPicked?"#FFF0F0":C.white) : C.white;
                          const border = showState ? (isAnswer?C.green:isPicked?C.red:C.light) : (isPicked?C.purple:C.light);
                          return (
                            <button key={i} onClick={()=>pickBlank(opt)} disabled={!!blankResult} style={{padding:"10px 8px",background:bg,border:`2px solid ${border}`,borderRadius:10,cursor:blankResult?"default":"pointer",textAlign:"center"}}>
                              <div style={{fontSize:18,fontWeight:800,color:C.navy}}>{opt.hz}</div>
                              <div style={{fontSize:11,color:C.red,fontWeight:600}}>{opt.py}</div>
                              <div style={{fontSize:11,color:"#777"}}>{opt.en}</div>
                            </button>
                          );
                        })}
                      </div>
                      {blankResult==="ok"    && <div style={{background:"#E8F7EE",border:`2px solid ${C.green}`,borderRadius:10,padding:10,color:C.green,fontWeight:700,fontSize:13}}>✓ Correct — {item.blank.answer} ({item.blank.answerPy}, "{item.blank.answerEn}")</div>}
                      {blankResult==="wrong" && <div style={{background:"#FFF0F0",border:`2px solid ${C.red}`,borderRadius:10,padding:10,color:C.red,fontWeight:700,fontSize:13}}>✗ Correct answer: {item.blank.answer} ({item.blank.answerPy}, "{item.blank.answerEn}")</div>}
                    </div>
                  )}

                  {poemStage==="blank" && blankResult && (
                    <button onClick={()=>setPoemStage("mc")} style={{width:"100%",padding:14,background:C.purple,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer",marginBottom:14}}>Usage Question →</button>
                  )}

                  {poemStage==="mc" && (
                    <div style={{background:C.white,border:`2px solid ${C.light}`,borderRadius:16,padding:16,marginBottom:14}}>
                      <div style={{fontWeight:700,color:C.navy,marginBottom:10,fontSize:14}}>2. {item.mc.q}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:mcResult?10:0}}>
                        {item.mc.options.map((opt,i)=>{
                          const isPicked = mcPick===i;
                          const isAnswer = i===item.mc.answer;
                          const showState = !!mcResult && (isPicked || isAnswer);
                          const bg = showState ? (isAnswer?"#E8F7EE":isPicked?"#FFF0F0":C.white) : C.white;
                          const border = showState ? (isAnswer?C.green:isPicked?C.red:C.light) : C.light;
                          return (
                            <button key={i} onClick={()=>pickMc(i)} disabled={!!mcResult} style={{textAlign:"left",padding:"11px 14px",background:bg,border:`2px solid ${border}`,borderRadius:10,cursor:mcResult?"default":"pointer",fontSize:13,color:C.navy,fontWeight:600,lineHeight:1.5}}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {mcResult && (
                        <div style={{background:mcResult==="ok"?"#E8F7EE":"#FFF0F0",border:`2px solid ${mcResult==="ok"?C.green:C.red}`,borderRadius:10,padding:10,color:mcResult==="ok"?C.green:C.red,fontSize:13,lineHeight:1.6}}>
                          <strong>{mcResult==="ok"?"✓ Correct.":"✗ Not quite."}</strong> {item.mc.explain}
                        </div>
                      )}
                    </div>
                  )}

                  {poemStage==="mc" && mcResult && (
                    <button onClick={nextPoem} style={{width:"100%",padding:14,background:C.navy,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer"}}>
                      {poemIdx+1>=POETRY_ITEMS.length ? "See Results →" : "Next →"}
                    </button>
                  )}

                  <div style={{textAlign:"center",marginTop:10,color:"#aaa",fontSize:13}}>Score so far: {poemScore}/{poemIdx + (poemStage==="mc"&&mcResult?1:0)}</div>
                </>
              );
            })() : (
              <div style={{textAlign:"center",paddingTop:24}}>
                <div style={{fontSize:68,marginBottom:14}}>{poemScore>=5?"🏆":poemScore>=3?"📖":"🌱"}</div>
                <div style={{fontWeight:900,fontSize:24,color:C.navy,marginBottom:8}}>Poetry Round Complete!</div>
                <div style={{fontSize:48,fontWeight:900,color:C.purple,marginBottom:6}}>{poemScore}<span style={{fontSize:22,color:"#aaa"}}>/{POETRY_ITEMS.length}</span></div>
                <div style={{color:"#666",fontSize:15,marginBottom:24,lineHeight:1.7,padding:"0 8px"}}>
                  {poemScore>=5?"🏆 Excellent — you can now drop a classical line into a toast or presentation with real confidence.":poemScore>=3?"📖 Good progress. A line or two of these will already impress at a business dinner.":"🌱 These take repetition — revisit the cards and try again."}
                </div>
                <button onClick={resetPoetry} style={{width:"100%",padding:14,background:C.navy,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer",marginBottom:10}}>Retry</button>
                <button onClick={()=>setTab("quiz")} style={{width:"100%",padding:14,background:C.light,color:C.navy,border:"none",borderRadius:12,fontWeight:700,fontSize:16,cursor:"pointer"}}>Go to Vocab Quiz</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Root — shows Onboarding first, then App ────────────────
export default function Root() {
  const [started, setStarted] = useState(false);
  const [path,    setPath]    = useState({ phase:1, lesson:0, tab:"roadmap" });

  if (!started) {
    return (
      <Onboarding
        onStart={(p) => { setPath(p); setStarted(true); }}
      />
    );
  }
  return <App initPhase={path.phase} initLesson={path.lesson} initTab={path.tab} />;
}
