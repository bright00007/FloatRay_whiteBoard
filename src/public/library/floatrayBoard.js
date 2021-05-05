"use strict";

class FloatrayBoard {
  // 是否开启选择模式
  _select = false;
  // 是否开启画笔模式
  _brush = false;
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
    text: "绘制的文本",
    /**
     * 画笔颜色
     */
    color: "#3366FF",
    /**
     * 画笔大小
     */
    size: 5,
    /**
     * 画笔路径坐标 
     */
    path: new Proxy([], {
      set: (target, propKey, value) => {
        target[propKey] = value;
        if (propKey === "length") {
          return true;
        }
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
    this.resetSize();
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
      // 判断是否为选择模式
      if (this._select) {
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
      if (this._select) {
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
      if (this._select) {
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
  // 设置画布是否选择模式
  setCanvasSelect(value) {
    if (typeof(value) !== "boolean") {
      return false;
    }
    this._select = value;
    return true;
  }
  // 设置画笔颜色
  setBrushColor(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      return false;
    }
    this._brush_path.color = color;
    return true;
  }
  // 设置画笔大小
  setBrushSize(size) {
    if (typeof(size) !== 'number' && isNaN(obj)) {
      return false;
    }
    this._brush_path.size = size;
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
  // 选择模式 选中画笔
  _selectBrush(x, y) {
    
  }
  // 绘制文本-插入input输入框
  _addInputText(x, y) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "fixed";
    input.style.left = `${x}px`;
    input.style.top = `${y - (this._brush_path.size * 0.2 + 1) * 12}px`;
    input.style["z-index"] = "99999";
    input.style.color = this._brush_path.color;
    input.style["font-size"] = `${(this._brush_path.size * 0.2 + 1) * 12}px`;
    input.style["background-color"] = "rgba(0,0,0,0)";
    input.style.border = "none";
    input.style.outline = "none";
    input.addEventListener("keydown", event => {
      if (event.code !== "Enter") {
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
    this._brush_history.push(JSON.parse(JSON.stringify(this._brush_path)));
    this._brush_path.path.length = 0;
    this._brush_path.start.x = undefined;
    this._brush_path.start.y = undefined;
    this._brush_path.end.x = undefined;
    this._brush_path.end.y = undefined;
  }
  // 绘制画笔历史栈
  _drawHistory() {
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
    if (data.type === 1) {
      if (!isHistory) {
        this._scrawl(ctx, data);
      } else {
        this._scrawlPath(ctx, data);
      }
      return false;
    } else if (data.type === 10) {
      this._text(ctx, data);
      return false;
    }
    if (!isHistory) {
      // 清除画布，绘制画布历史栈
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._drawHistory();
    }
    switch(data.type) {
      case 0:
        break;
      case 2:
        this._line(ctx, data);
        break;
      case 3:
        this._line(ctx, data, true);
        break;
      case 4:
        this._arrows(ctx, data);
        break;
      case 5:
        this._arrows(ctx, data, true);
        break;
      case 6:
        this._rect(ctx, data);
        break;
      case 7:
        this._rect(ctx, data, true);
        break;
      case 8:
        this._circle(ctx, data);
        break;
      case 9:
        this._circle(ctx, data, true);
        break;
    }
  }
  // 画线方法
  _drawLine(ctx, x, y, x1, y1, size, color, dash = [], lineCap = "round") {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.lineCap = lineCap;
    ctx.stroke();
    ctx.closePath();
  }
  // 画笔涂鸦绘制全路径
  _scrawlPath(ctx, data) {
    const paths = {
      size: data.sieze,
      color: data.color,
      path: [],
    };
    data.path.forEach(path => {
      paths.path.push(path);
      this._scrawl(ctx, paths);
    });
  }
  // 画笔涂鸦
  _scrawl(ctx, data) {
    const { x, y } = data.path.length < 2 ? data.path[0] : data.path[data.path.length - 2];
    const { x: x1, y: y1 } = data.path.length < 2 ? data.path[0] : data.path[data.path.length - 1];
    this._drawLine(ctx, x, y, x1, y1, data.size, data.color);
  }
  // 画线 deshed：是否绘制虚线
  _line(ctx, data, deshed = false) {
    const { x, y } = data.start;
    const { x: x1, y: y1 } = data.path[data.path.length - 1];
    this._drawLine(ctx, x, y, x1, y1, data.size, data.color, deshed ? [5, 15] : []);
  }
  // 箭头 deshed: 是否绘制虚线
  _arrows(ctx, data, deshed = false) {
    const { x, y } = data.start;
    const { x: x1, y: y1 } = data.path[data.path.length - 1];
    this._drawLine(ctx, x, y, x1, y1, data.size, data.color, deshed ? [5, 15] : []);
    if (x === x1 && y === y1) {
      return false;
    }
    const angle = Math.atan2(y1 - y, x1 - x) / Math.PI * 180 ;
    const x2 = x1 - data.size * 3 * Math.cos((angle + 30) * Math.PI / 180);
    const y2 = y1 - data.size * 3 * Math.sin((angle + 30) * Math.PI / 180);
    this._drawLine(ctx, x1, y1, x2, y2, data.size, data.color, []);
    const x3 = x1 - data.size * 3 * Math.cos((angle - 30) * Math.PI / 180);
    const y3 = y1 - data.size * 3 * Math.sin((angle - 30) * Math.PI / 180);
    this._drawLine(ctx, x1, y1, x3, y3, data.size, data.color, []);
  }
  // 矩形 fill：是否填充
  _rect(ctx, data, fill = false) {
    const { x, y } = data.start;
    const { x: x1, y: y1 } = data.path[data.path.length - 1];
    const w = x1 - x === 0 ? 1 : x1 - x;
    const h = y1 - y === 0 ? 1 : y1 - y;
    ctx.beginPath();
    ctx.lineWidth = data.size;
    ctx.strokeStyle = data.color;
    ctx.fillStyle = data.color;
    ctx.setLineDash([]);
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
  _circle(ctx, data, fill = false) {
    const { x, y } = data.start;
    const { x: x1, y: y1 } = data.path[data.path.length - 1];
    let r = Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
    r = r === 0 ? 1 : r;
    ctx.beginPath();
    ctx.lineWidth = data.size;
    ctx.strokeStyle = data.color;
    ctx.fillStyle = data.color;
    ctx.setLineDash([]);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    if (fill) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
    ctx.closePath();
  }
  // 文本
  _text(ctx, data) {
    const { x, y } = data.start;
    ctx.beginPath();
    ctx.fillStyle = data.color;
    ctx.font = `${(data.size * 0.2 + 1) * 12}px serif`;
    ctx.fillText(data.text, x, y);
    ctx.closePath();
  }
}

export default FloatrayBoard;