const mongoose = require('../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const leaderboardModel = new Schema({
  id: {type: Number},
  name: {type: String},
  data: [{
    year: {type: Number},
    distance: {type: Number},
    time: {type: Number},
    elevation: {type: Number},
    rides: {type: Number}
  }]
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardModel);

exports.update = async (data) => {
  for(const d of data)
  {
    let doc;

    if(await Leaderboard.exists({id: d.id}))
    {
      let doc = await Leaderboard.findOne({id: d.id});

      d.data.forEach(dd => {
        let year = doc.data.filter(f => f.year == dd.year);

        if(year.length > 0)
        {
          doc.data.splice(doc.data.indexOf(year[0]), 1);   
        }

        doc.data.push(dd);  
      });

      doc.save();
    } else {
      doc = new Leaderboard(d);
      doc.save();
    }
  }

  return formatSelect(Leaderboard.find());
}

exports.get = () => {
  return formatSelect(Leaderboard.find());
}

exports.getByStravaId = (id) => {
  return Leaderboard.findOne({id: id}).select('-_id -__v');
}

function formatSelect(results)
{
  return results.select('-_id -__v');
}