const WorkoutModel = require('./workouts.model');
const puppeteer = require('puppeteer');
const { filter } = require('compression');

exports.get = async (req, res, next) => {
  const page = req.body.page > 0 ? parseInt(req.body.page) : 1;
  const limit = req.body.limit > 0 ? parseInt(req.body.limit) : 50;
  const category = req.body.category;
  const name = req.body.name;
  const skipIndex = (page - 1) * limit;
  let results;

  try {
    results = await WorkoutModel.get(category, name)
      .sort({name: 1})
      .limit(limit)
      .skip(skipIndex)
      .exec();

      res.status(201).send(results);
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: "Error Occured" });
  }
}

exports.getDetail = (req, res, next) => {
  const id = req.body.id;

  WorkoutModel.getDetail(id)
  .then((result) => {  
    res.status(201).send(result);
  })
  .catch((err) => {
      next(err);
  });
}

exports.getRaw = (req, res, next) => {
  const name = req.body.name;

  WorkoutModel.getRaw(name)
  .then((result) => {  
    let data = result.data;
    let filteredData = [];

    filteredData = data;

    let formattedData = [];
    let startTime = filteredData[0].time;
    let endTime = 0;
    let startPower = filteredData[0].power;
    let endPower = 0;
    let index = 0;
    let prevPower = 0;
    let power = 0;
    let nextPower = 0;

    while(index < filteredData.length)
    {
      //SET START VALUES
      startTime = filteredData[index].time;
      startPower = Math.round(filteredData[index].power);

      if(filteredData[index].time == filteredData[index+1].time)
      {
        index++;
      } else 
      if(index == filteredData.length - 1)
      {
        //LAST ELEMENT
        endTime = filteredData[index].time;
        endPower = Math.round(filteredData[index].power);
        formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
        index++;
        break;
      } else if(filteredData[index+1].power != filteredData[index].power)
      {
        //RAMP
        //LOOP UNTILL NEXT IS EQUAL
        for(let i = index;i<filteredData.length;i++)
        {
          if(i > 0)
          {
            prevPower = filteredData[i-1].power;
          }
          
          power = filteredData[i].power;

          if(i < filteredData.length - 1)
          {
            nextPower = filteredData[i+1].power;
          }
          
          if(i == filteredData.length - 1)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(power);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = i+1;
            break;     
          } else if(power == nextPower)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(prevPower);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = i;
            break;
          } else if(i > 0)
          {
            if(prevPower > power && power < nextPower) {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;
            } else if (prevPower < power && power > nextPower)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;
            }
          }
        }
      } else if(filteredData[index+1].power == filteredData[index].power) {
        //FLAT
        //LOOP UNTILL NEXT IS DIFFERENT
        for(let i = index;i<filteredData.length;i++)
        {
          power = filteredData[i].power;
          nextPower = filteredData[i+1].power;

          if(i == filteredData.length - 1)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(power);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = i+1;
            break;     
          } else if(power != nextPower)
          {
            endTime = nextPower != filteredData[i+2].power ? filteredData[i].time : filteredData[i+1].time;
            endPower = Math.round(power);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = nextPower != filteredData[i+2].power ? i : i+1;
            break;
          }
        }
      }
    }

    let zzz = { 
      original: data, filtered: filteredData, formatted: formattedData
    };

    res.status(201).send(zzz);
  })
  .catch((err) => {
      next(err);
  });
}

exports.processRaw =  (req, res, next) => {
  WorkoutModel.getAllRaw()
  .then((result) => {  
    log(result.length + ' workouts loaded.');

    result.forEach(w => {
      log('Processing workout: ' + w.name);
      let data = w.data;
      let filteredData = [];
    
      filteredData = data;

      let formattedData = [];
      let startTime = filteredData[0].time;
      let endTime = 0;
      let startPower = filteredData[0].power;
      let endPower = 0;
      let index = 0;
      let prevPower = 0;
      let power = 0;
      let nextPower = 0;

      while(index < filteredData.length)
      {
        //SET START VALUES
        startTime = filteredData[index].time;
        startPower = Math.round(filteredData[index].power);
  
        if(filteredData[index].time == filteredData[index+1].time)
        {
          index++;
        } else 
        if(index == filteredData.length - 1)
        {
          //LAST ELEMENT
          endTime = filteredData[index].time;
          endPower = Math.round(filteredData[index].power);
          formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
          index++;
          break;
        } else if(filteredData[index+1].power != filteredData[index].power)
        {
          //RAMP
          //LOOP UNTILL NEXT IS EQUAL
          for(let i = index;i<filteredData.length;i++)
          {
            if(i > 0)
            {
              prevPower = filteredData[i-1].power;
            }
            
            power = filteredData[i].power;
  
            if(i < filteredData.length - 1)
            {
              nextPower = filteredData[i+1].power;
            }
            
            if(i == filteredData.length - 1)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;     
            } else if(power == nextPower)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(prevPower);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i;
              break;
            } else if(i > 0)
            {
              if(prevPower > power && power < nextPower) {
                endTime = filteredData[i].time;
                endPower = Math.round(power);
                formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
                index = i+1;
                break;
              } else if (prevPower < power && power > nextPower)
              {
                endTime = filteredData[i].time;
                endPower = Math.round(power);
                formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
                index = i+1;
                break;
              }
            }
          }
        } else if(filteredData[index+1].power == filteredData[index].power) {
          //FLAT
          //LOOP UNTILL NEXT IS DIFFERENT
          for(let i = index;i<filteredData.length;i++)
          {
            if(i > 0)
            {
              prevPower = filteredData[i-1].power;
            }
            
            power = filteredData[i].power;
  
            if(i < filteredData.length - 1)
            {
              nextPower = filteredData[i+1].power;
            }
  
            if(i == filteredData.length - 1)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;     
            } else if(power != nextPower)
            {
              endTime = nextPower != filteredData[i+2].power ? filteredData[i].time : filteredData[i+1].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = nextPower != filteredData[i+2].power ? i : i+1;
              break;
            }
          }
        }
      }

      let workout = {
        name: w.name,
        category: w.category != null ? w.category.replace(new RegExp('.[0-9]\.[0-9]'), '') : '',
        description: w.description,
        duration: formattedData[formattedData.length - 1].endTime,
        tss: Number(w.tss),
        data: formattedData,
        dateCreated: new Date()
      };

      WorkoutModel.add(workout)
      .then((result) => {
        log('Workout saved: ' + workout.name);        
      })
      .catch((err) => {
          next(err);
      });
    });
  })
  .catch((err) => {
    next(err);
  });
}

function log(msg)
{
  console.log(new Date() + ' - ' + msg);
}