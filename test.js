const data = [
    {
        "_id": "6589919c9a5a72250eff005c",
        "studentID": {
            "_id": "658990cb9a5a72250eff001b",
            "name": "Tukaram Tancker"
        },
        "date": "25/12/2023",
        "isPresent": true,
        "time": "07:58 pm",
        "timeStamp": "2023-12-25T13:56:17.983Z",
        "course": "656b2e3e8716915d307c92e3",
        "__v": 0
    },
    {
        "_id": "658afa6c6aab58420b1d8a83",
        "studentID": {
            "_id": "658990cb9a5a72250eff001b",
            "name": "Tukaram Tancker"
        },
        "date": "26/12/2023",
        "isPresent": true,
        "time": "09:38 pm",
        "timeStamp": "2023-12-26T16:07:43.108Z",
        "course": "656b2e3e8716915d307c92e3",
        "__v": 0
    },
    {
        "_id": "658afa6c6aab58420b1d8a83",
        "studentID": {
            "_id": "658990cb9a5a72250eff001b",
            "name": "Baliram"
        },
        "date": "16/12/2023",
        "isPresent": true,
        "time": "09:38 pm",
        "timeStamp": "2023-12-26T16:07:43.108Z",
        "course": "656b2e3e8716915d307c92e3",
        "__v": 0
    }
]
const arr2 = [
    {
        "_id": "658990cb9a5a72250eff001b",
        "name": "Tukaram Tancker",
        "email": "tukaram@gmail.com"
    }
]


function getWeekDates(date, result = []) {
    const startDate = new Date(date);

    for (let i = 7; i >= 1; i--) {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() - i + 1);

        result.push(newDate.toLocaleDateString())
    }
    return result
}


function getAttendance(data = [], date) {
    const weekend = getWeekDates(date)
    const finalData = arr2.map(allUser => {
        const attendance = {}
        weekend.forEach(currDate => {
            if (currDate in attendance) {
                return false
            } else {
                attendance[currDate.split("/").reverse().join("-")] = data.findIndex((attendanceData) => attendanceData.date === currDate) !== -1
            }
        })
        return [{
            name: allUser.name,
            attendance
            ,
        }]
    })

    return finalData
}

// console.log(getAttendance(data, "2023/12/27"))
console.log(getWeekDates(new Date().toLocaleDateString("en-us")))
// // Create an object to store the transformed data
// const transformedData = {};

// // Iterate through the raw data
// data.forEach(entry => {
//     const studentName = entry.studentID.name;
//     const attendanceDate = entry.timeStamp.split('T')[0];

//     // Initialize the entry for the student if it doesn't exist
//     if (!transformedData[studentName]) {
//         transformedData[studentName] = {
//             name: studentName,
//             attendance: {},
//             time: '9:00 AM - 5:00 PM' // You may adjust the time range as needed
//         };
//     }

//     // Update the attendance for the specific date
//     transformedData[studentName].attendance[attendanceDate] = entry.isPresent;
// });

// // Convert the object values to an array
// const finalResult = Object.values(transformedData);

// console.log(finalResult);