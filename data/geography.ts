import { Region } from '../types';

export const KENYA_GEOGRAPHY: Region[] = [
  {
    name: 'Central',
    counties: [
      { name: 'Kiambu', subCounties: ['Gatundu North', 'Gatundu South', 'Githunguri', 'Juja', 'Kabete', 'Kiambaa', 'Kiambu Town', 'Kikuyu', 'Limuru', 'Lari', 'Ruiru', 'Thika Town'] },
      { name: 'Kirinyaga', subCounties: ['Gichugu', 'Mwea East', 'Mwea West', 'Kirinyaga Central', 'Ndia'] },
      { name: 'Murang\'a', subCounties: ['Kangema', 'Mathioya', 'Kiharu', 'Kigumo', 'Maragua', 'Kandara', 'Gatanga'] },
      { name: 'Nyandarua', subCounties: ['Kinangop', 'Kipipiri', 'Ndaragwa', 'Ol Kalou', 'Ol Jorok'] },
      { name: 'Nyeri', subCounties: ['Kieni East', 'Kieni West', 'Mathira East', 'Mathira West', 'Mukureini', 'Nyeri Central', 'Tetu', 'Othaya'] }
    ]
  },
  {
    name: 'Coast',
    counties: [
      { name: 'Mombasa', subCounties: ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni', 'Mvita'] },
      { name: 'Kwale', subCounties: ['Kinango', 'Lungalunga', 'Matuga', 'Msambweni'] },
      { name: 'Kilifi', subCounties: ['Kilifi North', 'Kilifi South', 'Kaloleni', 'Rabai', 'Malindi', 'Magarini'] },
      { name: 'Tana River', subCounties: ['Bura', 'Galole', 'Garsen'] },
      { name: 'Lamu', subCounties: ['Lamu East', 'Lamu West'] },
      { name: 'Taita-Taveta', subCounties: ['Taveta', 'Voi', 'Mwatate', 'Wundanyi'] }
    ]
  },
  {
    name: 'Eastern',
    counties: [
      { name: 'Embu', subCounties: ['Manyatta', 'Runyenjes', 'Mbeere North', 'Mbeere South'] },
      { name: 'Kitui', subCounties: ['Kitui Central', 'Kitui East', 'Kitui Rural', 'Kitui South', 'Kitui West', 'Mwingi Central', 'Mwingi North', 'Mwingi West'] },
      { name: 'Machakos', subCounties: ['Kangundo', 'Kathiani', 'Machakos Town', 'Masinga', 'Matungulu', 'Mavoko', 'Mwala', 'Yatta'] },
      { name: 'Makueni', subCounties: ['Kaiti', 'Kibwezi East', 'Kibwezi West', 'Kilome', 'Makueni', 'Mbooni'] },
      { name: 'Meru', subCounties: ['Buuri East', 'Buuri West', 'Igembe Central', 'Igembe North', 'Igembe South', 'Imenti Central', 'Imenti North', 'Imenti South', 'Tigania East', 'Tigania West'] },
      { name: 'Tharaka-Nithi', subCounties: ['Maara', 'Meru South (Chuka)', 'Tharaka'] },
      { name: 'Isiolo', subCounties: ['Isiolo'] },
      { name: 'Marsabit', subCounties: ['Laisamis', 'Moyale', 'North Horr', 'Saku'] }
    ]
  },
  {
    name: 'Nairobi',
    counties: [
      { name: 'Nairobi City', subCounties: ['Dagoretti North', 'Dagoretti South', 'Embakasi Central', 'Embakasi East', 'Embakasi North', 'Embakasi South', 'Embakasi West', 'Kamukunji', 'Kasarani', 'Kibra', 'Lang\'ata', 'Makadara', 'Mathare', 'Roysambu', 'Ruaraka', 'Starehe', 'Westlands'] }
    ]
  },
  {
    name: 'North Eastern',
    counties: [
      { name: 'Garissa', subCounties: ['Balambala', 'Dadaab', 'Fafi', 'Garissa Township', 'Ijara', 'Lagdera'] },
      { name: 'Wajir', subCounties: ['Eldas', 'Tarbaj', 'Wajir East', 'Wajir North', 'Wajir South', 'Wajir West'] },
      { name: 'Mandera', subCounties: ['Banissa', 'Lafey', 'Mandera East', 'Mandera North', 'Mandera South', 'Mandera West'] }
    ]
  },
  {
    name: 'Nyanza',
    counties: [
      { name: 'Kisumu', subCounties: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyakach', 'Nyando', 'Seme'] },
      { name: 'Siaya', subCounties: ['Alego Usonga', 'Bondo', 'Gem', 'Rarieda', 'Ugenya', 'Ugunja'] },
      { name: 'Homa Bay', subCounties: ['Homa Bay Town', 'Kabondo Kasipul', 'Karachuonyo', 'Kasipul', 'Mbita', 'Ndhiwa', 'Rangwe', 'Suba'] },
      { name: 'Migori', subCounties: ['Awendo', 'Kuria East', 'Kuria West', 'Rongo', 'Suna East', 'Suna West', 'Uriri'] },
      { name: 'Kisii', subCounties: ['Bobasi', 'Bomachoge Borabu', 'Bomachoge Chache', 'Bonchari', 'Kitutu Chache North', 'Kitutu Chache South', 'Nyaribari Chache', 'Nyaribari Masaba', 'South Mugirango'] },
      { name: 'Nyamira', subCounties: ['Borabu', 'Kitutu Masaba', 'North Mugirango', 'West Mugirango'] }
    ]
  },
  {
    name: 'Rift Valley',
    counties: [
      { name: 'Turkana', subCounties: ['Turkana Central', 'Turkana East', 'Turkana North', 'Turkana South', 'Turkana West', 'Loima'] },
      { name: 'West Pokot', subCounties: ['Kapenguria', 'Kacheliba', 'Pokot South', 'Sigor'] },
      { name: 'Samburu', subCounties: ['Samburu East', 'Samburu North', 'Samburu West'] },
      { name: 'Trans-Nzoia', subCounties: ['Cherangany', 'Endebess', 'Kiminini', 'Kwanza', 'Saboti'] },
      { name: 'Uasin Gishu', subCounties: ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'] },
      { name: 'Elgeyo-Marakwet', subCounties: ['Keiyo North', 'Keiyo South', 'Marakwet East', 'Marakwet West'] },
      { name: 'Nandi', subCounties: ['Aldai', 'Chesumei', 'Emgwen', 'Mosop', 'Nandi Hills', 'Tinderet'] },
      { name: 'Baringo', subCounties: ['Baringo Central', 'Baringo North', 'Baringo South', 'Eldama Ravine', 'Mogotio', 'Tiaty'] },
      { name: 'Laikipia', subCounties: ['Laikipia East', 'Laikipia North', 'Laikipia West'] },
      { name: 'Nakuru', subCounties: ['Bahati', 'Gilgil', 'Kuresoi North', 'Kuresoi South', 'Molo', 'Naivasha', 'Nakuru Town East', 'Nakuru Town West', 'Njoro', 'Rongai', 'Subukia'] },
      { name: 'Narok', subCounties: ['Narok East', 'Narok North', 'Narok South', 'Narok West', 'Emurua Dikirr', 'Kilgoris'] },
      { name: 'Kajiado', subCounties: ['Kajiado Central', 'Kajiado East', 'Kajiado North', 'Kajiado South', 'Kajiado West'] },
      { name: 'Kericho', subCounties: ['Ainamoi', 'Belgut', 'Bureti', 'Kipkelion East', 'Kipkelion West', 'Sigowet-Soin'] },
      { name: 'Bomet', subCounties: ['Bomet Central', 'Bomet East', 'Chepalungu', 'Konoin', 'Sotik'] }
    ]
  },
  {
    name: 'Western',
    counties: [
      { name: 'Kakamega', subCounties: ['Butere', 'Ikolomani', 'Khwisero', 'Lugari', 'Lurambi', 'Malava', 'Matungu', 'Mumias East', 'Mumias West', 'Navakholo', 'Shinyalu'] },
      { name: 'Vihiga', subCounties: ['Emuhaya', 'Hamisi', 'Luanda', 'Sabatia', 'Vihiga'] },
      { name: 'Bungoma', subCounties: ['Bumula', 'Kabuchai', 'Kanduyi', 'Kimilili', 'Mt. Elgon', 'Sirisia', 'Tongaren', 'Webuye East', 'Webuye West'] },
      { name: 'Busia', subCounties: ['Budalangi', 'Butula', 'Funyula', 'Matayos', 'Nambale', 'Teso North', 'Teso South'] }
    ]
  }
];
