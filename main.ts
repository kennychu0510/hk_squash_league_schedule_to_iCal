import axios from 'axios';
import * as cheerio from 'cheerio';
import * as ics from 'ics';
import { writeFileSync } from 'fs';
const URL = 'https://www.hksquash.org.hk/public/leagues/results_schedules/id/D00339/league/Squash/year/2022-2023/pages_id/25.html';

const EVENTS: ics.EventAttributes[] = [];
async function main() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);
    const tables = $('.results-schedules-container');
    for (let table of tables) {
      const time = $(table).find('.results-schedules-title').text().trim();
      const schedule = $(table).find('.results-schedules-content');
      const teamA = $(schedule).children('div:contains("KCC")').children().first().text();
      const teamB = $(schedule).children('div:contains("KCC")').children().eq(2).text();
      const venue = $(schedule).children('div:contains("KCC")').children().eq(3).text();
      console.log(time);
      const week = time.slice(0, time.indexOf('-') - 1);
      const date = time
        .slice(time.indexOf('-') + 2)
        .split('/')
        .map((item) => Number(item));
      console.log(week);
      console.log(date);
      console.log(`${teamA} vs ${teamB} `);
      console.log(`venue: ${venue}`);
      console.log('\n');
      const opponent = teamA.includes('KCC') ? teamB : teamA;
      // break
      const event: ics.EventAttributes = {
        title: `Squash League - Div 3 - vs ${opponent}`,
        start: [date[2], date[1], date[0], 19, 0],
        duration: { hours: 2 },
        location: venue || '',
      };
      EVENTS.push(event);
    }
    ics.createEvents(EVENTS, (error, value) => {
      if (error) console.log(error);
      writeFileSync(`./output.ics`, value);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
