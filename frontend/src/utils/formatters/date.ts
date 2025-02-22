export function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  // Use toLocaleString to get the short month name and convert it to lowercase.
  const month = date
    .toLocaleString("default", { month: "short" })
    .toLowerCase();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}
