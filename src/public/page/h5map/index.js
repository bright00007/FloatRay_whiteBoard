// 初始化地图
const map = new AMap.Map("map", {
  zooms: [2, 20],
});
// 浏览器定位
const geolocation = new AMap.Geolocation({
  // 是否使用高精度定位，默认：true
  enableHighAccuracy: true,
  // 设置定位超时时间，默认：无穷大
  timeout: 10000,
});
geolocation.getCurrentPosition(function(status,result){
  if(status === 'complete'){
    const coord = [result.position.lng, result.position.lat];
    const marker = new AMap.Marker({
      position: coord,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
      title: '当前位置',
    });
    map.add(marker);
    map.setFitView();
  }else{
    console.log(`错误: ${result}`);
  }
});
// get传参定位
const text = document.querySelector("#text");
const coord = JSON.parse(getQueryString('lnglat'));
AMap.convertFrom(coord, 'gps', (status, result) => {
  if (result.info === 'ok') {
    const marker = new AMap.Marker({
      position: result.locations[0],   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
      title: '当前位置',
    });
    map.add(marker);
    map.setFitView();
  }
});
// H5+定位
if (window.plus) {
  plusready();
  text.innerHTML += "H5加载完成；";
} else {
  document.addEventListener("plusready", plusready);
  text.innerHTML += "H5监听完成；";
}
// H5+定位方法
function plusready() {
  //扩展API加载完成事
  text.innerHTML += "扩展能力加载完成；";
  plus.geolocation.getCurrentPosition(res => {
    text.innerHTML += "H5+定位成功；";
    AMap.convertFrom([res.coords.longitude, res.coords.latitude], 'gps', (status, result) => {
      if (result.info === 'ok') {
        text.innerHTML += result.locations + "；";
        const coord = result.locations[0];
        const marker = new AMap.Marker({
          position: coord,
          title: '当前位置',
        });
        map.add(marker);
        map.setFitView();
      }
    });
  }, err => {
    text.innerHTML += "H5+定位失败；";
  }, {
    timeout: 5000,    //定位超时时间
    enableHighAccuracy: true,   //启用高精度
    provider: "system",   //使用系统定位
    geocode: false, 
    coordsType: "wgs84",   //坐标系
  });
}
// 获取query参数
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}