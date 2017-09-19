const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDay() {
    const dayIndex = new Date().getDay();
    return days[dayIndex];
}

module.exports = getDay;