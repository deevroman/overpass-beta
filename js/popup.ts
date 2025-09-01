import $ from "jquery";
import {htmlentities} from "./misc";
import tag2link from "tag2link/index.json";

const _tag2link = tag2link.filter(
  (i) => !i.url.startsWith("https://unavatar.now.sh")
);

export function featurePopupContent(feature: GeoJSON.Feature) {
  let popup = "";
  if (feature.properties.type == "node")
    popup +=
      `<h4 class="title is-4"><span class="t" data-t="popup.node">Node</span>` +
      ` <a href="//www.openstreetmap.org/node/${feature.properties.id}" target="_blank">${feature.properties.id}</a>` +
      // ` <a href="//www.openstreetmap.org/edit?node=${feature.properties.id}" target="_blank">✏</a>` +
      `</h4>`;
  else if (feature.properties.type == "way")
    popup +=
      `<h4 class="title is-4"><span class="t" data-t="popup.way">Way</span>` +
      ` <a href="//www.openstreetmap.org/way/${feature.properties.id}" target="_blank">${feature.properties.id}</a>` +
      // ` <a href="//www.openstreetmap.org/edit?way=${feature.properties.id}" target="_blank">✏</a>` +
      `</h4>`;
  else if (feature.properties.type == "relation")
    popup +=
      `<h4 class="title is-4"><span class="t" data-t="popup.relation">Relation</span>` +
      ` <a href="//www.openstreetmap.org/relation/${feature.properties.id}" target="_blank">${feature.properties.id}</a>` +
      // ` <a href="//www.openstreetmap.org/edit?relation=${feature.properties.id}" target="_blank">✏</a>` +
      `</h4>`;
  else if (feature.properties.id)
    popup += `<h5 class="subtitle is-5">${feature.properties.type || ""} #${feature.properties.id}</h5>`;
  if (
    feature.properties &&
    feature.properties.tags &&
    !$.isEmptyObject(feature.properties.tags)
  ) {
    popup += `<h5 class="subtitle is-5"><span class="t" data-t="popup.tags">Tags</span>`;
    if (typeof Object.keys === "function") {
      popup += ` <span class="tag is-info is-light">${
        Object.keys(feature.properties.tags).length
      }</span>`;
    }
    popup += "</h5><ul>";
    $.each(feature.properties.tags, (k, v) => {
      k = htmlentities(k); // escaping strings!
      v = htmlentities(v);
      // hyperlinks for http,https and ftp URLs
      let urls;
      if (
        (urls = v.match(
          /\b(?:(?:https?|ftp):\/\/|www\d?\.|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:\([^\s()<>]*\)|[^\s()<>])*(?:\([^\s()<>]*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’])/gim
        ))
      ) {
        urls.forEach((url) => {
          const href = url.match(/^(https?|ftp):\/\//) ? url : `http://${url}`;
          v = v.replace(url, `<a href="${href}" target="_blank">${url}</a>`);
        });
      } else {
        // hyperlinks for email addresses
        v = v.replace(
          /(([^\s()<>]+)@([^\s()<>]+[^\s`!()[\]{};:'".,<>?«»“”‘’]))/g,
          '<a href="mailto:$1" target="_blank">$1</a>'
        );
      }
      // hyperlinks for wikipedia entries
      let wiki_lang, wiki_page;
      if (
        ((wiki_lang = k.match(/^wikipedia:(.*)$/)) && (wiki_page = v)) ||
        (k.match(/(^|:)wikipedia$/) &&
          (wiki_lang = v.match(/^([a-zA-Z]+):(.*)$/)) &&
          (wiki_page = wiki_lang[2]))
      ) {
        wiki_page = wiki_page.replace(/#.*$/, (match) =>
          // 'Target page#Section header' -> 'Target page#Section_header'
          match.replace(/ /g, "_")
        );
        v = `<a href="//${wiki_lang[1]}.wikipedia.org/wiki/${wiki_page}" target="_blank">${v}</a>`;
      }
      // hyperlinks for wikidata entries
      if (k.match(/(^|:)wikidata$/))
        v = v.replace(
          /Q[0-9]+/g,
          (q) =>
            `<a href="//www.wikidata.org/wiki/${q}" target="_blank">${q}</a>`
        );
      // hyperlinks for wikimedia-commons entries
      let wikimediacommons_page;
      if (
        k == "wikimedia_commons" &&
        (wikimediacommons_page = v.match(/^(Category|File):(.*)/))
      )
        v = `<a href="//commons.wikimedia.org/wiki/${wikimediacommons_page[1]}:${wikimediacommons_page[2]}" target="_blank">${v}</a>`;
      // hyperlinks for mapillary entries
      let mapillary_page;
      if (
        (k == "mapillary" && (mapillary_page = v.match(/^[-a-zA-Z0-9_]+$/))) ||
        (k.match(/^mapillary:/) &&
          (mapillary_page = v.match(/^[-a-zA-Z0-9_]+$/)))
      )
        v = `<a href="https://www.mapillary.com/app?focus=photo&pKey=${mapillary_page[0]}" target="_blank">${v}</a>`;

      // hyperlinks from tag2link
      const rule = _tag2link.find((i) => i.key === `Key:${k}`);
      if (rule?.url && !v.includes("<a href")) {
        v = `<a href="${rule.url.replace(/\$1/g, v)}" target="_blank">${v}</a>`;
      }
      popup += `<li><span class="is-family-monospace">${k} = ${v}</span></li>`;
    });
    popup += "</ul>";
  }
  if (
    feature.properties &&
    feature.properties.relations &&
    !$.isEmptyObject(feature.properties.relations)
  ) {
    popup += `<h3 class="title is-4"><span class="t" data-t="popup.relations">Relations</span>`;
    if (typeof Object.keys === "function") {
      popup += ` <span class="tag is-info is-light">${
        Object.keys(feature.properties.relations).length
      }</span>`;
    }
    popup += "</h3><ul>";
    $.each(feature.properties.relations, (k, v) => {
      popup += `<li><a href="//www.openstreetmap.org/relation/${v["rel"]}" target="_blank">${v["rel"]}</a>`;
      if (v.reltags && (v.reltags.name || v.reltags.ref || v.reltags.type))
        popup += ` <i>${$.trim(
          (v.reltags.type ? `${htmlentities(v.reltags.type)} ` : "") +
            (v.reltags.ref ? `${htmlentities(v.reltags.ref)} ` : "") +
            (v.reltags.name ? `${htmlentities(v.reltags.name)} ` : "")
        )}</i>`;
      if (v["role"]) popup += ` as <i>${htmlentities(v["role"])}</i>`;
      popup += "</li>";
    });
    popup += "</ul>";
  }
  if (
    feature.properties &&
    feature.properties.meta &&
    !$.isEmptyObject(feature.properties.meta)
  ) {
    popup += `<h4 class="subtitle is-5"><span class="t" data-t="popup.metadata">Metadata</span></h4><ul>`;
    $.each(feature.properties.meta, (k, v) => {
      k = htmlentities(k);
      v = htmlentities(v);
      if (k == "user")
        v = `<a href="//www.openstreetmap.org/user/${v}" target="_blank">${v}</a>`;
      if (k == "changeset")
        v = `<a href="//www.openstreetmap.org/changeset/${v}" target="_blank">${v}</a>`;
      popup += `<li><span class="is-family-monospace">${k} = ${v}</span></li>`;
    });
    popup += "</ul>";
  }

  let lat = null;
  let lon = null;
  const zoom = parseInt(localStorage.getItem("overpass-ide_coords_zoom"));

  if (feature.geometry.type == "Point") {
    lat = feature.geometry.coordinates[1];
    lon = feature.geometry.coordinates[0];
  } else if (feature.geometry.type == "LineString") {
    lat =
      (feature.geometry.coordinates
        .map((i) => i[1])
        .reduce((a, b) => Math.max(a, b), 0) +
        feature.geometry.coordinates
          .map((i) => i[1])
          .reduce((a, b) => Math.min(a, b), Infinity)) /
      2;
    lon =
      (feature.geometry.coordinates
        .map((i) => i[0])
        .reduce((a, b) => Math.max(a, b), 0) +
        feature.geometry.coordinates
          .map((i) => i[0])
          .reduce((a, b) => Math.min(a, b), Infinity)) /
      2;
  } else if (feature.geometry.type == "Polygon") {
    lat =
      (feature.geometry.coordinates[0]
        .map((i) => i[1])
        .reduce((a, b) => Math.max(a, b), 0) +
        feature.geometry.coordinates[0]
          .map((i) => i[1])
          .reduce((a, b) => Math.min(a, b), Infinity)) /
      2;
    lon =
      (feature.geometry.coordinates[0]
        .map((i) => i[0])
        .reduce((a, b) => Math.max(a, b), 0) +
        feature.geometry.coordinates[0]
          .map((i) => i[0])
          .reduce((a, b) => Math.min(a, b), Infinity)) /
      2;
  }
  if (lat !== null && lon !== null) {
    const textForCopy = `${lat.toFixed(7)} ${lon.toFixed(7)}`;
    popup +=
      `<h3 class="subtitle is-5"><span class="t" data-t="popup.coordinates">Coordinates</span></h3>` +
      `<p><a href="geo:${lat.toFixed(7)},${lon.toFixed(7)}">${lat}  ${lon}</a> <svg title="click to copy ${textForCopy}" copy-text="${textForCopy}" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="copy-coordinates-btn lucide lucide-file-icon lucide-file" style="cursor: pointer; position: relative; left: 3px; top: 1px;"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> </p>` +
      `<p style="padding-top: 10px; display: flex; justify-content: space-between;">
          <span>
            <a href="https://yandex.ru/maps/?l=stv,sta&ll=${lon},${lat}&z=${17}" target="_blank">Yandex</a>.<a href="https://yandex.com/maps/?l=stv%2Csta&ll=${lon}%2C${lat}&panorama%5Bdirection%5D=0%2C0&panorama%5Bfull%5D=true&panorama%5Bpoint%5D=${lon}%2C${lat}&panorama%5Bspan%5D=0%2C0&z=${zoom + 2}" target="_blank">Panoramas</a>
          </span> 
          <a href="https://google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=${lat},${lon}" target="_blank">Street View</a>
       </p>`;
  }
  if (
    $.inArray(feature.geometry.type, [
      "LineString",
      "Polygon",
      "MultiPolygon"
    ]) != -1
  ) {
    if (feature.properties && feature.properties.tainted == true) {
      popup += `<p><strong class="t" data-t="popup.incomplete_geometry">Attention: incomplete geometry (e.g. some nodes missing)</strong></p>`;
    }
  }
  return popup;
}
