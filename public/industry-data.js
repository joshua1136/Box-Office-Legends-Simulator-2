// Real-world industry reference layer. Game outcomes are simulated and fictional.
window.INDUSTRY_PEOPLE = {
 actors: [
  {name:'Leonardo DiCaprio',role:'Actor',talent:96,popularity:96,genres:['Drama','Thriller','Crime'],fee:25000000},
  {name:'Margot Robbie',role:'Actor',talent:94,popularity:95,genres:['Drama','Comedy','Action'],fee:22000000},
  {name:'Tom Holland',role:'Actor',talent:88,popularity:97,genres:['Action','Adventure','Drama'],fee:18000000},
  {name:'Zendaya',role:'Actor',talent:91,popularity:97,genres:['Drama','Romance','Sci-Fi'],fee:18000000},
  {name:'Florence Pugh',role:'Actor',talent:93,popularity:91,genres:['Drama','Horror','Thriller'],fee:12000000},
  {name:'Ryan Gosling',role:'Actor',talent:92,popularity:94,genres:['Drama','Comedy','Action'],fee:20000000}
 ],
 directors: [
  {name:'Christopher Nolan',role:'Director',talent:99,popularity:97,genres:['Drama','Thriller','Sci-Fi','Action'],fee:35000000},
  {name:'Greta Gerwig',role:'Director',talent:95,popularity:94,genres:['Drama','Comedy','Romance'],fee:18000000},
  {name:'Denis Villeneuve',role:'Director',talent:98,popularity:94,genres:['Sci-Fi','Drama','Thriller','Action'],fee:28000000},
  {name:'Jordan Peele',role:'Director',talent:94,popularity:88,genres:['Horror','Thriller','Comedy'],fee:14000000},
  {name:'Bong Joon-ho',role:'Director',talent:97,popularity:87,genres:['Drama','Thriller','Crime'],fee:16000000}
 ],
 writers: [
  {name:'Aaron Sorkin',role:'Writer',talent:97,popularity:89,genres:['Drama','Crime'],fee:9000000},
  {name:'Charlie Kaufman',role:'Writer',talent:96,popularity:78,genres:['Drama','Comedy','Thriller'],fee:6000000},
  {name:'Quentin Tarantino',role:'Writer',talent:98,popularity:92,genres:['Crime','Action','Drama'],fee:12000000},
  {name:'Greta Gerwig',role:'Writer',talent:94,popularity:94,genres:['Drama','Comedy','Romance'],fee:8000000}
 ],
 composers: [
  {name:'Hans Zimmer',role:'Composer',talent:99,popularity:96,genres:['Action','Sci-Fi','Drama'],fee:12000000},
  {name:'Ludwig Göransson',role:'Composer',talent:96,popularity:93,genres:['Action','Sci-Fi','Drama'],fee:9000000},
  {name:'Hildur Guðnadóttir',role:'Composer',talent:97,popularity:87,genres:['Drama','Thriller','Horror'],fee:6500000},
  {name:'John Williams',role:'Composer',talent:99,popularity:95,genres:['Adventure','Fantasy','Sci-Fi'],fee:10000000}
 ],
 cinematographers: [
  {name:'Roger Deakins',role:'Cinematographer',talent:99,popularity:90,genres:['Drama','Thriller','Action'],fee:8000000},
  {name:'Hoyte van Hoytema',role:'Cinematographer',talent:98,popularity:91,genres:['Sci-Fi','Drama','Action'],fee:7500000},
  {name:'Greig Fraser',role:'Cinematographer',talent:97,popularity:91,genres:['Sci-Fi','Action','Drama'],fee:7000000},
  {name:'Emmanuel Lubezki',role:'Cinematographer',talent:99,popularity:89,genres:['Drama','Adventure'],fee:7500000}
 ],
 editors: [
  {name:'Thelma Schoonmaker',role:'Editor',talent:99,popularity:88,genres:['Drama','Crime','Thriller'],fee:6500000},
  {name:'Jennifer Lame',role:'Editor',talent:96,popularity:89,genres:['Drama','Sci-Fi','Thriller'],fee:5000000},
  {name:'Lee Smith',role:'Editor',talent:97,popularity:88,genres:['Action','Sci-Fi','Drama'],fee:5500000},
  {name:'Joe Walker',role:'Editor',talent:97,popularity:86,genres:['Sci-Fi','Drama','Thriller'],fee:5000000}
 ],
 vfx: [
  {name:'Dan Lemmon',role:'VFX Supervisor',talent:97,popularity:84,genres:['Fantasy','Sci-Fi','Adventure'],fee:7000000},
  {name:'Joe Letteri',role:'VFX Supervisor',talent:99,popularity:91,genres:['Fantasy','Sci-Fi','Adventure'],fee:9000000},
  {name:'Paul Franklin',role:'VFX Supervisor',talent:99,popularity:89,genres:['Sci-Fi','Action','Adventure'],fee:8500000},
  {name:'Roger Guyett',role:'VFX Supervisor',talent:98,popularity:88,genres:['Sci-Fi','Action','Fantasy'],fee:8000000}
 ]
};
window.INDUSTRY_STUDIOS = [
 {name:'Warner Bros. Pictures',type:'Major Studio',reputation:96},
 {name:'Universal Pictures',type:'Major Studio',reputation:96},
 {name:'Walt Disney Studios',type:'Major Studio',reputation:98},
 {name:'Paramount Pictures',type:'Major Studio',reputation:91},
 {name:'Sony Pictures',type:'Major Studio',reputation:92},
 {name:'Lionsgate',type:'Studio',reputation:84},
 {name:'A24',type:'Independent Studio',reputation:88},
 {name:'Amazon MGM Studios',type:'Major Studio',reputation:90},
 {name:'Apple Studios',type:'Streaming Studio',reputation:89},
 {name:'Legendary Entertainment',type:'Production Company',reputation:91},
 {name:'Skydance',type:'Production Company',reputation:89},
 {name:'Blumhouse Productions',type:'Production Company',reputation:86}
];
window.INDUSTRY_STREAMERS = [
 {name:'Netflix',focus:['Drama','Thriller','Comedy','Sci-Fi'],appetite:'Very High'},
 {name:'Disney+',focus:['Animation','Adventure','Family','Fantasy'],appetite:'High'},
 {name:'Max',focus:['Drama','Thriller','Crime','Prestige'],appetite:'High'},
 {name:'Hulu',focus:['Drama','Comedy','Thriller'],appetite:'Medium'},
 {name:'Prime Video',focus:['Action','Drama','Comedy','Thriller'],appetite:'High'},
 {name:'Apple TV+',focus:['Drama','Sci-Fi','Thriller','Prestige'],appetite:'Medium'},
 {name:'Paramount+',focus:['Action','Comedy','Drama','Franchise'],appetite:'Medium'},
 {name:'Peacock',focus:['Comedy','Thriller','Drama'],appetite:'Medium'}
];