var gCodeText = "";
var gCodeArr;

var inputElm;

var thumbnails = [];

var temp = 180;



var checkLoop = setInterval(function() {

  if (document.readyState == "complete") {
    start();
    clearInterval(checkLoop);
  }

},1);



function start() {

  thumbnails[0] = b64toBlob(thumb1, 'image/png');
  thumbnails[1] = b64toBlob(thumb2, 'image/png');
  thumbnails[2] = b64toBlob(thumb3, 'image/png');

  inputElm = document.getElementById('gCodeInput');

  // get if file opened
  inputElm.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      // prepare and create file reader
      var myFile = this.files[0];
      var reader = new FileReader();

      // read text from file after it's been read and loaded
      reader.addEventListener('load', function (e) {

        var extension = myFile.name.split('.').pop().toLowerCase();

        if (extension != "gcode") {
          alert("no");
          return;
        }

        gCodeText = e.target.result;
        gCodeArr = gCodeText.split('\n');
        loadGCode();

        //download(JSON.stringify(print), "print.jsontoolpath");

        var meta = JSON.parse(JSON.stringify(baseMeta));
        meta.num_z_layers = layers.length;
        meta.num_z_transitions = layers.length - 1;
        meta.total_commands = posArr.length;
        meta.extrusion_temp = temp;
        meta.miracle_config.extruderTemp0 = temp;
        meta.machine_config.extruder_profiles["mk12"].materials.pla.temperature = temp;
        meta.machine_config.extruder_profiles["mk13"].materials.pla.temperature = temp;
        meta.machine_config.extruder_profiles["mk13_impla"].materials["im-pla"].temperature = temp;
        meta.printer_settings.extruder_temperatures[0] = temp;
        meta.toolhead_0_temperature = temp;

        var printString = JSON.stringify(print);

        var zip = new JSZip();
        zip.file("print.jsontoolpath", printString);
        zip.file("meta.json", JSON.stringify(meta));
        zip.file("thumbnail_55x40.png", thumbnails[0], {base64: true});
        zip.file("thumbnail_110x80.png", thumbnails[1], {base64: true});
        zip.file("thumbnail_320x200.png", thumbnails[2], {base64: true});
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            saveAs(content, document.getElementById('modelName').value+".makerbot");
      });

      });

      // read it
      reader.readAsBinaryString(myFile);
    }
  });

}




// Function to download data to a file
function download(data, filename) {
    var file = new Blob([data], {type: ""});
    var a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}



const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    }
  });
}



const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
