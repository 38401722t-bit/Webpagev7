// Script to build the complete master directory of all 1,924 places across all 36 States & UTs of India
import fs from 'fs';
import path from 'path';

const RAW_STATES_DATA = [
  {
    state: "Andhra Pradesh",
    region: "South",
    centerLat: 15.9129,
    centerLon: 79.7400,
    bestSeason: "Oct - Mar",
    places: [
      "Tirupati - Sri Venkateswara Temple", "Visakhapatnam - Kailasagiri", "Visakhapatnam - Rushikonda Beach",
      "Araku Valley", "Borra Caves", "Lambasingi", "Katiki Waterfalls", "Simhachalam Temple", "RK Beach",
      "Yarada Beach", "Submarine Museum", "Srisailam", "Mallikarjuna Temple", "Srisailam Dam", "Ahobilam",
      "Belum Caves", "Gandikota", "Lepakshi", "Veerabhadra Temple", "Horsley Hills", "Talakona Waterfalls",
      "Tirumala", "Kanipakam", "Sri Kalahasti", "Amaravati", "Amaravati Stupa", "Undavalli Caves",
      "Kondaveedu Fort", "Vijayawada - Prakasam Barrage", "Bhavani Island", "Mangalagiri",
      "Uppalapadu Bird Sanctuary", "Kolleru Lake", "Pulicat Lake", "Coringa Wildlife Sanctuary", "Hope Island",
      "Rajahmundry - Godavari riverfront", "Papikondalu", "Dindi", "Konaseema", "Draksharamam",
      "Samalkota Kumara Bhimeswara Temple", "Machilipatnam Beach", "Manginapudi Beach", "Suryalanka Beach",
      "Kurnool - Oravakallu Rock Garden", "Rollapadu Wildlife Sanctuary", "Mypadu Beach", "Penukonda Fort"
    ]
  },
  {
    state: "Arunachal Pradesh",
    region: "North-East",
    centerLat: 28.2180,
    centerLon: 94.7278,
    bestSeason: "Oct - Apr",
    places: [
      "Itanagar - Ganga Lake", "Itanagar - Ita Fort", "Itanagar Zoological Park", "Tawang Monastery",
      "Tawang War Memorial", "Sela Pass", "Sela Lake", "Bum La Pass", "Shonga-tser Lake", "Nuranang Falls",
      "Jaswant Garh", "Dirang", "Dirang Dzong", "Dirang Hot Water Spring", "Sangti Valley",
      "Bomdila Monastery", "Bomdila View Point", "Eaglenest Wildlife Sanctuary", "Shergaon", "Rupa",
      "Bhalukpong", "Pakhui Wildlife Sanctuary", "Tipi Orchidarium", "Ziro Valley", "Talley Valley",
      "Meghna Cave Temple", "Daporijo", "Mechuka", "Samten Yongcha Monastery", "Mechuka View Point",
      "Aalo", "Pasighat", "Daying Ering Wildlife Sanctuary", "Siang River", "Roing", "Mayudia Pass",
      "Mehao Wildlife Sanctuary", "Dong Valley", "Walong", "Kibithu", "Namdapha National Park",
      "Miao", "Nampong", "Parasuram Kund", "Tezu", "Bhismaknagar"
    ]
  },
  {
    state: "Assam",
    region: "North-East",
    centerLat: 26.2006,
    centerLon: 92.9376,
    bestSeason: "Nov - Apr",
    places: [
      "Guwahati - Kamakhya Temple", "Umananda Island", "Navagraha Temple", "Assam State Museum",
      "Srimanta Sankardev Kalakshetra", "Deepor Beel", "Pobitora Wildlife Sanctuary", "Hajo",
      "Hayagriva Madhava Temple", "Sualkuchi", "Kaziranga National Park", "Kaziranga Orchid Park",
      "Kakochang Waterfall", "Numaligarh", "Majuli", "Auniati Satra", "Kamalabari Satra", "Samaguri Satra",
      "Dibrugarh", "Bogibeel Bridge", "Naharkatia", "Tinsukia", "Dibru-Saikhowa National Park",
      "Digboi Oil Museum", "Digboi War Cemetery", "Margherita", "Jorhat", "Jorhat Gymkhana Club",
      "Tocklai Tea Research Centre", "Sivasagar", "Sivasagar Sivadol", "Rang Ghar", "Talatal Ghar",
      "Kareng Ghar", "Joysagar", "Charaideo Maidams", "Tezpur", "Agnigarh", "Da Parbatia", "Bamuni Hills",
      "Bhalukpong", "Orang National Park", "Manas National Park", "Hollongapar Gibbon Sanctuary",
      "Panidehing Wildlife Sanctuary", "Nameri National Park", "Bherjan-Borajan-Padumoni Wildlife Sanctuary",
      "Haflong", "Jatinga", "Umrangso", "Maibang"
    ]
  },
  {
    state: "Bihar",
    region: "East",
    centerLat: 25.0961,
    centerLon: 85.3131,
    bestSeason: "Oct - Mar",
    places: [
      "Gaya", "Mahabodhi Temple", "Vishnupad Temple", "Bodh Gaya Great Buddha", "Royal Bhutan Monastery",
      "Sujata Stupa", "Patna", "Golghar", "Gandhi Maidan", "Patna Museum", "Bihar Museum",
      "Sanjay Gandhi Biological Park", "Eco Park", "Takht Sri Patna Sahib", "Agam Kuan", "Kumhrar",
      "Padri Ki Haveli", "Maner Sharif", "Valmiki Tiger Reserve", "Valmikinagar", "Kesaria Stupa",
      "Vaishali", "Ashokan Pillar Vaishali", "Buddha Stupa", "Rajgir", "Rajgir Ropeway", "Vishwa Shanti Stupa",
      "Griddhakuta", "Hot Springs", "Nalanda Mahavihara", "Nalanda Archaeological Museum", "Pawapuri Jal Mandir",
      "Pawapuri", "Pawapuri Samosharan Temple", "Vikramshila Ruins", "Antichak", "Bhagalpur", "Mandar Hill",
      "Karkatgarh Waterfall", "Manjhar Kund", "Dhuan Kund", "Tutula Bhawani", "Sasaram", "Sher Shah Suri Tomb",
      "Buxar Fort", "Mithila", "Madhubani", "Janaki Temple Sitamarhi", "Rajnagar Ruins", "Sonepur Fair Ground",
      "Barabar Caves", "Pawapuri"
    ]
  },
  {
    state: "Chhattisgarh",
    region: "Central",
    centerLat: 21.2787,
    centerLon: 81.8661,
    bestSeason: "Oct - Mar",
    places: [
      "Raipur", "Mahant Ghasidas Memorial Museum", "Purani Basti", "Budha Talab", "Nandan Van Zoo",
      "Sirpur", "Lakshmana Temple Sirpur", "Barnawapara Wildlife Sanctuary", "Rajim", "Rajiv Lochan Temple",
      "Dhamtari", "Gangrel Dam", "Jagdalpur", "Chitrakote Waterfalls", "Tirathgarh Waterfalls",
      "Kanger Valley National Park", "Kutumsar Cave", "Kailash Cave", "Bastar Palace", "Dalpat Sagar",
      "Danteshwari Temple", "Bacheli", "Bailadila", "Kanger Valley", "Tamda Ghumar Waterfall",
      "Mendri Ghumar Waterfall", "Keshkal Valley", "Kanker", "Kanker Palace", "Malhar Archaeological Site",
      "Ratanpur", "Mahamaya Temple", "Khutaghat Dam", "Bilaspur", "Achanakmar Wildlife Sanctuary",
      "Tala Archaeological Site", "Rajim Triveni Sangam", "Bhoramdeo Temple", "Kawardha", "Mainpat",
      "Tiger Point Mainpat", "Jaljali", "Amarkantak access region", "Jatmai-Ghatarani Waterfalls",
      "Udanti-Sitanadi Tiger Reserve", "Sitanadi Wildlife Sanctuary", "Dongargarh", "Bambaleshwari Temple",
      "Chaiturgarh", "Korba"
    ]
  },
  {
    state: "Goa",
    region: "West",
    centerLat: 15.2993,
    centerLon: 74.1240,
    bestSeason: "Nov - Feb",
    places: [
      "Panaji", "Fontainhas", "Miramar Beach", "Dona Paula", "Old Goa", "Basilica of Bom Jesus",
      "Se Cathedral", "Church of St Francis of Assisi", "Church of St Cajetan",
      "Archaeological Museum Old Goa", "Reis Magos Fort", "Fort Aguada", "Sinquerim Beach", "Candolim Beach",
      "Calangute Beach", "Baga Beach", "Anjuna Beach", "Vagator Beach", "Chapora Fort", "Morjim Beach",
      "Ashwem Beach", "Arambol Beach", "Tiracol Fort", "Mandrem Beach", "Mapusa", "Mapusa Market", "Ponda",
      "Shri Mangueshi Temple", "Shantadurga Temple", "Safa Shahouri Mosque", "Mayem Lake", "Dudhsagar Falls",
      "Mollem National Park", "Bhagwan Mahavir Wildlife Sanctuary", "Tambdi Surla Temple",
      "Netravali Wildlife Sanctuary", "Cotigao Wildlife Sanctuary", "Palolem Beach", "Patnem Beach",
      "Agonda Beach", "Cabo de Rama Fort", "Colva Beach", "Benaulim Beach", "Varca Beach", "Cavelossim",
      "Mobor Beach", "Naval Aviation Museum", "Goa Chitra Museum", "Dr Salim Ali Bird Sanctuary", "Chorao Island"
    ]
  },
  {
    state: "Gujarat",
    region: "West",
    centerLat: 22.2587,
    centerLon: 71.1924,
    bestSeason: "Oct - Mar",
    places: [
      "Ahmedabad", "Sabarmati Ashram", "Adalaj Stepwell", "Kankaria Lake", "Sidi Saiyyed Mosque",
      "Sarkhej Roza", "Science City", "Statue of Unity", "Kevadia", "Valley of Flowers Ekta Nagar",
      "Sardar Sarovar Dam", "Pavagadh", "Champaner-Pavagadh Archaeological Park", "Jambughoda Wildlife Sanctuary",
      "Vadodara", "Laxmi Vilas Palace", "Sayaji Garden", "EME Temple", "Modhera Sun Temple", "Patan",
      "Rani ki Vav", "Siddhpur", "Ahmedabad - Hutheesing Jain Temple", "Lothal", "Dholavira", "Kutch",
      "Great Rann of Kutch", "Kala Dungar", "Mandvi Beach", "Vijay Vilas Palace", "Narayan Sarovar",
      "Koteshwar Temple", "Bhuj", "Aina Mahal", "Prag Mahal", "Kutch Museum", "Gir National Park",
      "Sasan Gir", "Somnath Temple", "Somnath Beach", "Dwarka", "Dwarkadhish Temple", "Bet Dwarka",
      "Rukmini Temple", "Shivrajpur Beach", "Porbandar", "Kirti Mandir", "Junagadh", "Uparkot Fort",
      "Girnar Hills", "Palitana", "Shatrunjaya Hills", "Velavadar Blackbuck National Park",
      "Little Rann of Kutch", "Nal Sarovar", "Marine National Park", "Jamnagar", "Pirotan Island", "Wankaner Palace"
    ]
  },
  {
    state: "Haryana",
    region: "North",
    centerLat: 29.0588,
    centerLon: 76.0856,
    bestSeason: "Oct - Mar",
    places: [
      "Gurugram", "Sultanpur National Park", "Damdama Lake", "Kingdom of Dreams area", "Faridabad",
      "Surajkund", "Raja Nahar Singh Palace", "Pinjore Gardens", "Yadavindra Gardens", "Panchkula",
      "Morni Hills", "Tikkar Tal", "Kurukshetra", "Brahma Sarovar", "Jyotisar", "Krishna Museum",
      "Sheikh Chilli's Tomb", "Bhishma Kund", "Panipat", "Panipat Museum", "Kabuli Bagh Mosque",
      "Ibrahim Lodhi Tomb", "Karnal", "Karnal Lake", "Kalander Shah Tomb", "Hisar",
      "Firoz Shah Palace Complex", "Agroha Dham", "Rakhigarhi", "Rohtak", "Tilyar Lake", "Jind",
      "Safidon Fort", "Rewari", "Rewari Railway Heritage Museum", "Narnaul", "Jal Mahal Narnaul",
      "Chor Gumbad", "Neemrana access", "Morni Fort", "Kalesar National Park", "Hathnikund Barrage",
      "Yamunanagar", "Chandigarh Rock Garden access", "Jyotisar Heritage Village", "Dhosi Hill",
      "Farrukh Nagar", "Sheesh Mahal Farrukhnagar"
    ]
  },
  {
    state: "Himachal Pradesh",
    region: "North",
    centerLat: 31.1048,
    centerLon: 77.1734,
    bestSeason: "Year round (Snow: Dec-Feb, Mild: Mar-Jun)",
    places: [
      "Shimla", "Mall Road", "The Ridge", "Christ Church", "Jakhoo Temple", "Viceregal Lodge", "Kufri",
      "Chail", "Chail Palace", "Narkanda", "Hatu Peak", "Mashobra", "Kasauli", "Gilbert Trail",
      "Monkey Point", "Solan", "Dagshai", "Parwanoo", "Pinjore-Gardens corridor", "Manali",
      "Hadimba Temple", "Manu Temple", "Old Manali", "Solang Valley", "Rohtang Pass", "Vashisht Hot Springs",
      "Naggar Castle", "Naggar", "Kasol", "Manikaran Sahib", "Tosh", "Malana", "Kullu", "Raghunath Temple",
      "Great Himalayan National Park", "Mandi", "Prashar Lake", "Rewalsar Lake", "Dharamshala",
      "McLeod Ganj", "Dalai Lama Temple", "Bhagsunag", "Triund", "Kangra Fort", "Kangra Valley",
      "Palampur", "Tea Gardens", "Bir Billing", "Andretta", "Chamba", "Khajjiar", "Dalhousie",
      "Kalatop Wildlife Sanctuary", "Dainkund", "Kinnaur", "Kalpa", "Chitkul", "Sangla", "Nako",
      "Spiti Valley", "Kaza", "Key Monastery", "Tabo", "Pin Valley National Park"
    ]
  },
  {
    state: "Jharkhand",
    region: "East",
    centerLat: 23.6102,
    centerLon: 85.2799,
    bestSeason: "Oct - Mar",
    places: [
      "Ranchi", "Dassam Falls", "Hundru Falls", "Jonha Falls", "Sita Falls", "Tagore Hill",
      "Rock Garden Ranchi", "State Museum Ranchi", "Jagannath Temple Ranchi", "Birsa Zoological Park",
      "Patratu Valley", "Patratu Dam", "Netarhat", "Netarhat Dam", "Magnolia Point", "Lodh Falls",
      "Betla National Park", "Palamau Tiger Reserve", "Marha Waterfall", "Hazaribagh",
      "Hazaribagh Wildlife Sanctuary", "Hazaribagh Lake", "Konar Dam", "Canary Hill", "Jamshedpur",
      "Jubilee Park", "Tata Steel Zoological Park", "Dimna Lake", "Dalma Hills", "Ghatshila",
      "Rankini Temple", "Deoghar", "Baba Baidyanath Dham", "Naulakha Temple", "Trikuta Hills",
      "Tapovan", "Basukinath", "Dumka", "Massanjore Dam", "Maluti Temples", "Rajmahal", "Sahibganj",
      "Udhwa Lake Bird Sanctuary", "Fossil Park Mandro", "Parasnath", "Shikharji", "Madhuban",
      "Topchanchi Lake", "Maithon Dam", "Panchet Dam", "Koderma", "Tilaiya Dam", "Birsa Munda Memorial"
    ]
  },
  {
    state: "Karnataka",
    region: "South",
    centerLat: 15.3173,
    centerLon: 75.7139,
    bestSeason: "Sep - Mar",
    places: [
      "Bengaluru", "Bangalore Palace", "Lalbagh", "Cubbon Park", "Vidhana Soudha", "ISKCON Bengaluru",
      "Bannerghatta Biological Park", "Mysuru", "Mysore Palace", "Chamundi Hill", "St Philomena's Cathedral",
      "Brindavan Gardens", "Srirangapatna", "Ranganathaswamy Temple", "Karanji Lake", "Hampi",
      "Virupaksha Temple", "Vittala Temple", "Lotus Mahal", "Elephant Stables", "Hampi Bazaar", "Matanga Hill",
      "Badami", "Cave Temples", "Pattadakal", "Aihole", "Bijapur/Vijayapura", "Gol Gumbaz", "Ibrahim Rauza",
      "Gagan Mahal", "Belagavi", "Belur", "Chennakeshava Temple", "Halebidu", "Hoysaleswara Temple",
      "Shravanabelagola", "Gomateshwara Statue", "Coorg/Madikeri", "Abbey Falls", "Raja's Seat",
      "Talacauvery", "Nisargadhama", "Nagarhole National Park", "Bandipur National Park", "Kabini",
      "Dandeli", "Kali Tiger Reserve", "Gokarna", "Om Beach", "Kudle Beach", "Murudeshwar",
      "Murudeshwar Temple", "Jog Falls", "Chikmagalur", "Mullayanagiri", "Baba Budangiri", "Sakleshpur",
      "Agumbe", "Udupi", "Sri Krishna Temple Udupi", "Malpe Beach", "St Mary's Island", "Mangaluru",
      "Panambur Beach", "Kadri Manjunath Temple", "Kodachadri", "Yana Caves", "Karwar"
    ]
  },
  {
    state: "Kerala",
    region: "South",
    centerLat: 10.8505,
    centerLon: 76.2711,
    bestSeason: "Sep - Mar",
    places: [
      "Thiruvananthapuram", "Sree Padmanabhaswamy Temple", "Kovalam", "Varkala Cliff", "Ponmudi",
      "Napier Museum", "Kanakakkunnu Palace", "Neyyar Wildlife Sanctuary", "Jatayu Earth Center",
      "Kollam", "Ashtamudi Lake", "Thangassery Lighthouse", "Munroe Island", "Alappuzha",
      "Alappuzha Backwaters", "Vembanad Lake", "Kumarakom", "Kumarakom Bird Sanctuary", "Marari Beach",
      "Kuttanad", "Kottayam", "Vagamon", "Idukki", "Idukki Dam", "Thekkady", "Periyar National Park",
      "Gavi", "Munnar", "Eravikulam National Park", "Mattupetty Dam", "Top Station", "Tea Museum",
      "Anamudi", "Marayoor", "Devikulam", "Kochi", "Fort Kochi", "Mattancherry Palace", "Jew Town",
      "Chinese Fishing Nets", "Marine Drive Kochi", "Cherai Beach", "Hill Palace", "Athirappilly Waterfalls",
      "Vazhachal Falls", "Thrissur", "Vadakkunnathan Temple", "Thrissur Zoo", "Palakkad", "Palakkad Fort",
      "Malampuzha", "Silent Valley National Park", "Nelliyampathy", "Kozhikode", "Kozhikode Beach", "Beypore",
      "Kappad Beach", "Wayanad", "Edakkal Caves", "Soochipara Falls", "Banasura Sagar Dam",
      "Tholpetty Wildlife Sanctuary", "Kannur", "St Angelo Fort", "Muzhappilangad Drive-in Beach",
      "Bekal", "Bekal Fort", "Ranipuram"
    ]
  },
  {
    state: "Madhya Pradesh",
    region: "Central",
    centerLat: 22.9734,
    centerLon: 78.6569,
    bestSeason: "Oct - Mar",
    places: [
      "Bhopal", "Upper Lake", "Van Vihar National Park", "Sanchi Stupa", "Bhojpur Temple",
      "Bhimbetka Rock Shelters", "Ujjain", "Mahakaleshwar Temple", "Kal Bhairav Temple", "Ram Ghat",
      "Gwalior", "Gwalior Fort", "Jai Vilas Palace", "Sas Bahu Temple", "Datia Palace", "Shivpuri",
      "Madhav National Park", "Orchha", "Orchha Fort", "Ram Raja Temple", "Chaturbhuj Temple",
      "Jhansi Fort", "Khajuraho", "Kandariya Mahadev Temple", "Western Group of Temples", "Panna",
      "Panna National Park", "Ken Gharial Sanctuary", "Ken Caves", "Bandhavgarh National Park",
      "Tala", "Kanha National Park", "Mukki", "Pench National Park", "Pachmarhi", "Bee Fall",
      "Dhoopgarh", "Jata Shankar Caves", "Satpura National Park", "Tamia", "Tamia Viewpoint",
      "Amarkantak", "Narmada Udgam", "Maihar", "Sharda Devi Temple", "Chitrakoot", "Ramghat",
      "Gupt Godavari", "Sphatik Shila", "Rewa", "Keoti Falls", "Purwa Falls", "Marble Rocks Bhedaghat",
      "Dhuandhar Falls", "Mandu", "Jahaz Mahal", "Hindola Mahal", "Rani Roopmati Pavilion", "Maheshwar",
      "Ahilya Fort", "Omkareshwar", "Omkareshwar Temple", "Burhanpur", "Asirgarh Fort", "Sanchi Udayagiri Caves"
    ]
  },
  {
    state: "Maharashtra",
    region: "West",
    centerLat: 19.7515,
    centerLon: 75.7139,
    bestSeason: "Oct - Mar (Monsoon: Jul-Sep)",
    places: [
      "Mumbai", "Gateway of India", "Marine Drive", "Chhatrapati Shivaji Maharaj Terminus",
      "Elephanta Caves", "Colaba Causeway", "Siddhivinayak Temple", "Haji Ali Dargah",
      "Sanjay Gandhi National Park", "Kanheri Caves", "Pune", "Shaniwar Wada", "Aga Khan Palace",
      "Sinhagad Fort", "Pataleshwar Cave Temple", "Lonavala", "Khandala", "Rajmachi", "Karla Caves",
      "Bhaja Caves", "Mahabaleshwar", "Panchgani", "Pratapgad Fort", "Venna Lake", "Wai", "Matheran",
      "Nashik", "Sula vineyards", "Trimbakeshwar Temple", "Pandavleni Caves", "Igatpuri", "Bhandardara",
      "Kalsubai Peak", "Shirdi", "Sai Baba Temple", "Aurangabad/Chhatrapati Sambhajinagar", "Bibi Ka Maqbara",
      "Daulatabad Fort", "Ellora Caves", "Ajanta Caves", "Lonar Lake", "Paithan", "Jyotiba Temple Kolhapur",
      "Kolhapur", "New Palace", "Panhala Fort", "Satara", "Kaas Plateau", "Thoseghar Falls", "Wai Ghats",
      "Tadoba-Andhari Tiger Reserve", "Nagpur", "Deekshabhoomi", "Raman Science Centre", "Pench access",
      "Sevagram", "Wardha", "Sindhudurg Fort", "Tarkarli", "Malvan", "Ganpatipule", "Ratnagiri",
      "Alibaug", "Murud-Janjira", "Harihareshwar", "Diveagar", "Raigad Fort", "Harishchandragad"
    ]
  },
  {
    state: "Manipur",
    region: "North-East",
    centerLat: 24.6637,
    centerLon: 93.9063,
    bestSeason: "Oct - Apr",
    places: [
      "Imphal", "Kangla Fort", "Imphal Polo Ground", "Ima Keithel", "Shri Govindajee Temple",
      "Manipur State Museum", "Andro", "Andro Shree Purtra Temple", "Sekta Archaeological Living Museum",
      "Loktak Lake", "Sendra Tourist Hub", "Keibul Lamjao National Park", "Keibul Lamjao", "Moirang",
      "INA Memorial", "Thangjing Hills", "Bishnupur", "Loukoi Pat", "Khongjom War Memorial",
      "Khongjom", "Ukhrul", "Shirui Hills", "Shirui Lily Reserve", "Kachai Village", "Dzukou Valley access",
      "Tamenglong", "Barak Waterfall", "Zeiladzang", "Jiribam", "Imphal War Cemetery",
      "Japanese War Memorial", "Marjing Polo Statue", "Cheirao Ching", "Khonghampat Orchidarium",
      "Leimaram Falls", "Sadu Chiru Waterfalls", "Thoubal", "Thoubal River", "Waithou Lake",
      "Andro Eco Park", "Phumdi Floating Village experience"
    ]
  },
  {
    state: "Meghalaya",
    region: "North-East",
    centerLat: 25.4670,
    centerLon: 91.3662,
    bestSeason: "Oct - May",
    places: [
      "Shillong", "Shillong Peak", "Elephant Falls", "Ward's Lake", "Lady Hydari Park",
      "Don Bosco Museum", "Cathedral of Mary Help of Christians", "Laitlum Canyons",
      "Mawphlang Sacred Forest", "Mawphlang Khasi Heritage Village", "Sohra/Cherrapunji",
      "Nohkalikai Falls", "Seven Sisters Falls", "Mawsmai Cave", "Arwah Cave", "Dainthlen Falls",
      "Wei Sawdong Falls", "Nongriat", "Double Decker Living Root Bridge", "Rainbow Falls", "Mawsynram",
      "Mawlynnong", "Balancing Rock", "Riwai Root Bridge", "Dawki", "Umngot River", "Shnongpdeng",
      "Krang Suri Falls", "Jowai", "Nartiang Monoliths", "Nartiang Durga Temple", "Syntu Ksiar",
      "Phe Phe Falls", "Amlarem", "West Jaintia Hills", "Nongkhnum Island", "Nongstoin", "Nongkhnum Falls",
      "Tura", "Nokrek National Park", "Pelga Falls", "Siju Caves", "Siju Wildlife Sanctuary",
      "Balpakram National Park", "Baghmara", "Simsanggre", "Rongjeng", "Williamnagar", "Umiam Lake",
      "Lumsohpet Byneng", "Dainthlen Valley", "Wah Khen", "Mawphu"
    ]
  },
  {
    state: "Mizoram",
    region: "North-East",
    centerLat: 23.1645,
    centerLon: 92.9376,
    bestSeason: "Oct - Mar",
    places: [
      "Aizawl", "Durtlang Hills", "Solomon's Temple", "Mizoram State Museum", "Reiek", "Reiek Tlang",
      "Hmuifang", "Hmuifang Tourist Resort", "Tamdil Lake", "Vantawng Falls", "Thenzawl",
      "Thenzawl Golf Course", "Saitual", "Khawnglung Wildlife Sanctuary", "Champhai", "Champhai viewpoint",
      "Murlen National Park", "Zokhawthar", "Rih Dil viewpoint", "Lunglei", "Lunglei Viewpoint",
      "Serchhip", "Chhingchhip", "Thenzawl Deer Park", "Phawngpui Blue Mountain National Park",
      "Phawngpui Peak", "Lawngtlai", "Sinlung Hills", "Dampa Tiger Reserve", "Mamit",
      "Reiek Heritage Village", "Falkawn", "Sialsuk", "Kolasib", "Tamdil", "Bairabi", "Vairengte",
      "Tuirihiau Falls", "Tuirihawn Falls", "Hnahthial", "Lalsavunga Park", "Khawzawl",
      "Tokalo Wildlife Sanctuary"
    ]
  },
  {
    state: "Nagaland",
    region: "North-East",
    centerLat: 26.1584,
    centerLon: 94.5624,
    bestSeason: "Oct - May (Hornbill: Dec)",
    places: [
      "Kohima", "Kohima War Cemetery", "State Museum Kohima", "Kisama Heritage Village",
      "Hornbill Festival grounds", "Nagaland State Museum", "Dzukou Valley", "Dzukou Valley Viewpoint",
      "Japfu Peak", "Khonoma", "Khonoma Green Village", "Dzuleke", "Viswema", "Jakhama", "Tseminyu",
      "Mokokchung", "Mopungchuket", "Longkhum", "Ungma", "Changtongya", "Tuophema", "Wokha",
      "Mount Tiyi", "Doyang Reservoir", "Dimapur", "Kachari Ruins", "Triple Falls", "Intangki National Park",
      "Peren", "Benreu", "Mt Pauna", "Mon", "Longwa", "Shangnyu Village", "Chui Village", "Tobu",
      "Tuensang", "Noklak", "Kiphire", "Saramati Peak", "Phek", "Pfutsero", "Shilloi Lake", "Meluri",
      "Fakim Wildlife Sanctuary", "Zunheboto", "Satoi Range", "Pfutsero Viewpoint", "Niuland",
      "Dzuleke village trails"
    ]
  },
  {
    state: "Odisha",
    region: "East",
    centerLat: 20.9517,
    centerLon: 85.0985,
    bestSeason: "Oct - Mar",
    places: [
      "Bhubaneswar", "Lingaraj Temple", "Udayagiri Caves", "Khandagiri Caves", "Mukteshwar Temple",
      "Rajarani Temple", "Dhauli Shanti Stupa", "Nandankanan Zoological Park", "Puri", "Jagannath Temple",
      "Puri Beach", "Gundicha Temple", "Konark", "Sun Temple", "Chandrabhaga Beach", "Ramachandi Temple",
      "Pipili", "Raghurajpur", "Chilika Lake", "Satapada", "Mangalajodi", "Barkul",
      "Nalaban Bird Sanctuary", "Cuttack", "Barabati Fort", "Netaji Birth Place Museum",
      "Dhabaleswar Temple", "Sambalpur", "Hirakud Dam", "Ghanteswari Temple", "Huma Leaning Temple",
      "Debrigarh Wildlife Sanctuary", "Bhitarkanika National Park", "Gahirmatha Marine Sanctuary",
      "Chandabali", "Paradip", "Odisha Maritime Museum", "Dhauli", "Similipal National Park",
      "Barehipani Falls", "Joranda Falls", "Baripada", "Mayurbhanj", "Rairangpur", "Koraput",
      "Deomali", "Gupteswar Cave", "Duduma Waterfall", "Rayagada", "Niyamgiri Hills", "Gopalpur-on-Sea",
      "Taptapani", "Daringbadi", "Chandipur Beach", "Balasore", "Astaranga", "Satkosia Gorge",
      "Tikarpada", "Hirapur Chausathi Yogini Temple"
    ]
  },
  {
    state: "Punjab",
    region: "North",
    centerLat: 31.1471,
    centerLon: 75.3412,
    bestSeason: "Oct - Mar",
    places: [
      "Amritsar", "Golden Temple", "Jallianwala Bagh", "Partition Museum", "Wagah-Attari Border",
      "Durgiana Temple", "Gobindgarh Fort", "Ram Tirath", "Pul Kanjari", "Bathinda Fort", "Bathinda Lake",
      "Talwandi Sabo", "Muktsar Sahib", "Anandpur Sahib", "Takht Sri Kesgarh Sahib", "Virasat-e-Khalsa",
      "Bhakra access", "Rupnagar", "Ropar Wetland", "Fatehgarh Sahib", "Gurdwara Fatehgarh Sahib",
      "Aam Khas Bagh Sirhind", "Patiala", "Qila Mubarak", "Sheesh Mahal", "Moti Bagh Palace",
      "Baradari Gardens", "Kapurthala", "Jagatjit Palace", "Pushpa Gujral Science City", "Moorish Mosque",
      "Jalandhar", "Devi Talab Mandir", "Wonderland", "Ludhiana", "Punjab Agricultural University Museum",
      "Rural Museum", "Maharaja Ranjit Singh War Museum", "Harike Wetland", "Abohar Wildlife Sanctuary",
      "Khatkar Kalan", "Shaheed Bhagat Singh Museum", "Sangrur", "Sunam", "Gurdwara Nanakiana Sahib",
      "Pathankot", "Ranjit Sagar Dam", "Mukerian", "Hoshiarpur", "Takhni-Rehmapur Wildlife Sanctuary",
      "Shaheedan da Memorial"
    ]
  },
  {
    state: "Rajasthan",
    region: "North",
    centerLat: 27.0238,
    centerLon: 74.2179,
    bestSeason: "Oct - Mar",
    places: [
      "Jaipur", "Amber Fort", "City Palace Jaipur", "Hawa Mahal", "Jantar Mantar Jaipur", "Nahargarh Fort",
      "Jaigarh Fort", "Albert Hall Museum", "Jal Mahal", "Galtaji", "Galta Monkey Temple", "Pushkar",
      "Brahma Temple", "Pushkar Lake", "Ajmer Sharif Dargah", "Ana Sagar Lake", "Kishangarh", "Alwar",
      "Bala Quila", "City Palace Alwar", "Siliserh Lake", "Sariska National Park", "Bhangarh Fort",
      "Bharatpur", "Keoladeo National Park", "Lohagarh Fort", "Deeg Palace", "Dholpur", "Machkund",
      "Chambal Safari", "Karauli", "City Palace Karauli", "Kaila Devi Temple", "Bundi", "Taragarh Fort",
      "Garh Palace", "Stepwells of Bundi", "Kota", "Chambal Garden", "Seven Wonders Park", "Kota Barrage",
      "Chittorgarh", "Chittorgarh Fort", "Vijay Stambh", "Kirti Stambh", "Kumbhalgarh Fort",
      "Ranakpur Jain Temple", "Udaipur", "City Palace Udaipur", "Lake Pichola", "Jag Mandir",
      "Sajjangarh Palace", "Saheliyon-ki-Bari", "Jodhpur", "Mehrangarh Fort", "Jaswant Thada",
      "Umaid Bhawan Palace", "Mandore Gardens", "Osian", "Jaisalmer", "Jaisalmer Fort", "Patwon Ki Haveli",
      "Gadisar Lake", "Sam Sand Dunes", "Khuri Sand Dunes", "Bikaner", "Junagarh Fort", "Lalgarh Palace",
      "Karni Mata Temple Deshnoke", "Kolayat", "Mount Abu", "Dilwara Temples", "Nakki Lake", "Guru Shikhar",
      "Sirohi", "Barmer", "Kiradu Temples", "Nagaur Fort", "Shekhawati", "Mandawa", "Nawalgarh",
      "Fatehpur", "Neemrana Fort", "Ranthambore National Park", "Sawai Madhopur", "Desert National Park"
    ]
  },
  {
    state: "Sikkim",
    region: "North-East",
    centerLat: 27.5330,
    centerLon: 88.5122,
    bestSeason: "Mar - May, Oct - Dec",
    places: [
      "Gangtok", "MG Marg", "Rumtek Monastery", "Enchey Monastery", "Ganesh Tok", "Hanuman Tok",
      "Tashi View Point", "Namgyal Institute of Tibetology", "Do Drul Chorten", "Banjhakri Falls",
      "Nathula Pass", "Tsomgo Lake", "Baba Harbhajan Singh Temple", "Kupup Lake", "Zuluk",
      "Thambi View Point", "Nathang Valley", "Pelling", "Pemayangtse Monastery", "Rabdentse Ruins",
      "Khecheopalri Lake", "Yuksom", "Dubdi Monastery", "Kanchenjunga Falls", "Ravangla", "Buddha Park",
      "Ralong Monastery", "Borang", "Namchi", "Char Dham", "Samdruptse", "Temi Tea Garden", "Mangan",
      "Singhik", "Lachen", "Lachung", "Yumthang Valley", "Zero Point", "Gurudongmar Lake", "Chopta Valley",
      "Chungthang", "Dzongu", "Phodong Monastery", "Kabi Lungchok", "Aritar", "Lampokhari Lake",
      "Rhenock", "Legship", "Jorethang", "Tashiding Monastery", "Sillery Gaon access"
    ]
  },
  {
    state: "Tamil Nadu",
    region: "South",
    centerLat: 11.1271,
    centerLon: 78.6569,
    bestSeason: "Nov - Mar",
    places: [
      "Chennai", "Marina Beach", "Kapaleeshwarar Temple", "Fort St George", "San Thome Basilica",
      "Government Museum Chennai", "Mahabalipuram/Mamallapuram", "Shore Temple", "Pancha Rathas",
      "Arjuna's Penance", "Kanchipuram", "Kailasanathar Temple", "Ekambareswarar Temple",
      "Kamakshi Amman Temple", "Vedanthangal Bird Sanctuary", "Pulicat Lake", "Pudukkottai",
      "Sittannavasal", "Thanjavur", "Brihadisvara Temple", "Thiruvaiyaru", "Kumbakonam", "Mahamaham Tank",
      "Darasuram Airavatesvara Temple", "Trichy/Tiruchirappalli", "Rockfort",
      "Sri Ranganathaswamy Temple Srirangam", "Samayapuram", "Chettinad", "Karaikudi", "Athangudi Palace",
      "Madurai", "Meenakshi Amman Temple", "Thirumalai Nayak Palace", "Alagar Koyil", "Rameswaram",
      "Ramanathaswamy Temple", "Pamban Bridge", "Dhanushkodi", "Kanyakumari", "Vivekananda Rock Memorial",
      "Thiruvalluvar Statue", "Suchindram", "Courtallam", "Tirunelveli", "Nellaiappar Temple", "Ooty",
      "Botanical Gardens", "Ooty Lake", "Doddabetta", "Coonoor", "Sim's Park", "Kotagiri", "Coimbatore",
      "Marudamalai Temple", "Isha Yoga Center", "Valparai", "Pollachi", "Topslip", "Kodaikanal",
      "Kodai Lake", "Coaker's Walk", "Silver Cascade", "Palani", "Palani Murugan Temple", "Yercaud",
      "Hogenakkal Falls", "Yelagiri", "Vellore Golden Temple", "Vellore Fort", "Gingee Fort",
      "Point Calimere Wildlife Sanctuary", "Mudumalai Tiger Reserve", "Guindy National Park"
    ]
  },
  {
    state: "Telangana",
    region: "South",
    centerLat: 18.1124,
    centerLon: 79.0193,
    bestSeason: "Oct - Mar",
    places: [
      "Hyderabad", "Charminar", "Golconda Fort", "Qutb Shahi Tombs", "Chowmahalla Palace",
      "Salar Jung Museum", "Mecca Masjid", "Hussain Sagar Lake", "Necklace Road", "Birla Mandir",
      "Nehru Zoological Park", "Shilparamam", "Ramoji Film City", "Durgam Cheruvu", "Osman Sagar",
      "Himayat Sagar", "Warangal", "Warangal Fort", "Thousand Pillar Temple", "Bhadrakali Temple",
      "Pakhal Lake", "Pakhal Wildlife Sanctuary", "Ramappa Temple", "Ramappa Lake", "Palampet",
      "Laknavaram Lake", "Bogatha Waterfall", "Kuntala Waterfall", "Pochera Waterfall",
      "Basar Saraswati Temple", "Basara", "Adilabad", "Kawal Tiger Reserve", "Nirmal", "Nirmal Fort",
      "Karimnagar", "Elgandal Fort", "Vemulawada", "Rajanna Temple", "Yadadri",
      "Yadadri Lakshmi Narasimha Temple", "Bhongir Fort", "Nagarjuna Sagar", "Nagarjuna Sagar Dam",
      "Nagarjunakonda", "Srisailam access", "Kinnerasani Wildlife Sanctuary", "Bhadrachalam", "Ram Temple",
      "Kaleshwaram", "Medaram", "Sammakka Saralamma shrine", "Ananthagiri Hills Vikarabad",
      "Pocharam Wildlife Sanctuary", "Singur Dam", "Medak Cathedral", "Medak Fort", "Durgapuram",
      "Khammam", "Kinnerasani Dam"
    ]
  },
  {
    state: "Tripura",
    region: "North-East",
    centerLat: 23.9408,
    centerLon: 91.9882,
    bestSeason: "Oct - Mar",
    places: [
      "Agartala", "Ujjayanta Palace", "Neermahal Palace", "Sepahijala Wildlife Sanctuary",
      "Tripura State Museum", "Heritage Park", "Jagannath Temple Agartala", "Laxminarayan Temple",
      "Venuban Vihar", "Unakoti", "Unakoti rock carvings", "Jampui Hills", "Vanghmun", "Dumboor Lake",
      "Neermahal", "Rudrasagar Lake", "Pilak Archaeological Site", "Pilak Museum", "Chabimura",
      "Devtamura rock carvings", "Matabari/Tripureswari Temple", "Kamalasagar Kali Temple", "Sepahijala",
      "Trishna Wildlife Sanctuary", "Gumti Wildlife Sanctuary", "Jampui Orange Festival area",
      "Boxanagar", "Melaghar", "Udaipur Tripura", "Tepania Eco Park", "Old Agartala",
      "Nirmahal boat point", "Bhuvaneswari Temple Udaipur", "Jagannath Dighi", "Gandacherra",
      "Dumbur Reservoir", "Manu Valley", "Kailashahar", "Lakshminarayan Temple Kailashahar",
      "Roa Wildlife Sanctuary", "Kailashahar heritage sites"
    ]
  },
  {
    state: "Uttar Pradesh",
    region: "North",
    centerLat: 26.8467,
    centerLon: 80.9462,
    bestSeason: "Oct - Mar",
    places: [
      "Agra", "Taj Mahal", "Agra Fort", "Itmad-ud-Daulah", "Mehtab Bagh", "Fatehpur Sikri",
      "Akbar's Tomb Sikandra", "Mathura", "Krishna Janmabhoomi", "Vishram Ghat", "Vrindavan",
      "Banke Bihari Temple", "ISKCON Vrindavan", "Prem Mandir", "Govardhan", "Kusum Sarovar",
      "Barsana", "Nandgaon", "Gokul", "Varanasi", "Kashi Vishwanath Temple", "Dashashwamedh Ghat",
      "Assi Ghat", "Sarnath", "Dhamek Stupa", "Chaukhandi Stupa", "Ramnagar Fort", "Prayagraj",
      "Triveni Sangam", "Allahabad Fort", "Anand Bhavan", "Chitrakoot", "Ramghat", "Gupt Godavari",
      "Ayodhya", "Ram Mandir", "Hanuman Garhi", "Kanak Bhawan", "Saryu Ghat", "Lucknow",
      "Bara Imambara", "Chota Imambara", "Rumi Darwaza", "British Residency", "Hazratganj",
      "Dudhwa National Park", "Katarniaghat Wildlife Sanctuary", "Naimisharanya", "Vindhyachal",
      "Mirzapur", "Chunar Fort", "Jhansi", "Jhansi Fort", "Orchha access", "Kanpur", "JK Temple",
      "Allen Forest Zoo", "Sravasti", "Jetavana", "Kushinagar", "Mahaparinirvana Temple",
      "Kapilavastu", "Kaushambi", "Deogarh", "Bateshwar", "Etawah Safari Park", "Agra Bear Rescue Center",
      "Pilibhit Tiger Reserve", "Hastinapur", "Sandi Bird Sanctuary", "Nawabganj Bird Sanctuary"
    ]
  },
  {
    state: "Uttarakhand",
    region: "North",
    centerLat: 30.0668,
    centerLon: 79.0193,
    bestSeason: "Mar - Jun, Sep - Nov",
    places: [
      "Dehradun", "Forest Research Institute", "Robber's Cave", "Sahastradhara", "Mindrolling Monastery",
      "Mussoorie", "Mall Road", "Kempty Falls", "Gun Hill", "Lal Tibba", "Landour", "Dhanaulti",
      "Chakrata", "Tiger Falls", "Rishikesh", "Laxman Jhula area", "Ram Jhula area", "Triveni Ghat",
      "Neelkanth Mahadev", "Rajaji National Park", "Haridwar", "Har Ki Pauri", "Mansa Devi Temple",
      "Chandi Devi Temple", "Ranikhet", "Chaubatia Gardens", "Nainital", "Naini Lake", "Naina Devi Temple",
      "Snow View", "Bhimtal", "Sattal", "Naukuchiatal", "Almora", "Bright End Corner", "Kasar Devi",
      "Binsar Wildlife Sanctuary", "Kausani", "Anashakti Ashram", "Baijnath Temple", "Bageshwar",
      "Jageshwar", "Pithoragarh", "Munsiyari", "Dharchula", "Chaukori", "Auli", "Joshimath",
      "Badrinath", "Valley of Flowers", "Hemkund Sahib", "Mana Village", "Kedarnath", "Gangotri",
      "Yamunotri", "Uttarkashi", "Harsil", "Tehri Lake", "New Tehri", "Lansdowne", "Kanatal",
      "Chopta", "Tungnath", "Deoria Tal", "Pauri", "Devprayag", "Rudraprayag", "Karnaprayag",
      "Nainital Gurney House"
    ]
  },
  {
    state: "West Bengal",
    region: "East",
    centerLat: 22.9868,
    centerLon: 87.8550,
    bestSeason: "Oct - Mar",
    places: [
      "Kolkata", "Victoria Memorial", "Howrah Bridge", "Indian Museum", "St Paul's Cathedral",
      "Marble Palace", "Park Street", "Dakshineswar Kali Temple", "Belur Math", "Science City Kolkata",
      "Eco Park New Town", "Kalighat Temple", "Sundarbans National Park", "Sunderban Tiger Camp region",
      "Darjeeling", "Tiger Hill", "Darjeeling Himalayan Railway", "Batasia Loop",
      "Himalayan Mountaineering Institute", "Padmaja Naidu Himalayan Zoological Park",
      "Happy Valley Tea Estate", "Sandakphu", "Kalimpong", "Deolo Hill", "Durpin Monastery", "Lava",
      "Loleygaon", "Neora Valley National Park", "Kurseong", "Mirik", "Siliguri",
      "Mahananda Wildlife Sanctuary", "Dooars", "Gorumara National Park", "Jaldapara National Park",
      "Buxa Tiger Reserve", "Alipurduar", "Jalpaiguri", "Murshidabad", "Hazarduari Palace",
      "Katra Mosque", "Nabadwip", "Mayapur", "Bishnupur", "Rasmancha", "Terracotta Temples",
      "Bankura", "Shantiniketan", "Tagore's Ashram", "Bolpur", "Digha", "Mandarmani", "Bakkhali",
      "Ganga Sagar", "Chandannagar", "Malda", "Gour", "Adina Mosque", "Cooch Behar Palace", "Taki",
      "Henry's Island"
    ]
  },
  {
    state: "Delhi",
    region: "North",
    centerLat: 28.6139,
    centerLon: 77.2090,
    bestSeason: "Oct - Mar",
    places: [
      "India Gate", "Rashtrapati Bhavan", "Parliament area", "Qutub Minar", "Humayun's Tomb", "Red Fort",
      "Jama Masjid", "Raj Ghat", "Lotus Temple", "Akshardham Temple", "Gurudwara Bangla Sahib",
      "Gurudwara Sis Ganj Sahib", "Jantar Mantar", "Purana Qila", "Safdarjung Tomb", "Lodhi Garden",
      "Agrasen ki Baoli", "National Museum", "National Rail Museum", "National Gallery of Modern Art",
      "Nehru Planetarium", "Dilli Haat", "Hauz Khas Village", "Hauz Khas Fort",
      "Mehrauli Archaeological Park", "Tughlaqabad Fort", "Sunder Nursery", "Garden of Five Senses",
      "Chandni Chowk", "Connaught Place", "Khan Market", "Rajpath/Kartavya Path",
      "National Zoological Park", "Purana Qila Lake", "Mughal Garden/Amrit Udyan", "Waste to Wonder Park",
      "Majnu ka Tilla", "Feroz Shah Kotla Fort", "Begumpur Mosque", "Isa Khan's Tomb", "Nizamuddin Dargah",
      "Chhatarpur Temple"
    ]
  },
  {
    state: "Jammu and Kashmir",
    region: "North",
    centerLat: 33.7782,
    centerLon: 76.5762,
    bestSeason: "Apr - Oct (Snow: Dec - Feb)",
    places: [
      "Srinagar", "Dal Lake", "Mughal Gardens", "Nishat Bagh", "Shalimar Bagh", "Chashme Shahi",
      "Pari Mahal", "Hazratbal Shrine", "Shankaracharya Temple", "Old City Srinagar", "Tulip Garden",
      "Wular Lake", "Manasbal Lake", "Gulmarg", "Gulmarg Gondola", "Khilanmarg", "Apharwat Peak",
      "Tangmarg", "Pahalgam", "Betaab Valley", "Aru Valley", "Chandanwari", "Lidder River", "Sonamarg",
      "Thajiwas Glacier", "Zoji La viewpoint", "Doodhpathri", "Yusmarg", "Aharbal Waterfall", "Kokernag",
      "Verinag", "Achabal Gardens", "Pulwama", "Avantipur Ruins", "Anantnag", "Martand Sun Temple",
      "Patnitop", "Sanasar", "Nathatop", "Bhaderwah", "Shiv Khori", "Katra", "Vaishno Devi",
      "Bahu Fort Jammu", "Mubarak Mandi Palace", "Mansar Lake", "Surinsar Lake", "Akhnoor Fort",
      "Rajouri", "Pir Panjal viewpoints", "Gurez Valley", "Dawar", "Lolab Valley", "Kupwara",
      "Bangus Valley", "Aasiya caves region", "Dachigam National Park"
    ]
  },
  {
    state: "Ladakh",
    region: "North",
    centerLat: 34.1526,
    centerLon: 77.5771,
    bestSeason: "May - Sep",
    places: [
      "Leh", "Leh Palace", "Shanti Stupa", "Namgyal Tsemo", "Hall of Fame", "Thiksey Monastery",
      "Shey Palace", "Rancho School/3 Idiots point", "Hemis Monastery", "Stok Palace", "Stok Village",
      "Spituk Monastery", "Alchi Monastery", "Likir Monastery", "Lamayuru", "Lamayuru Moonland",
      "Magnetic Hill", "Gurudwara Pathar Sahib", "Nimmu", "Zanskar", "Khardung La", "Nubra Valley",
      "Diskit Monastery", "Hunder Sand Dunes", "Turtuk", "Panamik Hot Springs", "Sumur", "Yarab Tso",
      "Pangong Lake", "Shachukul", "Hanle", "Hanle Observatory", "Tso Moriri", "Korzok", "Tso Kar",
      "More Plains", "Sarchu", "Tanglang La", "Chang La", "Diksit", "Zanskar Valley", "Padum",
      "Phuktal Monastery", "Zangla", "Karsha Monastery", "Lamayuru", "Fotu La", "Namika La",
      "Moonland", "Dha-Hanu", "Basgo Palace", "Deskit"
    ]
  },
  {
    state: "Andaman and Nicobar Islands",
    region: "South",
    centerLat: 11.7401,
    centerLon: 92.6586,
    bestSeason: "Oct - May",
    places: [
      "Sri Vijaya Puram/Port Blair", "Cellular Jail", "Corbyn's Cove", "Chidiya Tapu",
      "Munda Pahad Beach", "Ross Island", "North Bay Island", "Viper Island",
      "Samudrika Naval Marine Museum", "Anthropological Museum", "Fisheries Museum", "Mount Harriet",
      "Mahatma Gandhi Marine National Park", "Jolly Buoy Island", "Red Skin Island",
      "Havelock/Swaraj Dweep", "Radhanagar Beach", "Elephant Beach", "Kalapathar Beach",
      "Govind Nagar Beach", "Neil/Shaheed Dweep", "Bharatpur Beach", "Laxmanpur Beach", "Natural Bridge",
      "Sitapur Beach", "Baratang", "Limestone Caves", "Parrot Island", "Mud Volcano", "Rangat",
      "Amkunj Beach", "Dhani Nallah", "Moricedera", "Cutbert Bay", "Long Island", "Lalaji Bay Beach",
      "Diglipur", "Ross & Smith Islands", "Kalipur Beach", "Saddle Peak", "Smith Island", "Mayabunder",
      "Avis Island", "Karmatang Beach", "Great Nicobar", "Galathea National Park", "Campbell Bay",
      "Indira Point", "Little Andaman", "Butler Bay", "Hutbay"
    ]
  },
  {
    state: "Chandigarh",
    region: "North",
    centerLat: 30.7333,
    centerLon: 76.7794,
    bestSeason: "Oct - Mar",
    places: [
      "Rock Garden", "Sukhna Lake", "Rose Garden", "Capitol Complex",
      "Government Museum and Art Gallery", "Le Corbusier Centre", "Sector 17 Plaza",
      "Open Hand Monument", "Japanese Garden", "Terraced Garden", "Leisure Valley", "Pinjore access",
      "Sukhna Wildlife Sanctuary", "Botanical Garden", "International Dolls Museum", "Cactus Garden access",
      "Garden of Fragrance", "Bougainvillea Garden", "Topiary Park", "Fitness Trails", "Shanti Kunj",
      "Lake Club", "Chandigarh War Memorial"
    ]
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    region: "West",
    centerLat: 20.4283,
    centerLon: 72.8397,
    bestSeason: "Oct - Mar",
    places: [
      "Daman", "Devka Beach", "Jampore Beach", "Daman Fort", "Moti Daman Fort", "Nani Daman Fort",
      "St Jerome Fort", "Bom Jesus Church Daman", "Naida Caves", "Diu", "Diu Fort", "Naida Caves Diu",
      "Nagoa Beach", "Ghogla Beach", "Jallandhar Beach", "St Paul's Church Diu", "INS Khukri Memorial",
      "Diu Museum", "Panikota Fort", "Fudam Bird Sanctuary", "Gangeshwar Temple", "Shell Museum",
      "Silvassa", "Tribal Cultural Museum", "Vanganga Lake Garden", "Dudhani Lake", "Dudhni Waterfalls",
      "Satmaliya Deer Sanctuary", "Khanvel", "Nakshatra Garden", "Hirwa Van Garden", "Bindrabin Temple",
      "Madhuban Dam", "Lion Safari Vasona", "Tithal access", "Athal", "Dadra Garden"
    ]
  },
  {
    state: "Lakshadweep",
    region: "South",
    centerLat: 10.5667,
    centerLon: 72.6417,
    bestSeason: "Oct - May",
    places: [
      "Kavaratti", "Kavaratti Beach", "Ujra Mosque", "Kavaratti Aquarium", "Agatti Island", "Agatti Lagoon",
      "Bangaram Island", "Thinnakara Island", "Kalpeni", "Kalpeni Lagoon", "Minicoy Island",
      "Minicoy Lighthouse", "Minicoy Village", "Kadmat Island", "Kadmat Beach", "Amini Island",
      "Andrott Island", "Andrott Juma Masjid", "Kiltan Island", "Chetlat Island", "Bitra Island",
      "Suheli Atoll", "Parali I & II", "Marine conservation zones", "Snorkelling lagoons",
      "Scuba diving reefs", "Coral viewing trips", "glass-bottom boat routes"
    ]
  },
  {
    state: "Puducherry",
    region: "South",
    centerLat: 11.9416,
    centerLon: 79.8083,
    bestSeason: "Oct - Mar",
    places: [
      "Puducherry/French Quarter", "Promenade Beach", "Rock Beach", "White Town",
      "Sri Aurobindo Ashram", "Manakula Vinayagar Temple", "Basilica of the Sacred Heart of Jesus",
      "Pondicherry Museum", "Bharati Park", "Government Botanical Garden", "Old Lighthouse",
      "French War Memorial", "Auroville", "Matrimandir", "Visitors Centre Auroville", "Paradise Beach",
      "Chunnambar Boat House", "Serenity Beach", "Auroville Beach", "Mahe", "Mahe River", "Yanam",
      "Yanam Ferry Road", "Karaikal", "Karaikal Ammaiyar Temple", "Karaikal Beach", "Nallambal Lake",
      "Ousteri Lake", "Ousteri Wetland and Bird Sanctuary", "Arikamedu Archaeological Site",
      "Gingee access", "Villianur Temple", "Ousteri viewpoint"
    ]
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function determineCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('temple') || n.includes('mandir') || n.includes('ghat') || n.includes('ashram') ||
      n.includes('stupa') || n.includes('monastery') || n.includes('church') || n.includes('basilica') ||
      n.includes('cathedral') || n.includes('mosque') || n.includes('dargah') || n.includes('gurdwara') ||
      n.includes('shrine') || n.includes('jain') || n.includes('satra') || n.includes('math') || n.includes('kund')) {
    return "Religious & Spiritual";
  }
  if (n.includes('fort') || n.includes('palace') || n.includes('museum') || n.includes('memorial') ||
      n.includes('ruins') || n.includes('archaeological') || n.includes('tomb') || n.includes('monument') ||
      n.includes('heritage') || n.includes('qila') || n.includes('darwaza') || n.includes('gumbaz') ||
      n.includes('stepwell') || n.includes('haveli') || n.includes('bazaar') || n.includes('chowk')) {
    return "Heritage & Culture";
  }
  if (n.includes('falls') || n.includes('waterfall')) {
    return "Waterfalls";
  }
  if (n.includes('beach') || n.includes('island') || n.includes('cove') || n.includes('coral') || n.includes('reef') || n.includes('snorkelling') || n.includes('scuba')) {
    return "Beaches & Coastal";
  }
  if (n.includes('lake') || n.includes('tso') || n.includes('tal') || n.includes('dam') ||
      n.includes('river') || n.includes('backwaters') || n.includes('reservoir') || n.includes('barrage') || n.includes('canal')) {
    return "Lakes & Waterways";
  }
  if (n.includes('national park') || n.includes('wildlife') || n.includes('sanctuary') ||
      n.includes('tiger reserve') || n.includes('bird') || n.includes('zoo') || n.includes('safari') || n.includes('forest')) {
    return "Wildlife & Nature";
  }
  if (n.includes('hill') || n.includes('valley') || n.includes('pass') || n.includes('peak') ||
      n.includes('viewpoint') || n.includes('cave') || n.includes('caves') || n.includes('trail') || n.includes('dunes')) {
    return "Hill Stations & Scenic";
  }
  return "Sightseeing & Exploration";
}

const CATEGORY_IMAGES = {
  "Heritage & Culture": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    "https://images.unsplash.com/photo-1600100397608-f010e427d117?w=800"
  ],
  "Religious & Spiritual": [
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
    "https://images.unsplash.com/photo-1609137144822-26152a55928f?w=800"
  ],
  "Waterfalls": [
    "https://images.unsplash.com/photo-1546548970-71785318a17b?w=800",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"
  ],
  "Beaches & Coastal": [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
  ],
  "Lakes & Waterways": [
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
  ],
  "Wildlife & Nature": [
    "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800",
    "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800"
  ],
  "Hill Stations & Scenic": [
    "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800",
    "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800",
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800"
  ],
  "Sightseeing & Exploration": [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800"
  ]
};

let totalPlacesCount = 0;
const allPlaces = [];
const stateSummaries = [];

RAW_STATES_DATA.forEach((sData, sIndex) => {
  const statePlaces = [];
  sData.places.forEach((pName, pIndex) => {
    totalPlacesCount++;
    const cat = determineCategory(pName);
    const catImages = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES["Sightseeing & Exploration"];
    const image = catImages[(pIndex + sIndex) % catImages.length];
    
    // Distribute coordinates slightly around state center for variety on map
    const angle = (pIndex / sData.places.length) * 2 * Math.PI;
    const radius = 0.2 + ((pIndex % 7) * 0.18);
    const lat = +(sData.centerLat + Math.sin(angle) * radius).toFixed(4);
    const lon = +(sData.centerLon + Math.cos(angle) * radius).toFixed(4);

    const placeRecord = {
      id: `${slugify(sData.state)}-${pIndex + 1}-${slugify(pName)}`,
      name: pName,
      state: sData.state,
      region: sData.region,
      category: cat,
      lat,
      lon,
      rating: +(4.2 + ((pIndex * 7) % 7) * 0.1).toFixed(1),
      image,
      bestSeason: sData.bestSeason,
      description: `${pName} is a curated highlight in ${sData.state}, renowned for its scenic beauty, architecture, and cultural charm.`,
      tags: [sData.state, sData.region, cat.split(' ')[0], "Curated 2026 Directory"]
    };

    allPlaces.push(placeRecord);
    statePlaces.push(placeRecord);
  });

  stateSummaries.push({
    state: sData.state,
    region: sData.region,
    count: sData.places.length,
    centerLat: sData.centerLat,
    centerLon: sData.centerLon,
    bestSeason: sData.bestSeason,
    sampleImage: statePlaces[0]?.image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
  });
});

console.log(`Successfully generated ${allPlaces.length} places across ${stateSummaries.length} states/UTs.`);

// Save JSON master file
const jsonPath = path.join(process.cwd(), 'src', 'data', 'indiaTouristPlacesMaster.json');
fs.writeFileSync(jsonPath, JSON.stringify({
  version: "1.0.0",
  title: "India Tourist Places Master Directory (SIH 2026)",
  totalPlaces: allPlaces.length,
  totalStates: stateSummaries.length,
  states: stateSummaries,
  places: allPlaces
}, null, 2));

// Save TS wrapper file
const tsPath = path.join(process.cwd(), 'src', 'data', 'touristPlacesMaster.ts');
const tsContent = `// Auto-generated master dataset of 1,924 Indian Tourist Places across 36 States & UTs
import masterData from './indiaTouristPlacesMaster.json';

export interface TouristPlace {
  id: string;
  name: string;
  state: string;
  region: "South" | "North" | "East" | "West" | "Central" | "North-East";
  category: string;
  lat: number;
  lon: number;
  rating: number;
  image: string;
  bestSeason: string;
  description: string;
  tags: string[];
}

export interface StateSummary {
  state: string;
  region: string;
  count: number;
  centerLat: number;
  centerLon: number;
  bestSeason: string;
  sampleImage: string;
}

export const TOURIST_PLACES_MASTER: TouristPlace[] = masterData.places as TouristPlace[];
export const STATES_MASTER: StateSummary[] = masterData.states as StateSummary[];
export const TOTAL_TOURIST_PLACES = masterData.totalPlaces;
export const TOTAL_STATES_COUNT = masterData.totalStates;

export const PLACES_BY_ID = new Map<string, TouristPlace>(
  TOURIST_PLACES_MASTER.map((p) => [p.id, p])
);

export const PLACES_BY_STATE = new Map<string, TouristPlace[]>();
for (const p of TOURIST_PLACES_MASTER) {
  if (!PLACES_BY_STATE.has(p.state)) PLACES_BY_STATE.set(p.state, []);
  PLACES_BY_STATE.get(p.state)!.push(p);
}
`;

fs.writeFileSync(tsPath, tsContent);
console.log("Written master files successfully!");
