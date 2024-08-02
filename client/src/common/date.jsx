const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getDay = (timestamp) => {
  let date = new Date(timestamp);
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};
