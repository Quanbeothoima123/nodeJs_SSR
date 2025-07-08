function incrementQty() {
  const input = document.getElementById("quantity");
  const max = parseInt(input.max);
  let value = parseInt(input.value);
  if (value < max) input.value = value + 1;
}

function decrementQty() {
  const input = document.getElementById("quantity");
  let value = parseInt(input.value);
  if (value > 1) input.value = value - 1;
}
