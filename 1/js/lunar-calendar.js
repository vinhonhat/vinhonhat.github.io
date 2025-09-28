function convertLunarToSolar(lunarDay, lunarMonth, lunarYear) {
    const OFF_JDN = 2415021;
    let a11 = lunarYear * 12 + lunarMonth - 1;
    let b11 = Math.floor(a11 / 60);
    let leap = (a11 % 12 + 11) % 12;
    let k = Math.floor((lunarYear - 1900) * 365.2422);
    let l = Math.floor((lunarMonth - 1) * 30.43685);
    let dayNumber = k + l + lunarDay;
    if (b11 > 0 && lunarMonth > leap + 1) {
        dayNumber += Math.floor((lunarYear - 1900) / 4);
    }
    if (lunarMonth > 2) {
        dayNumber -= isLeapYear(lunarYear) ? 1 : 2;
    }
    const jdn = dayNumber + OFF_JDN;
    return jdnToSolar(jdn);
}
function isLeapYear(year) { return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0); }
function jdnToSolar(jdn) {
    let j = Math.floor(jdn + 0.5) + 32044;
    let i = Math.floor((4 * j + 3) / 146097);
    j = j - Math.floor((146097 * i) / 4);
    let y = Math.floor((4 * j + 3) / 1461);
    j = j - Math.floor((1461 * y) / 4);
    let m = Math.floor((5 * j + 2) / 153);
    let d = j - Math.floor((153 * m + 2) / 5) + 1;
    m = m + 3 - 12 * Math.floor(m / 10);
    y = 100 * i + y - 4800 + Math.floor(m / 10);
    return new Date(y, m - 1, d);
}