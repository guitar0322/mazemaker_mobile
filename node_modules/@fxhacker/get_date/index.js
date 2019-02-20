function getDayOfWeek() {
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let day = splitDate[0]
    return day
}


function getDayOfWeekFull(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let day = splitDate[0]
    switch(day){
        case 'Sun':
            return "Sunday";
            break;
        case 'Mon':
            return "Monday";
            break;
        case 'Tue':
            return "Tuesday";
            break;
        case 'Wed':
            return "Wednesday";
            break;
        case 'Thu':
            return "Thursday";
            break;
        case 'Fri':
            return "Friday";
            break;
        case 'Sat':
            return "Saturday";
            break;
        default:
            "We apparently had an error.  Apologies for breaking. :\( "
            break;
    }
}




function getMonth(){
    let date = Date(Date.now())
    let splitDate = date.split(" ");
    let month = splitDate[1]
    return month
}


function getMonthFull(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let month = splitDate[1]
    switch(month){
        case 'Jan':
            return "January";
            break;
        case 'Feb':
            return "February";
            break;
        case 'Mar':
            return "March";
            break;
        case 'Apr':
            return "April";
            break;
        case 'May':
            return "May";
            break;
        case 'Jun':
            return "June";
            break;
        case 'Jul':
            return "July";
            break;
        case 'Aug':
            return "August";
            break;
        case 'Sept':
            return "September";
            break;
        case 'Oct':
            return "October";
            break;
        case 'Nov':
            return "November";
            break;
        case 'Dec':
            return "December";
            break;
        default:
            return "We apparently had an error.  Apologies for breaking. :\( ";
            break;
    }
}


function getDayNumber(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let dayNumber = parseInt(splitDate[2])
    return dayNumber
}


function getYear(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let year = parseInt(splitDate[3])
    return year
}


function getTime(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let defaultTime = splitDate[4]
    let hours = parseInt(defaultTime)

    if (hours === 0 || hours > 12){
        if(hours === 13){
            hours = '01'
        } else if(hours === 14){
            hours = '02'
        } else if(hours === 15){
            hours = '03'
        } else if(hours === 16){
            hours = '04'
        } else if(hours === 17){
            hours = '05'
        } else if(hours === 18){
            hours = '06'
        } else if(hours === 19){
            hours = '07'
        } else if(hours === 20){
            hours = '08'
        } else if(hours ===21){
            hours = '09'
        } else if(hours === 22){
            hours = '10'
        } else if(hours === 23){
            hours = '11'
        } else if(hours === 0){
            hours = '12'
        }
    }

    let minutes = defaultTime.slice(3, 5)
    let seconds = defaultTime.slice(6, 8)
    let newTime = `${hours}:${minutes}:${seconds}`

    return newTime
    
}


function getMilitaryTime(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let militaryTime = splitDate[4]
    return militaryTime
}


function getHours(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let hour = parseInt(splitDate[4])
    return hour
}


function getMinutes(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let defaultTime = splitDate[4]
    let minutes = parseInt(defaultTime.slice(3, 5))
    return minutes
}


function getSeconds(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let defaultTime = splitDate[4]
    let seconds = parseInt(defaultTime.slice(6, 8))
    return seconds
}


function getTimezone(){
    let date = Date(Date.now())
    let splitDate = date.split(" ")
    let timeZone = splitDate[5]
    return timeZone;
}

module.exports = {
    getTimeZone: getTimezone(),
    getSeconds: getSeconds(),
    getMinutes: getMinutes(),
    getHours: getHours(),
    getMilitaryTime: getMilitaryTime(),
    getTime: getTime(),
    getYear: getYear(),
    getMonthFull: getMonthFull(),
    getMonth: getMonth(),
    getDayNumber: getDayNumber(),
    getDayOfWeekFull: getDayOfWeekFull(),
    getDayOfWeek: getDayOfWeek()
}