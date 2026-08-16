// Real-world industry reference layer. Game outcomes are simulated and fictional.
window.INDUSTRY_PEOPLE = {
 actors: [
  {name:'Leonardo DiCaprio',role:'Actor',gender:'male',talent:96,popularity:96,genres:['Drama','Thriller','Crime'],fee:25000000},
  {name:'Margot Robbie',role:'Actress',gender:'female',talent:94,popularity:95,genres:['Drama','Comedy','Action'],fee:22000000},
  {name:'Tom Holland',role:'Actor',gender:'male',talent:88,popularity:97,genres:['Action','Adventure','Drama'],fee:18000000},
  {name:'Zendaya',role:'Actress',gender:'female',talent:91,popularity:97,genres:['Drama','Romance','Sci-Fi'],fee:18000000},
  {name:'Florence Pugh',role:'Actress',gender:'female',talent:93,popularity:91,genres:['Drama','Horror','Thriller'],fee:12000000},
  {name:'Ryan Gosling',role:'Actor',gender:'male',talent:92,popularity:94,genres:['Drama','Comedy','Action'],fee:20000000},
  {name:'Meryl Streep',role:'Actress',gender:'female',talent:99,popularity:94,genres:['Drama','Comedy'],fee:12000000},
  {name:'Anne Hathaway',role:'Actress',gender:'female',talent:94,popularity:94,genres:['Drama','Comedy','Action'],fee:15000000},
  {name:'Saoirse Ronan',role:'Actress',gender:'female',talent:96,popularity:88,genres:['Drama','Romance','Historical'],fee:10000000},
  {name:'Anya Taylor-Joy',role:'Actress',gender:'female',talent:92,popularity:91,genres:['Drama','Horror','Thriller'],fee:10000000},
  {name:'Emma Stone',role:'Actress',gender:'female',talent:95,popularity:95,genres:['Drama','Comedy','Romance'],fee:18000000},
  {name:'Viola Davis',role:'Actress',gender:'female',talent:98,popularity:91,genres:['Drama','Thriller','Action'],fee:12000000}
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
 {name:'Warner Bros. Pictures',type:'Major Studio',reputation:96,capital:95,distribution:98,marketing:96,creative:62,genres:['Action','Drama','Sci-Fi','Thriller']},
 {name:'Universal Pictures',type:'Major Studio',reputation:96,capital:96,distribution:99,marketing:97,creative:64,genres:['Action','Adventure','Horror','Comedy']},
 {name:'Walt Disney Studios',type:'Major Studio',reputation:98,capital:99,distribution:99,marketing:99,creative:58,genres:['Animation','Adventure','Family','Fantasy']},
 {name:'Paramount Pictures',type:'Major Studio',reputation:91,capital:88,distribution:92,marketing:90,creative:65,genres:['Action','Comedy','Drama','Franchise']},
 {name:'Sony Pictures',type:'Major Studio',reputation:92,capital:89,distribution:94,marketing:92,creative:68,genres:['Action','Comedy','Drama','Thriller']},
 {name:'Lionsgate',type:'Studio',reputation:84,capital:72,distribution:79,marketing:78,creative:73,genres:['Horror','Thriller','Action','Drama']},
 {name:'A24',type:'Independent Studio',reputation:88,capital:52,distribution:61,marketing:67,creative:96,genres:['Drama','Horror','Comedy','Thriller']},
 {name:'Amazon MGM Studios',type:'Major Studio',reputation:90,capital:94,distribution:88,marketing:91,creative:70,genres:['Drama','Action','Comedy','Thriller']},
 {name:'Apple Studios',type:'Studio',reputation:89,capital:87,distribution:72,marketing:86,creative:82,genres:['Drama','Sci-Fi','Thriller','Prestige']},
 {name:'Legendary Entertainment',type:'Production Company',reputation:91,capital:86,distribution:70,marketing:76,creative:78,genres:['Sci-Fi','Action','Fantasy','Adventure']},
 {name:'Skydance',type:'Production Company',reputation:89,capital:84,distribution:74,marketing:80,creative:75,genres:['Action','Sci-Fi','Adventure']},
 {name:'Blumhouse Productions',type:'Production Company',reputation:86,capital:60,distribution:66,marketing:72,creative:88,genres:['Horror','Thriller']}
];
window.INDUSTRY_STREAMERS = [
 {name:'Netflix',focus:['Drama','Thriller','Comedy','Sci-Fi','Animation'],appetite:'Very High',power:98,license:92,global:99},
 {name:'Disney+',focus:['Animation','Adventure','Family','Fantasy'],appetite:'High',power:94,license:86,global:98},
 {name:'Max',focus:['Drama','Thriller','Crime','Prestige'],appetite:'High',power:87,license:88,global:84},
 {name:'Hulu',focus:['Drama','Comedy','Thriller'],appetite:'Medium',power:72,license:78,global:70},
 {name:'Prime Video',focus:['Action','Drama','Comedy','Thriller'],appetite:'High',power:95,license:91,global:96},
 {name:'Apple TV+',focus:['Drama','Sci-Fi','Thriller','Prestige'],appetite:'Medium',power:83,license:87,global:89},
 {name:'Paramount+',focus:['Action','Comedy','Drama','Franchise'],appetite:'Medium',power:76,license:80,global:76},
 {name:'Peacock',focus:['Comedy','Thriller','Drama'],appetite:'Medium',power:67,license:74,global:68}
];