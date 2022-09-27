const axios = require('axios').default;
const fs = require("fs");
const json2xls = require('json2xls');
const _ = require('lodash')


const apiUrl = `https://www.accionlabs.com/content`;

function getData(skip, limit) {
    console.log("skip", skip);
    console.log("limit", limit);
    return new Promise((resolve, reject) => {
        axios.get(`${apiUrl}/people?type=emp_start=${skip}&_limit=${limit}`).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err);
        })
    });   
}
// [ 'type', 'access_type', 'firstName','middleName', 'lastName', 'gender', 'status',	'isInnovator',	'summary',	'slug',	'designation','email','description','company', 'createdAt', 'updatedAt', 'dob',	'doj',	'location',	'primaryContactNo']
const getEmp = (empData) => {
    return empData.map(emp => {
           return _.pick(emp, ['name', 'email', 'skillsmatrix', 'type'])
        }
    ).filter(emp => {
        if(!emp.skillsmatrix) return true;
        if(emp.skillsmatrix.length === 0) return true;
        return false;
    })
}

async function main() {
    try {
        let empsData = [];
        let skip = 0;
        let limit = 50;
        while(1) {
            console.log("getting data")
            let empData = await getData(skip, limit);
            console.log("empData.length", empData.length);
            empData = getEmp(empData);
            console.log("empData.length", empData.length);
            if(empData.length <= 0) break;
            empsData = _.concat(empsData, empData);
            console.log("empsData.length", empsData.length);
            skip = limit + skip;
        }
        console.log("got all data");
        console.log("empsData", empsData.length);
        fs.writeFileSync("emp_json.json", JSON.stringify(empsData))
        const xls = json2xls(empsData);
        fs.writeFileSync('emp_data.xlsx', xls, 'binary');
        console.log("file created")
    } catch (e) {
        console.log("ERRRO", e)
    }
}

main()