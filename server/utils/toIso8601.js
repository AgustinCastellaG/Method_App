const toIso8601 = (date) => {
  const mm = date.split('-')[0];
  const dd = date.split('-')[1];
  const yyyy = date.split('-')[2];

  return `${yyyy}-${mm}-${dd}`
}

module.exports = toIso8601