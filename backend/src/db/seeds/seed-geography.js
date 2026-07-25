import 'dotenv/config';
import db from '../../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECKPOINT_PATH = path.join(__dirname, 'seed-geography-checkpoint.json');
const CSC_API_KEY = process.env.CSC_API_KEY || '40dadba216ddf8ec026ee0480246789678cdf4c594669d088d39c3b580fbd535';
const CSC_BASE = 'https://api.countrystatecity.in/v1';
const MAX_CALLS = 98;
const DELAY = 50;

const CURRENCIES = {
  AED:{name:'UAE Dirham',symbol:'د.إ'},AFN:{name:'Afghan Afghani',symbol:'؋'},ALL:{name:'Albanian Lek',symbol:'L'},AMD:{name:'Armenian Dram',symbol:'֏'},ANG:{name:'Netherlands Antillean Guilder',symbol:'ƒ'},AOA:{name:'Angolan Kwanza',symbol:'Kz'},ARS:{name:'Argentine Peso',symbol:'$'},AUD:{name:'Australian Dollar',symbol:'A$'},AWG:{name:'Aruban Florin',symbol:'ƒ'},AZN:{name:'Azerbaijani Manat',symbol:'₼'},
  BAM:{name:'Bosnia-Herzegovina Convertible Mark',symbol:'KM'},BBD:{name:'Barbadian Dollar',symbol:'Bds$'},BDT:{name:'Bangladeshi Taka',symbol:'৳'},BGN:{name:'Bulgarian Lev',symbol:'лв'},BHD:{name:'Bahraini Dinar',symbol:'.د.ب'},BIF:{name:'Burundian Franc',symbol:'FBu'},BMD:{name:'Bermudian Dollar',symbol:'$'},BND:{name:'Brunei Dollar',symbol:'B$'},BOB:{name:'Bolivian Boliviano',symbol:'Bs.'},BRL:{name:'Brazilian Real',symbol:'R$'},
  BSD:{name:'Bahamian Dollar',symbol:'B$'},BTN:{name:'Bhutanese Ngultrum',symbol:'Nu.'},BWP:{name:'Botswana Pula',symbol:'P'},BYN:{name:'Belarusian Ruble',symbol:'Br'},BZD:{name:'Belize Dollar',symbol:'BZ$'},
  CAD:{name:'Canadian Dollar',symbol:'CA$'},CDF:{name:'Congolese Franc',symbol:'FC'},CHF:{name:'Swiss Franc',symbol:'CHF'},CLP:{name:'Chilean Peso',symbol:'$'},CNY:{name:'Chinese Yuan',symbol:'¥'},COP:{name:'Colombian Peso',symbol:'$'},CRC:{name:'Costa Rican Colón',symbol:'₡'},CUP:{name:'Cuban Peso',symbol:'$'},CVE:{name:'Cape Verdean Escudo',symbol:'$'},CZK:{name:'Czech Koruna',symbol:'Kč'},
  DJF:{name:'Djiboutian Franc',symbol:'Fdj'},DKK:{name:'Danish Krone',symbol:'kr'},DOP:{name:'Dominican Peso',symbol:'RD$'},DZD:{name:'Algerian Dinar',symbol:'د.ج'},
  EGP:{name:'Egyptian Pound',symbol:'E£'},ERN:{name:'Eritrean Nakfa',symbol:'Nfk'},ETB:{name:'Ethiopian Birr',symbol:'Br'},EUR:{name:'Euro',symbol:'€'},
  FJD:{name:'Fijian Dollar',symbol:'FJ$'},FKP:{name:'Falkland Islands Pound',symbol:'£'},
  GBP:{name:'British Pound',symbol:'£'},GEL:{name:'Georgian Lari',symbol:'₾'},GHS:{name:'Ghanaian Cedi',symbol:'₵'},GIP:{name:'Gibraltar Pound',symbol:'£'},GMD:{name:'Gambian Dalasi',symbol:'D'},GNF:{name:'Guinean Franc',symbol:'FG'},GTQ:{name:'Guatemalan Quetzal',symbol:'Q'},GYD:{name:'Guyanese Dollar',symbol:'G$'},
  HKD:{name:'Hong Kong Dollar',symbol:'HK$'},HNL:{name:'Honduran Lempira',symbol:'L'},HRK:{name:'Croatian Kuna',symbol:'kn'},HTG:{name:'Haitian Gourde',symbol:'G'},HUF:{name:'Hungarian Forint',symbol:'Ft'},
  IDR:{name:'Indonesian Rupiah',symbol:'Rp'},ILS:{name:'Israeli New Shekel',symbol:'₪'},INR:{name:'Indian Rupee',symbol:'₹'},IQD:{name:'Iraqi Dinar',symbol:'ع.د'},IRR:{name:'Iranian Rial',symbol:'﷼'},ISK:{name:'Icelandic Króna',symbol:'kr'},
  JMD:{name:'Jamaican Dollar',symbol:'J$'},JOD:{name:'Jordanian Dinar',symbol:'د.ا'},JPY:{name:'Japanese Yen',symbol:'¥'},
  KES:{name:'Kenyan Shilling',symbol:'KSh'},KGS:{name:'Kyrgyzstani Som',symbol:'с'},KHR:{name:'Cambodian Riel',symbol:'៛'},KMF:{name:'Comorian Franc',symbol:'CF'},KPW:{name:'North Korean Won',symbol:'₩'},KRW:{name:'South Korean Won',symbol:'₩'},KWD:{name:'Kuwaiti Dinar',symbol:'د.ك'},KYD:{name:'Cayman Islands Dollar',symbol:'CI$'},KZT:{name:'Kazakhstani Tenge',symbol:'₸'},
  LAK:{name:'Lao Kip',symbol:'₭'},LBP:{name:'Lebanese Pound',symbol:'ل.ل'},LKR:{name:'Sri Lankan Rupee',symbol:'Rs'},LRD:{name:'Liberian Dollar',symbol:'L$'},LSL:{name:'Lesotho Loti',symbol:'L'},LYD:{name:'Libyan Dinar',symbol:'ل.د'},
  MAD:{name:'Moroccan Dirham',symbol:'د.م.'},MDL:{name:'Moldovan Leu',symbol:'L'},MGA:{name:'Malagasy Ariary',symbol:'Ar'},MKD:{name:'Macedonian Denar',symbol:'ден'},MMK:{name:'Myanmar Kyat',symbol:'K'},MNT:{name:'Mongolian Tögrög',symbol:'₮'},MOP:{name:'Macanese Pataca',symbol:'MOP$'},MRU:{name:'Mauritanian Ouguiya',symbol:'UM'},MUR:{name:'Mauritian Rupee',symbol:'₨'},MVR:{name:'Maldivian Rufiyaa',symbol:'Rf'},MWK:{name:'Malawian Kwacha',symbol:'MK'},MXN:{name:'Mexican Peso',symbol:'$'},MYR:{name:'Malaysian Ringgit',symbol:'RM'},MZN:{name:'Mozambican Metical',symbol:'MT'},
  NAD:{name:'Namibian Dollar',symbol:'N$'},NGN:{name:'Nigerian Naira',symbol:'₦'},NIO:{name:'Nicaraguan Córdoba',symbol:'C$'},NOK:{name:'Norwegian Krone',symbol:'kr'},NPR:{name:'Nepalese Rupee',symbol:'Rs'},NZD:{name:'New Zealand Dollar',symbol:'NZ$'},
  OMR:{name:'Omani Rial',symbol:'ر.ع.'},
  PAB:{name:'Panamanian Balboa',symbol:'B/.'},PEN:{name:'Peruvian Sol',symbol:'S/.'},PGK:{name:'Papua New Guinean Kina',symbol:'K'},PHP:{name:'Philippine Peso',symbol:'₱'},PKR:{name:'Pakistani Rupee',symbol:'₨'},PLN:{name:'Polish Złoty',symbol:'zł'},PYG:{name:'Paraguayan Guaraní',symbol:'₲'},QAR:{name:'Qatari Riyal',symbol:'ر.ق'},
  RON:{name:'Romanian Leu',symbol:'lei'},RSD:{name:'Serbian Dinar',symbol:'дин.'},RUB:{name:'Russian Ruble',symbol:'₽'},RWF:{name:'Rwandan Franc',symbol:'FRw'},
  SAR:{name:'Saudi Riyal',symbol:'ر.س'},SBD:{name:'Solomon Islands Dollar',symbol:'SI$'},SCR:{name:'Seychellois Rupee',symbol:'₨'},SDG:{name:'Sudanese Pound',symbol:'ج.س.'},SEK:{name:'Swedish Krona',symbol:'kr'},SGD:{name:'Singapore Dollar',symbol:'S$'},SHP:{name:'Saint Helena Pound',symbol:'£'},SLE:{name:'Sierra Leonean Leone',symbol:'Le'},SOS:{name:'Somali Shilling',symbol:'Sh'},SRD:{name:'Surinamese Dollar',symbol:'$'},SSP:{name:'South Sudanese Pound',symbol:'£'},STN:{name:'São Tomé and Príncipe Dobra',symbol:'Db'},SYP:{name:'Syrian Pound',symbol:'£'},SZL:{name:'Swazi Lilangeni',symbol:'E'},
  THB:{name:'Thai Baht',symbol:'฿'},TJS:{name:'Tajikistani Somoni',symbol:'SM'},TMT:{name:'Turkmenistani Manat',symbol:'m'},TND:{name:'Tunisian Dinar',symbol:'د.ت'},TOP:{name:'Tongan Paʻanga',symbol:'T$'},TRY:{name:'Turkish Lira',symbol:'₺'},TTD:{name:'Trinidad and Tobago Dollar',symbol:'TT$'},TWD:{name:'New Taiwan Dollar',symbol:'NT$'},TZS:{name:'Tanzanian Shilling',symbol:'TSh'},
  UAH:{name:'Ukrainian Hryvnia',symbol:'₴'},UGX:{name:'Ugandan Shilling',symbol:'USh'},USD:{name:'US Dollar',symbol:'$'},UYU:{name:'Uruguayan Peso',symbol:'$'},UZS:{name:'Uzbekistani Som',symbol:'с'},
  VES:{name:'Venezuelan Bolívar',symbol:'Bs'},VND:{name:'Vietnamese Đồng',symbol:'₫'},VUV:{name:'Vanuatu Vatu',symbol:'VT'},
  WST:{name:'Samoan Tālā',symbol:'WS$'},
  XAF:{name:'Central African CFA Franc',symbol:'FCFA'},XCD:{name:'East Caribbean Dollar',symbol:'EC$'},XOF:{name:'West African CFA Franc',symbol:'CFA'},XPF:{name:'CFP Franc',symbol:'₣'},
  YER:{name:'Yemeni Rial',symbol:'﷼'},
  ZAR:{name:'South African Rand',symbol:'R'},ZMW:{name:'Zambian Kwacha',symbol:'ZK'},ZWL:{name:'Zimbabwean Dollar',symbol:'Z$'},
};

let calls = 0;
const today = () => new Date().toISOString().slice(0, 10);

let cp = {
  cscCountries: null,
  statesData: {},
  stateMap: {},
  statesFetched: [],
  citiesFetched: [],
  lastDate: null,
};

const load = async () => {
  try { cp = JSON.parse(await fs.readFile(CHECKPOINT_PATH, 'utf-8')); } catch {}
  if (cp.lastDate !== today()) { calls = 0; cp.lastDate = today(); }
};

const save = () => fs.writeFile(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const csc = async (ep) => {
  if (calls >= MAX_CALLS) return null;
  calls++;
  const r = await fetch(`${CSC_BASE}${ep}`, { headers: { 'X-CSCAPI-KEY': CSC_API_KEY } });
  if (r.status === 429) {
    await save();
    console.log('Rate limited. Checkpoint saved. Run again tomorrow.');
    await db.end();
    process.exit(0);
  }
  if (!r.ok) return null;
  await wait(DELAY);
  return r.json();
};

const main = async () => {
  const clean = process.argv.includes('--clean');
  await load();

  if (clean) {
    console.log('Cleaning tables...');
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    await db.execute('TRUNCATE ucmt_tbl_city_master');
    await db.execute('TRUNCATE ucmt_tbl_state_master');
    await db.execute('TRUNCATE ucmt_tbl_country_master');
    await db.execute('TRUNCATE currencies');
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    cp = { cscCountries: null, statesData: {}, stateMap: {}, statesFetched: [], citiesFetched: [], lastDate: today() };
    calls = 0;
    await save();
    console.log('Tables cleaned.');
  }

  if (!cp.cscCountries) {
    console.log('Fetching countries from CSC API...');
    cp.cscCountries = await csc('/countries');
    if (!cp.cscCountries) { console.log('Failed to fetch countries.'); await db.end(); process.exit(1); }
    await save();
    console.log(`  Got ${cp.cscCountries.length} countries`);
  }

  console.log('Inserting currencies...');
  for (const [code, info] of Object.entries(CURRENCIES)) {
    await db.execute(
      `INSERT IGNORE INTO currencies (code, name, symbol, decimal_places) VALUES (?, ?, ?, ?)`,
      [code, info.name, info.symbol, 2]
    );
  }
  console.log(`  Inserted ${Object.keys(CURRENCIES).length} currencies`);

  console.log('Inserting countries...');
  for (const c of cp.cscCountries) {
    const cur = CURRENCIES[c.currency] || { name: c.currency, symbol: '' };
    await db.execute(
      `INSERT IGNORE INTO ucmt_tbl_country_master (id, countrycode, country, phonecode, currency_code, currency_name, currency_symbol) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.iso2, c.name.slice(0, 100), `+${c.phonecode}`, c.currency, cur.name.slice(0, 100), (cur.symbol || '').slice(0, 10)]
    );
  }
  console.log(`  Inserted ${cp.cscCountries.length} countries`);

  console.log('Fetching and inserting states...');
  for (const c of cp.cscCountries) {
    if (cp.statesFetched.includes(c.iso2)) continue;
    if (calls >= MAX_CALLS) break;

    const states = await csc(`/countries/${c.iso2}/states`);
    cp.statesData[c.iso2] = states || [];

    if (states && states.length > 0) {
      for (const s of states) {
        await db.execute(
          `INSERT IGNORE INTO ucmt_tbl_state_master (state, countryid) VALUES (?, ?)`,
          [s.name.slice(0, 100), c.id]
        );
      }
      const [rows] = await db.execute(
        `SELECT id, state FROM ucmt_tbl_state_master WHERE countryid = ?`,
        [c.id]
      );
      const stateMap = {};
      for (const row of rows) stateMap[row.state] = row.id;
      for (const s of states) {
        cp.stateMap[`${c.iso2}-${s.iso2}`] = stateMap[s.name.slice(0, 100)];
      }
    }

    cp.statesFetched.push(c.iso2);
    await save();
    console.log(`  ${c.name}: ${states?.length || 0} states`);
  }

  console.log('Fetching and inserting cities...');
  for (const c of cp.cscCountries) {
    const states = cp.statesData[c.iso2] || [];
    for (const s of states) {
      const key = `${c.iso2}-${s.iso2}`;
      if (cp.citiesFetched.includes(key)) continue;
      if (calls >= MAX_CALLS) break;

      const stateDbId = cp.stateMap[key];
      if (!stateDbId) {
        cp.citiesFetched.push(key);
        continue;
      }

      const cities = await csc(`/countries/${c.iso2}/states/${s.iso2}/cities`);
      if (cities && cities.length > 0) {
        for (let i = 0; i < cities.length; i += 500) {
          const batch = cities.slice(i, i + 500);
          const placeholders = batch.map(() => '(?, ?)').join(',');
          const values = batch.flatMap(ci => [ci.name.slice(0, 100), stateDbId]);
          await db.execute(`INSERT IGNORE INTO ucmt_tbl_city_master (city, stateid) VALUES ${placeholders}`, values);
        }
      }

      cp.citiesFetched.push(key);
      await save();
      console.log(`  ${s.name}, ${c.name}: ${cities?.length || 0} cities`);
    }
    if (calls >= MAX_CALLS) break;
  }

  const [co] = await db.execute('SELECT COUNT(*) c FROM ucmt_tbl_country_master');
  const [st] = await db.execute('SELECT COUNT(*) c FROM ucmt_tbl_state_master');
  const [ci] = await db.execute('SELECT COUNT(*) c FROM ucmt_tbl_city_master');
  const [cu] = await db.execute('SELECT COUNT(*) c FROM currencies');
  const totalStates = Object.values(cp.statesData).reduce((sum, s) => sum + (s?.length || 0), 0);
  const allDone = cp.statesFetched.length >= cp.cscCountries.length && cp.citiesFetched.length >= totalStates;

  console.log('\n========== Summary ==========');
  console.log(`Countries:  ${co[0].c}`);
  console.log(`States:     ${st[0].c}`);
  console.log(`Cities:     ${ci[0].c}`);
  console.log(`Currencies: ${cu[0].c}`);
  console.log(`API calls:  ${calls}/${MAX_CALLS}`);
  console.log(`States:     ${cp.statesFetched.length}/${cp.cscCountries.length} countries processed`);
  console.log(`Cities:     ${cp.citiesFetched.length}/${totalStates} states processed`);
  console.log(allDone ? '\nAll data seeded!' : '\nRun again tomorrow to continue.');

  await db.end();
};

main().catch(async (e) => {
  console.error('Fatal error:', e);
  try { await db.end(); } catch {}
  process.exit(1);
});
