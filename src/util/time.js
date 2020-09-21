import moment from 'moment';

// 时间戳转换成日期 参数number为毫秒时间戳，format为需要转换成的日期格式
// export const formatTime = (timestamp, format) => {
//   var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
//   // 去掉冒号
//   let delM = format.replace(/:/g, ".");
//   // 去掉空格
//   let delK = delM.replace(/ /g, ".");

//   let formatArr = delK.split('.')
//   let newArr = []
//   var Y = date.getFullYear();
//   var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
//   var D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate());
//   var h = date.getHours();
//   var m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes();
//   var s = date.getSeconds();
//   newArr.push(Y, M, D, h, m, s)
//   for (let i in newArr) {
//       format = format.replace(formatArr[i], newArr[i])
//   }
//   return format;
// }
export const weeks = ['周一','周二','周三','周四','周五','周六','周日'];

export const formatTime = (time) => {
  let year = new Date(time * 1000).getFullYear();
  let month = new Date(time * 1000).getMonth() + 1 >= 10 ? new Date(time * 1000).getMonth() + 1 : '0' + (new Date(time * 1000).getMonth() + 1);
  let day = new Date(time * 1000).getDate() < 10 ? '0' + new Date(time * 1000).getDate() : new Date(time * 1000).getDate();
  let week = new Date(time * 1000).getDay() === 0 ? 7 : new Date(time * 1000).getDay();
  let timeStamp = new Date(`${year}/${month}/${day}`).getTime() / 1000;
  let currentTimeStamp = time;
  let minutes = new Date(time * 1000).getMinutes() < 10 ? '0' + new Date(time * 1000).getMinutes() : new Date(time * 1000).getMinutes();
  let seconds = new Date(time * 1000).getSeconds() < 10 ? '0' + new Date(time * 1000).getSeconds() : new Date(time * 1000).getSeconds();
  let hour = new Date(time * 1000).getHours() < 10 ? '0' + new Date(time * 1000).getHours() : new Date(time * 1000).getHours();
  let weekDay = weeks[week - 1];
  let endTimeStamp = timeStamp + 24 * 60 * 60 - 1;
  return {year, month, day, week, timeStamp, hour, minutes, weekDay, seconds, endTimeStamp, currentTimeStamp}
}

//判断两个时间相差几天
// import dayjs from 'dayjs'
// eslint-disable-next-line import/prefer-default-export
export const timeDiffer = (data) => {
  const timeDiff = moment().diff(data, 'years')
  return timeDiff
}