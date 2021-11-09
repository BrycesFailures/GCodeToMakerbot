var startPos;
var posArr = [];

var numLayers = 0;
var layers = [];
var layerIndex = 0;

var startIndex;
var searchIndex;

var feedrate = 10;
var extrusion_dist = 10;
var duration_s = 1;

var print = [];

var baseCommand = {"command" : {"function": "move", "parameters": {"x": null, "y": null, "z": null, "a": 10.000000, "feedrate": 10.000000}, "tags": ["Connection"], "metadata": {"relative": {"x": false, "y": false, "z": false, "a": false}}}}

// DOUBLE BIG ASS NOTE:( SLICE FOR REPLICATOR2X IT'S SUPER NICE THANK YOU :) )

function loadGCode() {

  startIndex = gCodeArr.indexOf('(<layer>)') + 4 ;

  searchIndex = startIndex + 2;

  startPos = getXY(startIndex);

  console.log("Start Pos: "+startPos.x+", "+startPos.y);

  // position loop ;)
  var i = 0;
  while (true) {

      if (i + startIndex + 3 > gCodeArr.length) {
        break;
      }

      if (gCodeArr[searchIndex].includes("F")) {
        feedrate = Math.round((getNumAfterChar(gCodeArr[searchIndex], "F") / 60) * 1000) / 1000
      }

      if (gCodeArr[searchIndex] == "" || !gCodeArr[searchIndex].includes("X")) {
        //console.log(gCodeArr[searchIndex]);   // debug to see what gets sorted out
        if (gCodeArr[searchIndex].includes("</layer")) {
          layerIndex++;
        }
        searchIndex++;
      } else {

        // i'm not doing relative because absolute is the default setting for makerbot files
        var _pos = getXY(searchIndex);

        // relative position to use if needed ~~~~~~~~~~  ~~~~~~~~~~  ~~~~~~~~~~//
        // if (i == 0) {
        //   _pos.x = _pos.x - startPos.x;
        //   _pos.y = _pos.y - startPos.y;
        //   _pos.x = Math.round(_pos.x * 1000) / 1000;
        //   _pos.y = Math.round(_pos.y * 1000) / 1000;
        // } else {
        //   var pPos;
        //   for (let j = 1; j < 11; j++) {
        //     if (getXY(searchIndex - j).x > -1000) {
        //       pPos = getXY(searchIndex - j);
        //       break;
        //     }
        //   }
        //   _pos.x = _pos.x - pPos.x;
        //   _pos.y = _pos.y - pPos.y;
        //   _pos.x = Math.round(_pos.x * 1000000) / 1000000;
        //   _pos.y = Math.round(_pos.y * 1000000) / 1000000;
        // }
        // ~~~~~~~~~~  ~~~~~~~~~~  ~~~~~~~~~~  ~~~~~~~~~~  ~~~~~~~~~~  ~~~~~~~~~

        posArr.push(_pos);

        if (layers[layerIndex] == null) {
          layers[layerIndex] = [];
        }

        layers[layerIndex].push(_pos);

        var _command = JSON.parse(JSON.stringify(baseCommand));  // this is how you clone a json object
        _command.command.parameters.x = _pos.x;
        _command.command.parameters.y = _pos.y;
        _command.command.parameters.z = Math.round((layerIndex * 0.2 + 0.2) * 1000) / 1000;
        if (gCodeArr[searchIndex].includes("F")) {
          _command.command.parameters.a = Math.round(getNumAfterChar(gCodeArr[searchIndex], "A") * 1000000) / 1000000;
          _command.command.parameters.feedrate = feedrate;
        } else {
          _command.command.parameters.a = print[print.length-1].command.parameters.a;
          _command.command.parameters.feedrate = 10.000;
          //_command.command.tags = ["Not Printing Just Moving, Wink"];
        }

        if (_command.command.parameters.x >= -1000000 && _command.command.parameters.y >= -1000000) {
          print.push(_command);
        }


        searchIndex++;

    }

    i++;

  }

  extrusion_dist = print[print.length-1].command.parameters.a;
  duration_s = Math.round(extrusion_dist) / 30 * 60;

  console.log("Extrusion Dist: "+extrusion_dist);
  console.log("Estimated Time: "+duration_s+"s");

  // find layer #
  for (let i = 1; i < 101; i++) {
    if (gCodeArr[gCodeArr.length - i].includes("</layer")) {
      var _layer = "";
      var j = getCharAt(gCodeArr[gCodeArr.length - i], "r") + 2;
      while (gCodeArr[gCodeArr.length - i].charAt(j) != ">") {
        _layer += gCodeArr[gCodeArr.length - i].charAt(j);
        j++;
      }
      _layer++;
      numLayers = _layer;
      break;
    }
  }
  layers.splice(layers.length-1,1);

  console.log("Layers: "+numLayers);

  console.log(layers);

  console.log("Done!");

}




function getCharAt(_string, _character) {

  for (let i = 0; i < _string.length; i++) {
    if (_string.charAt(i) == _character) {
      return i - 1;
      break;
    }
  }

}



function getXY(_index) {

  _pos = {x:"",y:""}

  var _string = gCodeArr[_index];
  var _searchIndex;

  if (_string == null || _string == "") {
    return {x:null,y:null};
  }

  _searchIndex = getCharAt(_string,"X") + 1;

  while (_string.charAt(_searchIndex) != " " && _searchIndex < _string.length) {
    _searchIndex++;
    _pos.x += _string.charAt(_searchIndex);
  }
  _pos.x = parseFloat(_pos.x);


  _searchIndex = getCharAt(_string,"Y") + 1;

  while (_string.charAt(_searchIndex) != " " && _searchIndex < _string.length) {
    _searchIndex++;
    _pos.y += _string.charAt(_searchIndex);
  }
  _pos.y = parseFloat(_pos.y);

  return _pos;

}



function getNumAfterChar(_string, _char) {

  if (_string == null || _string == "") {
    return null;
  }

  var _searchIndex = getCharAt(_string,_char) + 1;

  var _val = ""
  while (_string.charAt(_searchIndex) != " " && _searchIndex < _string.length) {
    _searchIndex++;
    _val += _string.charAt(_searchIndex);
  }
  _val = parseFloat(_val);

  return _val;

}
