"use strict";

class FloatrayBoard {
  // 是否开启选择模式
  _select = false;
  // 是否允许画笔拖动
  _drag = false;
  // 拖动开始位置
  _dragStart = {
    x: undefined,
    y: undefined,
  }
  // 是否开启画笔模式
  _brush = false;
  // 画笔颜色
  _color = "#000000";
  // 画笔大小
  _size = 2;
  // 画笔当前路径对象
  _brush_path = {
    /**
     * 是否绘制，被删除、被修改和删除不绘制
     */
    isDraw: true,
    /**
     * 操作类型
     * 0 删除
     * 1 新增
     * 2 修改
     */
    operate_type: 1,
    /**
     * 原画布路径对象在历史栈中的索引
     */
    raw_index: undefined,
    /**
     * 画笔类型
     * 0 橡皮擦
     * 1 画笔涂鸦
     * 2 直线
     * 3 虚线
     * 4 箭头直线
     * 5 箭头虚线
     * 6 矩形框
     * 7 矩形填充
     * 8 圆环
     * 9 圆形填充
     * 10 文本
     */
    type: 1,
    /**
     * 绘制的文本
     */
    text: "",
    /**
     * 画笔颜色
     */
    color: undefined,
    /**
     * 画笔大小
     */
    size: undefined,
    /**
     * 画笔路径坐标 
     */
    path: new Proxy([], {
      set: (target, propKey, value) => {
        target[propKey] = value;
        if (propKey === "length") {
          return true;
        }
        this._brush_path.color = this._color;
        this._brush_path.size = this._size;
        this._graphing();
        return true;
      }
    }),
    /**
     * 画笔起始坐标 
     */
    start: { x: undefined, y: undefined },
    /**
     * 画笔结束坐标 
     */
    end: { x: undefined, y: undefined },
  };
  // 画笔历史栈
  _brush_history = [];
  constructor(selector) {
    // 插入canvas元素
    this._parent = document.querySelector(selector);
    this._canvas = document.createElement("canvas");
    this._canvas.id = "floatrayBoard";
    this._canvas.style.position = "relative";
    this._canvas.style["z-index"] = "9"
    this.resetSize();
    this.setCanvasCursor();
    this._canvas.appendChild(document.createTextNode("您的浏览器不支持CANVAS，请用其它浏览器打开，谢谢！"));
    this._parent.appendChild(this._canvas);
    // 执行初始化方法
    this._init();
  }
  // 初始化监听事件
  _init() {
    // 监听window窗口resize事件
    window.addEventListener("resize", () => {
      this.resetSize();
    });
    // 监听canvas鼠标左键按下事件
    this._canvas.addEventListener('mousedown', (event) => {
      // 判断是否鼠标左键按下
      if (event.button !== 0) {
        return false;
      }
      // 判断是否为选择模式
      if (this._select) {
        this._selectBrush(event.offsetX, event.offsetY);
        if (this._brush_path.raw_index !== undefined) {
          this._drag = true;
          this._dragStart.x = event.offsetX;
          this._dragStart.y = event.offsetY;
        }
        return false;
      }
      // 判断画笔类型是否为绘制文本
      if (this._brush_path.type === 10) {
        // 插入input框
        this._addInputText(event.offsetX, event.offsetY);
        return false;
      }
      // 开启画笔，记录起始坐标
      this._brush = true;
      this._brush_path.start.x = event.offsetX;
      this._brush_path.start.y = event.offsetY;
      this._brush_path.path.push(this._brush_path.start);
    });
    // 监听canvas鼠标左键按下移动鼠标事件
    this._canvas.addEventListener('mousemove', (event) => {
      // 判断是否为选择模式且有选中画笔路径且可拖动
      if (this._select && this._brush_path.raw_index !== undefined && this._drag) {
        this._dragBrush(event.offsetX - this._dragStart.x, event.offsetY - this._dragStart.y);
        return false;
      }
      // 判断画笔是否开启、画笔类型是否问绘制文本
      if (!this._brush || this._brush_path.type === 10) {
        return false;
      }
      // 记录画笔路径
      const path = { x: event.offsetX, y: event.offsetY };
      this._brush_path.path.push(path);
    });
    // 监听canvas鼠标左键抬起事件
    this._canvas.addEventListener('mouseup', (event) => {
      // 判断是否为选择模式
      if (this._select && this._drag) {
        this._drag = false;
        if (this._brush_path.operate_type === 2) {
          this._addHistory();
          this._brush_path.raw_index = this._brush_history.length - 1;
        }
        return false;
      }
      // 判断是否鼠标左键抬起、画笔类型是否问绘制文本
      if (event.button !== 0 || !this._brush || this._brush_path.type === 10) {
        return false;
      }
      // 关闭画笔，记录结束坐标
      this._brush = false;
      this._brush_path.end.x = event.offsetX;
      this._brush_path.end.y = event.offsetY;
      // 添加历史画笔栈，初始化当前画笔路径
      this._addHistory();
    });
    // 监听canvas鼠标移开事件
    this._canvas.addEventListener('mouseout', (event) => {
      // 判断是否为选择模式
      if (this._select && this._drag) {
        this._drag = false;
        if (this._brush_path.operate_type === 2) {
          this._addHistory();
        }
        return false;
      }
      // 判断画笔是否开启、画笔类型是否问绘制文本
      if (!this._brush || this._brush_path.type === 10) {
        return false;
      }
      // 鼠标移开canvas关闭画笔，记录结束坐标
      this._brush = false;
      this._brush_path.end.x = event.offsetX;
      this._brush_path.end.y = event.offsetY;
      // 添加历史画笔栈，初始化当前画笔路径
      this._addHistory();
    });
  }
  // 重置canvas大小
  resetSize() {
    const width = getComputedStyle(this._parent).width;
    const height = getComputedStyle(this._parent).height;
    this._canvas.width = width.replace("px", "");
    this._canvas.height = height.replace("px", "");
  }
  // 设置canvas光标
  setCanvasCursor(CUR = "pointer") {
    // 1画笔
    switch(true) {
      case CUR === 1:
        this._canvas.style.cursor = "url('/images/brush.png'), pointer";
        break;
      case CUR === 2:
        this._canvas.style.cursor = "url('/images/eraser.png'), pointer";
      default:
        this._canvas.style.cursor = CUR;
    }
    return true;
  }
  // 设置画布是否选择模式
  setCanvasSelect(value) {
    if (typeof(value) !== "boolean") {
      return false;
    }
    if (!value) {
      const ctx = this._canvas.getContext("2d");
      // 清除画布，绘制画布历史栈
      this._drawHistory();
      // 清空选择模式选择画笔索引
      this._brush_path.raw_index = undefined;
    }
    this._select = value;
    return true;
  }
  // 设置画笔颜色
  setBrushColor(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      return false;
    }
    this._color = color;
    return true;
  }
  // 设置画笔大小
  setBrushSize(size) {
    if (typeof(size) !== 'number' && isNaN(obj)) {
      return false;
    }
    // 累加累减
    if (size === 1 || size === -1) {
      if (this._size === 1 && size === -1) {
        return false;
      }
      if (this._size === 10 && size === 1) {
        return false;
      }
      this._size += size;
      return true;
    }
    this._size = size;
    return true;
  }
  // 设置画笔类型
  setBrushType(type) {
    if (type < 0 || type > 10) {
      return false;
    }
    this._brush_path.type = type;
    return true;
  }
  // 删除画笔路径
  deleteBrushPath() {
    const index = this._brush_path.raw_index;
    // 没有选中画笔
    if (index === undefined) {
      return false;
    }
    // 设置历史栈中选中画笔索引的对象 isDraw = false
    this._brush_history[index].isDraw = false;
    // 添加历史记录到历史栈
    this._brush_path.isDraw = false;
    this._brush_path.operate_type = 0;
    this._addHistory();
    // 清除画布，绘制画布历史栈
    this._drawHistory();
  }
  // 撤回画笔
  revocationBrushPath() {
    if (this._brush_history.length === 0) {
      return false;
    }
    const path = this._brush_history.pop();
    if (path.operate_type !== 1) {
      this._brush_history[path.raw_index].isDraw = true;
    }
    // 重新绘制
    this._drawHistory();
  }
  // tool 获取string汉字的个数
  getStringHanziNumbere(str) {
    let len = 0;
    [...str].forEach(s => {
      /[\u4e00-\u9fa5]/.test(s) ? len++ : '';
    })
    return len;
  }
  // 选择模式 选中画笔
  _selectBrush(x, y) {
    if (this._brush_history.length === 0) {
      return false;
    }
    const ctx = this._canvas.getContext("2d");
    // 如果有选中画笔路径则重绘画布
    if (this._brush_path.raw_index !== undefined || this._brush_history[this._brush_history.length - 1].operate_type === 2) {
      // 清除画布，绘制画布历史栈
      this._drawHistory();
    }
    // 查找历史栈中最后一个被选中的画笔索引
    let index = this._brush_history.reverse().findIndex(brush => {
      // 判断是否需要绘制
      if (!brush.isDraw) {
        return false;
      }
      let inPath = undefined;
      if (brush.type === 1 || brush.type === 2 || brush.type === 3 || brush.type === 4 || brush.type === 5) {
        inPath = ctx.isPointInStroke(brush.path2D, x, y);
      } else {
        inPath = ctx.isPointInPath(brush.path2D, x, y, "evenodd");
      }
      return inPath;
    });
    // 恢复历史栈顺序
    this._brush_history.reverse();
    // 有选中画笔索引
    if (index !== -1) {
      // 获取正序索引值，并记录
      index = this._brush_history.length - 1 - index;
      this._brush_path.raw_index = index;
      this._drawHintBox(this._brush_history[index]);
    } else {
      this._brush_path.raw_index = undefined
    }
  }
  // 选择模式 拖动画笔、
  _dragBrush(distX, distY) {
    if (this._brush_history[this._brush_path.raw_index].isDraw) {
      this._brush_history[this._brush_path.raw_index].isDraw = false;
    }
    this._brush_path.operate_type = 2;
    this._brush_path.type = this._brush_history[this._brush_path.raw_index].type
    this._brush_path.color = this._brush_history[this._brush_path.raw_index].color;
    this._brush_path.size = this._brush_history[this._brush_path.raw_index].size;
    this._brush_path.text = this._brush_history[this._brush_path.raw_index].text;
    this._brush_path.start.x = this._brush_history[this._brush_path.raw_index].start.x + distX;
    this._brush_path.start.y = this._brush_history[this._brush_path.raw_index].start.y + distY;
    this._brush_path.end.x = this._brush_history[this._brush_path.raw_index].end.x + distX;
    this._brush_path.end.y = this._brush_history[this._brush_path.raw_index].end.y + distY;
    this._brush_path.path.length = 0;
    if (this._brush_path.type === 1) {
      const path = this._brush_history[this._brush_path.raw_index].path.map(coord => {
        return {
          x: coord.x + distX,
          y: coord.y + distY,
        }
      });
      this._brush_path.path.push(...path);
    } else {
      this._brush_path.path.push(this._brush_path.start, this._brush_path.end);
    }
    // 绘制提示框
    this._drawHintBox(this._brush_path);
  }
  // 选择模式 绘制选中提示框
  _drawHintBox(data) {
    // 绘制选中提示矩形框
    const ctx = this._canvas.getContext("2d");
    const { x: x, y: y } = data.start;
    const { x: x1, y: y1 } = data.end;
    let dx, dy, dw, dh;
    if (data.type === 1) {
      let { x: minX, y: minY } = data.start;
      let { x: maxX, y: maxY } = data.start;
      data.path.forEach(coord => {
        if (coord.x < minX) {
          minX = coord.x;
        }
        if (coord.y < minY) {
          minY = coord.y;
        }
        if (coord.x > maxX) {
          maxX = coord.x;
        }
        if (coord.y > maxY) {
          maxY = coord.y;
        }
      });
      dx = minX - 10;
      dy = minY - 10;
      dw = maxX - minX + 20;
      dh = maxY - minY + 20;
    } else if (data.type === 8 || data.type === 9) {
      let r = Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
      r = r === 0 ? 1 : r;
      dx = x - r - 10;
      dy = y -r - 10;
      dw = dh = 2 * r + 20;
    } else if (data.type === 10) {
      const fontSize = Math.ceil((data.size * 0.2 + 1) * 12);
      dx = x - 5;
      dy = y + 5;
      dw = (data.text.length + this.getStringHanziNumbere(data.text)) * fontSize / 2 + 10;
      dh = -fontSize - 5;
    } else {
      const w = x1 - x === 0 ? 1 : x1 - x;
      const h = y1 - y === 0 ? 1 : y1 - y;
      dx = x1 > x ? x - 10 : x + 10;
      dy = y1 > y ? y - 10 : y + 10;
      dw = x1 > x ? w + 20 : w - 20;
      dh = y1 > y ? h + 20 : h - 20;
    }
    this._rect(ctx, dx, dy, dw, dh, "#909399", 1, false, [2, 2]);
  }
  // 绘制文本-插入input输入框
  _addInputText(x, y) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "fixed";
    input.style.left = `${x}px`;
    input.style.top = `${y - (this._size * 0.2 + 1) * 12}px`;
    input.style["z-index"] = "99999";
    input.style.color = this._color;
    input.style["font-size"] = `${(this._size * 0.2 + 1) * 12}px`;
    input.style["background-color"] = "rgba(0,0,0,0)";
    input.style.border = "none";
    input.style.outline = "none";
    input.addEventListener("keydown", event => {
      if (event.code !== "Enter" && event.code !== "NumpadEnter") {
        return false;
      }
      input.blur();
    });
    input.addEventListener("blur", event => {
      const text = input.value;
      // 移除input
      input.remove();
      if (!text) {
        return false;
      }
      // 记录绘制文本起始坐标，触发绘制文本
      this._brush_path.start.x = x;
      this._brush_path.start.y = y;
      this._brush_path.text = text;
      this._brush_path.path.push(this._brush_path.start);
      // 添加历史画笔栈，初始化当前画笔路径
      this._addHistory();
    });
    document.body.appendChild(input);
  }
  // 添加历史画笔栈，初始化当前画笔路径
  _addHistory() {
    // 添加画笔路径Path2D对象备份，操作为删除时不备份
    const path = JSON.parse(JSON.stringify(this._brush_path));
    if (this._brush_path.operate_type !== 0) {
      path.path2D = this._creatPath2D();
    }
    this._brush_history.push(path);
    this._brush_path.isDraw = true;
    this._brush_path.operate_type = 1;
    this._brush_path.raw_index = undefined;
    this._brush_path.color = undefined;
    this._brush_path.size = undefined;
    this._brush_path.path.length = 0;
    this._brush_path.start.x = undefined;
    this._brush_path.start.y = undefined;
    this._brush_path.end.x = undefined;
    this._brush_path.end.y = undefined;
  }
  // 创建画笔路径Path2D对象备份
  _creatPath2D(data = this._brush_path) {
    const path = new Path2D();
    let w, h, r;
    switch(true) {
      case data.type === 0:
        break;
      case data.type === 1:
        path.moveTo(data.start.x, data.start.y);
        data.path.forEach(p => {
          path.lineTo(p.x, p.y);
        });
        break;
      case data.type === 2 || data.type === 3 || data.type === 4 || data.type === 5:
        path.moveTo(data.start.x, data.start.y);
        path.lineTo(data.end.x, data.end.y);
        break;
      case data.type === 6 || data.type === 7:
        w = data.end.x - data.start.x === 0 ? 1 : data.end.x - data.start.x;
        h = data.end.y - data.start.y === 0 ? 1 : data.end.y - data.start.y;
        path.rect(data.start.x, data.start.y, w, h);
        break;
      case data.type === 8 || data.type === 9:
        r = Math.sqrt(Math.pow(data.end.x - data.start.x, 2) + Math.pow(data.end.y - data.start.y, 2));
        r = r === 0 ? 1 : r;
        path.arc(data.start.x, data.start.y, r, 0, 2 * Math.PI, false);
        break;
      case data.type === 10:
        const fontSize = Math.ceil((data.size * 0.2 + 1) * 12);
        w = (data.text.length + this.getStringHanziNumbere(data.text)) * fontSize / 2 + 10;
        h = -fontSize - 5;
        path.rect(data.start.x - 5, data.start.y + 5, w, h);
        break;
    }
    return path;
  }
  // 绘制画笔历史栈
  _drawHistory() {
    // 清除画布
    this._canvas.getContext("2d").clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._brush_history.forEach(data => {
      // 判断是否需要绘制
      if (!data.isDraw) {
        return false;
      }
      this._graphing(data, true);
    });
  }
  // 绘制方法
  _graphing(data = this._brush_path, isHistory = false) {
    const ctx = this._canvas.getContext("2d");
    if (!isHistory) {
      // 清除画布，绘制画布历史栈
      this._drawHistory();
    }
    switch(true) {
      case data.type === 0:
        ctx.globalCompositeOperation = "destination-out";
        const er = 32;
        data.path.forEach(xyz => {
          const { x: ex, y: ey } = xyz;
          this._circle(ctx, ex + er, ey + er, er, "#ffffff", 1, true);
        });
        ctx.globalCompositeOperation = "source-over";
        break;
      case data.type === 1:
        this._scrawlPath(ctx, data.path, data.size, data.color);
        break;
      case data.type === 2 || data.type === 3:
        const { x: lx, y: ly } = data.start;
        const { x: lx1, y: ly1 } = data.path[data.path.length - 1];
        this._drawLine(ctx, lx, ly, lx1, ly1, data.size, data.color, data.type === 3 ? [5, 15] : []);
        break;
      case data.type === 4 || data.type === 5:
        const { x: ax, y: ay } = data.start;
        const { x: ax1, y: ay1 } = data.path[data.path.length - 1];
        this._drawLine(ctx, ax, ay, ax1, ay1, data.size, data.color, data.type === 5 ? [5, 15] : []);
        if (ax === ax1 && ay === ay1) {
          return false;
        }
        const angle = Math.atan2(ay1 - ay, ax1 - ax) / Math.PI * 180 ;
        const ax2 = ax1 - data.size * 3 * Math.cos((angle + 30) * Math.PI / 180);
        const ay2 = ay1 - data.size * 3 * Math.sin((angle + 30) * Math.PI / 180);
        this._drawLine(ctx, ax1, ay1, ax2, ay2, data.size, data.color, []);
        const ax3 = ax1 - data.size * 3 * Math.cos((angle - 30) * Math.PI / 180);
        const ay3 = ay1 - data.size * 3 * Math.sin((angle - 30) * Math.PI / 180);
        this._drawLine(ctx, ax1, ay1, ax3, ay3, data.size, data.color, []);
        break;
      case data.type === 6 || data.type === 7:
        const { x: rx, y: ry } = data.start;
        const { x: rx1, y: ry1 } = data.path[data.path.length - 1];
        const rw = rx1 - rx === 0 ? 1 : rx1 - rx;
        const rh = ry1 - ry === 0 ? 1 : ry1 - ry;
        this._rect(ctx, rx, ry, rw, rh, data.color, data.size, data.type === 7 ? true : false);
        break;
      case data.type === 8 || data.type === 9:
        const { x: cx, y: cy } = data.start;
        const { x: cx1, y: cy1 } = data.path[data.path.length - 1];
        let cr = Math.sqrt(Math.pow(cx1 - cx, 2) + Math.pow(cy1 - cy, 2));
        cr = cr === 0 ? 1 : cr;
        this._circle(ctx, cx, cy, cr, data.color, data.size, data.type === 9 ? true : false);
        break;
      case data.type === 10:
        const { x: tx, y: ty } = data.start;
        this._text(ctx, tx, ty, data.text, data.color, data.size);
        break;
    }
  }
  // 画笔涂鸦绘制全路径
  _scrawlPath(ctx, paths, size, color, dash = [], lineCap = "round") {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.lineCap = lineCap;
    ctx.moveTo(paths[0].x, paths[0].y);
    paths.forEach(path => {
      ctx.lineTo(path.x, path.y);
    });
    ctx.stroke();
    ctx.closePath();
  }
  // 画线方法
  _drawLine(ctx, x, y, x1, y1, size, color, dash = [], lineCap = "round") {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.lineCap = lineCap;
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  }
  // 矩形 fill：是否填充
  _rect(ctx, x, y, w, h, color, size, fill = false, dash = []) {
    ctx.beginPath();
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.setLineDash(dash);
    if (fill) {
      ctx.fillRect(x, y, w, h);
      ctx.fill();
    } else {
      ctx.strokeRect(x, y, w, h);
      ctx.stroke();
    }
    ctx.closePath();
  }
  // 圆形 fill：是否填充
  _circle(ctx, x, y, r, color, size, fill = false, dash = []) {
    ctx.beginPath();
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.setLineDash(dash);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    if (fill) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
    ctx.closePath();
  }
  // 文本
  _text(ctx, x, y, text, color, size) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.font = `${(size * 0.2 + 1) * 12}px serif`;
    ctx.fillText(text, x, y);
    ctx.closePath();
  }
}

export default FloatrayBoard;