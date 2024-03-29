const LeaderboardModel = require('./leaderboard.model');
const ConfigController = require('../config/config.controller');
const ConfigModel = require('../config/config.model');
const puppeteer = require('puppeteer');
const e = require('express');

const stravaUrl = 'https://www.strava.com/login';

exports.refresh = async (req, res, next) => {
  const data = await getData(false);

  LeaderboardModel.update(data)
  .then((lb) => {
    ConfigModel.get()
    .then((result) => {  
        result.leaderboardRefreshed = new Date();
        ConfigModel.add(result);

        res.status(201).send(formatData(lb, result.leaderboardRefreshed));
    })
    .catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
};

exports.scrape = async (req, res, next) => {
  const data = await getData(true);

  LeaderboardModel.update(data)
  .then((result) => {
    res.status(201).send(formatData(result));
  })
  .catch((err) => {
    next(err);
  });
};

exports.get = (req, res, next) => {
    LeaderboardModel.get()
    .then((result) => {
      ConfigModel.get()
      .then((c) => {  
        res.status(201).send(formatData(result, c.leaderboardRefreshed));
      })
      .catch((err) => {
        next(err);
      });  
    })
    .catch((err) => {
        next(err);
    });
}

function formatData (result, refreshDate) {
  let formatted = {
    refreshDate: refreshDate,
    leaderboard: []
  };

  result.forEach(r => {
    r.data.forEach(d => {
      year = formatted.leaderboard.filter(x => x.year == d.year);

      if(year.length > 0)
      {
        formatted.leaderboard.splice(formatted.leaderboard.indexOf(year[0]), 1);

        year[0].distance.push({
          name: r.name,
          value: d.distance
        });

        year[0].time.push({
          name: r.name,
          value: d.time
        });

        year[0].elevation.push({
          name: r.name,
          value: d.elevation
        });

        year[0].rides.push({
          name: r.name,
          value: d.rides
        });

        year[0].distance.sort((a,b) => a.value > b.value ? -1 : b.value > a.value ? 1 : 0);
        year[0].time.sort((a,b) => a.value > b.value ? -1 : b.value > a.value ? 1 : 0);
        year[0].elevation.sort((a,b) => a.value > b.value ? -1 : b.value > a.value ? 1 : 0);
        year[0].rides.sort((a,b) => a.value > b.value ? -1 : b.value > a.value ? 1 : 0);

        formatted.leaderboard.push(year[0]);
      } else {
        const f = {
          year: d.year,
          distance: [],
          time: [],
          elevation: [],
          rides: []
        };

        f.distance.push({
          name: r.name,
          value: d.distance
        });

        f.time.push({
          name: r.name,
          value: d.time
        });

        f.elevation.push({
          name: r.name,
          value: d.elevation
        });

        f.rides.push({
          name: r.name,
          value: d.rides
        });

        formatted.leaderboard.push(f);
      }
    });
  });

  formatted.leaderboard.sort((a,b) => a.year > b.year ? -1 : b.year > a.year ? 1 : 0);

  return formatted;
}

async function getData(getAll)
{
  const config = await ConfigController.getLeaderboardConfig();
  const browser = await puppeteer.launch({args: ['--lang=en-GB,en']});
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(stravaUrl);

  await page.click(config.selectors.cookies);

  await page.click(config.selectors.username);
  await page.keyboard.type(process.env.stravaLogin);

  await page.click(config.selectors.password);
  await page.keyboard.type(process.env.stravaPassword);
  
  await page.click(config.selectors.login);
  await page.waitForNavigation();

  let data = [];

  for(let i = 0;i < config.athletes.length;i++)
  {
    let url = "https://www.strava.com/athletes/" + config.athletes[i];

    await page.goto(url);
    await page.waitForTimeout(2*1000);
  
    let name = await getValue(page, config.selectors.name);
    let rider = {
      id: Number(config.athletes[i]),
      name: name,
      data: []
    }

    await page.waitForTimeout(5*1000);

    try
    {
      await page.click('#athlete-profile > div.row.no-margins > div.spans5.offset1.sidebar > div.section.comparison.borderless > div.hidden.sport-0.active-tab > table > thead > tr > th:nth-child(1) > ul > li:nth-child(2) > button');
      await page.waitForTimeout(1000);
    } catch (err) {}
    
    if(getAll)
    {
      for(let x = 0;x<6;x++)
      {
        await page.click(config.selectors.year);
        await page.waitForTimeout(5*1000);
        let sel = '#ytd_year_bike > ul > li:nth-child('+ (x+1) +')';
        await page.click(sel);   
        await page.waitForTimeout(5*1000);

        rider.data.push(await getAthleteData(page, config));
      }
    } else {
      rider.data.push(await getAthleteData(page, config));
    }
    
    data.push(rider);
  }

  await browser.close();

  return data;
}

async function getAthleteData(page, config)
{
  let year = await getValue(page, config.selectors.year);

  let distance = await getValue(page, config.selectors.distance);
  if(distance != null) distance = distance.replace(" km", "").replace(",", "");
  
  let time = await getValue(page, config.selectors.time);
  if(time != null) {
    time = time.replace('h', '').replace('m', '');
    let timeSplit = time.split(" ");
    if(timeSplit.length > 0)
    {
      time = Number(timeSplit[0]) * 60 + Number(timeSplit[1]);
    } 
  }

  let elevation = await getValue(page, config.selectors.elevation);
  if(elevation != null) elevation = elevation.replace(" m", "").replace(",", "");

  let rides = await getValue(page, config.selectors.rides);

  let data = {
    year: Number(year),
    distance: Number(distance),
    time: time,
    elevation: Number(elevation),
    rides: Number(rides)   
  };

  return data;
}

async function getValue(page, sel)
{
  return await page.evaluate((sel) => {
    let el = document.querySelector(sel);
    return el ? el.innerHTML: null;
  }, sel);
}