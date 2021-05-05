"use strict";

import FloatrayBoard from "../../library/floatRayBoard.js";

const draw = window.draw = new FloatrayBoard("#whiteBoardBox");

[...document.querySelectorAll("ul.toolbar-operates > li")].forEach(el => {
  el.addEventListener("click", function () {
    const type = Number(this.dataset.type);
    // 撤回
    if (type === -3) {
      return false;
    }
    // 删除
    if (type === -2) {
      return false;
    }
    // 切换工具选择状态
    if (document.querySelector("ul.toolbar-operates > li.active")) {
      document.querySelector("ul.toolbar-operates > li.active").classList.remove("active");
    }
    this.classList.add("active");
    // 选择画笔路径
    if (type === -1) {
      return draw.setCanvasSelect(true);
    }
    // 设置画笔类型
    return draw.setBrushType(type);
  });
});