const planets = require('./planets.mongo')


async function getAllPlanets() {
  return await planets.find({} , {
    '_id' : 0 ,
    '__v' : 0
  });
}

module.exports = {
  planets:getAllPlanets()
};