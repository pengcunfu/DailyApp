import service from "@api/request.js";

const baseUrl = '/api'

export function findParamByKey() {
  return service({
    method: "get",
    url: baseUrl + "/param/findParamByKey?key=websocketUrl",
  });
}