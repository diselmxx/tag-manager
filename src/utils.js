export const tagsColors = [
  "#ffdce5",
  "#ffeab6",
  "#d1f7c4",
  "#fee2d5",
  "#ffdce5",
  "#c2f5e9",
  "#eeeeee",
];

export function mapOrder(array, order, key) {
    array.sort(function (a, b) {
    const A = a[key],
        B = b[key];
    if (order.indexOf(A) > order.indexOf(B)) {
      return 1;
    } else {
      return -1;
    }
  });
  return array;
}
