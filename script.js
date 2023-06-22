const canvas = document.querySelector(".drawing-board canvas");
const clearBtn = document.querySelector(".footer .clear");
const submitBtn = document.querySelector(".footer .submit");
const resultContainer = document.querySelector("#result");

ctx = canvas.getContext("2d");

let isDrawing = false;
let brushWidth = 40;
let result;

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

const startDraw = () => {
  isDrawing = true;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
};

canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", () => (isDrawing = false));

// Clear button action
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resultContainer.innerHTML = "-";
});

// Submit image action
submitBtn.addEventListener("click", () => {
  // Convert canvas into a data URL
  const dataURL = canvas.toDataURL("image/png");

  // Create a Blob from the data URL
  const blob = dataURLtoBlob(dataURL);

  // Create a FormData object and append the Blob
  const formData = new FormData();
  formData.append("image", blob, "image.png");

  // Make a POST request
  fetch("https://192.168.43.43:8082/digit-classifier-api", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        // Request successful
        console.log("Image uploaded successfully");
        return response.json();
      } else {
        // Request failed
        console.error("Image upload failed");
      }
    })
    .then((data) => {
      result = data;
      resultContainer.innerHTML = result.digit;
    })
    .catch((error) => {
      console.error("Error occurred while uploading image", error);
    });
});

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
