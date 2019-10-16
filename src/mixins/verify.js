const verifyDate = (value) => {
  const result = value.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
  if (result == null) {
    return false;
  }
  const d = new Date(result[1], result[3] - 1, result[4]);
  if (d.getFullYear() === Number(result[1]) && d.getMonth() + 1 === Number(result[3]) && d.getDate() === Number(result[4])) {
    return true;
  }
  return false;
};

const verifyMonth = (value) => {
  const result = value.match(/^(\d{1,4})(-|\/)(\d{1,2})$/);
  if (result == null) {
    return false;
  }
  const d = new Date(result[1], result[3] - 1);
  if (d.getFullYear() === Number(result[1]) && d.getMonth() + 1 === Number(result[3])) {
    return true;
  }
  return false;
};

const verifySelect = (value, options) => {
  const arr = options.map((item) => item.value);
  if (arr.includes(value)) {
    return true;
  }
  return false;
};

const verifyNumber = (value) => {
  if (isNaN(value)) {
    return false;
  }
  return true;
};

export {
  verifyDate,
  verifyMonth,
  verifySelect,
  verifyNumber,
};
