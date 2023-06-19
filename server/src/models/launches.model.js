const launches = require('./launches.mongo')
const planets = require('./planets.mongo')
const axios = require('axios')

const DEFAULT_FLIGHT_NUMBER = 100;

// rocket.name(rocket)
// flight_number(flightNumber)
// name (mission)
// date_local(date)
// upcoming
// success
// payload.customers
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function loadLaunchesData() {
   const firstLaunch =  await findLaunch({
        flightNumber:1,
        rocket: 'Falcon 1' ,
        mission: 'FalconSat' ,
    })
    if(firstLaunch){
        return;
    }

   const response =  await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination : false ,
            populate: [
                { 
                    path: 'rocket',
                    select: {
                        name: 1
                    }

                } ,
                {
                    path: 'payloads',
                    select: {
                        customers : 1
                    }

                }
            ]
        }
    })
    if(response.status !== 200){
        throw new Error('Launch data downloading failed!')
    }
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber: launchDoc['flight_number'] ,
            mission : launchDoc['name'] ,
            rocket : launchDoc['rocket']['name'] ,
            launchDate: launchDoc['date_local'] ,

            upcoming : launchDoc['upcoming'] ,
            success : launchDoc['success'] ,
            customers,
        }
        await saveLaunch(launch);

    }
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}


async function existsLaunchWithId(LaunchId) {
    return await findLaunch({
        flightNumber: LaunchId
    })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}


async function getAllLaunches(skip,limit) {
    return await launches.find({}, {
        '_id': 0,
        '__v': 0
    })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
    
}


async function saveLaunch(launch) {


    await launches.updateOne({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
}






async function scheduleNewLaunch(launch) {

    const planet = await planets.findOne({
        kepler_name: launch.target,
    })

    if (!planet) {
        throw new Error('No matching planets found!')
    }




    const newFlightNumber = await getLatestFlightNumber() + 1;


    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA']
    })

    await saveLaunch(newLaunch)
}



async function abortLaunchById(LaunchId) {
    const aborted = await launches.updateOne({
        flightNumber: LaunchId
    }, {
        upcoming: false,
        success: false,
    })

    return aborted.modifiedCount === 1;
}




module.exports = {
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
}