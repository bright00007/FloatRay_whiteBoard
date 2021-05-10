"use strict";

import FloatrayBoard from "../../library/floatrayBoard.js";

window.addEventListener("load", () => {
  const draw = window.draw = new FloatrayBoard("#whiteBoardBox");
  // 初始化光标类型
  draw.setCanvasCursor(1);

  [...document.querySelectorAll("ul.toolbar-operates > li")].forEach(el => {
    el.addEventListener("click", function () {
      const type = Number(this.dataset.type);
      // 删除
      if (type === -2) {
        draw.deleteBrushPath();
        return false;
      }
      // 撤回
      if (type === -3) {
        draw.revocationBrushPath();
        return false;
      }
      // 颜色
      if (type === -4) {
        draw.setBrushColor();
        return false;
      }
      // 字体大小-
      if (type === -5) {
        draw.setBrushSize(-1);
        return false;
      }
      // 字体大小+
      if (type === -6) {
        draw.setBrushSize(1);
        return false;
      }
      // 切换工具选择状态
      if (document.querySelector("ul.toolbar-operates > li.active")) {
        document.querySelector("ul.toolbar-operates > li.active").classList.remove("active");
      }
      this.classList.add("active");
      // 选择画笔路径
      if (type === -1) {
        draw.setCanvasCursor("pointer");
        return draw.setCanvasSelect(true);
      }
      // 设置画笔类型
      switch(true) {
        case type === 0:
          draw.setCanvasCursor(2);
          break;
        case type === -1:
          draw.setCanvasCursor();
        default:
          draw.setCanvasCursor(1);
      }
      draw.setCanvasSelect(false);
      return draw.setBrushType(type);
    });
  });
  [...document.querySelectorAll(".toolbar-operate-color li")].forEach(li => {
    li.addEventListener("click", function () {
      const color = this.dataset.color;
      const result = draw.setBrushColor(color);
      if (result) {
        document.querySelector(".toolbar-operate-color p span").style["background-color"] = color;
      }
      });
  })
});