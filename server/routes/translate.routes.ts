import { Router, Request, Response } from "express";
import { getGemini } from "../providers/ai/geminiProvider";

const router = Router();

const COMMON_TRANSLATIONS: Record<string, Record<string, { translated: string; phonetic: string }>> = {
  "how much does this cost?": {
    hi: { translated: "यह कितने का है?", phonetic: "Yeh kitne ka hai?" },
    bn: { translated: "এটার দাম কত?", phonetic: "Etar daam koto?" },
    ta: { translated: "இதன் விலை என்ன?", phonetic: "Idhan vilai enna?" },
    te: { translated: "దీని ధర ఎంత?", phonetic: "Deeni dhara entha?" },
    mr: { translated: "याची किंमत किती आहे?", phonetic: "Yaachi kimmat kiti aahe?" },
    gu: { translated: "આ કેટલાનું છે?", phonetic: "Aa ketlanu chhe?" },
    kn: { translated: "ಇದರ ಬೆಲೆ ಎಷ್ಟು?", phonetic: "Idhara bele eshtu?" },
    ml: { translated: "ഇതിന് എത്ര രൂപയാണ്?", phonetic: "Ithinu ethra roopayanu?" },
    pa: { translated: "ਇਹ ਕਿੰਨੇ ਦਾ ਹੈ?", phonetic: "Eh kinne da hai?" },
  },
  "please turn on the meter.": {
    hi: { translated: "कृपया मीटर चालू करें।", phonetic: "Kripya meter chalu karein." },
    bn: { translated: "দয়া করে মিটার চালান।", phonetic: "Doya kore meter chalan." },
    ta: { translated: "தயவுசெய்து மீட்டரைப் போடவும்.", phonetic: "Dayavuseidhu meterai podavum." },
    te: { translated: "దయచేసి మీటర్ ఆన్ చేయండి.", phonetic: "Dayachesi meter on cheyandi." },
    mr: { translated: "कृपया मीटर सुरू करा.", phonetic: "Krupaya meter suru kara." },
    gu: { translated: "કૃપા કરીને મીટર ચાલુ કરો.", phonetic: "Krupa karine meter chalu karo." },
    kn: { translated: "ದಯವಿಟ್ಟು ಮೀಟರ್ ಆನ್ ಮಾಡಿ.", phonetic: "Dayavittu meter on maadi." },
    ml: { translated: "ദയവായി മീറ്റർ ഇടുക.", phonetic: "Dayavaayi meter iduka." },
    pa: { translated: "ਕਿਰਪਾ ਕਰਕੇ ਮੀਟਰ ਚਾਲੂ ਕਰੋ।", phonetic: "Kirpa karke meter chalu karo." },
  },
  "please make it less spicy.": {
    hi: { translated: "कृपया इसे कम तीखा बनाएं।", phonetic: "Kripya ise kam teekha banayein." },
    bn: { translated: "দয়া করে ঝাল কম দিন।", phonetic: "Doya kore jhaal kom din." },
    ta: { translated: "தயவுசெய்து காரம் குறைவாக வைக்கவும்.", phonetic: "Dayavuseidhu kaaram kuraivaaga vaikkavum." },
    te: { translated: "దయచేసి కారం తక్కువ వేయండి.", phonetic: "Dayachesi kaaram thakkuva veyandi." },
    mr: { translated: "कृपया कमी तिखट करा.", phonetic: "Krupaya kami tikhat kara." },
    gu: { translated: "કૃપા કરીને ઓછું તીખું બનાવો.", phonetic: "Krupa karine ochhu teekhu banavo." },
    kn: { translated: "ದಯವಿಟ್ಟು ಕಡಿಮೆ ಖಾರ ಮಾಡಿ.", phonetic: "Dayavittu kadime khaara maadi." },
    ml: { translated: "ദയവായി എരിവ് കുറയ്ക്കുക.", phonetic: "Dayavaayi erivu kuraykkuka." },
    pa: { translated: "ਕਿਰਪਾ ਕਰਕੇ ਘੱਟ ਮਿਰਚ ਪਾਓ।", phonetic: "Kirpa karke ghatt mirch pao." },
  },
  "where is the nearest medical store?": {
    hi: { translated: "नजदीकी मेडिकल स्टोर कहाँ है?", phonetic: "Nazdeeki medical store kahan hai?" },
    bn: { translated: "কাছের ওষুধের দোকান কোথায়?", phonetic: "Kaacher oshudher dokan kothay?" },
    ta: { translated: "அருகிலுள்ள மருந்தகம் எங்கே?", phonetic: "Arugilulla marundhagam engey?" },
    te: { translated: "సమీపంలోని మెడికల్ షాప్ ఎక్కడ ఉంది?", phonetic: "Sameepanloni medical shop ekkada undi?" },
    mr: { translated: "जवळचे मेडिकल स्टोअर कुठे आहे?", phonetic: "Javalche medical store kuthe aahe?" },
    gu: { translated: "નજીકનું મેડિકલ સ્ટોર ક્યાં છે?", phonetic: "Najeek nu medical store kyan chhe?" },
    kn: { translated: "ಹತ್ತಿರದ ಮೆಡಿಕಲ್ ಶಾಪ್ ಎಲ್ಲಿದೆ?", phonetic: "Hatthirada medical shop ellide?" },
    ml: { translated: "ഏറ്റവും അടുത്തുള്ള മെഡിക്കൽ ഷോപ്പ് എവിടെയാണ്?", phonetic: "Ettavum aduthulla medical shop evideyaanu?" },
    pa: { translated: "ਨੇੜਲਾ ਮੈਡੀਕਲ ਸਟੋਰ ਕਿੱਥੇ ਹੈ?", phonetic: "Nerdla medical store kithe hai?" },
  },
  "thank you very much!": {
    hi: { translated: "बहुत-बहुत धन्यवाद!", phonetic: "Bahut-bahut dhanyavaad!" },
    bn: { translated: "অনেক অনেক ধন্যবাদ!", phonetic: "Onek onek dhonnobaad!" },
    ta: { translated: "மிக்க நன்றி!", phonetic: "Mikka nandri!" },
    te: { translated: "చాలా ధన్యవాదాలు!", phonetic: "Chaala dhanyavaadaalu!" },
    mr: { translated: "खूप खूप धन्यवाद!", phonetic: "Khoop khoop dhanyavaad!" },
    gu: { translated: "ખૂબ ખૂબ આભાર!", phonetic: "Khoob khoob aabhar!" },
    kn: { translated: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು!", phonetic: "Thumba dhanyavaadagalu!" },
    ml: { translated: "വളരെ നന്ദി!", phonetic: "Valare nandi!" },
    pa: { translated: "ਬਹੁਤ-ਬਹੁਤ ਧੰਨਵਾਦ!", phonetic: "Bahut-bahut dhanvaad!" },
  },
  "can you help me with the directions to the station?": {
    hi: { translated: "क्या आप मुझे स्टेशन का रास्ता बता सकते हैं?", phonetic: "Kya aap mujhe station ka raasta bata sakte hain?" },
    bn: { translated: "আপনি কি আমাকে স্টেশনের পথ দেখাতে পারেন?", phonetic: "Apni ki amake stationer poth dekhate paren?" },
    ta: { translated: "நிலையம் செல்லும் வழியைக் கூற முடியுமா?", phonetic: "Nilayam sellum vazhiyai koora mudiyuma?" },
    te: { translated: "స్టేషన్ వైపు వెళ్లే దారిని చూపించగలరా?", phonetic: "Station vaipu velle daarini choopinchagalara?" },
    mr: { translated: "तुम्ही मला स्टेशनचा रस्ता दाखवू शकता का?", phonetic: "Tumhi mala stationcha rasta daakhavu shakta ka?" },
    gu: { translated: "શું તમે મને સ્ટેશનનો રસ્તો બતાવી શકશો?", phonetic: "Shu tame mane station no rasto batavi shaksho?" },
    kn: { translated: "ನೀವು ನನಗೆ ರೈಲ್ವೆ ನಿಲ್ದಾಣದ ಮಾರ್ಗವನ್ನು ತೋರಿಸಬಹುದೇ?", phonetic: "Neevu nanage railway nildaanada maargavannu thorisabahude?" },
    ml: { translated: "സ്റ്റേഷനിലേക്കുള്ള വഴി പറഞ്ഞു തരാമോ?", phonetic: "Stationilekkulla vazhi paranju tharamo?" },
    pa: { translated: "ਕੀ ਤੁਸੀਂ ਮੈਨੂੰ ਸਟੇਸ਼ਨ ਦਾ ਰਸਤਾ ਦੱਸ ਸਕਦੇ ਹੋ?", phonetic: "Ki tussi mainu station da rasta dass sakde ho?" },
  },
};

router.post("/", async (req: Request, res: Response) => {
  const text = String(req.body?.text || "").trim();
  const from = String(req.body?.from || "en").toLowerCase();
  const to = String(req.body?.to || "hi").toLowerCase();

  if (!text) {
    return res.status(400).json({ detail: "Text is required" });
  }

  // Check lookup table first
  const normalizedKey = text.toLowerCase();
  if (COMMON_TRANSLATIONS[normalizedKey] && COMMON_TRANSLATIONS[normalizedKey][to]) {
    const match = COMMON_TRANSLATIONS[normalizedKey][to];
    return res.json({
      translated: match.translated,
      phonetic: match.phonetic,
      from,
      to,
    });
  }

  // Try Gemini AI translation
  const ai = getGemini();
  if (ai) {
    try {
      const prompt = `Translate the following text accurately from language code '${from}' to '${to}'.
Original: "${text}"
Output ONLY a strict JSON object with no markdown fences, formatted as:
{"translated": "<native script translation>", "phonetic": "<english phonetic romanization pronunciation guide>"}`;

      const aiPromise = ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 4000)
      );

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const rawText = (response?.text || "").trim();
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.translated) {
        return res.json({
          translated: parsed.translated,
          phonetic: parsed.phonetic || "",
          from,
          to,
        });
      }
    } catch {
      // Fall through to default fallback
    }
  }

  // Graceful fallback
  res.json({
    translated: text,
    phonetic: text,
    from,
    to,
  });
});

export default router;
