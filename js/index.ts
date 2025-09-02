import $ from "jquery";
import "jquery-ui-dist/jquery-ui";

import "leaflet";
import "./leaflet.polylineoffset";
import "leaflet.locationfilter";

import "codemirror/lib/codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import "codemirror/mode/clike/clike";
import "codemirror/mode/css/css";
import "codemirror/mode/sql/sql";
import "codemirror/lib/util/multiplex";
import "codemirror/lib/util/closetag";

import "html2canvas";

// include the CSS files
import "codemirror/lib/codemirror.css";
import "leaflet/dist/leaflet.css";
import "leaflet.locationfilter/src/locationfilter.css";
import "jquery-ui/themes/base/all.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "bulma/css/bulma.css";
import "../css/default.css";
import "../css/compact.css";

// initialize ide on document ready
import ide, {make_combobox} from "./ide";
import configs from "./configs";
import settings from "./settings";
$(document).ready(() => ide.init());
$(document).ready(initClickHandler);

function initClickHandler() {
  $("*[data-ide-handler]").each(function () {
    const handlerDefinition = $(this).attr("data-ide-handler").split(/:/);
    const event = handlerDefinition[0];
    const handlerName = handlerDefinition[1];
    const handler = ide[handlerName].bind(ide);
    $(this).on(event, handler);
  });
  // debugger
  $("#tile_server_global")[0].value = settings.tile_server;
  make_combobox(
    $("#tile_server_global"),
    configs.suggestedTiles.concat(settings.customTiles),
    settings.customTiles,
    (tileServer) => {
      settings.customTiles.splice(settings.customTiles.indexOf(tileServer), 1);
      settings.save();
    }
  );
  $("#tile_server_global")[0].onkeypress = (event) => {
    if (event.key === "Enter") {
      ide.map.tile_layer.setUrl($("#tile_server_global")[0].value);
      // todo save settings
    }
  };
}
